/**
 * Legacy extractor for the Browse/Locations sites grid.
 * Source view: TMD/Views/Browse/LocationsGridPartial.cshtml (rendered
 * standalone for AJAX requests, or wrapped in a `.portlet` by
 * TMD/Views/Browse/Locations.cshtml for the full-page load). Works on
 * either form: it locates the first `div.dataTablesGrid` anywhere in the
 * document rather than assuming a particular wrapper.
 * Columns (TMD/Extensions/DataTablesGrid.cs `DataTablesColumnBuilder`
 * calls in LocationsGridPartial.cshtml): Site, County, State, RHI5, RHI10,
 * RGI5, RGI10, LastMeasurement.
 */
import * as cheerio from "cheerio";
import type { GridJson } from "../schema";
import { parseGrid } from "./dom-helpers";

export function extract(html: string): GridJson {
  const $ = cheerio.load(html);
  return parseGrid($, $(".dataTablesGrid").first());
}
