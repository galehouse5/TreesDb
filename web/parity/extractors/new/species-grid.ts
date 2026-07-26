/**
 * New-side extractor for the `/species` grid (`app/species/page.tsx`, task
 * P1-04). Same rationale as `locations-grid.ts`: reuses
 * `parity/extractors/legacy/dom-helpers.ts`'s `parseGrid` unmodified
 * against `components/grids/browse-grid.tsx`'s legacy-class-name-mirroring
 * markup.
 */
import * as cheerio from "cheerio";
import type { GridJson } from "../schema";
import type { NewExtractorContext } from "./index";
import { parseGrid } from "../legacy/dom-helpers";

export function extract(html: string, _ctx?: NewExtractorContext): GridJson {
  const $ = cheerio.load(html);
  return parseGrid($, $(".dataTablesGrid").first());
}
