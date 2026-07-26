// GET /export/sites/[id] -- mirrors legacy `GET /Export/Sites/{id}`
// (`ExportController.Sites`, ExportController.cs:29-39).
//
// `Identifiers["Site"] = site.Id.ToString()` -> filename
// `Site-{id} Trees ({unit}).csv` via `exportFilename`.
//
// 404 iff the site itself doesn't exist (`Repositories.Sites.FindById`) --
// a site with zero trees still exports a 200, header-only CSV.
import { NextRequest } from "next/server";
import { getExportTrees } from "@/db/queries/export-trees.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { csvResponse, exportFilename, exportNotFound } from "../../_lib/csv-response";
import { siteExists } from "../../_lib/lookups";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const siteId = Number(id);
  if (!Number.isInteger(siteId) || !(await siteExists(siteId))) return exportNotFound();

  const rows = await getExportTrees({ siteId });
  const units = readUnitsPreference(request.cookies);
  const filename = exportFilename([{ key: "Site", value: String(siteId) }], units);
  return csvResponse(rows, units, filename);
}
