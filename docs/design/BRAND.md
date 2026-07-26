# TreesDb visual brand

Source: legacy treesdb.org (screenshots in this directory), modernized.
Repo-owner direction: "match the general brand and style of the original
app while allowing freedom to apply modern ui components and visual
structure." Expanded 2026-07-18: "feel free to take liberties to improve
or modernize the ui so long as it stays functionally equivalent to
treesdb.org" — visual/structural liberty is broad; the Constraints
section below is what "functionally equivalent" means in practice and
remains hard. Component library: shadcn/ui (components/ui/*) on
Tailwind 4 — prefer composing/styling shadcn primitives over bespoke
markup.

## Tokens (defined in web/app/globals.css)

| Token | Value | Legacy source | Use |
|---|---|---|---|
| `primary` | forest green (#255648) | header/nav/table headers | header bar, primary buttons, active pills, table header rows |
| `badge` / `badge-foreground` | amber (#f0a020) / white | value pill badges | data-value badges (names, counts, dates, coordinates) |
| `link` | teal (#327487) | body links | inline links in prose/tables |
| `background` | light gray (#efefef-ish) | page background | page behind cards |
| `card` | white | content panels | all content sits on white cards |
| `secondary`/`accent` | pale green tint | — | hover states, subtle emphasis |

Font: Geist Sans (modern replacement for legacy Arial). Logo: the header
wordmark is `components/chrome/wordmark.tsx` — lowercase "trees database"
with a vector conifer standing in for the initial "t", reproducing legacy
`TMD/images/Theme/title.png` (traced geometry + shared path constants in
`lib/brand/wordmark.ts`; the standalone /search document mirrors it via
those constants). Don't set the wordmark below `text-base` — the branch
tiers stop resolving under a 16px em. `/tree-icon.png` (64px white pine,
from legacy) remains as the decorative mark on error/not-found pages.

## Structural idioms (from legacy, apply with modern components)

- Page = light-gray background, content in white rounded-xl cards with a
  border and a card-header strip (semibold green-tinted heading, e.g.
  "Site", "Species", "Location", "Photos").
- Two-column card layouts on wide detail pages (main card left, side
  cards right), stacking on mobile.
- Detail rows: label left (muted), value right — values that are DATA
  (names, counts, dates, coordinates, measurements) render as amber
  `badge` pills (rounded-full, white text); empty values as muted
  "(no data)" / "(none)" text, not badges.
- Tables: `primary` green header row with white text; zebra-subtle rows;
  linked cells in `link` teal.
- Pill toggles for view switches (Summary/Trip history/Map): active =
  green pill, inactive = outline/gray pill (shadcn Tabs or ToggleGroup
  styled accordingly).
- Map pages: full-bleed map under the green header (already done).
- Buttons: primary actions = green; destructive = default destructive.

## Card headers

Two documented idioms — pick the one that matches what the card IS:

- **(a) Data portlets** — read-only detail/report/grid cards
  (`report-table.tsx`'s `Portlet`, `browse-grid.tsx`): green `bg-secondary`
  strip with `text-secondary-foreground` semibold heading.
- **(b) Form/action cards** — cards whose body is a form or primary action
  (import-wizard steps, account pages, token-confirmation pages):
  `border-b bg-primary/5` with `text-primary` heading. Import
  `SECTION_HEADER_CLASS`/`SECTION_TITLE_CLASS` from
  `components/import/wizard-ui.tsx` rather than re-typing the strings.
  The account pages' former third idiom (`bg-secondary/60`) was converted
  to (b) in the 2026-07-19 consistency pass; there is no card-header style
  outside (a)/(b).

## Close buttons

Icon-only close buttons use lucide `XIcon` (`aria-label="Close"` on the
button, `aria-hidden` on the icon), never a literal "✕" glyph.
`components/map/marker-info-popup.tsx` is the reference;
`components/import/coordinate-picker.tsx` matches it.

## Constraints

- Do NOT change any rendered text content, URLs, form field names, or
  server behavior — parity harness compares extracted text/links; styling
  must be presentation-only. If a restyle would alter extracted text
  (e.g. adding visible label text), don't.
- Keep server components; client components only where interaction needs.
- Accessibility: keep focus states (ring is green), aria labels intact.
