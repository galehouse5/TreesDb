/**
 * `exports` category comparator (doc 07 §5.1) - pure, no I/O. Byte-identical
 * after trailing-newline strip; also compares the `Content-Disposition`
 * filename. "Strongest oracle" per the doc: normalization here is
 * deliberately minimal - a failure almost always means a real bug.
 */
import type { Diff } from "../data/comparator";
import { classifyD016SpeciesExportArtifact, isD016WhitespaceCollapseEqual, W010_WAIVER_ID } from "../data/waivers";
import { makeDiff } from "./diff-helpers";

/** Strips exactly one trailing newline (CRLF or LF) - doc §5.1: "strip nothing except a trailing newline." */
export function stripTrailingNewline(s: string): string {
  if (s.endsWith("\r\n")) return s.slice(0, -2);
  if (s.endsWith("\n")) return s.slice(0, -1);
  return s;
}

// ---------------------------------------------------------------------------
// W-003 (export row order) - ACTIVATED by the P1-15 sweep
// ---------------------------------------------------------------------------
//
// `db/queries/export-trees.sql.ts`'s file header documents an extensive,
// already-completed investigation: legacy's row order (`OrderBy(State.Code)
// .ThenBy(County).ThenBy(Site.Name).ThenBy(CommonName).ThenBy(ScientificName)
// .ThenBy(Height)`) sorts its four string keys under .NET's default
// *culture-aware* (Windows NLS) comparer, which Postgres cannot reproduce
// exactly even with `lower()` + the closest available ICU collation - a
// residual ~56-of-~30,091-row (~0.19%) mismatch concentrated in non-ASCII
// punctuation (curly vs straight apostrophes, etc.), which that file's own
// doc comment recommends "fold into doc 07's W-003 waiver (sort both sides
// by tree id in the comparator)". Doc 07 §5.1 / waivers.md's predeclared
// W-003 text matches exactly: "if unstable in legacy, sort both sides by
// tree id in the comparator and record waiver W-003" (CSV column 10, 0-based
// index 9 in `csvHeaders()`/`buildTreeCsvRow()`, `lib/export/tree-csv.ts`).
// A handful of order-only row swaps early in a large export's ~30k rows
// cascades into a byte-diff at every position afterward under the plain
// string comparison above - so, on any body mismatch, this activates W-003:
// re-parse both sides as CSV, re-sort each by (tree id, measurement number)
// - the one column pair every one of the 8 export endpoints shares (doc
// 03 P1-11: "one shared row-builder for all 8 endpoints") - and re-compare.
// A mismatch that resolves after re-sorting is still recorded as a Diff
// (never silently dropped, doc principle 4 / §9: "a waiver never turns a
// check green silently"), just tagged `waiverHint: "W-003"` so report.ts
// buckets it as "waived", not "failed". Anything that still differs after
// re-sorting is a genuine content bug and fails outright.

const TREE_ID_COLUMN_INDEX = 9; // "Tree id", csvHeaders()/buildTreeCsvRow() column 10 (1-based)
const MEASUREMENT_NUMBER_COLUMN_INDEX = 10; // "Measurement number", the very next column

/** Minimal quote-all CSV parser matching doc §5.1's format (every field quoted, `""` escaping, CRLF rows). Returns one array of field values per row (header included as row 0). */
function parseCsvRows(body: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = body.length;
  while (i < n) {
    const ch = body[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (body[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r" && body[i + 1] === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 2;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Re-serializes rows in doc §5.1's format (quote every field, `""` escape, CRLF-joined, no trailing newline - already stripped by the caller). */
function serializeCsvRows(rows: string[][]): string {
  return rows.map((r) => r.map((v) => `"${v.replace(/"/g, '""')}"`).join(",")).join("\r\n");
}

/**
 * Re-sorts data rows (everything after the header) by (tree id, measurement
 * number) as integers - a stable, deterministic, tree-id-based order that
 * doesn't depend on any string collation. Returns `null` if any row doesn't
 * have a parseable integer in the tree-id column (defensive - shouldn't
 * happen for a real `GetTrees`-shaped export; falling back to `null` means
 * the W-003 rescue attempt is simply skipped, not silently mis-applied).
 */
function sortByTreeIdThenMeasurement(rows: string[][]): string[][] | null {
  const [header, ...data] = rows;
  if (!header) return rows;
  const keyed = data.map((r) => {
    const treeId = Number(r[TREE_ID_COLUMN_INDEX]);
    const measurementNumber = Number(r[MEASUREMENT_NUMBER_COLUMN_INDEX]);
    if (!Number.isFinite(treeId) || !Number.isFinite(measurementNumber)) return null;
    return { treeId, measurementNumber, r };
  });
  if (keyed.some((k) => k === null)) return null;
  const sorted = (keyed as { treeId: number; measurementNumber: number; r: string[] }[])
    .slice()
    .sort((a, b) => a.treeId - b.treeId || a.measurementNumber - b.measurementNumber);
  return [header, ...sorted.map((k) => k.r)];
}

/** Returns true iff re-sorting both bodies' data rows by (tree id, measurement number) makes them identical - the W-003 rescue check. */
function matchesAfterTreeIdResort(legacyBody: string, nextBody: string): boolean {
  const legacyRows = sortByTreeIdThenMeasurement(parseCsvRows(legacyBody));
  const nextRows = sortByTreeIdThenMeasurement(parseCsvRows(nextBody));
  if (legacyRows === null || nextRows === null) return false;
  return serializeCsvRows(legacyRows) === serializeCsvRows(nextRows);
}

// ---------------------------------------------------------------------------
// W-010 (D-016 species whitespace-duplicate cleanup) - three prongs, all
// tried only AFTER the W-003 resort rescue above has already failed to
// fully reconcile the two bodies (a pure row-order difference stays W-003).
//   1. name-cell whitespace (waivers.md W-010: "name cells on the affected
//      trees' rows") - every export row still exists on both sides, only
//      its name cell(s) differ by a whitespace run.
//   3. the closed 7-artifact `/Export/Species/{bn} ({cn})` allowlist - the
//      one shape where D-016 actually changes ROW PRESENCE for an export
//      (a removed duplicate-variant's export is now header-only; a merged
//      clean-twin's export gained the duplicate's rows). Exports has no
//      prong-2 case (D-016 never touches row presence for the OTHER 7
//      endpoints - see prong 1 above).
// ---------------------------------------------------------------------------

/** True iff every corresponding cell in the two (equal-length) rows is either byte-identical or whitespace-collapse-equal (data/waivers.ts's `isD016WhitespaceCollapseEqual`). Shared by prong 1's per-cell rescue and prong 3's row-set matching below. */
function rowCellsCollapseEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  for (let c = 0; c < a.length; c++) {
    if (a[c] !== b[c] && !isD016WhitespaceCollapseEqual(a[c], b[c])) return false;
  }
  return true;
}

/**
 * Prong 1: returns true iff, after re-sorting both bodies' data rows by
 * (tree id, measurement number) - same alignment as
 * `matchesAfterTreeIdResort` - every CELL that still differs between the two
 * aligned row sets is whitespace-collapse-equal (D-016's `\s+` -> single
 * space rule). Returns false (no rescue) if either side fails to parse, the
 * row counts differ, any row's column count differs, or ANY differing cell
 * is NOT whitespace-collapse-equal - a genuine content bug anywhere in the
 * export still fails outright, unaffected by this rule.
 */
function matchesAfterWhitespaceCollapseCells(legacyBody: string, nextBody: string): boolean {
  const legacyRows = sortByTreeIdThenMeasurement(parseCsvRows(legacyBody));
  const nextRows = sortByTreeIdThenMeasurement(parseCsvRows(nextBody));
  if (legacyRows === null || nextRows === null) return false;
  if (legacyRows.length !== nextRows.length) return false;

  let sawADifference = false;
  for (let i = 0; i < legacyRows.length; i++) {
    const legacyRow = legacyRows[i]!;
    const nextRow = nextRows[i]!;
    if (!rowCellsCollapseEqual(legacyRow, nextRow)) return false;
    if (legacyRow.some((v, c) => v !== nextRow[c])) sawADifference = true;
  }
  return sawADifference; // caller only invokes this on an already-confirmed body mismatch, but guard defensively anyway
}

/** Prong 3, "duplicate-variant" shape: true iff `body`'s CSV has no data rows (header only, or literally empty) - D-016 merged/renamed this species away, so the new app has nothing to serve under this literal URL. */
function isHeaderOnlyCsvBody(body: string): boolean {
  return parseCsvRows(body).length <= 1;
}

/**
 * Prong 3, "clean-twin" shape: true iff every LEGACY data row has an
 * unclaimed NEW data row that's cell-collapse-equal to it (multiset/SET
 * matching, not positional - `rowCellsCollapseEqual` per candidate) - i.e.
 * every tree legacy already had for this species is still present in the
 * new body (name-cell whitespace aside), while the new body is free to
 * carry additional rows (the absorbed duplicate-variant's trees). False if
 * the headers themselves aren't collapse-equal, legacy has zero data rows
 * (nothing to be a meaningful subset of), or any legacy row has no
 * unclaimed match - a genuinely missing/changed shared row still fails.
 */
function legacyRowsAreSubsetOfNewRows(legacyBody: string, nextBody: string): boolean {
  const [legacyHeader, ...legacyData] = parseCsvRows(legacyBody);
  const [nextHeader, ...nextData] = parseCsvRows(nextBody);
  if (!legacyHeader || !nextHeader || !rowCellsCollapseEqual(legacyHeader, nextHeader)) return false;
  if (legacyData.length === 0) return false;

  const unclaimed = nextData.slice();
  for (const legacyRow of legacyData) {
    const idx = unclaimed.findIndex((nextRow) => rowCellsCollapseEqual(legacyRow, nextRow));
    if (idx === -1) return false;
    unclaimed.splice(idx, 1);
  }
  return true;
}

/** Prong 3 dispatcher: applies the header-only / subset check appropriate to `label`'s classification (data/waivers.ts's `classifyD016SpeciesExportArtifact`, the closed 7-artifact list). Returns false for any artifact outside that allowlist. */
function rescuedBySpeciesExportAllowlist(label: string, legacyBody: string, nextBody: string): boolean {
  const kind = classifyD016SpeciesExportArtifact(label);
  if (kind === "duplicate-variant") return isHeaderOnlyCsvBody(nextBody);
  if (kind === "clean-twin") return legacyRowsAreSubsetOfNewRows(legacyBody, nextBody);
  return false;
}

/** Extracts the `filename` token from a `Content-Disposition` header value, e.g. `attachment; filename="All Trees (Feet).csv"` -> `All Trees (Feet).csv`. Returns null when absent/unparseable. */
export function extractContentDispositionFilename(headerValue: string | null): string | null {
  if (!headerValue) return null;
  const m = /filename\*?=(?:UTF-8''|")?([^";]+)"?/i.exec(headerValue);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]!.trim());
  } catch {
    return m[1]!.trim();
  }
}

export interface ExportArtifact {
  body: string;
  /**
   * `undefined` means "not available to compare" (see below) - distinct
   * from `null`, which means the header was genuinely absent from a
   * response that WAS checked. Only `null`/a string participate in the
   * filename check; `undefined` skips it (checksRun drops to 1).
   */
  contentDisposition: string | null | undefined;
}

export interface ExportCompareResult {
  diffs: Diff[];
  checksRun: number;
}

/**
 * Compares one export CSV artifact (doc §5.1).
 *
 * KNOWN GAP: `capture.ts` only stores `{url, status, contentType, sha256,
 * capturedAt, savePathBase}` in the exports manifest - it never captured
 * the legacy `Content-Disposition` header (only `content-type`). `verify.ts`
 * therefore always calls this with `legacy.contentDisposition: undefined`
 * for real snapshot-backed runs, and this comparator skips the filename
 * check entirely rather than reporting a spurious "null vs non-null"
 * mismatch on every single artifact. This is reported prominently by
 * `verify.ts` (not silently treated as a pass) - a future capture re-run
 * that starts storing the header is required before doc §5.1's "also
 * compare Content-Disposition filename" is actually exercised.
 */
export function compareExport(label: string, legacy: ExportArtifact, next: ExportArtifact): ExportCompareResult {
  const diffs: Diff[] = [];

  const legacyBody = stripTrailingNewline(legacy.body);
  const nextBody = stripTrailingNewline(next.body);
  if (legacyBody !== nextBody) {
    const rescuedByTreeIdResort = matchesAfterTreeIdResort(legacyBody, nextBody);
    // W-010 prongs are tried only once W-003 has already failed to
    // reconcile the bodies - a pure row-order difference stays W-003.
    const rescuedByWhitespaceCollapse = !rescuedByTreeIdResort && matchesAfterWhitespaceCollapseCells(legacyBody, nextBody);
    const rescuedBySpeciesAllowlist =
      !rescuedByTreeIdResort && !rescuedByWhitespaceCollapse && rescuedBySpeciesExportAllowlist(label, legacyBody, nextBody);
    // NOTE: `expected`/`actual` deliberately hold only the short diverging
    // EXCERPT (see `byteDiffMessage`), never the full body - export bodies
    // run to multi-MB CSVs, and report.ts persists every unwaived/waived
    // Diff verbatim into the committed JSON report (doc §1.5's "first 50
    // diffs verbatim"); embedding full bodies there previously produced a
    // 55 MB report file for a single-character divergence.
    const [expectedExcerpt, actualExcerpt] = excerptAroundFirstDivergence(legacyBody, nextBody);
    diffs.push(
      makeDiff({
        artifact: label,
        field: "body",
        expected: expectedExcerpt,
        actual: actualExcerpt,
        message: rescuedByTreeIdResort
          ? `${label}: body differs only in row order - identical after re-sorting both sides by (tree id, measurement number) (W-003)`
          : rescuedByWhitespaceCollapse
            ? `${label}: body differs only in name-cell whitespace runs - identical after collapsing whitespace on the differing cells (W-010)`
            : rescuedBySpeciesAllowlist
              ? `${label}: body differs because this is a D-016-affected species export (removed duplicate-variant is header-only, or clean-twin's legacy rows are a subset of its new rows) (W-010)`
              : byteDiffMessage(label, legacyBody, nextBody),
        waiverHint: rescuedByTreeIdResort ? "W-003" : rescuedByWhitespaceCollapse || rescuedBySpeciesAllowlist ? W010_WAIVER_ID : undefined,
      }),
    );
  }

  if (legacy.contentDisposition === undefined) {
    return { diffs, checksRun: 1 };
  }

  const legacyFilename = extractContentDispositionFilename(legacy.contentDisposition);
  const nextFilename = extractContentDispositionFilename(next.contentDisposition ?? null);
  if (legacyFilename !== nextFilename) {
    diffs.push(
      makeDiff({
        artifact: label,
        field: "content-disposition-filename",
        expected: legacyFilename,
        actual: nextFilename,
        message: `${label}: Content-Disposition filename mismatch - expected ${JSON.stringify(legacyFilename)}, got ${JSON.stringify(nextFilename)}`,
      }),
    );
  }

  return { diffs, checksRun: 2 };
}

/** First-diverging-character summary, so a body mismatch is actionable without dumping the whole CSV into the report. */
function byteDiffMessage(label: string, a: string, b: string): string {
  let i = 0;
  const n = Math.min(a.length, b.length);
  while (i < n && a[i] === b[i]) i++;
  const context = (s: string, at: number) => JSON.stringify(s.slice(Math.max(0, at - 20), at + 20));
  if (i >= n && a.length !== b.length) {
    return `${label}: body length mismatch (legacy ${a.length} chars, new ${b.length} chars) - shorter side is a prefix of the longer`;
  }
  return `${label}: body diverges at char ${i} - legacy ${context(a, i)}, new ${context(b, i)}`;
}

/** Bounded (±60 char) excerpt around the first divergence, for `Diff.expected`/`.actual` - see `compareExport`'s NOTE on why the full body must never land there. */
function excerptAroundFirstDivergence(a: string, b: string): [string, string] {
  let i = 0;
  const n = Math.min(a.length, b.length);
  while (i < n && a[i] === b[i]) i++;
  const excerpt = (s: string) => s.slice(Math.max(0, i - 60), i + 60);
  return [excerpt(a), excerpt(b)];
}
