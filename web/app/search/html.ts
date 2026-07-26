/**
 * Renders the non-AJAX `/search` HTML response (`route.ts`'s HTML branch).
 *
 * `/search` is a Route Handler (not a `page.tsx`) because the SAME URL must
 * also serve the AJAX-JSON contract at the exact same path
 * (`X-Requested-With` content negotiation, doc 01 §1) -- Next.js App Router
 * does not allow a `route.ts` and `page.tsx` to coexist at one route
 * segment, so this response is a self-contained HTML document rather than a
 * React Server Component automatically nested inside `app/layout.tsx`'s
 * shared header/nav/footer chrome. TODO (flagged in the P1-09 task report,
 * alongside the header search widget's layout wiring, `components/search/
 * search-widget.tsx`): once a later task revisits `app/layout.tsx`, it's
 * worth reconsidering whether this route should render via a shared partial
 * so `/search` gets the same chrome as every other Phase 1 page.
 *
 * Markup mirrors (structurally, not byte-for-byte) the legacy view
 * (`TMD/Views/Search/Index.cshtml`): an `h4`-equivalent heading
 * (`Search results for "{term}"`), a literal "No results found." paragraph
 * when there are zero results, else a list of results each carrying a
 * `data-category` attribute (legacy: `td.value.{category}`'s CSS class) and
 * a link + description -- structured so `parity/extractors/new/
 * search-results.ts` can recover the exact `SearchResultsPageJson` shape
 * (`term`/`noResults`/`results[]`) the legacy extractor also produces.
 *
 * Design-audit item 7a note: this document's `<header>`/`<nav>` (the brand
 * bar + Map/Browse/Import/Account links + a no-JS GET search form, styled to
 * match `app/layout.tsx`'s header; "Search" nav link dropped everywhere per
 * owner request 2026-07-19, the search box IS the entry point) were added
 * after confirming
 * `parity/extractors/new/search-results.ts` scopes strictly to
 * `.search-heading` / `.search-no-results` / `.search-result` -- it never
 * walks the full document or collects all `<a>` tags, so the extra chrome
 * (different classes entirely) is invisible to the parity comparison. Item
 * 7b (per-category accent borders, pill restyle, mobile grid rows) is
 * CSS-only against the SAME `.search-result`/`data-category`/
 * `.search-result-description` markup -- no selector, text, or href
 * changed.
 *
 * Design-audit item (footer parity): this document previously had NO
 * footer at all -- since it doesn't extend app/layout.tsx (see above), it
 * got none of that file's footer either, so /search was the one page with
 * no Community Forum / Website Technical Help links and no units control.
 * A static footer is appended below, styled with this same file's inline-CSS
 * approach: a plain `<form action="/api/units" method="post">` (identical
 * contract to app/layout.tsx's, same UNITS_NAMES option values) needs no
 * client JS -- /api/units redirects back via the request's Referer header,
 * so submitting it from here just re-renders this same /search page.
 */
import type { ComposedSearch } from "./compose";
import { UNITS_NAMES } from "@/lib/units/cookie";
import { TREE_PATH_D, TREE_VIEWBOX, TREE_Y_SCALE } from "@/lib/brand/wordmark";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderSearchResultsHtml(composed: ComposedSearch): string {
  const term = escapeHtml(composed.term);
  const noResults = composed.results.length === 0;

  const body = noResults
    ? `<p class="search-no-results">No results found.</p>`
    : `<ul class="search-results">
${composed.results
  .map(
    (r) => `        <li class="search-result" data-category="${escapeHtml(r.category)}">
          <a href="${escapeHtml(r.url)}">${escapeHtml(r.subject)}</a>
          <span class="search-result-description">${escapeHtml(r.description)}</span>
        </li>`,
  )
  .join("\n")}
      </ul>`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Search - TreesDb</title>
    <style>
      /* TreesDb brand, inlined -- this is a standalone document (see file
         header: route.ts's HTML branch can't share app/layout.tsx's
         Tailwind-built chrome), so the palette from docs/design/BRAND.md
         is reproduced here as plain CSS rather than utility classes. */
      :root { color-scheme: light; }
      * { box-sizing: border-box; }
      body { font-family: system-ui, sans-serif; margin: 0; padding: 0; background: #efefef; color: #1a1a1a; }
      a { color: #327487; text-decoration: none; }
      a:hover { text-decoration: underline; }

      /* Site header (design-audit item 7a), matching app/layout.tsx. */
      .site-header { background: #255648; }
      /* Header-balance v2 2026-07: symmetric padding again, mirroring
         app/layout.tsx's py-2.5 -- the y-squashed 1.71em tree no longer
         governs the row height, so plain centering is correct. */
      .site-header-inner { max-width: 72rem; margin: 0 auto; padding: 0.625rem 1rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.625rem 1.5rem; }
      /* Brand wordmark, mirroring components/chrome/wordmark.tsx: the
         conifer stands in for the initial "t" of a lowercase
         "trees database" (legacy title.png). line-height:0 collapses the
         strut so the anchor is exactly 1.71em tall with the baseline on its
         bottom edge; the SVG's own baseline is its bottom margin edge, so
         vertical-align:baseline seats the trunk on the text baseline. */
      .brand { display: inline-block; line-height: 0; white-space: nowrap; color: #fff; text-decoration: none; font-size: 1.125rem; font-weight: 400; letter-spacing: -0.01em; }
      .brand:focus-visible, .site-nav a:focus-visible { outline: 2px solid #fff; outline-offset: 2px; border-radius: 2px; }
      .brand:hover { text-decoration: none; }
      .brand svg { display: inline-block; height: 1.71em; width: 1.334em; vertical-align: baseline; fill: currentColor; }
      /* Nudge so the "r" lands on the legacy "r" origin under the crown's
         overhang (see lib/brand/wordmark.ts's WORDMARK_NUDGE_EM). This
         document renders in system-ui rather than Geist, so it may run
         ~1px loose -- tighten toward -0.44em if it ever reads as a gap. */
      .brand-name { margin-left: -0.4em; }
      .brand-t { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
      .site-nav { display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap; }
      /* 2.25rem matches NavLink's sm:h-9 (one control height with the 36px
         search input); mobile keeps the 2.5rem touch height below. */
      .site-nav a { display: inline-flex; align-items: center; height: 2.25rem; padding: 0 0.625rem; border-radius: 999px; color: #fff; text-decoration: none; font-size: 0.8rem; font-weight: 500; }
      .site-nav a:hover { background: rgba(255, 255, 255, 0.1); text-decoration: none; }
      /* Wrap-order parity with app/layout.tsx's mobile header (brand /
         search full-width / nav full-width). */
      @media (max-width: 640px) {
        .site-header-inner { gap: 0.5rem 1.5rem; }
        .site-search { order: 2; flex-basis: 100%; max-width: none; }
        .site-nav { order: 3; width: 100%; }
        .site-nav a { height: 2.5rem; }
      }

      /* Header search box: visual twin of components/search/search-widget.tsx
         (white pill input + magnifier), minus the AJAX dropdown -- this is a
         standalone document with no client JS, and the plain GET form is the
         same no-JS contract the widget itself falls back to. */
      .site-search { position: relative; flex: 1 1 16rem; max-width: 24rem; }
      .site-search input { width: 100%; height: 2.25rem; border: 1px solid transparent; border-radius: 0.375rem; background: #fff; padding: 0 0.75rem 0 2.25rem; font-size: 0.875rem; color: #333; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
      .site-search input::placeholder { color: #888; }
      .site-search input:focus-visible { outline: none; border-color: #fff; box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7); }
      .site-search svg { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); width: 1rem; height: 1rem; color: #888; pointer-events: none; }

      .shell { max-width: 48rem; margin: 2rem auto; padding: 0 1rem; }
      .card { background: #fff; border: 1px solid #e2e2e2; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
      .card-header { padding: 0.9rem 1.25rem; background: #e9f0ed; border-bottom: 1px solid #e2e2e2; }
      .search-heading { margin: 0; font-size: 1.15rem; font-weight: 600; color: #255648; }
      .search-content { padding: 0.25rem 1.25rem 1.25rem; }
      .search-results { list-style: none; margin: 0; padding: 0; }

      /* Result rows (design-audit item 7b): 3px left accent border per
         category, CSS-only against the existing data-category attribute. */
      .search-result { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; column-gap: 1rem; padding: 0.85rem 0 0.85rem 0.75rem; border-bottom: 1px solid #ececec; border-left: 3px solid transparent; }
      .search-result:last-child { border-bottom: none; }
      .search-result[data-category="sites"] { border-left-color: #255648; }
      .search-result[data-category="species"] { border-left-color: #327487; }
      .search-result[data-category="states"] { border-left-color: #f0a020; }
      .search-result a { font-weight: 500; }
      .search-result[data-category="species"] a { font-style: italic; }

      /* Description pills: amber pill reserved for site location pills;
         species common-name descriptions become outline pills; states'
         plain country-name description stays unpilled caption text. */
      .search-result-description { display: inline-block; flex-shrink: 0; font-size: 0.75rem; line-height: 1.4; white-space: nowrap; }
      .search-result[data-category="sites"] .search-result-description { background: #f0a020; color: #fff; font-weight: 500; padding: 0.15rem 0.65rem; border-radius: 999px; }
      .search-result[data-category="species"] .search-result-description { background: #fff; color: #327487; border: 1px solid rgba(50, 116, 135, 0.35); font-weight: 500; padding: 0.15rem 0.65rem; border-radius: 999px; }
      .search-result[data-category="states"] .search-result-description { color: #666; }
      .search-result-description:empty { display: none; }

      .search-no-results { color: #666; padding: 0.75rem 0; margin: 0; }

      @media (max-width: 640px) {
        .search-result { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 8px; align-items: center; }
      }

      /* Site footer (design-audit: footer parity), matching app/layout.tsx's
         SiteFooter markup/spacing translated to plain CSS -- see this
         file's header docblock. */
      .site-footer { border-top: 1px solid #e2e2e2; margin-top: 2rem; }
      .site-footer-inner { max-width: 72rem; margin: 0 auto; padding: 1rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.75rem; font-size: 0.875rem; color: #666; }
      .footer-links { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem 0.75rem; }
      .footer-links a { color: #327487; }
      .footer-units { display: flex; align-items: center; gap: 0.5rem; border: 1px solid #e2e2e2; border-radius: 0.375rem; background: #fff; padding: 0.25rem 0.5rem; }
      .footer-units label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.03em; }
      .footer-units select { height: 2rem; border-radius: 0.375rem; border: 1px solid #ccc; background: #fff; padding: 0 0.5rem; font-size: 0.875rem; color: #1a1a1a; }
      .footer-units button { height: 2rem; padding: 0 0.75rem; border-radius: 0.375rem; border: 1px solid #ccc; background: #f5f5f5; font-size: 0.8rem; font-weight: 500; color: #1a1a1a; cursor: pointer; }
      .footer-units button:hover { background: #eee; }
    </style>
  </head>
  <body>
    <header class="site-header">
      <div class="site-header-inner">
        <a class="brand" href="/map" aria-label="Trees database"><svg viewBox="${TREE_VIEWBOX}" aria-hidden="true" focusable="false"><path d="${TREE_PATH_D}" transform="scale(1 ${TREE_Y_SCALE})"/></svg><span class="brand-t">T</span><span class="brand-name" aria-hidden="true">rees database</span></a>
        <nav class="site-nav" aria-label="Primary">
          <a href="/map">Map</a>
          <a href="/locations">Browse</a>
          <a href="/import">Import</a>
          <a href="/account">Account</a>
        </nav>
        <form class="site-search" action="/search" method="get" role="search">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="search" name="term" value="${term}" placeholder="Search sites, states, species&hellip;" aria-label="Search" />
        </form>
      </div>
    </header>
    <div class="shell">
      <main class="card">
        <div class="card-header">
          <h1 class="search-heading">Search results for &quot;${term}&quot;</h1>
        </div>
        <div class="search-content">
${body}
        </div>
      </main>
    </div>
    <footer class="site-footer">
      <div class="site-footer-inner">
        <div class="footer-links">
          <span>&copy; ${new Date().getFullYear()} TreesDb - a registry of measured trees</span>
          <span aria-hidden="true">&bull;</span>
          <a href="http://ents-bbs.org/viewforum.php?f=15" target="_blank" rel="noopener noreferrer">Community Forum</a>
          <span aria-hidden="true">&bull;</span>
          <a href="mailto:treesdb.org@gmail.com">Website Technical Help</a>
        </div>
        <form class="footer-units" action="/api/units" method="post">
          <label for="units">Units</label>
          <select id="units" name="units">
${UNITS_NAMES.map((name) => `            <option value="${name}">${name}</option>`).join("\n")}
          </select>
          <button type="submit">Save</button>
        </form>
      </div>
    </footer>
  </body>
</html>
`;
}
