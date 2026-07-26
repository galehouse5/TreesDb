/**
 * Port of `TMD/Controllers/MapController.cs` (`AllMarkers`/`TreeMarker`/
 * `SiteMarker`/`StateMarkerInfo`/`SiteMarkerInfo`/`TreeMarkerInfo` actions)
 * + `TMD/Models/Map/MapMarkerModel.cs:16-28` (marker JSON shape) +
 * `TMD/Mappings/MapMapping.cs:63-106` (Title/Position/zoom-band/icon rules)
 * -- task P1-10, doc 03 P1-10, doc 01 §9.
 *
 * ---------------------------------------------------------------------------
 * Marker rules transcribed from MapMapping.cs `configureForMarkers()`
 * (lines 63-106) and `MapController.AllMarkers()` (lines 35-54):
 *
 *   STATE  (`Model.Locations.State -> MapMarkerModel`, lines 79-85):
 *     - Filter (`AllMarkers()` line 40): `state.ComputedTreesMeasuredCount > 0`.
 *       (Legacy filters `sites.Where(s => s.State.ComputedTreesMeasuredCount >
 *       0).Select(s => s.State).Distinct()` -- filtering per-site-then-
 *       distinct is equivalent to filtering the state directly: a state can
 *       only have `ComputedTreesMeasuredCount > 0` if at least one of its
 *       sites has measured trees, so it always has >= 1 site in this set.)
 *     - Title = `state.Name` (line 80).
 *     - Position = `state.CoordinateBounds.Center` (line 81) -- the midpoint
 *       of the state's static NE/SW bounding-box columns (NOT computed from
 *       any site/tree coordinates), per `CoordinateBounds.cs:104-107`'s
 *       `recomputeIfNeeded()` formula (wraparound-aware on both axes,
 *       reproduced in `boundsCenter()` below with float32 discipline).
 *     - MinZoom = 0 (line 82, constant).
 *     - MaxZoom = 30 when `ComputedContainsEntityWithCoordinates == false`,
 *       else 6 (line 83) -- nullable-bool `== false` is `false` for both
 *       `true` AND `null`, so a null/unset flag defaults to the 6 branch.
 *     - DefaultIconUrl = `/images/icons/State32.png` (line 84), no
 *       IconLoaderAction configured at all for State -> IconUrl is ALWAYS
 *       the default image, never a photo (unlike Site/Tree below).
 *     - InfoLoaderUrl -> `Map/StateMarkerInfo?id={id}` (line 85) -- ported to
 *       `/api/map/states/{id}/info`.
 *
 *   SITE  (`Model.Sites.Site -> MapMarkerModel`, lines 87-95):
 *     - Filter (`AllMarkers()` line 44): `site.CalculatedCoordinates.
 *       IsSpecified`. `Coordinates.IsSpecified` (`Coordinates.cs:23`) is
 *       `Latitude.IsSpecified || Longitude.IsSpecified` (an OR, not AND) --
 *       i.e. EITHER the calculated latitude OR the calculated longitude
 *       input-format is anything other than Unspecified(1).
 *     - Title = `site.Name` (line 88).
 *     - Position = `site.CalculatedCoordinates` (line 89) -- same field the
 *       filter tests, unlike Tree below.
 *     - MinZoom = 7 (line 90, constant).
 *     - MaxZoom = 30 when `ComputedContainsEntityWithCoordinates == false`,
 *       else 13 (line 91) -- same nullable-bool rule as State.
 *     - DefaultIconUrl = `/images/icons/Site32.png?v=2` (line 92, note the
 *       cache-busting query string -- State and Tree have none).
 *     - IconLoaderAction: when the site has >=1 photo, the FIRST photo's
 *       `SmallMapSquare` variant (lines 93-94) -- ported to
 *       `/photos/{photoId}/SmallMapSquare`. "First" = lowest `id` among
 *       `photo_references` rows for this site (NHibernate's unordered
 *       `IList<IPhoto>` collection mapping has no `order-by`; lowest id
 *       reproduces physical/insertion order, the only deterministic
 *       stand-in available -- moot in the current corpus, which has zero
 *       `photo_references` rows of any type; see db/queries/map.test.ts).
 *     - InfoLoaderUrl -> `Map/SiteMarkerInfo?id={id}` (line 95) -- ported to
 *       `/api/map/sites/{id}/info`.
 *
 *   TREE  (`Model.Trees.Tree -> MapMarkerModel`, lines 97-105):
 *     - Filter (`AllMarkers()` line 48): `tree.Coordinates.IsSpecified` --
 *       note this is the tree's RAW `Coordinates` (`latitude_input_format`/
 *       `longitude_input_format`), NOT `CalculatedCoordinates`.
 *     - Title = `tree.ScientificName` (line 98) -- NOT CommonName. (Tree.
 *       ScientificName is itself populated from the LAST measurement's
 *       botanical-name field at `RecalculateProperties()`
 *       (TMD.Model/Trees/Tree.cs:57), so this is the tree's `trees.
 *       scientific_name` column.)
 *     - Position = `tree.CalculatedCoordinates` (line 99) -- DIFFERENT field
 *       than the filter above; a tree can be included via its raw
 *       Coordinates being specified while its marker is placed at
 *       CalculatedCoordinates (which may differ, e.g. GPS track vs. a
 *       calculated/derived fix).
 *     - MinZoom = 14, MaxZoom = 30 (lines 100-101, both constant -- no
 *       "no contained coordinates" exception for trees, they're leaves).
 *     - DefaultIconUrl = `/images/icons/Tree32.png` (line 102, no query
 *       string).
 *     - IconLoaderAction: same "first photo -> SmallMapSquare" rule as Site
 *       (lines 103-104), sourced from the tree's OWN photos (mirrors its
 *       last measurement's photos at merge time, TMD.Model/Trees/Tree.cs:71).
 *     - InfoLoaderUrl -> `Map/TreeMarkerInfo?id={id}` (line 105) -- ported to
 *       `/api/map/trees/{id}/info`.
 *
 * `AllMarkers()` (lines 35-54) concatenates state, then site, then tree
 * markers (order preserved here for readability; W-004 in doc 07 waives
 * array order for parity comparison, so this is not itself a parity
 * requirement).
 *
 * `TreeMarker(id)`/`SiteMarker(id)` (lines 56-68) fetch a single marker by
 * id with NO filter (works for any id, even one AllMarkers would exclude) --
 * ported as `treeMarker()`/`siteMarker()` below. There is no legacy
 * `StateMarker` action (only `StateMarkerInfo`), so none is ported. Per this
 * task's doc-03 URL table, only `/api/map/markers` and the three
 * `/api/map/{trees,sites,states}/{id}/info` routes are wired up as HTTP
 * routes in this task -- these single-marker query functions exist for
 * completeness / future callers (e.g. an eventual import-wizard coordinate
 * picker) but are NOT exposed as routes here (see report / `web/app/api/
 * map/**` for the route list actually shipped).
 *
 * Icon photo URLs use the new `/photos/{id}/{size}` route from doc 03's URL
 * table (`normalize.ts`'s `"photos"` entry) -- P1-12 (photo serving) is a
 * separate, not-yet-landed task; this task only emits the URL shape.
 *
 * ---------------------------------------------------------------------------
 * Marker-info payload rules, transcribed per-view (each `Map/
 * *MarkerInfo.cshtml` + its Model class):
 *
 * STATE (`TMD/Views/Map/StateMarkerInfo.cshtml`,
 * `TMD/Models/Map/MapStateMarkerInfoModel.cs`): header (Name + link to
 * `/Browse/States/{id}/Details`, ported to `/states/{id}`), then `Country`
 * (always), `RHI5/RHI10/RHI20/RGI5/RGI10/RGI20` (`IfSpecifiedReportDisplayFor`
 * -- omitted entirely, not a placeholder, when the underlying
 * `computed_rhi*`/`computed_rgi*` column is NULL -- note neither Map info
 * model overrides `NullDisplayText`, unlike the Browse state/site pages), then
 * `TreesMeasuredCount`/`LastMeasurementDate` (always rendered via plain
 * `ReportDisplayFor` -- ASP.NET MVC's un-overridden default `NullDisplayText`
 * is `""`, reproduced as `""` for the (currently unreachable in this task's
 * verification corpus, since `AllMarkers` already filters to
 * `ComputedTreesMeasuredCount > 0`) case where either is NULL).
 *
 * SITE (`SiteMarkerInfo.cshtml`, `MapSiteMarkerInfoModel.cs`): header, then
 * `State` (formatted `"{Name} ({Country.Code})"` per `Views/Shared/
 * DisplayTemplates/State.cshtml`), `County`, `OwnershipType` (both always,
 * plain columns), the same six `IfSpecified` RHI/RGI rows,
 * `TreesMeasuredCount` (always), then an optional hand-written `Photos` row
 * (present only when count > 0, one `<img>` per photo at
 * `/photos/{id}/Square`, matching `Html.Photo(photo, PhotoSize.Square, ...)`
 * -- `TMD/Extensions/PhotoExtensions.cs:9-44`, the `PhotoSize.Square`/
 * `PhotoSize.MiniSquare`/... branch renders `<img src>` at the FIRST
 * (inline) size argument), then `LastMeasurementDate` (always, AFTER the
 * optional photos row).
 *
 * TREE (`TreeMarkerInfo.cshtml`, `MapTreeMarkerInfoModel.cs`): header uses
 * the SCIENTIFIC name (unlike State/Site, which header on `Name`), then
 * `CommonName` (always), `Height`/`Girth`(SubprefixOnly)/`CrownSpread`
 * (`IfSpecified`, gated on the tree's own `*_input_format <> 1`),
 * `TDI3`/`TDI2`/`ENTSPTS2`/`ENTSPTS` (`IfSpecified`, gated on `.HasValue`),
 * then EITHER `ChampionPoints` OR `AbbreviatedChampionPoints` (whichever is
 * non-null -- the row is omitted entirely, no "(not enough data)" fallback,
 * unlike the Tree Details page), optional `Photos` row, then `LastMeasured`
 * (always). NOTE: `MapTreeMarkerInfoModel.Elevation` exists on the C# model
 * but the `.cshtml` never renders it (no `@Html...Elevation` call anywhere
 * in `TreeMarkerInfo.cshtml`) -- confirmed against both the view source and
 * `parity/extractors/schema.ts`'s `TreeMarkerInfoJson` (no `elevation`
 * field) and every one of the 312 `TreeMarkerInfo` snapshot artifacts (none
 * contain an "Elevation" row). This port deliberately excludes Elevation
 * from the tree info payload to match the ACTUAL displayed/extracted
 * behavior, even though doc 01 §9's prose summary ("height/girth/spread/
 * elevation...") reads as if it should be included -- documented deviation
 * from that summary, not from the code.
 *
 * `ENTSPTS`/`ENTSPTS2`/`ChampionPoints`/`AbbreviatedChampionPoints` are
 * pre-computed once at import time (`Measurement.RecalculateProperties()`,
 * `TMD.Model/Trees/Measurement.cs:122-131`) and persisted as plain nullable
 * `real` columns on `trees` -- this port reads them directly, no
 * recomputation. `TDI2`/`TDI3` are NOT persisted (`Tree.TDI2`/`TDI3` are
 * computed properties, `TMD.Model/Trees/Tree.cs:80-81`, evaluated against
 * the tree's `GlobalMeasuredSpecies` -- i.e. the CURRENT global max height/
 * girth/crown-spread for the tree's (scientific_name, common_name) pair,
 * `TMD.Model/Trees/Species.cs:35-66`) -- this port computes them live via a
 * join against the same trees table, mirroring `measured-species.sql.ts`'s
 * "group by scientific_name, common_name" grouping (not imported from that
 * file to keep this module self-contained per file-ownership; the grouping
 * logic is duplicated intentionally, not by oversight).
 *
 * TDI gating deviation (documented): `CalculateTDI2`/`CalculateTDI3`
 * (`Species.cs:35-66`) literally check `!MaxHeight.IsSpecified` etc., and
 * `Distance.IsSpecified` (`Distance.cs:39`) is `InputFormat !=
 * DistanceFormat.Unspecified(1)` -- but the species-max query sets
 * `Max*InputFormat = Invalid(0)` (not Unspecified) when the max is exactly
 * 0 (`CreateObjectsAndTypes.sql`'s `case when max=0 then 0 else 2 end`, see
 * `measured-species.sql.ts`'s header). Since `Invalid(0) != Unspecified(1)`,
 * `IsSpecified` is literally `true` even when the group max is 0 -- meaning
 * legacy's own gate never actually excludes the "no species data" case and
 * would divide by zero (producing `Infinity`, which `.ToString("0.00")`
 * renders as the literal string `"Infinity"`) in that edge case. This port
 * instead gates on `maxHeight/maxGirth/maxCrownSpread <> 0` (documented,
 * deliberate deviation, not a literal transcription) to avoid emitting
 * `Infinity`/`NaN` into JSON -- this requires every tree of a species to
 * have literally zero recorded height/girth/crown-spread, which does not
 * occur anywhere in the 312-artifact verification corpus and is judged an
 * unreachable-in-practice legacy quirk, not a behavior worth reproducing.
 */
import { fround, roundDotNetSingle } from "@/lib/units/float32";
import { Units, distanceSubunit, formatDistance, formatRuckerIndex } from "@/lib/units/format";
import { type SqlTag, defaultSql } from "./sql-tag";

// ---------------------------------------------------------------------------
// Small local formatters not exposed by lib/units/format.ts (that file is
// read-only for this task -- see task ownership notes). Both mirror .NET
// custom-format-string semantics already documented/implemented there.
// ---------------------------------------------------------------------------

/**
 * `{0:0.00}` on a plain (non-value-object) `float?` -- TDI2/TDI3/ENTSPTS/
 * ENTSPTS2/ChampionPoints/AbbreviatedChampionPoints all use this exact
 * format on `MapTreeMarkerInfoModel` with NO unit-based `ToString`, i.e.
 * these values are NOT run through `Units`/`formatDistance` at all --
 * always 2dp fixed regardless of the visitor's unit preference. Same
 * half-away-from-zero rounding as `format.ts`'s private `formatFixed`.
 */
function formatPlainFixed2(value: number): string {
  const rounded = roundDotNetSingle(value, 2);
  const normalized = rounded === 0 ? 0 : rounded;
  return normalized.toFixed(2);
}

/**
 * `{0:MM/dd/yyyy}` on a date/date? column, reading the `YYYY-MM-DD` (or
 * `YYYY-MM-DD...` timestamp) text produced by this module's `::text` casts.
 * `null`/`undefined` maps to ASP.NET MVC's un-overridden default
 * `NullDisplayText`, which is `""` (`MapStateMarkerInfoModel`/
 * `MapSiteMarkerInfoModel` do not override it, unlike e.g.
 * `BrowseStateModel`).
 */
function formatDateMMDDYYYY(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  const datePart = isoDate.slice(0, 10);
  const [y, m, d] = datePart.split("-");
  return `${m}/${d}/${y}`;
}

/**
 * `CoordinateBounds.cs:92-117` `recomputeIfNeeded()`'s center formula,
 * applied independently per axis with float32 discipline (doc 07 §6):
 * `(edge1 + (edge1 < edge2 ? 360f : 0f) - edge2) / 2f + edge2`.
 */
function boundsMidpoint(edge1: number, edge2: number): number {
  const e1 = fround(edge1);
  const e2 = fround(edge2);
  const offset = e1 < e2 ? 360 : 0;
  const sum = fround(fround(e1) + offset);
  const diff = fround(sum - e2);
  const half = fround(diff / 2);
  const raw = fround(half + e2);
  // Antimeridian wrap: for bounds crossing ±180 (Alaska) the offset math
  // overshoots past 180; legacy's Longitude.Create normalizes back into
  // range (verified: legacy renders -158.93, not 201.07). Same fix as
  // species-state-details.sql.ts's bounds midpoint.
  if (raw > 180) return fround(raw - 360);
  if (raw < -180) return fround(raw + 360);
  return raw;
}

// ---------------------------------------------------------------------------
// Markers (`/api/map/markers` and friends)
// ---------------------------------------------------------------------------

export type MapMarkerKind = "state" | "site" | "tree";

export interface MapMarkerRow {
  kind: MapMarkerKind;
  id: number;
  title: string;
  minZoom: number;
  maxZoom: number;
  latitude: number;
  longitude: number;
  iconUrl: string;
}

function siteOrTreeIconUrl(photoId: number | null, defaultUrl: string): string {
  return photoId == null ? defaultUrl : `/photos/${photoId}/SmallMapSquare`;
}

interface RawStateMarkerRow {
  id: number;
  name: string;
  ne_latitude: number;
  ne_longitude: number;
  sw_latitude: number;
  sw_longitude: number;
  contains_entity_with_coordinates: boolean | null;
}

/** Port of the State branch of `MapController.AllMarkers()` -- see file header. */
export async function allStateMarkers(sql: SqlTag = defaultSql()): Promise<MapMarkerRow[]> {
  const rows = await sql<RawStateMarkerRow>`
    select
      id, name, ne_latitude, ne_longitude, sw_latitude, sw_longitude,
      computed_contains_entity_with_coordinates as contains_entity_with_coordinates
    from states
    where computed_trees_measured_count > 0
    order by id
  `;
  return rows.map((r) => ({
    kind: "state" as const,
    id: r.id,
    title: r.name,
    minZoom: 0,
    maxZoom: r.contains_entity_with_coordinates === false ? 30 : 6,
    latitude: boundsMidpoint(r.ne_latitude, r.sw_latitude),
    longitude: boundsMidpoint(r.ne_longitude, r.sw_longitude),
    iconUrl: "/images/icons/State32.png",
  }));
}

interface RawSiteMarkerRow {
  id: number;
  name: string;
  calculated_latitude: number;
  calculated_longitude: number;
  contains_entity_with_coordinates: boolean | null;
  photo_id: number | null;
}

function mapSiteRow(r: RawSiteMarkerRow): MapMarkerRow {
  return {
    kind: "site",
    id: r.id,
    title: r.name,
    minZoom: 7,
    maxZoom: r.contains_entity_with_coordinates === false ? 30 : 13,
    latitude: r.calculated_latitude,
    longitude: r.calculated_longitude,
    iconUrl: siteOrTreeIconUrl(r.photo_id, "/images/icons/Site32.png?v=2"),
  };
}

/** Port of the Site branch of `MapController.AllMarkers()` -- see file header. */
export async function allSiteMarkers(sql: SqlTag = defaultSql()): Promise<MapMarkerRow[]> {
  const rows = await sql<RawSiteMarkerRow>`
    select
      s.id, s.name, s.calculated_latitude, s.calculated_longitude,
      s.computed_contains_entity_with_coordinates as contains_entity_with_coordinates,
      (select pr.photo_id from photo_references pr where pr.site_id = s.id order by pr.id asc limit 1) as photo_id
    from sites s
    where (s.calculated_latitude_input_format <> 1 or s.calculated_longitude_input_format <> 1)
    order by s.id
  `;
  return rows.map(mapSiteRow);
}

/** Port of `MapController.SiteMarker(id)` (lines 63-68) -- no filter, any id. */
export async function siteMarker(id: number, sql: SqlTag = defaultSql()): Promise<MapMarkerRow | null> {
  const rows = await sql<RawSiteMarkerRow>`
    select s.id, s.name, s.calculated_latitude, s.calculated_longitude,
      s.computed_contains_entity_with_coordinates as contains_entity_with_coordinates,
      (select pr.photo_id from photo_references pr where pr.site_id = s.id order by pr.id asc limit 1) as photo_id
    from sites s
    where s.id = ${id}
  `;
  return rows[0] ? mapSiteRow(rows[0]) : null;
}

interface RawTreeMarkerRow {
  id: number;
  scientific_name: string;
  calculated_latitude: number;
  calculated_longitude: number;
  photo_id: number | null;
}

function mapTreeRow(r: RawTreeMarkerRow): MapMarkerRow {
  return {
    kind: "tree",
    id: r.id,
    title: r.scientific_name,
    minZoom: 14,
    maxZoom: 30,
    latitude: r.calculated_latitude,
    longitude: r.calculated_longitude,
    iconUrl: siteOrTreeIconUrl(r.photo_id, "/images/icons/Tree32.png"),
  };
}

/**
 * Port of the Tree branch of `MapController.AllMarkers()` -- see file
 * header. Filter uses the tree's RAW `latitude_input_format`/
 * `longitude_input_format` (not the calculated ones used for Position).
 */
export async function allTreeMarkers(sql: SqlTag = defaultSql()): Promise<MapMarkerRow[]> {
  const rows = await sql<RawTreeMarkerRow>`
    select t.id, t.scientific_name, t.calculated_latitude, t.calculated_longitude,
      (select pr.photo_id from photo_references pr where pr.tree_id = t.id order by pr.id asc limit 1) as photo_id
    from trees t
    where (t.latitude_input_format <> 1 or t.longitude_input_format <> 1)
    order by t.id
  `;
  return rows.map(mapTreeRow);
}

/** Port of `MapController.TreeMarker(id)` (lines 56-61) -- no filter, any id. */
export async function treeMarker(id: number, sql: SqlTag = defaultSql()): Promise<MapMarkerRow | null> {
  const rows = await sql<RawTreeMarkerRow>`
    select t.id, t.scientific_name, t.calculated_latitude, t.calculated_longitude,
      (select pr.photo_id from photo_references pr where pr.tree_id = t.id order by pr.id asc limit 1) as photo_id
    from trees t
    where t.id = ${id}
  `;
  return rows[0] ? mapTreeRow(rows[0]) : null;
}

/**
 * Port of `MapController.AllMarkers()` (lines 35-54): concatenates state,
 * site, then tree markers. The `{ Markers: [...] }` JSON envelope + PascalCase
 * field renaming + `InfoLoaderUrl` construction are the API route's job
 * (`app/api/map/markers/route.ts`), not this query layer's.
 */
export async function allMapMarkers(sql: SqlTag = defaultSql()): Promise<MapMarkerRow[]> {
  const [states, sites, trees] = await Promise.all([
    allStateMarkers(sql),
    allSiteMarkers(sql),
    allTreeMarkers(sql),
  ]);
  return [...states, ...sites, ...trees];
}

// ---------------------------------------------------------------------------
// Marker info payloads (`/api/map/{states,sites,trees}/{id}/info`)
//
// Each function returns a shape matching (near-identically)
// `parity/extractors/schema.ts`'s `{State,Site,Tree}MarkerInfoJson` so the
// `parity/extractors/new/marker-info-*.ts` extractors are near-identity
// mappings, per this task's deliverable #4.
// ---------------------------------------------------------------------------

export interface MarkerInfoLinkedText {
  text: string;
  href: string;
}

export interface StateMarkerInfoData {
  stateId: number;
  name: string;
  detailsLink: MarkerInfoLinkedText;
  rows: Record<string, string>;
}

export interface SiteMarkerInfoData {
  siteId: number;
  name: string;
  detailsLink: MarkerInfoLinkedText;
  rows: Record<string, string>;
  photos: { thumbnailSrc: string }[];
  lastMeasurementDate: string;
}

export interface TreeMarkerInfoData {
  treeId: number;
  scientificName: string;
  detailsLink: MarkerInfoLinkedText;
  rows: Record<string, string>;
  photos: { thumbnailSrc: string }[];
  lastMeasured: string;
}

/** `countries`/`states` char(2)/char(3) columns are space-padded; trim before use (Country.cs:27-35 / State.cs:25-35 `Code` logic). */
function codeOf(double: string, triple: string): string {
  const d = double.trim();
  return d.length > 0 ? d : triple.trim();
}

function pushIfSpecified(rows: Record<string, string>, label: string, value: number | null, units: Units): void {
  if (value == null) return;
  rows[label] = formatRuckerIndex(value, units);
}

interface RawStateInfoRow {
  id: number;
  name: string;
  country_name: string;
  computed_rhi5: number | null;
  computed_rhi10: number | null;
  computed_rhi20: number | null;
  computed_rgi5: number | null;
  computed_rgi10: number | null;
  computed_rgi20: number | null;
  computed_trees_measured_count: number | null;
  computed_last_measurement_date: string | null;
}

/** Port of `MapController.StateMarkerInfo(id)` + `StateMarkerInfo.cshtml` -- see file header. */
export async function stateMarkerInfo(
  id: number,
  units: Units,
  sql: SqlTag = defaultSql(),
): Promise<StateMarkerInfoData | null> {
  const rows = await sql<RawStateInfoRow>`
    select
      st.id, st.name, c.name as country_name,
      st.computed_rhi5, st.computed_rhi10, st.computed_rhi20,
      st.computed_rgi5, st.computed_rgi10, st.computed_rgi20,
      st.computed_trees_measured_count,
      st.computed_last_measurement_date::text as computed_last_measurement_date
    from states st
    join countries c on c.id = st.country_id
    where st.id = ${id}
  `;
  const r = rows[0];
  if (!r) return null;

  const out: Record<string, string> = { Country: r.country_name };
  pushIfSpecified(out, "RHI5", r.computed_rhi5, units);
  pushIfSpecified(out, "RHI10", r.computed_rhi10, units);
  pushIfSpecified(out, "RHI20", r.computed_rhi20, units);
  pushIfSpecified(out, "RGI5", r.computed_rgi5, units);
  pushIfSpecified(out, "RGI10", r.computed_rgi10, units);
  pushIfSpecified(out, "RGI20", r.computed_rgi20, units);
  out["Trees measured"] = r.computed_trees_measured_count == null ? "" : String(r.computed_trees_measured_count);
  out["Last measurement date"] = formatDateMMDDYYYY(r.computed_last_measurement_date);

  return {
    stateId: r.id,
    name: r.name,
    detailsLink: { text: "View more details", href: `/states/${r.id}` },
    rows: out,
  };
}

interface RawSiteInfoRow {
  id: number;
  name: string;
  county: string;
  ownership_type: string;
  state_name: string;
  country_double: string;
  country_triple: string;
  computed_rhi5: number | null;
  computed_rhi10: number | null;
  computed_rhi20: number | null;
  computed_rgi5: number | null;
  computed_rgi10: number | null;
  computed_rgi20: number | null;
  computed_trees_measured_count: number | null;
  computed_last_measurement_date: string | null;
}

/** Port of `MapController.SiteMarkerInfo(id)` + `SiteMarkerInfo.cshtml` -- see file header. */
export async function siteMarkerInfo(
  id: number,
  units: Units,
  sql: SqlTag = defaultSql(),
): Promise<SiteMarkerInfoData | null> {
  // Perf audit 2026-07: entity row + photo ids are independent -- pipeline
  // them in one batch instead of two sequential round trips.
  const [rows, photoRows] = await Promise.all([
    sql<RawSiteInfoRow>`
      select
        s.id, s.name, s.county, s.ownership_type,
        st.name as state_name, c.double_letter_code as country_double, c.triple_letter_code as country_triple,
        s.computed_rhi5, s.computed_rhi10, s.computed_rhi20,
        s.computed_rgi5, s.computed_rgi10, s.computed_rgi20,
        s.computed_trees_measured_count,
        s.computed_last_measurement_date::text as computed_last_measurement_date
      from sites s
      join states st on st.id = s.state_id
      join countries c on c.id = st.country_id
      where s.id = ${id}
    `,
    sql<{ photo_id: number }>`
      select photo_id from photo_references where site_id = ${id} order by id asc
    `,
  ]);
  const r = rows[0];
  if (!r) return null;

  const out: Record<string, string> = {
    State: `${r.state_name} (${codeOf(r.country_double, r.country_triple)})`,
    County: r.county,
    "Ownership type": r.ownership_type,
  };
  pushIfSpecified(out, "RHI5", r.computed_rhi5, units);
  pushIfSpecified(out, "RHI10", r.computed_rhi10, units);
  pushIfSpecified(out, "RHI20", r.computed_rhi20, units);
  pushIfSpecified(out, "RGI5", r.computed_rgi5, units);
  pushIfSpecified(out, "RGI10", r.computed_rgi10, units);
  pushIfSpecified(out, "RGI20", r.computed_rgi20, units);
  out["Trees measured"] = r.computed_trees_measured_count == null ? "" : String(r.computed_trees_measured_count);

  return {
    siteId: r.id,
    name: r.name,
    detailsLink: { text: "View more details", href: `/sites/${r.id}` },
    rows: out,
    photos: photoRows.map((p) => ({ thumbnailSrc: `/photos/${p.photo_id}/Square` })),
    lastMeasurementDate: formatDateMMDDYYYY(r.computed_last_measurement_date),
  };
}

interface RawTreeInfoRow {
  id: number;
  scientific_name: string;
  common_name: string;
  height: number;
  height_input_format: number;
  girth: number;
  girth_input_format: number;
  crown_spread: number;
  crown_spread_input_format: number;
  entspts: number | null;
  entspts2: number | null;
  champion_points: number | null;
  abbreviated_champion_points: number | null;
  last_measured: string;
  max_height: number;
  max_girth: number;
  max_crown_spread: number;
}

/**
 * Live TDI2/TDI3 inputs: the tree's own height/girth/crown-spread against
 * the CURRENT global max for its (scientific_name, common_name) pair --
 * mirrors `Tree.Species` (`GlobalMeasuredSpecies`), see file header.
 */
async function treeAndSpeciesMax(id: number, sql: SqlTag): Promise<RawTreeInfoRow | null> {
  const rows = await sql<RawTreeInfoRow>`
    with target as (
      select id, scientific_name, common_name, height, height_input_format,
        girth, girth_input_format, crown_spread, crown_spread_input_format,
        entspts, entspts2, champion_points, abbreviated_champion_points,
        last_measured::text as last_measured
      from trees where id = ${id}
    ),
    species_max as (
      select max(t2.height) as max_height, max(t2.girth) as max_girth, max(t2.crown_spread) as max_crown_spread
      from trees t2
      join target on t2.scientific_name = target.scientific_name and t2.common_name = target.common_name
    )
    select target.*, species_max.max_height, species_max.max_girth, species_max.max_crown_spread
    from target, species_max
  `;
  return rows[0] ?? null;
}

/** `Species.CalculateTDI2` (`Species.cs:35-49`) -- see file header's "TDI gating deviation" note. */
function calculateTDI2(r: RawTreeInfoRow): number | null {
  if (r.height_input_format === 1 || r.girth_input_format === 1) return null;
  if (r.max_height === 0 || r.max_girth === 0) return null;
  const value = r.height / r.max_height + r.girth / r.max_girth;
  return fround(value);
}

/** `Species.CalculateTDI3` (`Species.cs:51-66`) -- see file header's "TDI gating deviation" note. */
function calculateTDI3(r: RawTreeInfoRow): number | null {
  if (r.height_input_format === 1 || r.girth_input_format === 1 || r.crown_spread_input_format === 1) return null;
  if (r.max_height === 0 || r.max_girth === 0 || r.max_crown_spread === 0) return null;
  const value = r.height / r.max_height + r.girth / r.max_girth + r.crown_spread / r.max_crown_spread;
  return fround(value);
}

/** Port of `MapController.TreeMarkerInfo(id)` + `TreeMarkerInfo.cshtml` -- see file header. */
export async function treeMarkerInfo(
  id: number,
  units: Units,
  sql: SqlTag = defaultSql(),
): Promise<TreeMarkerInfoData | null> {
  // Perf audit 2026-07: same pipelined-batch shape as siteMarkerInfo above.
  const [r, photoRows] = await Promise.all([
    treeAndSpeciesMax(id, sql),
    sql<{ photo_id: number }>`
      select photo_id from photo_references where tree_id = ${id} order by id asc
    `,
  ]);
  if (!r) return null;

  const out: Record<string, string> = { "Common name": r.common_name };
  if (r.height_input_format !== 1) out.Height = formatDistance(r.height, units);
  if (r.girth_input_format !== 1) out.Girth = distanceSubunit(r.girth, units);
  if (r.crown_spread_input_format !== 1) out["Crown spread"] = formatDistance(r.crown_spread, units);

  const tdi3 = calculateTDI3(r);
  if (tdi3 != null) out.TDI3 = formatPlainFixed2(tdi3);
  const tdi2 = calculateTDI2(r);
  if (tdi2 != null) out.TDI2 = formatPlainFixed2(tdi2);
  if (r.entspts2 != null) out.ENTSPTS2 = formatPlainFixed2(r.entspts2);
  if (r.entspts != null) out.ENTSPTS = formatPlainFixed2(r.entspts);

  if (r.champion_points != null) {
    out["Champion points"] = formatPlainFixed2(r.champion_points);
  } else if (r.abbreviated_champion_points != null) {
    out["Champion points (abbreviated)"] = formatPlainFixed2(r.abbreviated_champion_points);
  }

  return {
    treeId: r.id,
    scientificName: r.scientific_name,
    detailsLink: { text: "View more details", href: `/trees/${r.id}` },
    rows: out,
    photos: photoRows.map((p) => ({ thumbnailSrc: `/photos/${p.photo_id}/Square` })),
    lastMeasured: formatDateMMDDYYYY(r.last_measured),
  };
}
