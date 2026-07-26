/**
 * Legacy extractor for the state details page.
 * Source view: TMD/Views/Browse/StateDetails.cshtml, plus:
 *   - TMD/Views/Browse/StateSpeciesGridPartial.cshtml (Species grid, prefix "stateSpecies")
 *   - TMD/Views/Browse/SitesGridPartial.cshtml (Sites grid, prefix "sites")
 *
 * Key assumption: stateId is read off the "Export tree data" link's href
 * (`/Export/States/{id}`) - like tree/site details, no plain-text id is
 * printed on the page itself.
 */
import * as cheerio from "cheerio";
import type { StateDetailsJson } from "../schema";
import { findPortletContentByHeading, parseGrid, parseReportRowsRaw, toReportRowsExcluding } from "./dom-helpers";

export function extract(html: string): StateDetailsJson {
  const $ = cheerio.load(html);

  const exportHref = $('a[href*="/Export/States/"]').first().attr("href") ?? "";
  const stateIdMatch = /\/Export\/States\/(\d+)/.exec(exportHref);
  if (!stateIdMatch) {
    throw new Error("state-details extractor: could not determine stateId from the 'Export tree data' link");
  }
  const stateId = Number(stateIdMatch[1]);

  const stateContent = findPortletContentByHeading($, (h) => h === "State");
  const summary = toReportRowsExcluding(
    parseReportRowsRaw($, stateContent.find("table.reports_table").first()),
    [],
  );

  const locationContent = findPortletContentByHeading($, (h) => h === "Location");
  const location = toReportRowsExcluding(
    parseReportRowsRaw($, locationContent.find("table.reports_table").first()),
    [],
  );

  const speciesContent = findPortletContentByHeading($, (h) => h === "Species");
  const speciesGrid = parseGrid($, speciesContent.find(".dataTablesGrid").first());

  const sitesContent = findPortletContentByHeading($, (h) => h === "Sites");
  const sitesGrid = parseGrid($, sitesContent.find(".dataTablesGrid").first());

  return { stateId, summary, location, speciesGrid, sitesGrid };
}
