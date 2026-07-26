/**
 * Shared markup primitives for the Browse detail pages (task P1-05/P1-06;
 * reused LATER by the parallel P1-07/P1-08 Species/State details task -- see
 * the task brief's "components/details/** (new, shared...)" ownership note).
 *
 * These deliberately reuse the LEGACY markup's own class-name/id
 * conventions (`reports_table`/`description`/`value`, `portlet`/
 * `portlet-header`/`portlet-content`, `support_table`/`gallery`/`ticket
 * open`) ALONGSIDE real Tailwind utility classes -- same rationale as
 * `components/grids/browse-grid.tsx`'s file header: it lets
 * `parity/extractors/new/*.ts` reuse `parity/extractors/legacy/
 * dom-helpers.ts`'s `parseReportRowsRaw`/`findRow`/`toReportRowsExcluding`/
 * `extractLinkedText`/`findPortletContentByHeading` UNMODIFIED instead of
 * writing an equivalent parser against different markup. No legacy CSS is
 * loaded anywhere in the new app; these classes carry no styling here.
 *
 * BRAND RESTYLE (docs/design/BRAND.md): `Portlet` renders the white-card
 * "portlet" as a card with a green-tinted `card-header` strip (reusing the
 * `heading` text passed in, restyled -- never new text). `ReportRow` renders
 * its value as an amber `badge` pill for genuine DATA values, or as plain
 * text for values that are either the legacy NullDisplayText/empty-marker
 * convention ("(no data)"/"(none)"/"(not enough data)"/"(private)"/"") or
 * already a link/free-text value (`tone="text"`, set explicitly by callers
 * for Link-valued rows and prose fields like comments/urls/name-lists) --
 * see the `tone` param doc below. Wrapping the existing cell content in
 * extra `<span>`s does not change `td.value`'s extracted `.text()` (cheerio
 * concatenates descendant text nodes regardless of wrapper elements), so
 * this is presentation-only.
 *
 * Task P1-16 additions (`ExportDataLink`/`ViewOnMapLink`/`PhotoSummaryTable`'s
 * real thumbnails) place new affordances OUTSIDE the extracted
 * `reports_table`/`support_table` containers (`Portlet`'s `tabNav` slot, or
 * markup after `#LocationSummary`'s table) -- extraction-safe by
 * construction. `PhotoSummaryTable` is the one component here that reads
 * from the database (`db/queries/sql-tag.ts`'s shared `SqlTag`/`defaultSql`
 * -- `db/queries/**` itself is out of this task's file ownership, so the
 * lookup query lives here instead of there); every other primitive in this
 * file remains a pure markup function.
 */
import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { DownloadIcon, MapIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { type SqlTag, defaultSql } from "@/db/queries/sql-tag";

/** Legacy `NullDisplayText`/gated-empty conventions ("(no data)", "(none)", "(not enough data)", "(private)") plus a bare empty string (e.g. `computedTreesMeasuredCount === null ? "" : ...`, which has no NullDisplayText override in legacy). */
function isEmptyValueText(value: string): boolean {
  const trimmed = value.trim();
  return trimmed === "" || /^\(.+\)$/.test(trimmed);
}

export function ReportTable({
  id,
  children,
  emphasizeIdentity = false,
}: {
  id?: string;
  children: ReactNode;
  /** Optional (default false): when true, the first row renders with visual emphasis (larger/bolder value badge, tinted row) -- see `ReportRow`'s internal `emphasize` prop below. Never changes rendered text. */
  emphasizeIdentity?: boolean;
}) {
  const rows = emphasizeIdentity
    ? Children.toArray(children).map((child, index) =>
        index === 0 && isValidElement(child)
          ? cloneElement(child as ReactElement<{ emphasize?: boolean }>, { emphasize: true })
          : child,
      )
    : children;
  return (
    <table id={id} className="reports_table w-full table-fixed text-sm">
      <tbody>{rows}</tbody>
    </table>
  );
}

export function ReportRow({
  label,
  tone = "data",
  emphasize = false,
  children,
}: {
  label: string;
  /**
   * "data" (default): DATA values (names, counts, dates, coordinates,
   * measurements per BRAND.md) render as an amber badge pill; a plain-string
   * child matching the empty/NullDisplayText convention instead renders as
   * muted plain text. "text": never badged -- for rows whose value is
   * already a Link (kept as the caller's own teal `text-link` styling) or
   * free-form prose (comments, contact info, urls, concatenated name
   * lists); still gets the muted-text empty-marker treatment when the value
   * happens to be one of those conventions (e.g. "(none)").
   */
  tone?: "data" | "text";
  /** Internal -- set by `ReportTable`'s `emphasizeIdentity` prop on the first row only. Not intended to be passed directly by callers. */
  emphasize?: boolean;
  children: ReactNode;
}) {
  const isEmptyString = typeof children === "string" && isEmptyValueText(children);
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="description w-2/5 py-1.5 pr-3 align-top text-muted-foreground">{label}</td>
      <td className="value py-1.5 align-top text-right break-words whitespace-normal [overflow-wrap:anywhere] [&_a]:inline-flex [&_a]:items-center [&_a]:py-2 [&_a]:-my-2 [&_a]:focus-visible:underline [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-ring [&_a]:rounded-sm">
        {isEmptyString ? (
          <span className="text-muted-foreground">{children}</span>
        ) : tone === "data" ? (
          <Badge
            className={cn(
              "border-transparent bg-badge font-medium text-badge-foreground",
              emphasize && "h-7 px-3 text-sm font-semibold",
            )}
          >
            {children}
          </Badge>
        ) : (
          children
        )}
      </td>
    </tr>
  );
}

export function Portlet({
  heading,
  tabNav,
  children,
}: {
  heading: string;
  tabNav?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="portlet overflow-hidden rounded-xl border border-border bg-card">
      <div className="portlet-header flex flex-wrap items-center justify-between gap-2 border-b border-border bg-secondary px-4 py-2.5">
        <h4 className="font-semibold text-secondary-foreground">{heading}</h4>
        {tabNav}
      </div>
      <div className="portlet-content p-4">{children}</div>
    </div>
  );
}

export interface PhotoSummaryRow {
  /** `site_visits.id` (photoRefType 5) or `tree_measurements.id` (photoRefType 7) -- also the `photo_references` owner-column value looked up below. */
  key: number;
  date: string;
  photoCount: number;
  photographers: string;
}

/**
 * `photo_references.type` discriminator (`db/schema.ts`'s
 * `ck_photo_references_owner` doc comment, doc 01 §2/§3): 5 = SiteVisit
 * (owner column `site_visit_id`), 7 = TreeMeasurement (owner column
 * `tree_measurement_id`) -- the only two owner kinds `PhotoSummaryTable` is
 * ever fed (site-detail visits / tree-detail measurements).
 */
export type PhotoRefType = 5 | 7;

/**
 * Task P1-16 (photo thumbnails): looks up the real `photo_id`s backing one
 * `PhotoSummaryRow`, in the same `order by id asc` (oldest-reference-first)
 * convention `db/queries/map.sql.ts` already uses for a site's/tree's
 * marker-popup photo list, and the same `type = 5/7 and
 * site_visit_id/tree_measurement_id = ...` shape `db/queries/details.sql.ts`
 * already uses for this exact row's `photo_count` (see that file's
 * `siteDetails`/`treeDetails` -- duplicated here rather than importing,
 * same cross-file-ownership self-containment rationale `map.sql.ts`'s own
 * header documents, since `db/queries/**` is out of this task's file
 * ownership). One query per row (not batched via `= any(...)`) -- the
 * `SqlTag` contract (`db/queries/sql-tag.ts`'s header) restricts every
 * query to flat, single-level `sql\`...${value}...\`` binding understood by
 * both the real postgres.js client and the PGlite test shim, and row counts
 * here (visits/measurements per site/tree) are small enough that an N+1
 * query pattern is not a real cost.
 */
async function fetchPhotoIds(photoRefType: PhotoRefType, ownerId: number, sql: SqlTag): Promise<number[]> {
  const rows =
    photoRefType === 5
      ? await sql<{ photo_id: number }>`
          select photo_id from photo_references
          where type = 5 and site_visit_id = ${ownerId}
          order by id asc
        `
      : await sql<{ photo_id: number }>`
          select photo_id from photo_references
          where type = 7 and tree_measurement_id = ${ownerId}
          order by id asc
        `;
  return rows.map((r) => r.photo_id);
}

/**
 * `BrowsePhotoSummaryList.cshtml`/`BrowsePhotoSumaryModel.cshtml`: a
 * `table.support_table` of `(date, gallery <ul>/<li> per photo, "Taken by
 * {photographers}")` rows, or the literal text "(no photos)" when there are
 * none.
 *
 * Task P1-16 (photo thumbnails): P1-12 (photo serving,
 * `app/photos/[id]/[[...size]]/route.ts`) shipped after this table's
 * original placeholder-`<li>` implementation, so each gallery item now
 * renders a real thumbnail via the same `/photos/{id}/Square` route/size
 * `components/map/marker-info-popup.tsx`'s marker popup already uses --
 * `PhotoSummaryTable` is itself async (a Server Component) so it can look
 * the row's real `photo_id`s up (`fetchPhotoIds` above) before rendering.
 * `ul.gallery > li`'s count is still exactly `photoCount` (one `<li>` per
 * looked-up id), unchanged for the extractor.
 */
export async function PhotoSummaryTable({ rows, photoRefType }: { rows: PhotoSummaryRow[]; photoRefType: PhotoRefType }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">(no photos)</p>;
  const sql = defaultSql();
  const photoIdsByRow = await Promise.all(rows.map((r) => fetchPhotoIds(photoRefType, r.key, sql)));
  return (
    <div className="w-full overflow-x-auto">
      <table className="support_table w-full min-w-max text-sm">
        <tbody>
          {rows.map((r, rowIndex) => (
            <tr key={r.key} className="border-b border-border/60 last:border-0">
              <td className="py-1.5 pr-3 align-top">
                <Badge className="ticket open border-transparent bg-badge font-normal text-badge-foreground">
                  {r.date}
                </Badge>
              </td>
              <td className="full py-1.5 align-top">
                <ul className="gallery flex flex-wrap gap-1">
                  {photoIdsByRow[rowIndex]!.map((photoId, i) => (
                    <li key={photoId}>
                      {/* eslint-disable-next-line @next/next/no-img-element -- thumbnails come from the P1-12 /photos/{id}/{size} route, no next/image benefit here (same as marker-info-popup.tsx's own photo thumbnails). */}
                      <img
                        src={`/photos/${photoId}/Square`}
                        alt={`Photo ${i + 1} from ${r.date}`}
                        loading="lazy"
                        className="size-8 rounded object-cover"
                      />
                    </li>
                  ))}
                </ul>
              </td>
              <td className="who py-1.5 pl-3 align-top text-muted-foreground">Taken by {r.photographers}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Task P1-16 (export links): a quiet header-area affordance linking to the
 * matching `/export/**` CSV route -- placed via `Portlet`'s `tabNav` slot,
 * OUTSIDE every `table.reports_table`/`table.support_table` the parity
 * extractors walk, so it carries no extraction risk. Text/icon match the
 * existing `/species` browse page's own export link (`app/species/page.tsx`)
 * for visual consistency.
 */
export function ExportDataLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1.5 text-sm text-link hover:underline">
      <DownloadIcon aria-hidden="true" className="size-3.5" />
      Export tree data
    </Link>
  );
}

/**
 * Task P1-16 ("View on map"): the lighter equivalent of legacy's
 * Location-panel Summary|Map toggle (an embedded map) -- a deep link to the
 * full `/map` page centered on this row's coordinates instead. Rendered by
 * callers only when `selectCoordinatesRow`'s `coordinates` field is
 * non-null (see that function's doc comment for the gating rationale);
 * placed OUTSIDE `#LocationSummary`'s `table.reports_table`, so it's
 * additive and carries no extraction risk.
 */
export function ViewOnMapLink({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <Link
      href={`/map?lat=${latitude}&lng=${longitude}&zoom=14`}
      className="mt-2 inline-flex items-center gap-1.5 text-sm text-link hover:underline"
    >
      <MapIcon aria-hidden="true" className="size-3.5" />
      View on map
    </Link>
  );
}
