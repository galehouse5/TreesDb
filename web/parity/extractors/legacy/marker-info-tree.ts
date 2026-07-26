/**
 * Legacy extractor for the tree map-marker info popup partial.
 * Source view: TMD/Views/Map/TreeMarkerInfo.cshtml.
 *
 * Key assumptions:
 *   - treeId read off the "View more details" link's href
 *     (`/Browse/Trees/{id}/Details`).
 *   - Header row's `<strong>` text is the SCIENTIFIC name here (unlike
 *     state/site marker info, which header on the entity's plain `Name`) -
 *     excluded from `rows`.
 *   - CommonName is a plain `ReportDisplayFor` row (always present).
 *     Height/Girth/CrownSpread/TDI3/TDI2/ENTSPTS2/ENTSPTS are
 *     `IfSpecifiedReportDisplayFor` - absent when unspecified.
 *   - The champion-points row is EITHER the exact ("Champion points") OR
 *     abbreviated ("Champion points (abbreviated)") `ReportDisplayFor` row,
 *     and - unlike the Tree Details page - there is NO "(not enough data)"
 *     fallback row here when neither is available; the row is simply
 *     absent. Both label variants are left as ordinary keys in `rows`.
 *   - Photos row (hand-written, label "Photos") present only when
 *     `Model.Photos.Count > 0`; extracted via `extractMarkerPhotos` and
 *     excluded from `rows`.
 *   - `LastMeasured` (`ReportDisplayFor`, DisplayName "Measured") is always
 *     the final row, after the optional Photos row.
 */
import * as cheerio from "cheerio";
import type { TreeMarkerInfoJson } from "../schema";
import { extractMarkerHeader, extractMarkerPhotos, findRow, parseReportRowsRaw, toReportRowsExcluding } from "./dom-helpers";

export function extract(html: string): TreeMarkerInfoJson {
  const $ = cheerio.load(html);
  const $table = $("table.reports_table").first();
  const { name: scientificName, detailsLink } = extractMarkerHeader($, $table);

  const treeIdMatch = /\/Browse\/Trees\/(\d+)\/Details/.exec(detailsLink.href ?? "");
  if (!treeIdMatch) {
    throw new Error("marker-info-tree extractor: could not determine treeId from the details link");
  }

  const allRows = parseReportRowsRaw($, $table).slice(1); // drop hand-written header row
  const photosRow = findRow(allRows, "Photos");
  const lastMeasuredRow = findRow(allRows, "Measured");

  return {
    treeId: Number(treeIdMatch[1]),
    scientificName,
    detailsLink,
    rows: toReportRowsExcluding(allRows, ["Photos", "Measured"]),
    photos: photosRow ? extractMarkerPhotos($, photosRow.$value) : [],
    lastMeasured: lastMeasuredRow?.valueText ?? "",
  };
}
