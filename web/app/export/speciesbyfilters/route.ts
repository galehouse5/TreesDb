// GET /export/speciesbyfilters -- mirrors legacy
// `GET /Export/SpeciesByFilters?botanicalNameFilter=&commonNameFilter=`
// (`ExportController.SpeciesByFilters`, ExportController.cs:88-96), linked
// from `TMD/Views/Browse/Species.cshtml:12` as
// `Export/SpeciesByFilters?BotanicalNameFilter=...&CommonNameFilter=...`.
//
// `Identifiers["Botanical Name"] = botanicalNameFilter`,
// `Identifiers["Common Name"] = commonNameFilter` (in that order).
//
// No entity-existence check -- always 200 (an unmatched/absent filter
// param, e.g. the `?filter=a` shape used by some captured corpus
// artifacts, binds to nothing and falls through to an unfiltered "All
// Trees" export).
import { NextRequest } from "next/server";
import { getExportTrees } from "@/db/queries/export-trees.sql";
import { readUnitsPreference } from "@/lib/units/cookie";
import { csvResponse, exportFilename } from "../_lib/csv-response";
import { getSearchParamCI } from "../_lib/query-params";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const botanicalNameFilter = getSearchParamCI(searchParams, "botanicalNameFilter");
  const commonNameFilter = getSearchParamCI(searchParams, "commonNameFilter");

  const rows = await getExportTrees({ botanicalNameFilter, commonNameFilter });
  const units = readUnitsPreference(request.cookies);
  const filename = exportFilename(
    [
      { key: "Botanical Name", value: botanicalNameFilter },
      { key: "Common Name", value: commonNameFilter },
    ],
    units,
  );
  return csvResponse(rows, units, filename);
}
