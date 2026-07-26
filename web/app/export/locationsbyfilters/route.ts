// GET /export/locationsbyfilters -- mirrors legacy
// `GET /Export/LocationsByFilters?stateFilter=&countyFilter=&siteFilter=`
// (`ExportController.LocationsByFilters`, ExportController.cs:98-107),
// linked from `TMD/Views/Browse/Locations.cshtml:12` as
// `Export/LocationsByFilters?StateFilter=...&CountyFilter=...&SiteFilter=...`.
//
// `Identifiers["State"] = stateFilter`, `Identifiers["County"] =
// countyFilter`, `Identifiers["Site"] = siteFilter` (in that order).
//
// No entity-existence check -- always 200 (same "unmatched filter param ->
// unfiltered All Trees export" behavior as `speciesbyfilters`).
import { NextRequest } from "next/server";
import { getExportTrees } from "@/db/queries/export-trees.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { csvResponse, exportFilename } from "../_lib/csv-response";
import { getSearchParamCI } from "../_lib/query-params";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stateFilter = getSearchParamCI(searchParams, "stateFilter");
  const countyFilter = getSearchParamCI(searchParams, "countyFilter");
  const siteFilter = getSearchParamCI(searchParams, "siteFilter");

  const rows = await getExportTrees({ stateFilter, countyFilter, siteFilter });
  const units = readUnitsPreference(request.cookies);
  const filename = exportFilename(
    [
      { key: "State", value: stateFilter },
      { key: "County", value: countyFilter },
      { key: "Site", value: siteFilter },
    ],
    units,
  );
  return csvResponse(rows, units, filename);
}
