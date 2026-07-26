/**
 * New-side extractor for the tree map-marker info popup
 * (`GET /api/map/trees/{id}/info` -> `db/queries/map.sql.ts`'s
 * `treeMarkerInfo()`). See `marker-info-state.ts`'s file header for the
 * shared design rationale, including why the shared `(html: string, ctx?)`
 * signature is repurposed here to mean "raw response body text of the info
 * endpoint" rather than literal HTML.
 */
import type { TreeMarkerInfoJson } from "../schema";
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

/** `raw` is the response body text of `GET /api/map/trees/{id}/info`. */
export function extract(raw: string, _ctx?: NewExtractorContext): TreeMarkerInfoJson {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("marker-info-tree (new) extractor: response body is not valid JSON");
  }
  if (typeof json !== "object" || json === null) {
    throw new Error("marker-info-tree (new) extractor: response body is not a JSON object");
  }
  const body = json as Record<string, unknown>;
  const detailsLink = body.detailsLink as { text?: unknown; href?: unknown } | undefined;

  if (
    typeof body.treeId !== "number" ||
    typeof body.scientificName !== "string" ||
    typeof detailsLink !== "object" ||
    detailsLink === null ||
    typeof detailsLink.text !== "string" ||
    typeof detailsLink.href !== "string" ||
    !isRecordOfStrings(body.rows) ||
    !isPhotoArray(body.photos) ||
    typeof body.lastMeasured !== "string"
  ) {
    throw new Error("marker-info-tree (new) extractor: response body does not match TreeMarkerInfoJson");
  }

  // BUGFIX (surfaced by the P1-15 sweep): see marker-info-site.ts's matching
  // note - the JSON API's string fields are collapsed here to match the
  // legacy extractor's "displayed text" (rendered-HTML-collapsed) semantics.
  return {
    treeId: body.treeId,
    scientificName: collapseWhitespace(body.scientificName),
    detailsLink: { text: collapseWhitespace(detailsLink.text), href: detailsLink.href },
    rows: collapseRows(body.rows),
    photos: body.photos,
    lastMeasured: body.lastMeasured,
  };
}
