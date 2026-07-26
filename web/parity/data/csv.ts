/**
 * Hand-rolled, streaming, RFC4180-ish CSV reader for the P0-03 legacy dump
 * format (doc 02 §P0-03, doc 07 §7.1; see web/scripts/dump-legacy.sql /
 * dump-legacy.ps1 header comments for the exact convention this parses):
 *
 *   - Header row + data rows, CRLF line endings, UTF-8.
 *   - Every field is double-quoted with embedded quotes doubled ("" per
 *     RFC4180) EXCEPT a true SQL NULL, which is emitted as the bare,
 *     UNQUOTED, exact 4-character token `NULL`. A real empty string is a
 *     quoted `""`. This is PostgreSQL's own `COPY ... CSV NULL 'NULL'`
 *     convention.
 *
 * Deliberately NOT importing scripts/etl/csv.ts (a parallel task's ETL
 * loader may have its own parser) - this is parity/data's own small parser,
 * per this task's explicit ownership boundary.
 *
 * Streaming: implemented as a small incremental state machine (`CsvScanner`)
 * fed chunk-by-chunk, so row boundaries and quote-escape sequences (`""`)
 * are handled correctly even when split across two stream chunks (a real
 * risk with fs.createReadStream's default 64KB high-water mark). This is
 * what makes `parseCsvRowsFromFile` genuinely streaming rather than
 * "read the whole file into memory, then split" - callers that only care
 * about small in-memory strings (tests) can use `parseCsvStringSync`
 * instead, which reuses the same scanner over a single synchronous chunk.
 */
import { createReadStream } from "node:fs";

/** A single CSV field's decoded value: `null` only for the bare NULL token; every other field (including a real empty string) is a string. */
export type CsvValue = string | null;

const NULL_TOKEN = "NULL";

/**
 * Incremental CSV row scanner. Feed it text via `feed()` (call as many times
 * as you have chunks); it returns any rows completed by that chunk. Call
 * `finish()` once at end-of-input to flush a final row that wasn't
 * terminated by a trailing newline.
 */
export class CsvScanner {
  private buffer = "";
  private quoted = false;
  private inQuotes = false;
  private fieldStarted = false;
  private quotePending = false; // saw a `"` while inQuotes; ambiguous until the next char (escape vs close)
  private pendingCR = false; // saw a bare `\r`; ambiguous until the next char (CRLF vs lone CR)
  private row: CsvValue[] = [];

  feed(text: string): CsvValue[][] {
    const rows: CsvValue[][] = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i]!;

      if (this.quotePending) {
        this.quotePending = false;
        if (ch === '"') {
          this.buffer += '"';
          continue;
        }
        this.inQuotes = false;
        // fall through: ch is not part of the escape, process it normally below.
      }

      if (this.pendingCR) {
        this.pendingCR = false;
        if (ch === "\n") continue; // consumed the LF half of a CRLF pair.
        // fall through: lone CR already ended the row; ch starts the next token.
      }

      if (this.inQuotes) {
        if (ch === '"') {
          this.quotePending = true;
        } else {
          this.buffer += ch;
        }
        continue;
      }

      if (!this.fieldStarted && ch === '"') {
        this.quoted = true;
        this.inQuotes = true;
        this.fieldStarted = true;
        continue;
      }

      if (ch === ",") {
        this.pushField();
        continue;
      }

      if (ch === "\r") {
        this.pushField();
        rows.push(this.row);
        this.row = [];
        this.pendingCR = true;
        continue;
      }

      if (ch === "\n") {
        this.pushField();
        rows.push(this.row);
        this.row = [];
        continue;
      }

      this.buffer += ch;
      this.fieldStarted = true;
    }
    return rows;
  }

  /** Flushes a trailing row with no terminating newline. Returns null if there's nothing pending. */
  finish(): CsvValue[] | null {
    if (this.quotePending) {
      this.quotePending = false;
      this.inQuotes = false;
    }
    if (this.buffer !== "" || this.fieldStarted || this.row.length > 0) {
      this.pushField();
      const r = this.row;
      this.row = [];
      return r;
    }
    return null;
  }

  private pushField(): void {
    const value: CsvValue = this.quoted ? this.buffer : this.buffer === NULL_TOKEN ? null : this.buffer;
    this.row.push(value);
    this.buffer = "";
    this.quoted = false;
    this.fieldStarted = false;
  }
}

/** Parses a complete CSV string synchronously (no streaming) - for tests / small in-memory fixtures. */
export function parseCsvStringSync(text: string): CsvValue[][] {
  const scanner = new CsvScanner();
  const rows = scanner.feed(text);
  const last = scanner.finish();
  if (last) rows.push(last);
  return rows;
}

/** Streams CSV rows from an async iterable of text chunks (e.g. a readable stream in utf-8 mode). */
export async function* parseCsvRows(chunks: AsyncIterable<string>): AsyncGenerator<CsvValue[]> {
  const scanner = new CsvScanner();
  for await (const chunk of chunks) {
    for (const row of scanner.feed(chunk)) yield row;
  }
  const last = scanner.finish();
  if (last) yield last;
}

/** Streams CSV rows directly from a file path. */
export async function* parseCsvRowsFromFile(filePath: string): AsyncGenerator<CsvValue[]> {
  const stream = createReadStream(filePath, { encoding: "utf-8" });
  yield* parseCsvRows(stream);
}

/** Streams CSV rows as header-keyed records (first row is consumed as the header). */
export async function* parseCsvRecords(
  filePath: string,
): AsyncGenerator<Record<string, CsvValue>> {
  let header: string[] | null = null;
  for await (const row of parseCsvRowsFromFile(filePath)) {
    if (!header) {
      header = row.map((v) => v ?? "");
      continue;
    }
    yield rowToRecord(header, row, filePath);
  }
}

/** Parses a complete in-memory CSV string into header-keyed records (tests / small fixtures). */
export function parseCsvRecordsSync(text: string): Record<string, CsvValue>[] {
  const rows = parseCsvStringSync(text);
  if (rows.length === 0) return [];
  const header = rows[0]!.map((v) => v ?? "");
  return rows.slice(1).map((row) => rowToRecord(header, row, "<inline>"));
}

function rowToRecord(header: string[], row: CsvValue[], source: string): Record<string, CsvValue> {
  if (row.length !== header.length) {
    throw new Error(
      `csv.ts: row field count (${row.length}) != header count (${header.length}) in ${source}. ` +
        `Row: ${JSON.stringify(row)}`,
    );
  }
  const record: Record<string, CsvValue> = {};
  for (let i = 0; i < header.length; i++) record[header[i]!] = row[i]!;
  return record;
}
