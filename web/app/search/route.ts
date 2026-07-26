/**
 * GET /search?term=... -- port of `SearchController.Index`
 * (`TMD/Controllers/SearchController.cs:18-43`), task P1-09, doc 01 §1 /
 * doc 03 P1-09 note.
 *
 * Two response modes at the SAME url, exactly like legacy:
 *   - `X-Requested-With: XMLHttpRequest` present -> JSON, 5 results/category,
 *     with synthetic "message" rows (`ResultModel.From(string, ...)`):
 *       * zero results total -> a single `{Category:"message", Subject:"",
 *         Description:"No results found", Url:"/search?term=..."}` row
 *         (SHORT-CIRCUITS the "Show more results" check entirely --
 *         SearchController.cs:34-35).
 *       * some results but any category was truncated (`!hasAllResults`)
 *         -> the real rows followed by a "Show more results" message row
 *         (SearchController.cs:37-38).
 *       * otherwise -> just the real rows.
 *   - absent -> HTML page, 25 results/category, NEVER message rows (legacy
 *     `TMD/Views/Search/Index.cshtml` only ever renders "No results found."
 *     literal text when `!Model.Any()`, or a plain results table).
 *
 * JSON field casing (`Category`/`Subject`/`Description`/`Url`, PascalCase)
 * copied verbatim from the doc 07 corpus snapshots
 * (`web/parity/snapshots/search/*.json`) -- ASP.NET's default JSON
 * serializer preserves C# property casing.
 *
 * Implemented as a Route Handler, not `page.tsx` -- see `html.ts`'s header
 * for why (Next.js can't have both at one route segment) and the resulting
 * TODO about shared-layout chrome.
 */
import { NextRequest, NextResponse } from "next/server";
import { composeSearch, type SearchResultModel } from "./compose";
import { renderSearchResultsHtml } from "./html";

const AJAX_MAX_RESULTS_PER_CATEGORY = 5;
const HTML_MAX_RESULTS_PER_CATEGORY = 25;

function isAjaxRequest(request: NextRequest): boolean {
  return (request.headers.get("x-requested-with") ?? "").toLowerCase() === "xmlhttprequest";
}

function messageRow(description: string, term: string): SearchResultModel {
  return {
    category: "message",
    subject: "",
    description,
    url: `/search?term=${encodeURIComponent(term)}`,
  };
}

function toJson(model: SearchResultModel) {
  return { Category: model.category, Subject: model.subject, Description: model.description, Url: model.url };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("term");
  const ajax = isAjaxRequest(request);
  const cap = ajax ? AJAX_MAX_RESULTS_PER_CATEGORY : HTML_MAX_RESULTS_PER_CATEGORY;

  const composed = await composeSearch(term, cap);

  if (ajax) {
    let results = composed.results;
    if (results.length === 0) {
      results = [messageRow("No results found", composed.term)];
    } else if (!composed.hasAllResults) {
      results = [...results, messageRow("Show more results", composed.term)];
    }
    return NextResponse.json(results.map(toJson));
  }

  const html = renderSearchResultsHtml(composed);
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
