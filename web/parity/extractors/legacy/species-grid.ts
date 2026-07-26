/**
 * Legacy extractor for the Browse/Species global species grid.
 * Source view: TMD/Views/Browse/GlobalSpeciesGridPartial.cshtml (rendered
 * standalone for AJAX requests, or wrapped in a `.portlet` by
 * TMD/Views/Browse/Species.cshtml for the full-page load). Same
 * either-form handling as locations-grid.ts.
 * Columns: BotanicalName, CommonName, MaxHeight, MaxGirth, MaxCrownSpread.
 */
import * as cheerio from "cheerio";
import type { GridJson } from "../schema";
import { parseGrid } from "./dom-helpers";

export function extract(html: string): GridJson {
  const $ = cheerio.load(html);
  return parseGrid($, $(".dataTablesGrid").first());
}
