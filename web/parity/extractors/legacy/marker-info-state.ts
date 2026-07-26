/**
 * Legacy extractor for the state map-marker info popup partial.
 * Source view: TMD/Views/Map/StateMarkerInfo.cshtml.
 *
 * Key assumptions:
 *   - stateId is not printed as plain text; read off the "View more
 *     details" link's href (`/Browse/States/{id}/Details`).
 *   - The first `<tr>` (`<strong>Name</strong>` + details link) is a
 *     hand-written header row, not `ReportDisplayFor` - excluded from the
 *     generic row map and returned separately as `name`/`detailsLink`.
 *   - RHI5/RHI10/RHI20/RGI5/RGI10/RGI20 use `IfSpecifiedReportDisplayFor`
 *     (MapStateMarkerInfoModel has no `NullDisplayText` override, unlike
 *     the Browse state page) - the row is entirely ABSENT when unspecified,
 *     not rendered with a placeholder. Absence here means the label is
 *     simply missing from `rows`.
 */
import * as cheerio from "cheerio";
import type { StateMarkerInfoJson } from "../schema";
import { extractMarkerHeader, parseReportRowsRaw, toReportRows } from "./dom-helpers";

export function extract(html: string): StateMarkerInfoJson {
  const $ = cheerio.load(html);
  const $table = $("table.reports_table").first();
  const { name, detailsLink } = extractMarkerHeader($, $table);

  const stateIdMatch = /\/Browse\/States\/(\d+)\/Details/.exec(detailsLink.href ?? "");
  if (!stateIdMatch) {
    throw new Error("marker-info-state extractor: could not determine stateId from the details link");
  }

  const allRows = parseReportRowsRaw($, $table);
  const rows = toReportRows(allRows.slice(1)); // drop the hand-written header row

  return { stateId: Number(stateIdMatch[1]), name, detailsLink, rows };
}
