/**
 * Shared cheerio helpers for the legacy extractors. Encodes the two
 * recurring markup shapes emitted by legacy HTML helpers:
 *
 *  - `ReportDisplayFor`/`IfSpecifiedReportDisplayFor`/the default
 *    `ObjectReport.cshtml` template all render
 *    `<tr><td class="description">Label</td><td class="value">...</td></tr>`
 *    rows into a `table.reports_table` (TMD/Extensions/DisplayExtensions.cs,
 *    TMD/Views/Shared/DisplayTemplates/ObjectReport.cshtml).
 *  - `Html.DataTablesGrid<T>()` renders
 *    `<div class="dataTablesGrid"><table class="display">...</table>
 *    <div class="dataTables_info">...</div>
 *    <div class="dataTables_paginate ...">...</div></div>`
 *    (TMD/Extensions/DataTablesGrid.cs, DataTablesGridRenderer).
 */
import type { CheerioAPI, Cheerio } from "cheerio";
import { collapseWhitespace } from "../../normalize";
import type { GridColumnJson, GridJson, GridRowJson, LinkedText, MarkerPhotoJson, ReportRows } from "../schema";

/**
 * cheerio's DOM node type (`domhandler`'s `Element`/`AnyNode`) is not
 * re-exported from the public `cheerio` package entry point, and
 * `domhandler` itself is only a transitive dependency (not hoisted by pnpm,
 * and this task may not run `pnpm add`/modify package.json to make it a
 * direct one). Standing in with `unknown` instead of `Element` would break
 * every cheerio method call on `Cheerio<T>` below, so this alias documents
 * the one, intentional `any` rather than scattering unexplained `any`s.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyElement = any;

export interface ParsedRow {
  label: string;
  valueText: string;
  $value: Cheerio<AnyElement>;
}

/**
 * Parses the direct `<tr>` children of a `table.reports_table` (or any
 * table using the description/value cell convention) into label/value
 * pairs, preserving the raw value cell so callers can pull links or other
 * structure out of specific rows before flattening the rest to text.
 */
export function parseReportRowsRaw($: CheerioAPI, $table: Cheerio<AnyElement>): ParsedRow[] {
  const out: ParsedRow[] = [];
  $table.find("tr").each((_, tr) => {
    const $tr = $(tr);
    const $description = $tr.children("td.description");
    if ($description.length === 0) return; // skip non-report rows (shouldn't happen in scoped tables)
    const label = collapseWhitespace($description.text());
    const $value = $tr.children("td.value");
    const valueText = collapseWhitespace($value.text());
    out.push({ label, valueText, $value });
  });
  return out;
}

/** Flattens parsed rows to a plain label -> displayed-text map. */
export function toReportRows(rows: ParsedRow[]): ReportRows {
  const map: ReportRows = {};
  for (const r of rows) map[r.label] = r.valueText;
  return map;
}

/** Same as `toReportRows` but drops the given labels (use for rows extracted separately, e.g. as LinkedText). */
export function toReportRowsExcluding(rows: ParsedRow[], excludeLabels: string[]): ReportRows {
  const exclude = new Set(excludeLabels);
  const map: ReportRows = {};
  for (const r of rows) {
    if (exclude.has(r.label)) continue;
    map[r.label] = r.valueText;
  }
  return map;
}

export function findRow(rows: ParsedRow[], label: string): ParsedRow | undefined {
  return rows.find((r) => r.label === label);
}

/** Extracts the first `<a>` inside a container as {text, href}; falls back to plain collapsed text with a null href. */
export function extractLinkedText($: CheerioAPI, $container: Cheerio<AnyElement>): LinkedText {
  const $a = $container.find("a").first();
  if ($a.length > 0) {
    return { text: collapseWhitespace($a.text()), href: $a.attr("href") ?? null };
  }
  return { text: collapseWhitespace($container.text()), href: null };
}

/** Parses a `table.reports_table` scoped to a single `<tr><td class="description"><strong>Name</strong></td><td class="value">...link...</td></tr>` marker-info header row (StateMarkerInfo/SiteMarkerInfo/TreeMarkerInfo.cshtml first row). */
export function extractMarkerHeader(
  $: CheerioAPI,
  $table: Cheerio<AnyElement>,
): { name: string; detailsLink: LinkedText } {
  const $firstRow = $table.find("tr").first();
  const name = collapseWhitespace($firstRow.children("td.description").text());
  const detailsLink = extractLinkedText($, $firstRow.children("td.value"));
  return { name, detailsLink };
}

/**
 * Extracts marker-info "Photos" row thumbnails (`Html.Photo(photo,
 * PhotoSize.Square, PhotoSize.Medium)`, TMD/Extensions/PhotoExtensions.cs):
 * for the Square/MiniSquare/MapSquare/MiniMapSquare inline sizes it renders
 * `<a href="..." rel="facebox"><img alt="" src="{inlineSizeUrl}"/></a>` per
 * photo - only the `<img src>` (the inline thumbnail actually displayed) is
 * captured, per photo.
 */
export function extractMarkerPhotos($: CheerioAPI, $valueCell: Cheerio<AnyElement>): MarkerPhotoJson[] {
  const photos: MarkerPhotoJson[] = [];
  $valueCell.find("img").each((_, img) => {
    const src = $(img).attr("src");
    if (src) photos.push({ thumbnailSrc: src });
  });
  return photos;
}

/**
 * Parses one `div.dataTablesGrid` fragment (DataTablesGridRenderer.Render +
 * RenderPager) into the shared GridJson shape.
 */
export function parseGrid($: CheerioAPI, $gridRoot: Cheerio<AnyElement>): GridJson {
  const $table = $gridRoot.find("table.display").first();
  const $headRow = $table.find("thead").first().children("tr").first();
  const columns: GridColumnJson[] = [];
  $headRow.children("th").each((_, th) => {
    const $th = $(th);
    const classAttr = $th.attr("class") ?? "";
    const sortable = /\bsortable\b/.test(classAttr);
    let sortState: GridColumnJson["sortState"] = "none";
    if (/\bsorting_asc\b/.test(classAttr)) sortState = "asc";
    else if (/\bsorting_desc\b/.test(classAttr)) sortState = "desc";
    columns.push({ header: collapseWhitespace($th.text()), sortable, sortState });
  });

  const rows: GridRowJson[] = [];
  $table
    .find("tbody")
    .first()
    .children("tr")
    .each((_, tr) => {
      const $tr = $(tr);
      const cells: string[] = [];
      const links: (LinkedText | null)[] = [];
      $tr.children("td").each((_, td) => {
        const $td = $(td);
        cells.push(collapseWhitespace($td.text()));
        const $a = $td.find("a").first();
        links.push($a.length > 0 ? { text: collapseWhitespace($a.text()), href: $a.attr("href") ?? null } : null);
      });
      rows.push({ cells, links });
    });

  const pageInfo = collapseWhitespace($gridRoot.find("div.dataTables_info").first().text());
  const hasPreviousPage = $gridRoot.find("a.paginate_enabled_previous").length > 0;
  const hasNextPage = $gridRoot.find("a.paginate_enabled_next").length > 0;

  return { columns, rows, pageInfo, hasPreviousPage, hasNextPage };
}

/**
 * Finds the `.portlet` whose `.portlet-header h4` text passes `match`, and
 * returns its `.portlet-content` element. Used because the Browse detail
 * views identify sections by heading text rather than stable ids/classes
 * (multiple `table.reports_table` / `div.dataTablesGrid` per page).
 */
export function findPortletContentByHeading(
  $: CheerioAPI,
  match: (headingText: string) => boolean,
): Cheerio<AnyElement> {
  const portlets = $(".portlet").filter((_, el) => {
    const heading = collapseWhitespace($(el).children(".portlet-header").first().find("h4").first().text());
    return match(heading);
  });
  return portlets.first().children(".portlet-content").first();
}
