/**
 * Legacy extractor for the non-AJAX Search results HTML page.
 * Source view: TMD/Views/Search/Index.cshtml.
 * Controller: TMD/Controllers/SearchController.cs `Index`.
 *
 * Key assumptions:
 *   - This is the HTML page only (`X-Requested-With` absent). The AJAX JSON
 *     response (captured separately under the `search` category, doc 07
 *     §4) is a different payload shape and includes synthetic "message"
 *     rows ("No results found" / "Show more results",
 *     TMD/Models/Search/ResultModel.cs `From(string message, ...)`) that
 *     the non-AJAX HTML path never adds - `SearchController.Index` only
 *     appends those for `Request.IsAjaxRequest()`. The HTML page instead
 *     renders literal text "No results found." (with a period, and no
 *     table) when there are zero results.
 *   - `Category` (TMD/Models/Search/ResultModel.cs) is a plain string
 *     ("states" | "sites" | "species") set as a CSS class on
 *     `td.value` (`<td class="value @result.Category">`) - read off that
 *     class attribute, ignoring the literal "value" class.
 *   - term is read from the "Search results for "..."" heading text.
 */
import * as cheerio from "cheerio";
import { collapseWhitespace } from "../../normalize";
import type { SearchResultsPageJson } from "../schema";

export function extract(html: string): SearchResultsPageJson {
  const $ = cheerio.load(html);

  const heading = collapseWhitespace($(".portlet-header h4").first().text());
  const headingMatch = /^Search results for "(.*)"$/.exec(heading);
  const term = headingMatch ? headingMatch[1] : "";

  const $content = $(".portlet-content").first();
  const contentText = collapseWhitespace($content.clone().children("table").remove().end().text());
  const noResults = contentText === "No results found.";

  const results: SearchResultsPageJson["results"] = [];
  $content.find("tr.search-result").each((_, tr) => {
    const $tr = $(tr);
    const $valueCell = $tr.children("td.value");
    const classes = ($valueCell.attr("class") ?? "").split(/\s+/).filter((c) => c && c !== "value");
    const category = classes[0] ?? "";
    const $full = $tr.children("td.full");
    const $link = $full.find("a").first();
    results.push({
      category,
      subject: collapseWhitespace($link.text()),
      url: $link.attr("href") ?? "",
      description: collapseWhitespace($full.clone().children("a").remove().end().text()),
    });
  });

  return { term, noResults, results };
}
