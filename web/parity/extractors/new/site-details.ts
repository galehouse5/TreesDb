/**
 * New-side extractor for `/sites/[id]` (`app/sites/[id]/page.tsx`, task
 * P1-06). Same rationale as `tree-details.ts`: reuses
 * `parity/extractors/legacy/dom-helpers.ts` UNMODIFIED against
 * `components/details/report-table.tsx`'s legacy-class-mirroring markup,
 * plus `parseGrid` (already proven by `locations-grid.ts`/`species-grid.ts`)
 * against the embedded species grid, which is `components/grids/
 * browse-grid.tsx` (P1-03/04) reused as-is. The site id is read off a
 * `data-site-id` attribute on the page's root element (no "Export tree
 * data" link on the new page, CSV export is a separate task, P1-11).
 */
import * as cheerio from "cheerio";
import type { PhotoSummaryRowJson, SiteDetailsJson, SiteVisitJson } from "../schema";
import { collapseWhitespace } from "../../normalize";
import {
  extractLinkedText,
  findPortletContentByHeading,
  findRow,
  parseGrid,
  parseReportRowsRaw,
  toReportRowsExcluding,
} from "../legacy/dom-helpers";
import type { NewExtractorContext } from "./index";

export function extract(html: string, _ctx?: NewExtractorContext): SiteDetailsJson {
  const $ = cheerio.load(html);

  const idAttr = $("[data-site-id]").first().attr("data-site-id") ?? "";
  const siteId = Number(idAttr);
  if (!Number.isInteger(siteId)) {
    throw new Error("site-details (new) extractor: could not read data-site-id off the page root");
  }

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
  const coordinatesRow = findRow(locationRows, "Coordinates (calculated)") ?? findRow(locationRows, "Coordinates");
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
