// GET /export/states/[id]/species/[species] -- mirrors legacy
// `GET /Export/States/{id}/Species/{botanicalName} ({commonName})`
// (`ExportController.StatesSpecies`, ExportController.cs:66-77).
//
// NOTE: same as `sites/[id]/species/[species]` -- the action signature is
// `StatesSpecies(int id, string botanicalName)`, no `commonName`
// parameter, so the parsed `commonName` is discarded (not filtered on, not
// added to `Identifiers`).
//
// `Identifiers["State"] = state.Code`, `Identifiers["Species"] =
// botanicalName` (in that order) -> filename
// `State-{code} Species-{botanicalName} Trees ({unit}).csv`.
//
// 404 iff the state doesn't exist, OR the `[species]` segment doesn't
// match the legacy `"{bn} ({cn})"` shape.
import { NextRequest } from "next/server";
import { getExportTrees } from "@/db/queries/export-trees.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { csvResponse, exportFilename, exportNotFound } from "../../../../_lib/csv-response";
import { findStateCode } from "../../../../_lib/lookups";
import { parseSpeciesSegment } from "../../../../_lib/species-segment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; species: string }> },
) {
  const { id, species } = await params;
  const stateId = Number(id);
  const parsed = parseSpeciesSegment(species);
  if (!Number.isInteger(stateId) || !parsed) return exportNotFound();
  const code = await findStateCode(stateId);
  if (code === null) return exportNotFound();

  const rows = await getExportTrees({ stateId, botanicalName: parsed.botanicalName });
  const units = readUnitsPreference(request.cookies);
  const filename = exportFilename(
    [
      { key: "State", value: code },
      { key: "Species", value: parsed.botanicalName },
    ],
    units,
  );
  return csvResponse(rows, units, filename);
}
