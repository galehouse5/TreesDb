// GET /export/trees/[id] -- mirrors legacy `GET /Export/Trees/{id}`
// (`ExportController.Trees`, ExportController.cs:19-27).
//
// Filename bypasses `TreeCsvExporter.Filename`/`Identifiers` entirely:
// `$"Tree-{tree.Id} ({UserSession.Units.Describe()}).csv"` -- see
// `treeExportFilename` in `../../_lib/csv-response.ts`.
//
// 404: legacy checks `Repositories.Trees.FindById(id)` before calling
// `GetTrees`. A tree is always present in its own
// `GetTrees(treeId: tree.Id)` result (the filter is `Tree.Id = treeId`,
// necessarily matching the tree itself), so an empty result here is
// equivalent to "tree does not exist" -- no separate existence lookup
// needed (contrast `sites/[id]`/`states/[id]`, where a site/state can
// exist with zero trees and must still export a 200).
import { NextRequest } from "next/server";
import { getExportTrees } from "@/db/queries/export-trees.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { csvResponse, exportNotFound, treeExportFilename } from "../../_lib/csv-response";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const treeId = Number(id);
  if (!Number.isInteger(treeId)) return exportNotFound();

  const rows = await getExportTrees({ treeId });
  if (rows.length === 0) return exportNotFound();

  const units = readUnitsPreference(request.cookies);
  return csvResponse(rows, units, treeExportFilename(treeId, units));
}
