// Shared response-building helpers for the 8 `/export/**` route handlers
// (P1-11, doc 03 P1-11, doc 01 §8). Not a `route.ts`/`page.tsx` file, so
// Next.js's App Router does not treat this as a route segment; the `_lib`
// folder-name underscore prefix makes that explicit too.

import {
  buildTreeCsvRow,
  csvHeaders,
  exportFilename,
  serializeCsv,
  Units,
  type CsvFilterIdentifier,
  type ExportTreeRow,
} from "@/lib/export/tree-csv";

export { exportFilename };
export type { CsvFilterIdentifier };

/**
 * `UnitsExtensions.Abbreviation`/`.Describe()` (Units.cs:9-22): `Default`/
 * `Feet` -> "ft", `Meters` -> "m", `Yards` -> "yd". Duplicated here (not
 * imported) because `lib/export/tree-csv.ts`'s equivalent
 * (`unitsAbbreviation`) is a private, unexported helper of that
 * already-landed module (owned by another task) -- needed directly here
 * only for the `Export/Trees/{id}` filename, which bypasses
 * `TreeCsvExporter.Filename`/`Identifiers` entirely:
 * `ExportController.cs:26`: `$"Tree-{tree.Id} ({UserSession.Units.Describe()}).csv"`.
 */
function unitsFilenameToken(units: Units): string {
  return units === Units.Yards ? "yd" : units === Units.Meters ? "m" : "ft";
}

/** `Export/Trees/{id}` filename -- see `unitsFilenameToken` doc above. */
export function treeExportFilename(treeId: number, units: Units): string {
  return `Tree-${treeId} (${unitsFilenameToken(units)}).csv`;
}

/**
 * BUGFIX (surfaced by the P1-15 sweep): the HTTP `Headers` API (Fetch spec,
 * what `Response` uses under the hood) requires header VALUES to be valid
 * Latin1/ByteString - any character above U+00FF throws a hard `TypeError`
 * when the response is constructed, a real 500 crash (confirmed live:
 * `/export/species/M. acuminata var. subcordata x m. x soulangeana
 * 'alexandrina' (Yellow Lantern Magnolia)` - the common name contains
 * curly-quote U+2018/U+2019 - 500s unconditionally). Non-ASCII species/site/
 * state names are real production data (doc 07 §3's corpus explicitly
 * includes "non-ASCII" species names as an edge case), so this is not a
 * theoretical concern. Fixed the standard RFC 6266/5987 way: the legacy
 * exact-byte filename still goes in the ASCII-safe `filename=` fallback
 * param (non-ASCII chars replaced, never crashes), with the real Unicode
 * filename in `filename*=UTF-8''<percent-encoded>` for clients that
 * understand it (virtually all modern browsers) - `Content-Disposition`
 * filename parity is a documented, currently-inactive gap regardless (see
 * this function's own next comment), so this doesn't change what parity
 * compares, only whether the response 500s.
 */
function asciiSafeFilename(filename: string): string {
  // Strip anything outside printable ASCII (header values must be Latin1/ByteString).
  return filename.replace(/[^\x20-\x7E]/g, "_");
}

/**
 * `CsvFileResult` (CsvFileResult.cs:9-28): `Content-Type: text/csv`,
 * `Content-Disposition: attachment; filename="..."` (ASP.NET's
 * `System.Net.Mime.ContentDisposition.ToString()`, which quotes the
 * filename and backslash-escapes embedded `"`/`\`), UTF-8 body with no BOM
 * (`Encoding.UTF8.GetBytes`), no trailing newline (`serializeCsv`).
 *
 * KNOWN GAP (verify.ts's own doc comment, `parity/verify/exports.ts`):
 * `capture.ts` never stored legacy's `Content-Disposition` header, so
 * filename parity is not currently exercised by the sweep either way.
 */
export function csvResponse(rows: ExportTreeRow[], units: Units, filename: string): Response {
  const csv = serializeCsv(csvHeaders(units), rows.map((row) => buildTreeCsvRow(row, units)));
  const escapedAsciiFilename = asciiSafeFilename(filename).replace(/(["\\])/g, "\\$1");
  const encodedUtf8Filename = encodeURIComponent(filename);
  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${escapedAsciiFilename}"; filename*=UTF-8''${encodedUtf8Filename}`,
    },
  });
}

/** 404 body for a missing tree/site/state -- legacy `NotFoundResult`. */
export function exportNotFound(): Response {
  return new Response("Not Found", { status: 404 });
}
