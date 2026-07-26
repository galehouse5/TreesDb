/**
 * Legacy extractor for the site map-marker info popup partial.
 * Source view: TMD/Views/Map/SiteMarkerInfo.cshtml.
 *
 * Key assumptions:
 *   - siteId read off the "View more details" link's href
 *     (`/Browse/Sites/{id}/Details`).
 *   - Header row (name + details link) excluded from `rows`, same as
 *     marker-info-state.
 *   - State/County/OwnershipType/TreesMeasuredCount always render
 *     (`ReportDisplayFor`); RHI5/10/20 and RGI5/10/20 are `IfSpecified` -
 *     entirely absent when unspecified (MapSiteMarkerInfoModel has no
 *     `NullDisplayText`, unlike the Browse site page).
 *   - The Photos row (hand-written, label "Photos") is present only when
 *     `Model.Photos.Count > 0`; extracted separately via
 *     `extractMarkerPhotos` and excluded from `rows`.
 *   - `LastMeasurementDate` (`ReportDisplayFor`, label "Last measurement
 *     date") is always the final row, AFTER the optional Photos row -
 *     pulled out separately per the schema, matching the tree marker info
 *     shape.
 */
import * as cheerio from "cheerio";
import type { SiteMarkerInfoJson } from "../schema";
import { extractMarkerHeader, extractMarkerPhotos, findRow, parseReportRowsRaw, toReportRowsExcluding } from "./dom-helpers";

export function extract(html: string): SiteMarkerInfoJson {
  const $ = cheerio.load(html);
  const $table = $("table.reports_table").first();
  const { name, detailsLink } = extractMarkerHeader($, $table);

  const siteIdMatch = /\/Browse\/Sites\/(\d+)\/Details/.exec(detailsLink.href ?? "");
  if (!siteIdMatch) {
    throw new Error("marker-info-site extractor: could not determine siteId from the details link");
  }

  const allRows = parseReportRowsRaw($, $table).slice(1); // drop hand-written header row
  const photosRow = findRow(allRows, "Photos");
  const lastMeasurementRow = findRow(allRows, "Last measurement date");

  return {
    siteId: Number(siteIdMatch[1]),
    name,
    detailsLink,
    rows: toReportRowsExcluding(allRows, ["Photos", "Last measurement date"]),
    photos: photosRow ? extractMarkerPhotos($, photosRow.$value) : [],
    lastMeasurementDate: lastMeasurementRow?.valueText ?? "",
  };
}
