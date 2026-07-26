/**
 * Legacy extractor for the tree details page.
 * Source view: TMD/Views/Browse/TreeDetails.cshtml, plus its partials:
 *   - TMD/Views/Browse/DisplayTemplates/BrowseTreeDetailsModel.cshtml (Details table + each measurement's "Details" tab)
 *   - TMD/Views/Browse/DisplayTemplates/BrowseTreeSummaryModel.cshtml (each measurement's "Summary" tab)
 *   - TMD/Views/Browse/DisplayTemplates/BrowsePhotoSummaryList.cshtml / BrowsePhotoSumaryModel.cshtml (Photos portlet)
 *
 * Key assumptions (verified against the .cshtml + TMD/Extensions/DataTablesGrid.cs / DisplayExtensions.cs):
 *   - treeId is not printed as plain text anywhere on the page; it is read
 *     off the "Export tree data" link's href (`/Export/Trees/{id}`).
 *   - Botanical/common name rows are hand-written `<tr>`s with `<a>` links
 *     to SpeciesDetails, NOT `ReportDisplayFor` - extracted as LinkedText,
 *     excluded from the generic `details` row map.
 *   - Each measurement portlet renders its Summary and Details tabs into
 *     TWO separate `table.reports_table` elements (ids `MeasurementSummary{i}`
 *     / `MeasurementDetails{i}`), but BOTH tables also include a `Measurers`
 *     row emitted by a second `Html.ReportDisplayFor` call INSIDE the same
 *     `<table>` as the display-template output (see the .cshtml: the
 *     `ReportDisplayFor(... .Measurers)` call sits inside the same
 *     `<table class="reports_table">` as `DisplayFor`). Measurers is pulled
 *     out of the summary table and reported once as `measurers`.
 *   - The Location table shows exactly one of "Coordinates" /
 *     "Coordinates (calculated)" (legacy `if/else`); Site and State are
 *     hand-written link rows, not `ReportDisplayFor`.
 */
import * as cheerio from "cheerio";
import { collapseWhitespace } from "../../normalize";
import type { PhotoSummaryRowJson, TreeDetailsJson, TreeMeasurementJson } from "../schema";
import {
  extractLinkedText,
  findPortletContentByHeading,
  findRow,
  parseReportRowsRaw,
  toReportRowsExcluding,
} from "./dom-helpers";

export function extract(html: string): TreeDetailsJson {
  const $ = cheerio.load(html);

  const exportHref = $('a[href*="/Export/Trees/"]').first().attr("href") ?? "";
  const treeIdMatch = /\/Export\/Trees\/(\d+)/.exec(exportHref);
  if (!treeIdMatch) {
    throw new Error("tree-details extractor: could not determine treeId from the 'Export tree data' link");
  }
  const treeId = Number(treeIdMatch[1]);

  const treeContent = findPortletContentByHeading($, (h) => h === "Tree");
  const $detailsTable = treeContent.find("table.reports_table").first();
  const detailRows = parseReportRowsRaw($, $detailsTable);
  const botanicalRow = findRow(detailRows, "Botanical name");
  const commonRow = findRow(detailRows, "Common name");
  const botanicalName = botanicalRow
    ? extractLinkedText($, botanicalRow.$value)
    : { text: "", href: null };
  const commonName = commonRow ? extractLinkedText($, commonRow.$value) : { text: "", href: null };
  const details = toReportRowsExcluding(detailRows, ["Botanical name", "Common name"]);

  const measurements: TreeMeasurementJson[] = [];
  $(".portlet").each((_, el) => {
    const $portlet = $(el);
    const heading = collapseWhitespace($portlet.find(".portlet-header h4").first().text());
    if (!heading.startsWith("Measured on ")) return;

    const $summaryTable = $portlet.find('[id^="MeasurementSummary"] table.reports_table').first();
    const $detailsTableM = $portlet.find('[id^="MeasurementDetails"] table.reports_table').first();
    const summaryRows = parseReportRowsRaw($, $summaryTable);
    const detailRowsM = parseReportRowsRaw($, $detailsTableM);
    const measurersRow = findRow(summaryRows, "Measurers") ?? findRow(detailRowsM, "Measurers");

    measurements.push({
      heading,
      summary: toReportRowsExcluding(summaryRows, ["Measurers"]),
      details: toReportRowsExcluding(detailRowsM, ["Measurers"]),
      measurers: measurersRow?.valueText ?? "",
    });
  });

  const $locationTable = $("#LocationSummary table.reports_table").first();
  const locationRows = parseReportRowsRaw($, $locationTable);
  const coordinatesRow =
    findRow(locationRows, "Coordinates (calculated)") ?? findRow(locationRows, "Coordinates");
  const siteRow = findRow(locationRows, "Site");
  const stateRow = findRow(locationRows, "State");
  const location = {
    coordinatesLabel: coordinatesRow?.label ?? "",
    coordinatesValue: coordinatesRow?.valueText ?? "",
    coordinatesKind: (coordinatesRow?.label === "Coordinates (calculated)" ? "calculated" : "specified") as
      | "calculated"
      | "specified",
    site: siteRow ? extractLinkedText($, siteRow.$value) : { text: "", href: null },
    rows: toReportRowsExcluding(locationRows, ["Coordinates", "Coordinates (calculated)", "Site", "State"]),
    state: stateRow ? extractLinkedText($, stateRow.$value) : { text: "", href: null },
  };

  const photosContent = findPortletContentByHeading($, (h) => h === "Photos");
  const photos: PhotoSummaryRowJson[] = [];
  photosContent.find("table.support_table > tbody > tr, table.support_table > tr").each((_, tr) => {
    const $tr = $(tr);
    const $cells = $tr.children("td");
    const date = collapseWhitespace($cells.eq(0).text());
    const photoCount = $cells.eq(1).find("ul.gallery > li").length;
    const photographers = collapseWhitespace($cells.eq(2).text());
    photos.push({ date, photoCount, photographers });
  });

  return {
    treeId,
    botanicalName,
    commonName,
    details,
    measurements,
    location,
    photos,
    hasPhotos: photos.length > 0,
  };
}
