/**
 * New-side extractor for `/trees/[id]` (`app/trees/[id]/page.tsx`, task
 * P1-05). Reuses `parity/extractors/legacy/dom-helpers.ts` UNMODIFIED --
 * same rationale as `locations-grid.ts`/`species-grid.ts`: the page's
 * markup (`components/details/report-table.tsx`) deliberately mirrors the
 * legacy view's own class-name/id conventions (`reports_table`,
 * `description`/`value`, `portlet`/`portlet-header`/`portlet-content`,
 * `LocationSummary`, `support_table`/`gallery`) purely as structural hooks
 * -- no legacy CSS is loaded, these classes carry no styling in the new
 * app. The overall extraction logic below is intentionally close to
 * `parity/extractors/legacy/tree-details.ts` (same target shape,
 * `TreeDetailsJson`), with one structural difference: the new page has no
 * "Export tree data" link (CSV export is a separate task, P1-11), so the
 * tree id is read off a `data-tree-id` attribute on the page's root element
 * instead.
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
} from "../legacy/dom-helpers";
import type { NewExtractorContext } from "./index";

export function extract(html: string, _ctx?: NewExtractorContext): TreeDetailsJson {
  const $ = cheerio.load(html);

  const idAttr = $("[data-tree-id]").first().attr("data-tree-id") ?? "";
  const treeId = Number(idAttr);
  if (!Number.isInteger(treeId)) {
    throw new Error("tree-details (new) extractor: could not read data-tree-id off the page root");
  }

  const treeContent = findPortletContentByHeading($, (h) => h === "Tree");
  const $detailsTable = treeContent.find("table.reports_table").first();
  const detailRows = parseReportRowsRaw($, $detailsTable);
  const botanicalRow = findRow(detailRows, "Botanical name");
  const commonRow = findRow(detailRows, "Common name");
  const botanicalName = botanicalRow ? extractLinkedText($, botanicalRow.$value) : { text: "", href: null };
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
  const coordinatesRow = findRow(locationRows, "Coordinates (calculated)") ?? findRow(locationRows, "Coordinates");
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
