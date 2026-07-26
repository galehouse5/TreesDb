/**
 * GET /api/species/suggest?by=common|scientific&term=&results= -- port of
 * `TreesController.FindKnownSpeciesWithSimilar{Common,Scientific}Name`
 * (`TMD/Controllers/TreesController.cs:8-31`), task P1-09, doc 01 §1's
 * URL-equivalence entries `autocomplete-common-name`/
 * `autocomplete-scientific-name` (`web/parity/normalize.ts`).
 *
 * Legacy exposes these as two DISTINCT URLs
 * (`/Trees/FindKnownSpeciesWithSimilarCommonName`,
 * `…ScientificName`); the new URL scheme (doc 03) collapses them into one
 * route distinguished by `?by=`. `results` defaults to 5 (legacy `int
 * results = 5` action-parameter default, `TreesController.cs:8,20`).
 *
 * JSON shapes copied VERBATIM from the doc 07 corpus snapshots
 * (`web/parity/snapshots/autocomplete/Trees/*.json`), field names/casing
 * exactly as legacy's anonymous-type `Json(...)` results serialize them:
 *
 *   FindKnownSpeciesWithSimilarCommonName ->
 *     [{ "label": "{CommonName} ({ScientificName})", "value": CommonName, "ScientificName": ScientificName }, ...]
 *   FindKnownSpeciesWithSimilarScientificName ->
 *     [{ "value": ScientificName, "CommonName": CommonName }, ...]
 *
 * Ranking itself lives in `./rank.ts` (Jaro/Jaro-Winkler transcribed from
 * the `SimMetrics.dll` IL) -- this route only resolves query params, loads
 * candidates (`./known-species.sql.ts`), and shapes the JSON.
 */
import { NextRequest, NextResponse } from "next/server";
import { listAllKnownSpecies } from "./known-species.sql";
import { rankKnownSpeciesBySimilarCommonName, rankKnownSpeciesBySimilarScientificName } from "./rank";

/** `int results = 5` default parameter (TreesController.cs:8,20); a present-but-unparseable value binds to `default(int)` = 0 under ASP.NET MVC's model binder (best-effort match -- no corpus snapshot exercises this edge case). */
function resolveResults(raw: string | null): number {
  if (raw === null) return 5;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : 0;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const by = searchParams.get("by");
  const term = searchParams.get("term") ?? "";
  const results = resolveResults(searchParams.get("results"));

  if (by !== "common" && by !== "scientific") {
    return NextResponse.json({ error: "by must be 'common' or 'scientific'" }, { status: 400 });
  }

  const candidates = await listAllKnownSpecies();

  if (by === "common") {
    const matches = rankKnownSpeciesBySimilarCommonName(term, candidates, results);
    return NextResponse.json(
      matches.map((m) => ({
        label: `${m.commonName} (${m.scientificName})`,
        value: m.commonName,
        ScientificName: m.scientificName,
      })),
    );
  }

  const matches = rankKnownSpeciesBySimilarScientificName(term, candidates, results);
  return NextResponse.json(
    matches.map((m) => ({
      value: m.scientificName,
      CommonName: m.commonName,
    })),
  );
}
