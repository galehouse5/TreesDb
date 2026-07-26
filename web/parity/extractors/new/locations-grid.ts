/**
 * New-side extractor for the `/locations` grid (`app/locations/page.tsx`,
 * task P1-03). `html` is the full server-rendered page (no separate AJAX
 * partial in the new app -- every request already returns the full page).
 *
 * Reuses `parity/extractors/legacy/dom-helpers.ts`'s `parseGrid` UNMODIFIED
 * rather than re-implementing an equivalent cheerio parser: the grid
 * markup in `components/grids/browse-grid.tsx` deliberately mirrors the
 * legacy grid partial's own class-name conventions (`.dataTablesGrid`,
 * `table.display`, `th.sortable`/`.sorting_asc`/`.sorting_desc`,
 * `div.dataTables_info`, `a.paginate_enabled_previous`/
 * `.paginate_enabled_next`) purely as structural hooks for this file --
 * see that component's file header for the full rationale. No legacy CSS
 * is loaded; these classes carry no styling in the new app.
 */
import * as cheerio from "cheerio";
import type { GridJson } from "../schema";
import type { NewExtractorContext } from "./index";
import { parseGrid } from "../legacy/dom-helpers";

export function extract(html: string, _ctx?: NewExtractorContext): GridJson {
  const $ = cheerio.load(html);
  return parseGrid($, $(".dataTablesGrid").first());
}
