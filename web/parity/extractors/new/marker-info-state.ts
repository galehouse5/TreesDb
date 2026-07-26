/**
 * New-side extractor for the state map-marker info popup.
 *
 * Unlike the legacy extractors in `parity/extractors/legacy/**` (which parse
 * server-rendered HTML with cheerio), the new app's popups are React
 * components fed directly by a JSON endpoint (D-007, doc 01 §9) --
 * `GET /api/map/states/{id}/info`, implemented by `db/queries/map.sql.ts`'s
 * `stateMarkerInfo()` and served by `app/api/map/states/[id]/info/route.ts`.
 * That query function was deliberately written to already match this file's
 * output shape (`StateMarkerInfoJson`, `parity/extractors/schema.ts`) field-
 * for-field, so this "extractor" is a validating identity mapping.
 *
 * Signature: `index.ts`'s `NewExtractor<J> = (html: string, ctx?) => J` is
 * shared across every page type, HTML-rendered or not -- for this JSON-fed
 * page type, the `html` parameter is simply whatever raw text the caller
 * fetched from the info endpoint (`verify.ts`'s capture step fetches the
 * URL and hands over the response body text uniformly, regardless of
 * content-type). This extractor `JSON.parse`s that text, then
 * asserts/narrows it into the shared schema type -- the same contract the
 * legacy HTML extractor fulfills for its side. Kept as a real function (not
 * a bare type-cast) so a future schema drift on either side fails loudly
 * here rather than silently comparing `undefined` to `undefined`.
 */
import type { StateMarkerInfoJson } from "../schema";
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

/** `raw` is the response body text of `GET /api/map/states/{id}/info`. */
export function extract(raw: string, _ctx?: NewExtractorContext): StateMarkerInfoJson {
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("marker-info-state (new) extractor: response body is not valid JSON");
  }
  if (typeof json !== "object" || json === null) {
    throw new Error("marker-info-state (new) extractor: response body is not a JSON object");
  }
  const body = json as Record<string, unknown>;
  const detailsLink = body.detailsLink as { text?: unknown; href?: unknown } | undefined;

  if (
    typeof body.stateId !== "number" ||
    typeof body.name !== "string" ||
    typeof detailsLink !== "object" ||
    detailsLink === null ||
    typeof detailsLink.text !== "string" ||
    typeof detailsLink.href !== "string" ||
    !isRecordOfStrings(body.rows)
  ) {
    throw new Error("marker-info-state (new) extractor: response body does not match StateMarkerInfoJson");
  }

  // BUGFIX (surfaced by the P1-15 sweep): see marker-info-site.ts's matching
  // note - the JSON API's string fields are collapsed here to match the
  // legacy extractor's "displayed text" (rendered-HTML-collapsed) semantics.
  return {
    stateId: body.stateId,
    name: collapseWhitespace(body.name),
    detailsLink: { text: collapseWhitespace(detailsLink.text), href: detailsLink.href },
    rows: collapseRows(body.rows),
  };
}
