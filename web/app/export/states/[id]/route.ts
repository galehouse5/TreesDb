// GET /export/states/[id] -- mirrors legacy `GET /Export/States/{id}`
// (`ExportController.States`, ExportController.cs:54-64).
//
// `Identifiers["State"] = state.Code` (State.cs:25-35: `DoubleLetterCode`
// unless blank, else `TripleLetterCode`) -> filename
// `State-{code} Trees ({unit}).csv` via `exportFilename`.
//
// 404 iff the state itself doesn't exist
// (`Repositories.Locations.FindStateById`) -- a state with zero trees
// still exports a 200, header-only CSV.
import { NextRequest } from "next/server";
import { getExportTrees } from "@/db/queries/export-trees.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { csvResponse, exportFilename, exportNotFound } from "../../_lib/csv-response";
import { findStateCode } from "../../_lib/lookups";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stateId = Number(id);
  if (!Number.isInteger(stateId)) return exportNotFound();
  const code = await findStateCode(stateId);
  if (code === null) return exportNotFound();

  const rows = await getExportTrees({ stateId });
  const units = readUnitsPreference(request.cookies);
  const filename = exportFilename([{ key: "State", value: code }], units);
  return csvResponse(rows, units, filename);
}
