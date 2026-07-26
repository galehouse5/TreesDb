/**
 * New-side extractor for the `/search` non-AJAX HTML page
 * (`app/search/html.ts`, task P1-09). Counterpart to
 * `parity/extractors/legacy/search-results.ts` -- both must produce the
 * exact same `SearchResultsPageJson` shape (`term`/`noResults`/
 * `results[]`), per `schema.ts`'s file header.
 *
 * Markup read directly off `app/search/html.ts`'s template: heading text in
 * `.search-heading` (`Search results for "{term}"`), a literal
 * `.search-no-results` paragraph when there are zero results, else a
 * `.search-result` list item per row carrying `data-category` (mirrors the
 * legacy extractor reading `td.value`'s CSS class) plus an `<a>` (subject +
 * href) and a `.search-result-description` span.
 */
import * as cheerio from "cheerio";
import { collapseWhitespace } from "../../normalize";
import type { SearchResultsPageJson } from "../schema";
import type { NewExtractorContext } from "./index";

export function extract(html: string, _ctx?: NewExtractorContext): SearchResultsPageJson {
  const $ = cheerio.load(html);

  const heading = collapseWhitespace($(".search-heading").first().text());
  const headingMatch = /^Search results for "(.*)"$/.exec(heading);
  const term = headingMatch ? headingMatch[1]! : "";

  const noResults = $(".search-no-results").length > 0;

  const results: SearchResultsPageJson["results"] = [];
  $(".search-result").each((_, li) => {
    const $li = $(li);
    const category = $li.attr("data-category") ?? "";
    const $link = $li.find("a").first();
    results.push({
      category,
      subject: collapseWhitespace($link.text()),
      url: $link.attr("href") ?? "",
      description: collapseWhitespace($li.find(".search-result-description").first().text()),
    });
  });

  return { term, noResults, results };
}
