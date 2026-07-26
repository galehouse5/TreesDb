// GET /export/species/[species] -- mirrors legacy
// `GET /Export/Species/{botanicalName} ({commonName})`
// (`ExportController.Species`, ExportController.cs:79-86).
//
// Unlike the site-/state-scoped species exports, this action's signature
// (`Species(string botanicalName, string commonName)`) DOES declare both
// parameters and passes both to `GetTrees` (exact match on both). But only
// `botanicalName` goes into `Identifiers["Botanical Name"]` -- `commonName`
// is a filter only, never shown in the filename.
//
// No entity-existence check at all in legacy -- always 200, even when zero
// trees match (header-only CSV). 404 only for a malformed `[species]`
// segment (not matching `"{bn} ({cn})"`), mirroring legacy's route
// template simply not matching such a URL.
import { NextRequest } from "next/server";
import { getExportTrees } from "@/db/queries/export-trees.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { csvResponse, exportFilename, exportNotFound } from "../../_lib/csv-response";
import { parseSpeciesSegment } from "../../_lib/species-segment";

export async function GET(request: NextRequest, { params }: { params: Promise<{ species: string }> }) {
  const { species } = await params;
  const parsed = parseSpeciesSegment(species);
  if (!parsed) return exportNotFound();

  const rows = await getExportTrees({
    botanicalName: parsed.botanicalName,
    commonName: parsed.commonName,
  });
  const units = readUnitsPreference(request.cookies);
  const filename = exportFilename([{ key: "Botanical Name", value: parsed.botanicalName }], units);
  return csvResponse(rows, units, filename);
}
