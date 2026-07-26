/**
 * The TreesDb wordmark: lowercase "trees database" whose initial "t" IS a
 * conifer, reproducing legacy treesdb.org's title.png (see
 * lib/brand/wordmark.ts for the traced geometry and docs/design/BRAND.md
 * for the palette). Renders as live text -- only the "t" is vector -- so
 * "rees database" stays selectable, searchable, and set in Geist.
 *
 * Three details that look like mistakes and are not:
 *
 * 1. `leading-[0]`. The SVG is an atomic inline whose baseline is its
 *    bottom margin edge, so `vertical-align: baseline` seats the trunk on
 *    the text baseline for free. line-height:0 then collapses the strut's
 *    sub-baseline descent, making this element exactly TREE_HEIGHT_EM tall
 *    (41px at text-xl) with the baseline flush at its bottom edge. Glyphs
 *    still paint normally; nothing is clipped.
 * 2. The sr-only "T". It makes textContent read exactly "Trees database"
 *    (no duplication, no stray space) for copy/paste, SEO and any text
 *    extraction, while the visible mark stays legacy-lowercase. It is also
 *    the no-CSS fallback: with styles off you get plain "Trees database".
 * 3. `font-normal`. The legacy stems measure 0.087em -- regular, not the
 *    medium the previous header used. Medium thickens the type until the
 *    4.5px trunk no longer reads as its stem.
 */
import {
  TREE_HEIGHT_EM,
  TREE_PATH_D,
  TREE_VIEWBOX,
  TREE_WIDTH_EM,
  TREE_Y_SCALE,
  WORDMARK_NUDGE_EM,
} from "@/lib/brand/wordmark";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block whitespace-nowrap font-normal leading-[0] tracking-[-0.01em] ${className ?? ""}`}
    >
      <svg
        viewBox={TREE_VIEWBOX}
        aria-hidden="true"
        focusable="false"
        fill="currentColor"
        className="inline-block align-baseline"
        style={{ height: `${TREE_HEIGHT_EM}em`, width: `${TREE_WIDTH_EM}em` }}
      >
        <path d={TREE_PATH_D} transform={`scale(1 ${TREE_Y_SCALE})`} />
      </svg>
      <span className="sr-only">T</span>
      <span aria-hidden="true" style={{ marginLeft: `${WORDMARK_NUDGE_EM}em` }}>
        rees database
      </span>
    </span>
  );
}
