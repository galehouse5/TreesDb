/**
 * Legacy extractor for the site details page.
 * Source view: TMD/Views/Browse/SiteDetails.cshtml, plus:
 *   - TMD/Views/Browse/SiteSpeciesGridPartial2.cshtml (Species grid, no parameterNamePrefix)
 *   - TMD/Views/Browse/DisplayTemplates/BrowsePhotoSummaryList.cshtml / BrowsePhotoSumaryModel.cshtml
 *
 * Key assumptions:
 *   - siteId is read off the "Export tree data" link's href (`/Export/Sites/{id}`),
 *     same rationale as tree-details (no plain-text id on the page).
 *   - The "Ownership contact" row is EITHER a `ReportDisplayFor` row (label
 *     "Ownership contact", from `OwnershipContactInfo`'s DisplayName) when
 *     `MakeOwnershipContactInfoPublic` is true, OR a hand-written row with
 *     literal value text "(private)" - both use the same
 *     `td.description`/`td.value` shape, so a single row lookup for label
 *     "Ownership contact" is correct either way, and the private case's
 *     literal "(private)" ends up in `summary` like any other value.
 *   - Trip history rows (`#TripHistory`) are `support_table` rows containing
 *     a nested `reports_table` with Visitors/TripReportUrl/Comments; Visited
 *     is the `<span class="ticket open">` text in the first cell.
 *   - Location table has no "Site" row (unlike tree-details) - only
 *     Coordinates(/calculated), OwnershipType, County, State(link).
 */
import * as cheerio from "cheerio";
import type { SiteDetailsJson, SiteVisitJson, PhotoSummaryRowJson } from "../schema";
import { collapseWhitespace } from "../../normalize";
import {
  extractLinkedText,
  findPortletContentByHeading,
  findRow,
  parseGrid,
  parseReportRowsRaw,
  toReportRowsExcluding,
} from "./dom-helpers";

export function extract(html: string): SiteDetailsJson {
  const $ = cheerio.load(html);

  const exportHref = $('a[href*="/Export/Sites/"]').first().attr("href") ?? "";
  const siteIdMatch = /\/Export\/Sites\/(\d+)/.exec(exportHref);
  if (!siteIdMatch) {
    throw new Error("site-details extractor: could not determine siteId from the 'Export tree data' link");
  }
  const siteId = Number(siteIdMatch[1]);

  const $summaryTable = $("#SiteSummary table.reports_table").first();
  const summary = toReportRowsExcluding(parseReportRowsRaw($, $summaryTable), []);

  const visits: SiteVisitJson[] = [];
  $("#TripHistory table.support_table > tr, #TripHistory table.support_table > tbody > tr").each((_, tr) => {
    const $tr = $(tr);
    const visited = collapseWhitespace($tr.find("> td").eq(0).find("span.ticket").first().text());
    const $nested = $tr.find("> td").eq(1).find("table.reports_table").first();
    const nestedRows = parseReportRowsRaw($, $nested);
    visits.push({
      visited,
      visitors: findRow(nestedRows, "Visitors")?.valueText ?? "",
      tripReportUrl: findRow(nestedRows, "Trip report url")?.valueText ?? null,
      comments: findRow(nestedRows, "General comments")?.valueText ?? "",
    });
  });

  const speciesContent = findPortletContentByHeading($, (h) => h === "Species");
  const speciesGrid = parseGrid($, speciesContent.find(".dataTablesGrid").first());

  const $locationTable = $("#LocationSummary table.reports_table").first();
  const locationRows = parseReportRowsRaw($, $locationTable);
  const coordinatesRow =
    findRow(locationRows, "Coordinates (calculated)") ?? findRow(locationRows, "Coordinates");
  const stateRow = findRow(locationRows, "State");
  const location = {
    coordinatesLabel: coordinatesRow?.label ?? "",
    coordinatesValue: coordinatesRow?.valueText ?? "",
    coordinatesKind: (coordinatesRow?.label === "Coordinates (calculated)" ? "calculated" : "specified") as
      | "calculated"
      | "specified",
    rows: toReportRowsExcluding(locationRows, ["Coordinates", "Coordinates (calculated)", "State"]),
    state: stateRow ? extractLinkedText($, stateRow.$value) : { text: "", href: null },
  };

  const photosContent = findPortletContentByHeading($, (h) => h === "Photos");
  const photos: PhotoSummaryRowJson[] = [];
  photosContent.find("table.support_table > tbody > tr, table.support_table > tr").each((_, tr) => {
    const $tr = $(tr);
    const $cells = $tr.children("td");
    if ($cells.length < 3) return;
    photos.push({
      date: collapseWhitespace($cells.eq(0).text()),
      photoCount: $cells.eq(1).find("ul.gallery > li").length,
      photographers: collapseWhitespace($cells.eq(2).text()),
    });
  });

  return {
    siteId,
    summary,
    visits,
    speciesGrid,
    location,
    photos,
    hasPhotos: photos.length > 0,
  };
}
