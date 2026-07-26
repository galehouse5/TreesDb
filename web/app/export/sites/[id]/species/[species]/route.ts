// GET /export/sites/[id]/species/[species] -- mirrors legacy
// `GET /Export/Sites/{id}/Species/{botanicalName} ({commonName})`
// (`ExportController.SitesSpecies`, ExportController.cs:41-52).
//
// NOTE: the action signature is `SitesSpecies(int id, string
// botanicalName)` -- it does NOT declare a `commonName` parameter, even
// though the route template has a `{commonName}` placeholder. ASP.NET MVC
// binds route values to action parameters by name; an unconsumed route
// value is simply dropped. So `commonName` is parsed out of the URL only
// to validate/strip the segment shape -- it is NOT passed to `GetTrees`
// (filter is `botanicalName` only, an exact match) and NOT added to
// `Identifiers`.
//
// `Identifiers["Site"] = site.Id.ToString()`, `Identifiers["Species"] =
// botanicalName` (in that order) -> filename
// `Site-{id} Species-{botanicalName} Trees ({unit}).csv`.
//
// 404 iff the site doesn't exist, OR the `[species]` segment doesn't match
// the legacy `"{bn} ({cn})"` shape (see `parseSpeciesSegment`).
import { NextRequest } from "next/server";
import { getExportTrees } from "@/db/queries/export-trees.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { csvResponse, exportFilename, exportNotFound } from "../../../../_lib/csv-response";
import { siteExists } from "../../../../_lib/lookups";
import { parseSpeciesSegment } from "../../../../_lib/species-segment";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; species: string }> },
) {
  const { id, species } = await params;
  const siteId = Number(id);
  const parsed = parseSpeciesSegment(species);
  if (!Number.isInteger(siteId) || !parsed || !(await siteExists(siteId))) return exportNotFound();

  const rows = await getExportTrees({ siteId, botanicalName: parsed.botanicalName });
  const units = readUnitsPreference(request.cookies);
  const filename = exportFilename(
    [
      { key: "Site", value: String(siteId) },
      { key: "Species", value: parsed.botanicalName },
    ],
    units,
  );
  return csvResponse(rows, units, filename);
}
