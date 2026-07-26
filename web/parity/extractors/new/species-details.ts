/**
 * New-side extractor for `/species/[slug]` (`app/species/[slug]/page.tsx`,
 * task P1-07). Reuses `parity/extractors/legacy/dom-helpers.ts` UNMODIFIED --
 * same rationale as `tree-details.ts`/`site-details.ts`: the page's markup
 * (`components/details/report-table.tsx`) deliberately mirrors the legacy
 * view's own class-name/id conventions purely as structural hooks. Overall
 * extraction logic mirrors `parity/extractors/legacy/species-details.ts`
 * (same target shape, `SpeciesDetailsJson`) closely -- see that file's
 * header for the "state portlet always precedes site portlet, matched by
 * heading prefix" reasoning, which holds identically on the new page since
 * it renders the same portlet ORDER for the same reason (site-scoped pages
 * always also derive + show the state-scoped section).
 *
 * Unlike tree/site details, this page has no natural single numeric id to
 * expose via a `data-*` attribute (species are identified by the
 * (botanicalName, commonName) pair, not an id) -- and the legacy extractor
 * itself doesn't need one either (`SpeciesDetailsJson` carries no id field),
 * so none is added here.
 */
import * as cheerio from "cheerio";
import type { SpeciesDetailsJson, SpeciesMaxRowsJson } from "../schema";
import { collapseWhitespace } from "../../normalize";
import {
  extractLinkedText,
  findPortletContentByHeading,
  findRow,
  parseGrid,
  parseReportRowsRaw,
  type ParsedRow,
} from "../legacy/dom-helpers";
import type { NewExtractorContext } from "./index";

function extractMaxima($: cheerio.CheerioAPI, rows: ParsedRow[]): SpeciesMaxRowsJson {
  const maxima: SpeciesMaxRowsJson = {};
  const height = findRow(rows, "Max height");
  if (height) maxima.maxHeight = extractLinkedText($, height.$value);
  const girth = findRow(rows, "Max girth");
  if (girth) maxima.maxGirth = extractLinkedText($, girth.$value);
  const crownSpread = findRow(rows, "Max crown spread");
  if (crownSpread) maxima.maxCrownSpread = extractLinkedText($, crownSpread.$value);
  return maxima;
}

export function extract(html: string, _ctx?: NewExtractorContext): SpeciesDetailsJson {
  const $ = cheerio.load(html);

  const globalContent = findPortletContentByHeading($, (h) => h === "Species");
  const globalRows = parseReportRowsRaw($, globalContent.find("table.reports_table").first());
  const botanicalName = findRow(globalRows, "Botanical name")?.valueText ?? "";
  const commonName = findRow(globalRows, "Common name")?.valueText ?? "";
  const global = extractMaxima($, globalRows);

  const withinPortlets = $(".portlet").filter((_, el) =>
    collapseWhitespace($(el).find(".portlet-header h4").first().text()).startsWith("Species within "),
  );

  let state: SpeciesDetailsJson["state"];
  let site: SpeciesDetailsJson["site"];

  if (withinPortlets.length >= 1) {
    const $content = withinPortlets.eq(0).find(".portlet-content");
    const rows = parseReportRowsRaw($, $content.find("table.reports_table").first());
    const stateRow = findRow(rows, "State");
    state = {
      state: stateRow ? extractLinkedText($, stateRow.$value) : { text: "", href: null },
      maxima: extractMaxima($, rows),
    };
  }

  if (withinPortlets.length >= 2) {
    const $content = withinPortlets.eq(1).find(".portlet-content");
    const rows = parseReportRowsRaw($, $content.find("table.reports_table").first());
    const siteRow = findRow(rows, "Site");
    site = {
      site: siteRow ? extractLinkedText($, siteRow.$value) : { text: "", href: null },
      rows: {
        ...(findRow(rows, "Ownership type") ? { "Ownership type": findRow(rows, "Ownership type")!.valueText } : {}),
        ...(findRow(rows, "County") ? { County: findRow(rows, "County")!.valueText } : {}),
      },
      maxima: extractMaxima($, rows),
    };
  }

  const recordedStatesContent = findPortletContentByHeading($, (h) => h === "Recorded states");
  const recordedStatesGrid = parseGrid($, recordedStatesContent.find(".dataTablesGrid").first());

  let recordedSitesGrid: SpeciesDetailsJson["recordedSitesGrid"];
  const recordedSitesContent = findPortletContentByHeading($, (h) => h.startsWith("Recorded sites within "));
  if (recordedSitesContent.length > 0) {
    recordedSitesGrid = parseGrid($, recordedSitesContent.find(".dataTablesGrid").first());
  }

  let recordedTreesGrid: SpeciesDetailsJson["recordedTreesGrid"];
  const recordedTreesContent = findPortletContentByHeading($, (h) => h.startsWith("Recorded trees within "));
  if (recordedTreesContent.length > 0) {
    recordedTreesGrid = parseGrid($, recordedTreesContent.find(".dataTablesGrid").first());
  }

  return {
    botanicalName,
    commonName,
    global,
    state,
    site,
    recordedStatesGrid,
    recordedSitesGrid,
    recordedTreesGrid,
  };
}
