/**
 * New-side extractor for `/states/[id]` (`app/states/[id]/page.tsx`, task
 * P1-08). Same rationale as `tree-details.ts`/`site-details.ts`: reuses
 * `parity/extractors/legacy/dom-helpers.ts` UNMODIFIED against
 * `components/details/report-table.tsx`'s legacy-class-mirroring markup and
 * `parseGrid` against the two embedded grids. Unlike the legacy extractor
 * (`parity/extractors/legacy/state-details.ts`), which has to scrape the
 * state id off the "Export tree data" link's href (no export link on the
 * new page -- CSV export is a separate task, P1-11), the state id is read
 * off a `data-state-id` attribute on the page's root element instead.
 */
import * as cheerio from "cheerio";
import type { StateDetailsJson } from "../schema";
import { findPortletContentByHeading, parseGrid, parseReportRowsRaw, toReportRowsExcluding } from "../legacy/dom-helpers";
import type { NewExtractorContext } from "./index";

export function extract(html: string, _ctx?: NewExtractorContext): StateDetailsJson {
  const $ = cheerio.load(html);

  const idAttr = $("[data-state-id]").first().attr("data-state-id") ?? "";
  const stateId = Number(idAttr);
  if (!Number.isInteger(stateId)) {
    throw new Error("state-details (new) extractor: could not read data-state-id off the page root");
  }

  const stateContent = findPortletContentByHeading($, (h) => h === "State");
  const summary = toReportRowsExcluding(parseReportRowsRaw($, stateContent.find("table.reports_table").first()), []);

  const locationContent = findPortletContentByHeading($, (h) => h === "Location");
  const location = toReportRowsExcluding(parseReportRowsRaw($, locationContent.find("table.reports_table").first()), []);

  const speciesContent = findPortletContentByHeading($, (h) => h === "Species");
  const speciesGrid = parseGrid($, speciesContent.find(".dataTablesGrid").first());

  const sitesContent = findPortletContentByHeading($, (h) => h === "Sites");
  const sitesGrid = parseGrid($, sitesContent.find(".dataTablesGrid").first());

  return { stateId, summary, location, speciesGrid, sitesGrid };
}
