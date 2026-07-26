/**
 * TreesDb wordmark geometry, shared by the React header
 * (components/chrome/wordmark.tsx) and the standalone search-results
 * document (app/search/html.ts), which is a plain HTML string and cannot
 * import the component.
 *
 * The conifer is a vector reconstruction of legacy treesdb.org's
 * TMD/images/Theme/title.png, traced from that PNG's alpha channel. The
 * viewBox IS the legacy ink bbox (46 x 71 device px at the legacy em of
 * ~34.5px), so every constant below is a literal legacy measurement:
 *
 *   y = 71  -> the type BASELINE (the trunk stops flat on it, like a stem)
 *   y = 46  -> the ascender line of "database"
 *   y = 53  -> the x-height line of "rees"
 *   x 22.2..27.2 -> the trunk, which sits exactly where the letter "t"'s
 *                   stem would sit (0.155em right of the "t" origin).
 *
 * Consequently the tree is not an icon beside the text: it consumes one
 * "t" advance in the line and the crown overhangs both sides. See
 * TREE_ASPECT / WORDMARK_NUDGE_EM for the spacing that makes that true.
 *
 * Legibility floor (checked at 34.5/20/18/16/13px): the five branch tiers
 * stay individually resolvable down to a 16px em; below that the mark
 * reads as a lumpy triangle. Don't set this below text-base.
 */

/**
 * Header-balance v2 (2026-07): the tree renders VERTICALLY COMPRESSED to
 * 83% of the legacy trace (71 -> 59 units) via `TREE_Y_SCALE` on the path.
 * At the legacy 2.06em height the wordmark box was the tallest thing in
 * the header row, forcing asymmetric bar padding that left the nav pills
 * and search field ~3px above the bar's optical center. At 1.71em the
 * 36px search input governs the row instead: symmetric padding, controls
 * dead-centered, crown keeps ~12px headroom. The squash is y-only, so
 * every x metric (trunk-as-"t"-stem position, TREE_WIDTH_EM,
 * WORDMARK_NUDGE_EM) is untouched, and at header sizes the tier
 * compression is imperceptible.
 */
export const TREE_Y_SCALE = 59 / 71; // 0.831

/** Ink bounding box of the RENDERED (y-squashed) conifer. Legacy trace box was 0 0 46 71. */
export const TREE_VIEWBOX = "0 0 46 59";

/** width / height of TREE_VIEWBOX -- keeps the SVG box exact if `width:auto` is unavailable. */
export const TREE_ASPECT = 46 / 59; // 0.7797

/** Tree height as a multiple of the wordmark font-size (59px / 34.5px em; legacy was 2.06). */
export const TREE_HEIGHT_EM = 1.71;

/** Tree width as a multiple of the wordmark font-size (TREE_HEIGHT_EM * TREE_ASPECT). */
export const TREE_WIDTH_EM = 1.334;

/**
 * Negative left margin applied to "rees database" so the "r" lands on the
 * legacy "r" origin instead of after the crown's overhang:
 *   r origin = svg left + 0.561em ("t" origin) + 0.377em ("t" advance)
 *            = 0.938em, versus the SVG's own 1.334em advance
 *   => 0.938 - 1.334 = -0.396em
 * Do not "fix" this to 0 -- the crown is SUPPOSED to reach over the "r",
 * exactly as the legacy raster does (its branches occupy x 38..45 while
 * the "r" stem is at x 34..37).
 */
export const WORDMARK_NUDGE_EM = -0.4;

/**
 * Closed silhouette: apex -> right branch tiers -> skirt -> trunk (down
 * the right side, across the baseline, up the left) -> left branch tiers
 * -> apex. Implicit lineto pairs after the initial M; all straight
 * segments so the tiers stay crisp at 16-20px header sizes (the legacy
 * raster is feathery, which turns to mush below ~30px).
 */
export const TREE_PATH_D =
  "M23 0 25.2 5.2 28.2 8.8 32 13 28 15.4 38 22.6 33 24.6 39.2 30 33.4 31.6 42 37 " +
  "37 38.6 45.4 47 40 48.8 33 52.6 27.2 52.6 27.2 71 22.2 71 22.2 52.6 3 52.6 " +
  "8 46.4 0 45 6 38.6 4 36.4 8.6 32 6 29.6 13 24.4 10 21 16 15.6 12 12.6 16.2 10.4 20.8 4.6Z";
