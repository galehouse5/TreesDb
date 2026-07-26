// Parses the legacy `{botanicalName} ({commonName})` export URL segment.
//
// Source: `TMD/Global.asax.cs` route templates (literal, not action-param
// derived): `"Export/Species/{botanicalName} ({commonName})"`,
// `"Export/Sites/{id}/Species/{botanicalName} ({commonName})"`,
// `"Export/States/{id}/Species/{botanicalName} ({commonName})"`. ASP.NET
// routing splits the decoded segment on the literal text `" ("` .. `")"`
// bracketing `commonName`; `botanicalName` (never containing `" ("` in
// practice -- binomial nomenclature has no parens) greedily takes
// everything before the LAST such occurrence. Next.js already URL-decodes
// a `[species]` dynamic segment before handing it to the route handler,
// matching what ASP.NET's routing operates on.
//
// BUGFIX (surfaced by the P1-15 sweep): this previously used the regex
// `/^(.*) \(([^)]*)\)$/`, whose doc comment claimed it reproduces "greedily
// takes everything before the LAST [' ('] occurrence" -- it does NOT, once
// `commonName` itself contains a nested `)` (real production data: species
// "Vitis labrusca (Northern Fox Grape (Vine))" -- doc 07 §3's corpus
// explicitly calls out species names containing non-ASCII/punctuation
// edge cases). `[^)]*` cannot span an embedded `)`, so for that input the
// regex fails to match at BOTH candidate " (" boundaries and returns
// `null` unconditionally -- a real functional 404 on a URL legacy itself
// serves 200 for (confirmed against the captured production snapshot,
// `parity/snapshots/exports/Export/Species/Vitis...csv`). Switched to a
// plain `lastIndexOf(" (")` split, matching the equivalent, already-tested
// algorithm in `parity/normalize.ts`'s `splitSpeciesRouteSegment` (doc 06
// P4-01) -- for a doubly-nested case like this one, the split still lands
// on the LAST " (" and leaves one unmatched trailing `)` inside
// `commonName` (e.g. commonName ends up `"Vine)"`), which is the same
// "good enough, not perfectly recursive" behavior `splitSpeciesRouteSegment`
// already has and is unit-tested for -- consistent, not a new limitation.
export interface ParsedSpeciesSegment {
  botanicalName: string;
  commonName: string;
}

/**
 * Returns `null` when the segment doesn't contain `" ("` .. trailing `")"`
 * at all -- legacy's literal-text route template simply would not have
 * matched such a URL, falling through to the `CatchAll` -> `Error/NotFound`
 * route, so callers should treat `null` as a 404.
 */
export function parseSpeciesSegment(raw: string): ParsedSpeciesSegment | null {
  const idx = raw.lastIndexOf(" (");
  if (idx === -1 || !raw.endsWith(")")) return null;
  return { botanicalName: raw.slice(0, idx), commonName: raw.slice(idx + 2, -1) };
}
