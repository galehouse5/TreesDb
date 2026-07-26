/**
 * New-side extractor for the site map-marker info popup
 * (`GET /api/map/sites/{id}/info` -> `db/queries/map.sql.ts`'s
 * `siteMarkerInfo()`). See `marker-info-state.ts`'s file header for the
 * shared design rationale, including why the shared `(html: string, ctx?)`
 * signature is repurposed here to mean "raw response body text of the info
 * endpoint" rather than literal HTML.
 */
import type { SiteMarkerInfoJson } from "../schema";
import { collapseWhitespace } from "../../normalize";
import type { NewExtractorContext } from "./index";

function isRecordOfStrings(value: unknown): value is Record<string, string> {
  if (typeof value !== "object" || value === null) return false;
  return Object.values(value).every((v) => typeof v === "string");
}

/** Collapses whitespace on every value of a `Record<string, string>` - see this file's BUGFIX note below. */
function collapseRows(rows: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, collapseWhitespace(v)]));
}

function isPhotoArray(value: unknown): value is { thumbnailSrc: string }[] {
  return (
    Array.isArray(value) &&
    value.every((p) => typeof p === "object" && p !== null && typeof (p as { thumbnailSrc?: unknown }).thumbnailSrc === "string")
  );
}

/** `raw` is the response body text of `GET /api/map/sites/{id}/info`. */
export function extract(raw: string, _ctx?: NewExtractorContext): SiteMarkerInfoJson {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("marker-info-site (new) extractor: response body is not valid JSON");
  }
  if (typeof json !== "object" || json === null) {
    throw new Error("marker-info-site (new) extractor: response body is not a JSON object");
  }
  const body = json as Record<string, unknown>;
  const detailsLink = body.detailsLink as { text?: unknown; href?: unknown } | undefined;

  if (
    typeof body.siteId !== "number" ||
    typeof body.name !== "string" ||
    typeof detailsLink !== "object" ||
    detailsLink === null ||
    typeof detailsLink.text !== "string" ||
    typeof detailsLink.href !== "string" ||
    !isRecordOfStrings(body.rows) ||
    !isPhotoArray(body.photos) ||
    typeof body.lastMeasurementDate !== "string"
  ) {
    throw new Error("marker-info-site (new) extractor: response body does not match SiteMarkerInfoJson");
  }

  // BUGFIX (surfaced by the P1-15 sweep): unlike the HTML-page extractors
  // (site-details.ts etc.), which parse legacy's server-rendered markup
  // with cheerio and collapse whitespace via `collapseWhitespace`, this
  // extractor previously passed the JSON API's string fields through
  // verbatim. The underlying data occasionally contains a literal double
  // space (e.g. a site name stored as "Foo  (Bar)") that a normal HTML text
  // node - which is exactly how this JSON gets rendered in the popup -
  // visually collapses to one space in every browser, same as legacy's
  // rendered HTML. Comparing the raw (uncollapsed) JSON value against
  // legacy's already-collapsed extracted text therefore produced false
  // "displayed text" mismatches; collapsing here matches doc §5.4's rule
  // ("extract displayed text, not... raw column").
  return {
    siteId: body.siteId,
    name: collapseWhitespace(body.name),
    detailsLink: { text: collapseWhitespace(detailsLink.text), href: detailsLink.href },
    rows: collapseRows(body.rows),
    photos: body.photos,
    lastMeasurementDate: body.lastMeasurementDate,
  };
}
