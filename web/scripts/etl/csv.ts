/**
 * Hand-rolled RFC4180 CSV reader for the P0-04 ETL loader.
 *
 * Matches the exact dump format produced by P0-03 (web/scripts/dump-legacy.ps1
 * `ConvertTo-CsvField`/`Write-CsvFile`, see that file's header comment and
 * doc 07 section 7.1):
 *   - Every field is double-quoted, embedded `"` doubled (`""`), EXCEPT a
 *     true SQL NULL, which is written as a bare, UNQUOTED 4-character
 *     literal `NULL` token.
 *   - A real empty string is written quoted as `""` (never bare/unquoted).
 *   - CRLF line endings, UTF-8 without BOM, header row present.
 * This is deliberately the same convention Postgres COPY uses for
 * `WITH (FORMAT csv, HEADER true, NULL 'NULL')`: a quoted field is NEVER
 * treated as NULL even if its content is literally the text "NULL" - only
 * an *unquoted* field matching the NULL string converts. This module
 * preserves that distinction (`CsvField.quoted`) so callers (dry-run
 * counting, the staging-table INSERT fallback path used by tests against
 * PGlite, and manifest cross-checks) can reproduce Postgres COPY's NULL
 * semantics exactly without a live database connection.
 *
 * The production load path (see load-table.ts) does NOT run dump rows
 * through this parser at all - it streams the CSV file bytes directly into
 * a real `COPY ... FROM STDIN WITH (FORMAT csv, HEADER true, NULL 'NULL')`,
 * which is both faster and byte-identical in NULL handling by construction.
 * This module exists for: header/column-list discovery, `--dry-run` row
 * counting, manifest row-count cross-checks, and driving the staging-table
 * INSERT fallback path in tests (PGlite has no COPY wire protocol).
 */

export interface CsvField {
  /** Decoded field text (quotes stripped, `""` unescaped to `"`). */
  value: string;
  /** Whether this field was wrapped in double quotes in the source text. */
  quoted: boolean;
}

export type CsvRow = CsvField[];

type ParserState = "field-start" | "in-field" | "in-quoted" | "after-quote";

/**
 * Incremental RFC4180 parser. Feed it chunks of text (as they arrive from a
 * file stream) via `feed()`; call `end()` once after the last chunk to flush
 * any trailing field/row that wasn't newline-terminated. Handles chunk
 * boundaries landing mid-field, mid-quote, or mid-CRLF.
 */
export class CsvParser {
  private state: ParserState = "field-start";
  private field = "";
  private fieldQuoted = false;
  private row: CsvField[] = [];
  private sawAnyFieldInRow = false;

  /** Feed a chunk of CSV text; returns any rows completed by this chunk. */
  feed(chunk: string): CsvRow[] {
    const completed: CsvRow[] = [];
    let i = 0;
    const n = chunk.length;

    const pushField = () => {
      this.row.push({ value: this.field, quoted: this.fieldQuoted });
      this.field = "";
      this.fieldQuoted = false;
      this.sawAnyFieldInRow = true;
    };
    const pushRow = () => {
      completed.push(this.row);
      this.row = [];
      this.sawAnyFieldInRow = false;
    };
    // Ends the current field/row on \r; consumes an immediately-following
    // \n too (CRLF as one terminator). If the chunk ends right after the
    // \r, `pendingCrAtBoundary` defers that lookahead to the next feed()
    // call (or end()) instead of guessing.
    const handleCr = () => {
      pushField();
      pushRow();
      this.state = "field-start";
      i++;
      if (i < n) {
        if (chunk[i] === "\n") i++;
      } else {
        this.pendingCrAtBoundary = true;
      }
    };

    // Resolve state left ambiguous by the previous chunk ending exactly on
    // a boundary character, using this chunk's first character:
    if (this.pendingCrAtBoundary && n > 0) {
      this.pendingCrAtBoundary = false;
      if (chunk[0] === "\n") i = 1; // swallow the \n half of a split CRLF
    }
    if (this.pendingQuoteAtBoundary && n > 0) {
      this.pendingQuoteAtBoundary = false;
      if (chunk[0] === '"') {
        // Escaped "" split across chunks.
        this.field += '"';
        i = 1;
      } else {
        // The quote was the field's closing quote; re-process this
        // chunk's first character under "after-quote" without consuming it.
        this.state = "after-quote";
      }
    }

    while (i < n) {
      const ch = chunk[i]!;

      switch (this.state) {
        case "field-start": {
          if (ch === '"') {
            this.fieldQuoted = true;
            this.state = "in-quoted";
            i++;
          } else if (ch === ",") {
            pushField();
            i++;
          } else if (ch === "\r") {
            handleCr();
          } else if (ch === "\n") {
            pushField();
            pushRow();
            i++;
          } else {
            this.field += ch;
            this.state = "in-field";
            i++;
          }
          break;
        }

        case "in-field": {
          if (ch === ",") {
            pushField();
            this.state = "field-start";
            i++;
          } else if (ch === "\r") {
            handleCr();
          } else if (ch === "\n") {
            pushField();
            pushRow();
            this.state = "field-start";
            i++;
          } else {
            this.field += ch;
            i++;
          }
          break;
        }

        case "in-quoted": {
          if (ch === '"') {
            // Could be an escaped "" or the closing quote; need to look
            // ahead one char (may not be available in this chunk).
            if (i + 1 < n) {
              if (chunk[i + 1] === '"') {
                this.field += '"';
                i += 2;
              } else {
                this.state = "after-quote";
                i++;
              }
            } else {
              // Ambiguous at chunk boundary: resolved at the top of the
              // next feed()/end() call via pendingQuoteAtBoundary.
              this.pendingQuoteAtBoundary = true;
              i++;
            }
          } else {
            this.field += ch;
            i++;
          }
          break;
        }

        case "after-quote": {
          // RFC4180: only a comma or row terminator should follow a
          // closing quote. Be lenient and just resume normal field
          // accumulation for anything else (matches how most real-world
          // CSV consumers behave), since the dump generator never emits
          // that pattern.
          if (ch === ",") {
            pushField();
            this.state = "field-start";
            i++;
          } else if (ch === "\r") {
            handleCr();
          } else if (ch === "\n") {
            pushField();
            pushRow();
            this.state = "field-start";
            i++;
          } else {
            this.field += ch;
            this.state = "in-field";
            i++;
          }
          break;
        }
      }
    }

    return completed;
  }

  /** True if `feed()` left a `"` as the very last character of its input,
   * whose escaped-vs-closing meaning depends on the next chunk's first
   * character. Resolved lazily at the top of the next `feed()`/`end()`. */
  private pendingQuoteAtBoundary = false;

  /** True if `feed()` ended a row on a lone trailing `\r`, so the next
   * chunk's leading `\n` (if any) needs to be swallowed as the other half
   * of the same CRLF terminator rather than starting a new (spurious)
   * empty row. */
  private pendingCrAtBoundary = false;

  /** Call once after the final chunk. Flushes a trailing unterminated
   * field/row (files not ending in a newline) and returns it if non-empty. */
  end(): CsvRow[] {
    // No further input is coming, so any deferred boundary decision
    // resolves to "nothing else follows": a pending quote was the closing
    // quote, and a pending \r had no matching \n (both are no-ops here -
    // the row/field was already pushed by handleCr()/the quote's own
    // eventual after-quote transition).
    this.pendingCrAtBoundary = false;
    if (this.pendingQuoteAtBoundary) {
      this.state = "after-quote";
      this.pendingQuoteAtBoundary = false;
    }
    const completed: CsvRow[] = [];
    const hasTrailingContent =
      this.field.length > 0 ||
      this.fieldQuoted ||
      this.state === "in-quoted" ||
      this.sawAnyFieldInRow;
    if (hasTrailingContent) {
      this.row.push({ value: this.field, quoted: this.fieldQuoted });
      completed.push(this.row);
      this.row = [];
      this.field = "";
      this.fieldQuoted = false;
      this.sawAnyFieldInRow = false;
    }
    this.state = "field-start";
    return completed;
  }
}

/** Parse a complete in-memory CSV string into rows of fields. */
export function parseCsv(text: string): CsvRow[] {
  const parser = new CsvParser();
  const rows = parser.feed(text);
  const tail = parser.end();
  return tail.length > 0 ? [...rows, ...tail] : rows;
}

/**
 * Resolve a single field to the value the ETL should use: `null` for an
 * unquoted bare `NULL` token, otherwise the decoded string (which may be
 * the empty string, or even the literal text "NULL" if it was quoted).
 */
export function fieldToNullableString(field: CsvField): string | null {
  if (!field.quoted && field.value === "NULL") return null;
  return field.value;
}

export function rowToNullableStrings(row: CsvRow): (string | null)[] {
  return row.map(fieldToNullableString);
}

/**
 * Parse just the header row of a CSV text and return the decoded column
 * names in file order. Header names are always quoted by the dump tooling
 * (they're plain strings, not the NULL token) but this treats a NULL-shaped
 * header defensively as literal text rather than throwing.
 */
export function parseCsvHeader(text: string): string[] {
  const parser = new CsvParser();
  let rows = parser.feed(text);
  if (rows.length === 0) rows = parser.end();
  if (rows.length === 0) {
    throw new Error("CSV text has no header row");
  }
  return rows[0]!.map((f) => f.value);
}

/**
 * Streams a CSV file off disk row-by-row without materializing the whole
 * file in memory (used for `--dry-run` row counting and the manifest
 * cross-check; the header row is yielded first like any other row - callers
 * that need it separately should read row 0 themselves).
 *
 * `node:fs`/`node:path` are Node built-ins, not a new dependency; this is
 * the only place in scripts/etl/ that touches the filesystem directly, so
 * the production loader and the (filesystem-free) PGlite test can both
 * reuse everything else in this module.
 */
export async function* streamCsvRows(
  filePath: string,
): AsyncGenerator<CsvRow> {
  const { createReadStream } = await import("node:fs");
  const parser = new CsvParser();
  const stream = createReadStream(filePath, { encoding: "utf8" });
  try {
    for await (const chunk of stream) {
      const rows = parser.feed(chunk as string);
      for (const row of rows) yield row;
    }
    for (const row of parser.end()) yield row;
  } finally {
    stream.destroy();
  }
}

/**
 * Reads just the header row of a CSV file on disk, without reading the
 * rest of the file (the underlying stream is destroyed as soon as the
 * first row is available - see the `finally` in `streamCsvRows`, which
 * runs on this generator's early `return()`).
 */
export async function readCsvHeaderFromFile(
  filePath: string,
): Promise<string[]> {
  for await (const row of streamCsvRows(filePath)) {
    return row.map((f) => f.value);
  }
  throw new Error(`CSV file has no header row: ${filePath}`);
}
