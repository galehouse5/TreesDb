/**
 * Legacy extractor for the (global / state-scoped / site-scoped) species
 * details page.
 * Source view: TMD/Views/Browse/SpeciesDetails.cshtml, plus:
 *   - TMD/Views/Browse/SpeciesByStateGridPartial.cshtml ("Recorded states" grid, prefix "stateSpecies")
 *   - TMD/Views/Browse/SiteSpeciesGridPartial.cshtml ("Recorded sites within {state}" grid, prefix "siteSpecies")
 *   - TMD/Views/Browse/TreesGridPartial.cshtml ("Recorded trees within {site}" grid, prefix "trees")
 *
 * Key assumptions (TMD/Controllers/BrowseController.cs SpeciesDetails action):
 *   - `Model.StateDetails`/`StateSpeciesModel` populate whenever `stateId`
 *     is known (explicit `?stateId=`, or implied by `?siteId=` since the
 *     controller derives the site's state and treats it as if stateId were
 *     passed). `Model.SiteDetails`/`TreesModel` populate only when `siteId`
 *     is explicit. So a site-scoped page ALWAYS also renders the
 *     state-scoped section, in that order (state portlet before site
 *     portlet in the .cshtml).
 *   - "Species within {name}" portlets are matched by heading PREFIX (the
 *     suffix is the live State/Site name, not a stable string); if two such
 *     portlets exist, the first (document order) is state-scoped and the
 *     second is site-scoped, per the assumption above.
 *   - Global ScientificName/CommonName ARE `ReportDisplayFor` rows (plain
 *     text, label "Botanical name"/"Common name"); by contrast every
 *     "Max height"/"Max girth"/"Max crown spread" row (global, state- and
 *     site-scoped) and the "State"/"Site" identity rows are hand-written
 *     link rows sharing the same td.description/td.value shape, so the
 *     generic row parser + `extractLinkedText` handles all of them.
 *   - "Recorded sites within..." / "Recorded trees within..." portlets are
 *     matched by heading prefix for the same reason.
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
} from "./dom-helpers";

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

export function extract(html: string): SpeciesDetailsJson {
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
