/**
 * Import-wizard draft data layer -- task P3-03 (doc 05 §P3-03..07, doc 01
 * §10, doc 01 §2 `import_*` table columns). Drafts live in the `import_*`
 * tables exactly like legacy's `Imports.*` tables; every mutation stamps
 * `last_saved`, mirroring `ImportRepository.Save` (`TMD.Model/Imports/
 * ImportRepository.cs:11-15`: `t.LastSaved = DateTime.Now; InternalSave(t);`
 * -- called from EVERY wizard mutation, not just an explicit "Save" click).
 *
 * This task owns only the Trip step -- Sites/Trees/Review (P3-04..06) own
 * their own tables' CRUD in their own files; this module's scope is
 * `import_trips` + `import_trip_measurers` plus the cross-cutting
 * authorization primitive every step's route/layout needs.
 *
 * --- Authorization (doc 01 §1 "Import/* requires role Import AND per-trip
 * creator == user") ---------------------------------------------------------
 * Ported from `TMD.Model/Users/UserRoles.cs:44-88`:
 *   - `AuthorizeUser(Roles = UserRoles.Import)]` on every ImportController
 *     action (e.g. `ImportController.cs:30`) gates on the Import role bit
 *     BEFORE the action body runs -- reproduced here as the `roles` check.
 *   - `User.IsAuthorizedToEdit(trip)` (`UserRoles.cs:50`) delegates to each
 *     of the user's `UserRole` instances' `IsAuthorizedToEdit` (default
 *     `false`, `UserRoles.cs:59`). ONLY `ImportUserRole` overrides it:
 *     `return user == trip.Creator;` (`UserRoles.cs:69`) -- reference
 *     equality on the loaded entity, i.e. **creator-id equality**.
 *     `AdminUserRole` does NOT override this method (`UserRoles.cs:81-87`)
 *     -- admins get NO special edit access to someone else's trip. The rule
 *     is therefore exactly "has Import role AND is the trip's creator",
 *     with no admin bypass, reproduced verbatim in `assertTripEditable`.
 */
import type { SqlTag } from "./sql-tag";
import { defaultSql, withTransaction } from "./sql-tag";
import { CoordinatesFormat } from "../../lib/units/parse-coordinates";
// `removeTrip` (appended for task P3-07, doc 05 §P3-03..07) reuses the
// canonical-side orphan-cleanup helpers already built/verified for reimport
// (`lib/merge/reimport.ts`, additive exports -- see that file's header note)
// rather than duplicating `RemoveMeasurementsByTrip`/`RemoveVisitsByTrip`.
import { removeMeasurementsByTrip, removeVisitsByTrip } from "../../lib/merge/reimport";
import { recomputeStaleMetrics } from "../recompute";

// ---------------------------------------------------------------------------
// Authorization
// ---------------------------------------------------------------------------

export type TripAccessReason = "not-found" | "unauthorized";

/** Thrown by `assertTripEditable` -- callers (layouts/actions) catch this and
 * render the not-found/401 case the way legacy's `UnauthorizedResult()` /
 * a missing entity would (see app/import/[tripId]/layout.tsx). */
export class TripAccessError extends Error {
  reason: TripAccessReason;
  constructor(reason: TripAccessReason) {
    super(reason === "not-found" ? "Trip not found." : "You are not authorized to edit this trip.");
    this.reason = reason;
    this.name = "TripAccessError";
  }
}

/**
 * `UserRoles.cs:50,69` -- role Import AND creator-id equality, no admin
 * bypass (see file header). Throws `TripAccessError` rather than returning a
 * boolean so every call site gets the not-found/unauthorized distinction
 * (`UnauthorizedResult` vs. a null `FindById`) for free.
 */
export async function assertTripEditable(
  tripId: number,
  userId: number,
  roles: string[],
  sql: SqlTag = defaultSql(),
): Promise<void> {
  if (!roles.includes("import")) {
    throw new TripAccessError("unauthorized");
  }
  const rows = await sql<{ creator_user_id: number | null }>`
    select creator_user_id from import_trips where id = ${tripId}
  `;
  const row = rows[0];
  if (!row) {
    throw new TripAccessError("not-found");
  }
  if (row.creator_user_id !== userId) {
    throw new TripAccessError("unauthorized");
  }
}

// ---------------------------------------------------------------------------
// Trip creation (Trip.Create(), Trip.cs:139-155)
// ---------------------------------------------------------------------------

/**
 * `Trip.Create()` defaults: Name/Website/MeasurerContactInfo empty,
 * Date/Imported null, PhotosAvailable false,
 * MakeMeasurerContactInfoPublic **true** (Trip.cs:153),
 * DefaultLaserBrand/DefaultClinometerBrand empty strings,
 * DefaultHeightMeasurementMethod left at its enum default (0),
 * DefaultState/DefaultCounty null. `Created`/`Creator` come from
 * `RecordCreation()` (EntityBase.cs:67-72) -- `Created = DateTime.Now`,
 * `Creator = UserSession.User`. `LastSaved` is stamped by the first
 * `ImportRepository.Save` call the same way every other mutation stamps it
 * (file header) -- set to `now` here too so a freshly-created, never-yet-
 * "Saved" draft still has a sane value.
 */
export async function createTrip(userId: number, now: Date, sql: SqlTag = defaultSql()): Promise<number> {
  const rows = await sql<{ id: number }>`
    insert into import_trips (
      creator_user_id, created, imported, name, date, website, photos_available,
      measurer_contact_info, make_measurer_contact_info_public,
      default_laser_brand, default_clinometer_brand, default_height_measurement_method,
      default_state_id, default_county, last_saved
    ) values (
      ${userId}, ${now}, null, '', null, '', false,
      '', true,
      '', '', 0,
      null, null, ${now}
    )
    returning id
  `;
  return rows[0]!.id;
}

// ---------------------------------------------------------------------------
// Trip read (single trip, with measurers)
// ---------------------------------------------------------------------------

export interface TripMeasurer {
  id: number;
  firstName: string;
  lastName: string;
}

export interface TripDraft {
  id: number;
  creatorUserId: number | null;
  created: Date;
  imported: Date | null;
  isImported: boolean;
  name: string;
  date: string | null;
  website: string;
  photosAvailable: boolean;
  measurerContactInfo: string;
  makeMeasurerContactInfoPublic: boolean;
  defaultLaserBrand: string | null;
  defaultClinometerBrand: string | null;
  defaultHeightMeasurementMethod: number;
  defaultStateId: number | null;
  defaultCounty: string | null;
  lastSaved: Date;
  measurers: TripMeasurer[];
}

interface RawTripRow {
  id: number;
  creator_user_id: number | null;
  created: Date;
  imported: Date | null;
  name: string;
  date: string | null;
  website: string;
  photos_available: boolean;
  measurer_contact_info: string;
  make_measurer_contact_info_public: boolean;
  default_laser_brand: string | null;
  default_clinometer_brand: string | null;
  default_height_measurement_method: number;
  default_state_id: number | null;
  default_county: string | null;
  last_saved: Date;
}

/** `ImportController.Trip`/`.Sites`/`.Trees` GET actions all start with
 * `Repositories.Imports.FindById(id)` (e.g. `ImportController.cs:57,87`).
 * `date` is explicitly cast `::text` -- same convention as
 * db/queries/details.sql.ts/browse-grids.sql.ts -- because the real
 * postgres.js client and the PGlite test transport represent a bare SQL
 * `date` column differently (string vs. `Date`) by default; casting keeps
 * both transports' output identical rather than branching on which driver
 * is in play. */
export async function getTrip(tripId: number, sql: SqlTag = defaultSql()): Promise<TripDraft | null> {
  const rows = await sql<RawTripRow>`
    select
      id, creator_user_id, created, imported, name, date::text as date, website,
      photos_available, measurer_contact_info, make_measurer_contact_info_public,
      default_laser_brand, default_clinometer_brand, default_height_measurement_method,
      default_state_id, default_county, last_saved
    from import_trips
    where id = ${tripId}
  `;
  const row = rows[0];
  if (!row) return null;

  const measurers = await listTripMeasurers(tripId, sql);

  return {
    id: row.id,
    creatorUserId: row.creator_user_id,
    created: row.created,
    imported: row.imported,
    isImported: row.imported !== null, // Trip.cs:63
    name: row.name,
    date: row.date,
    website: row.website,
    photosAvailable: row.photos_available,
    measurerContactInfo: row.measurer_contact_info,
    makeMeasurerContactInfoPublic: row.make_measurer_contact_info_public,
    defaultLaserBrand: row.default_laser_brand,
    defaultClinometerBrand: row.default_clinometer_brand,
    defaultHeightMeasurementMethod: row.default_height_measurement_method,
    defaultStateId: row.default_state_id,
    defaultCounty: row.default_county,
    lastSaved: row.last_saved,
    measurers,
  };
}

// ---------------------------------------------------------------------------
// Trip list (History -- `ImportRepository.ListCreatedByUser`,
// `TMD.Infrastructure/Repositories/ImportRepository.cs:15-22`: ordered
// `Order.Desc("Id")`. Built now per this task's brief ("History uses this
// later") even though the History page itself is a later task's file.)
// ---------------------------------------------------------------------------

export interface TripSummary {
  id: number;
  name: string;
  date: string | null;
  created: Date;
  isImported: boolean;
  /** `ImportMapping.cs:17-18` (`ImportTripSummaryModel.Sites` <- site
   * names) -- empty until the Sites step (P3-04, not this task) creates any
   * `import_sites` rows for the trip. */
  siteNames: string[];
}

interface RawTripSummaryRow {
  id: number;
  name: string;
  date: string | null;
  created: Date;
  imported: Date | null;
  site_names: string[] | null;
}

export async function listTripsForUser(userId: number, sql: SqlTag = defaultSql()): Promise<TripSummary[]> {
  const rows = await sql<RawTripSummaryRow>`
    select
      t.id, t.name, t.date::text as date, t.created, t.imported,
      coalesce(array_agg(s.name) filter (where s.id is not null), '{}') as site_names
    from import_trips t
    left join import_sites s on s.trip_id = t.id
    where t.creator_user_id = ${userId}
    group by t.id
    order by t.id desc
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    date: r.date,
    created: r.created,
    isImported: r.imported !== null,
    siteNames: r.site_names ?? [],
  }));
}

/**
 * `ImportRepository.FindLastCreatedByUser` (`ImportRepository.cs:45-52`) --
 * same ordering as `listTripsForUser`, `SetMaxResults(1)`. Backs the
 * mega-menu's "Continue"/"History" branching (`ImportMenuWidgetModel.
 * LatestTrip`, `TMD/Views/Import/MenuWidget.cshtml:11-16`) that
 * app/import/page.tsx's entry redirect mirrors -- see that file's header
 * for why (the legacy `/Import` route itself points at a nonexistent
 * `Index` action, doc 01 §1's "Import/New ... dead" quirk applies equally
 * here, confirmed against `TMD/Global.asax.cs:68` + the full generated
 * `ImportController` action list, which has no `Index`).
 */
export async function findLatestTripForUser(
  userId: number,
  sql: SqlTag = defaultSql(),
): Promise<{ id: number; isImported: boolean } | null> {
  const rows = await sql<{ id: number; imported: Date | null }>`
    select id, imported from import_trips
    where creator_user_id = ${userId}
    order by id desc
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;
  return { id: row.id, isImported: row.imported !== null };
}

// ---------------------------------------------------------------------------
// Trip-step field update (Trip.cs's own scalar properties)
// ---------------------------------------------------------------------------

export interface TripStepUpdate {
  name: string;
  date: string | null;
  measurerContactInfo: string;
  makeMeasurerContactInfoPublic: boolean;
  website: string;
}

/** Updates only the Trip-step's own scalar fields and stamps `last_saved` --
 * the `updateTripStep` primitive named in this task's brief. `saveTripStep`
 * below composes this with the measurer-list replace in one transaction,
 * matching `Repositories.Imports.Save(trip)` persisting the whole aggregate
 * (entity + its `Measurers` collection) in a single NHibernate flush. */
export async function updateTripStep(
  tripId: number,
  fields: TripStepUpdate,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update import_trips set
      name = ${fields.name},
      date = ${fields.date},
      measurer_contact_info = ${fields.measurerContactInfo},
      make_measurer_contact_info_public = ${fields.makeMeasurerContactInfoPublic},
      website = ${fields.website},
      last_saved = ${now}
    where id = ${tripId}
  `;
}

// ---------------------------------------------------------------------------
// Trip measurers (Imports.Measurers / import_trip_measurers)
// ---------------------------------------------------------------------------

export async function listTripMeasurers(tripId: number, sql: SqlTag = defaultSql()): Promise<TripMeasurer[]> {
  const rows = await sql<{ id: number; first_name: string; last_name: string }>`
    select id, first_name, last_name from import_trip_measurers
    where trip_id = ${tripId}
    order by id asc
  `;
  return rows.map((r) => ({ id: r.id, firstName: r.first_name, lastName: r.last_name }));
}

export async function addTripMeasurer(
  tripId: number,
  firstName: string,
  lastName: string,
  sql: SqlTag = defaultSql(),
): Promise<number> {
  const rows = await sql<{ id: number }>`
    insert into import_trip_measurers (trip_id, first_name, last_name)
    values (${tripId}, ${firstName}, ${lastName})
    returning id
  `;
  return rows[0]!.id;
}

export async function removeTripMeasurer(measurerId: number, sql: SqlTag = defaultSql()): Promise<void> {
  await sql`delete from import_trip_measurers where id = ${measurerId}`;
}

/**
 * Whole-collection replace: delete every existing measurer row for the trip
 * and re-insert the given list, preserving array order via ascending `id`
 * on read-back (`listTripMeasurers`). Mirrors `ImportMapping.cs`'s
 * `AfterMap` block, which rebuilds `Trip.Measurers` from scratch on every
 * Trip-step submit rather than diffing (file header).
 */
export async function replaceTripMeasurers(
  tripId: number,
  measurers: { firstName: string; lastName: string }[],
  sql: SqlTag,
): Promise<void> {
  await sql`delete from import_trip_measurers where trip_id = ${tripId}`;
  for (const m of measurers) {
    await sql`
      insert into import_trip_measurers (trip_id, first_name, last_name)
      values (${tripId}, ${m.firstName}, ${m.lastName})
    `;
  }
}

/**
 * The Trip step's actual save primitive: updates the scalar fields and
 * wholesale-replaces the measurer list in one transaction, stamping
 * `last_saved` once for the whole aggregate -- matching
 * `Repositories.Imports.Save(trip); Uow.Persist();`
 * (`ImportController.cs:79-80`).
 */
export async function saveTripStep(
  tripId: number,
  fields: TripStepUpdate,
  measurers: { firstName: string; lastName: string }[],
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await withTransaction(sql, async (trx) => {
    await updateTripStep(tripId, fields, now, trx);
    await replaceTripMeasurers(tripId, measurers, trx);
  });
}

// ---------------------------------------------------------------------------
// Sites step (P3-04, doc 05 §P3-04, doc 01 §10) -- Imports.Sites /
// import_sites, plus the `states` lookup the step's State dropdown needs.
//
// Every mutation below stamps the OWNING trip's `last_saved`, same
// convention as the Trip-step functions above -- `Repositories.Imports.
// Save(trip)` persists the whole aggregate (trip + its Sites collection) in
// one NHibernate flush from every Sites-step controller action
// (`ImportController.cs:84-220`), stamping `LastSaved` every time,
// INCLUDING the plain GET (`Sites(int id)`, cs:84-97) -- that action calls
// `trip.InitializeSites(); Repositories.Imports.Save(trip);`
// unconditionally, so `last_saved` bumps on every visit to this step, not
// only on an explicit edit; see `ensureSiteExists` below.
// ---------------------------------------------------------------------------

export interface ImportSite {
  id: number;
  tripId: number;
  name: string;
  latitude: number;
  latitudeInputFormat: number;
  longitude: number;
  longitudeInputFormat: number;
  stateId: number | null;
  county: string;
  ownershipType: string;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  comments: string;
}

interface RawImportSiteRow {
  id: number;
  trip_id: number;
  name: string;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
  state_id: number | null;
  county: string;
  ownership_type: string;
  ownership_contact_info: string;
  make_ownership_contact_info_public: boolean;
  comments: string;
}

function mapImportSite(row: RawImportSiteRow): ImportSite {
  return {
    id: row.id,
    tripId: row.trip_id,
    name: row.name,
    latitude: row.latitude,
    latitudeInputFormat: row.latitude_input_format,
    longitude: row.longitude,
    longitudeInputFormat: row.longitude_input_format,
    stateId: row.state_id,
    county: row.county,
    ownershipType: row.ownership_type,
    ownershipContactInfo: row.ownership_contact_info,
    makeOwnershipContactInfoPublic: row.make_ownership_contact_info_public,
    comments: row.comments,
  };
}

/** `Trip.Sites` (via `Mapper.Map(trip, new ImportSitesModel())`,
 * `ImportController.cs:95`), read back in insertion order. */
export async function listImportSites(tripId: number, sql: SqlTag = defaultSql()): Promise<ImportSite[]> {
  const rows = await sql<RawImportSiteRow>`
    select
      id, trip_id, name, latitude, latitude_input_format, longitude, longitude_input_format,
      state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public, comments
    from import_sites where trip_id = ${tripId} order by id asc
  `;
  return rows.map(mapImportSite);
}

export async function getImportSite(siteId: number, sql: SqlTag = defaultSql()): Promise<ImportSite | null> {
  const rows = await sql<RawImportSiteRow>`
    select
      id, trip_id, name, latitude, latitude_input_format, longitude, longitude_input_format,
      state_id, county, ownership_type, ownership_contact_info, make_ownership_contact_info_public, comments
    from import_sites where id = ${siteId}
  `;
  const row = rows[0];
  return row ? mapImportSite(row) : null;
}

/** `Trip.DefaultState`/`Trip.DefaultCounty` -- seeds a newly-created site
 * (`Site.Create(trip)`, `Site.cs:150-164`) the same way legacy does. */
export interface TripSiteDefaults {
  stateId: number | null;
  county: string | null;
}

async function stampTripLastSaved(tripId: number, now: Date, sql: SqlTag): Promise<void> {
  await sql`update import_trips set last_saved = ${now} where id = ${tripId}`;
}

/**
 * `Trip.InitializeSites()` (`Trip.cs:100-106`): adds one blank
 * `Site.Create(trip)` only if the trip has no sites yet. Called from
 * `ImportController.Sites(int id)` GET on EVERY page load
 * (`ImportController.cs:91`), immediately followed by an unconditional
 * `Repositories.Imports.Save(trip)` (cs:92) -- so `last_saved` is stamped
 * here regardless of whether a site was actually inserted, matching that
 * exact call sequence (not just "insert if empty").
 */
export async function ensureSiteExists(
  tripId: number,
  defaults: TripSiteDefaults,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await withTransaction(sql, async (trx) => {
    const rows = await trx<{ id: number }>`select id from import_sites where trip_id = ${tripId} limit 1`;
    if (rows.length === 0) {
      await trx`
        insert into import_sites (
          created, trip_id, name, state_id, county, ownership_type, ownership_contact_info,
          make_ownership_contact_info_public, latitude, latitude_input_format, longitude, longitude_input_format, comments
        ) values (
          ${now}, ${tripId}, '', ${defaults.stateId}, ${defaults.county ?? ""}, '', '',
          true, 0, ${CoordinatesFormat.Unspecified}, 0, ${CoordinatesFormat.Unspecified}, ''
        )
      `;
    }
    await stampTripLastSaved(tripId, now, trx);
  });
}

/**
 * `Trip.AddSite()` (`Trip.cs:93-98`, via `ImportController.AddSite`,
 * cs:120-134) -- ALWAYS inserts a new blank site (unlike `ensureSiteExists`
 * above, which is conditional), seeded from the trip's current
 * `DefaultState`/`DefaultCounty`. Returns the new site's id.
 */
export async function createImportSite(
  tripId: number,
  defaults: TripSiteDefaults,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<number> {
  return withTransaction(sql, async (trx) => {
    const rows = await trx<{ id: number }>`
      insert into import_sites (
        created, trip_id, name, state_id, county, ownership_type, ownership_contact_info,
        make_ownership_contact_info_public, latitude, latitude_input_format, longitude, longitude_input_format, comments
      ) values (
        ${now}, ${tripId}, '', ${defaults.stateId}, ${defaults.county ?? ""}, '', '',
        true, 0, ${CoordinatesFormat.Unspecified}, 0, ${CoordinatesFormat.Unspecified}, ''
      )
      returning id
    `;
    await stampTripLastSaved(tripId, now, trx);
    return rows[0]!.id;
  });
}

export interface ImportSiteFields {
  name: string;
  latitude: number;
  latitudeInputFormat: number;
  longitude: number;
  longitudeInputFormat: number;
  stateId: number | null;
  county: string;
  ownershipType: string;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  comments: string;
}

/** Updates only the site's own scalar fields -- the `SaveSite` primitive
 * named in this task's brief (`ImportController.cs:136-163`, the
 * `Mapper.Map(siteModel, site)` step). Does NOT stamp `last_saved` or
 * touch `Trip.DefaultState`/`DefaultCounty` -- `saveImportSite` below
 * composes both in one transaction, mirroring `updateTripStep`/
 * `saveTripStep`'s split. */
export async function updateImportSite(
  siteId: number,
  fields: ImportSiteFields,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`
    update import_sites set
      name = ${fields.name},
      state_id = ${fields.stateId},
      county = ${fields.county},
      ownership_type = ${fields.ownershipType},
      ownership_contact_info = ${fields.ownershipContactInfo},
      make_ownership_contact_info_public = ${fields.makeOwnershipContactInfoPublic},
      latitude = ${fields.latitude},
      latitude_input_format = ${fields.latitudeInputFormat},
      longitude = ${fields.longitude},
      longitude_input_format = ${fields.longitudeInputFormat},
      comments = ${fields.comments}
    where id = ${siteId}
  `;
}

/** `Site.SetTripDefaults()` (`Site.cs:22-26`): `Trip.DefaultState =
 * State; Trip.DefaultCounty = County;` -- called after a successful site
 * save (`ImportController.SaveSite`, cs:156) and after the Sites step's
 * "Continue" (`SaveSites`, cs:113, on `trip.Sites.Last()`). */
export async function setTripSiteDefaults(
  tripId: number,
  stateId: number | null,
  county: string,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await sql`update import_trips set default_state_id = ${stateId}, default_county = ${county} where id = ${tripId}`;
}

/**
 * The Sites-step per-site save primitive: updates the site's scalar
 * fields, propagates them onto the trip's State/County defaults for the
 * NEXT new site, and stamps `last_saved` once -- matching
 * `Mapper.Map(siteModel, site); ...; site.SetTripDefaults();
 * Repositories.Imports.Save(trip); Uow.Persist();`
 * (`ImportController.cs:140-158`).
 */
export async function saveImportSite(
  siteId: number,
  tripId: number,
  fields: ImportSiteFields,
  now: Date,
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await withTransaction(sql, async (trx) => {
    await updateImportSite(siteId, fields, trx);
    await setTripSiteDefaults(tripId, fields.stateId, fields.county, trx);
    await stampTripLastSaved(tripId, now, trx);
  });
}

/**
 * `Trip.RemoveSite(site)` (`Trip.cs:116-119`) removes the site from the
 * NHibernate-mapped `Sites` bag, which cascades `all-delete-orphan`
 * through the site's own `Trees` bag and (transitively) each tree's
 * `Trunks`/`Photos` bags (`TMD.Infrastructure/Mappings/Imports.hbm.xml`
 * lines 57,172,201,206 -- ORM-level cascade, NOT a DB `ON DELETE CASCADE`:
 * `import_trees.site_id`/`import_trunks.tree_id` carry no cascading FK,
 * doc 01 §2 / db/schema.ts's own file-header note 2). Reproduced here as
 * an explicit multi-statement delete in dependency order, in one
 * transaction, followed by the same `Repositories.Imports.Save(trip)`
 * `last_saved` stamp every other mutation gets (`ImportController.cs:
 * 165-178`). Photo references are out of this task's scope (P3-08, not
 * built yet) and have no rows to delete yet.
 */
export async function removeImportSite(siteId: number, tripId: number, now: Date, sql: SqlTag = defaultSql()): Promise<void> {
  await withTransaction(sql, async (trx) => {
    await trx`delete from import_trunks where tree_id in (select id from import_trees where site_id = ${siteId})`;
    await trx`delete from import_trees where site_id = ${siteId}`;
    await trx`delete from import_sites where id = ${siteId}`;
    await stampTripLastSaved(tripId, now, trx);
  });
}

// ---------------------------------------------------------------------------
// State lookup (Sites step's State dropdown + the Optional-tag
// coordinates-in-bounds check, `lib/import-sites.ts`'s `validateSiteOptional`)
// ---------------------------------------------------------------------------

export interface ImportStateOption {
  id: number;
  name: string;
  /** `Country.Code` (`TMD.Model/Locations/Country.cs:30-36`):
   * double-letter code if non-blank, else triple-letter -- the exact label
   * legacy's State editor template renders (`"{0} ({1})"`,
   * `TMD/Views/Shared/EditorTemplates/State.cshtml:13`, which reads
   * `state.Country.Code`, NOT the state's own `DoubleLetterCode`/
   * `TripleLetterCode`). */
  code: string;
  neLatitude: number;
  neLongitude: number;
  swLatitude: number;
  swLongitude: number;
}

interface RawStateOptionRow {
  id: number;
  name: string;
  double_letter_code: string;
  triple_letter_code: string;
  ne_latitude: number;
  ne_longitude: number;
  sw_latitude: number;
  sw_longitude: number;
}

/** `Repositories.Locations.FindAllStates()` (backing
 * `EditorTemplates/State.cshtml`) -- ordered by name for a stable, readable
 * dropdown; joins `countries` for the label's `Country.Code`. */
export async function listStates(sql: SqlTag = defaultSql()): Promise<ImportStateOption[]> {
  const rows = await sql<RawStateOptionRow>`
    select s.id, s.name, c.double_letter_code, c.triple_letter_code,
           s.ne_latitude, s.ne_longitude, s.sw_latitude, s.sw_longitude
    from states s
    join countries c on c.id = s.country_id
    order by s.name asc
  `;
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    code: r.double_letter_code.trim() !== "" ? r.double_letter_code.trim() : r.triple_letter_code.trim(),
    neLatitude: r.ne_latitude,
    neLongitude: r.ne_longitude,
    swLatitude: r.sw_latitude,
    swLongitude: r.sw_longitude,
  }));
}

// ---------------------------------------------------------------------------
// History "Remove" inner action (task P3-07, doc 05 §P3-03..07) --
// `ImportController.History([ModelBinder] ImportInnerActionModel)`
// (`TMD/Controllers/ImportController.cs:37-51`): the ONLY POST inner action
// History supports is `Trip.{id}.Remove` (`ImportModelLevel.Trip`,
// `ImportModelAction.Remove`) -- every other level/action combination falls
// through to `throw new NotImplementedException()` (cs:50), i.e. dead code
// never reached by the real UI (`ImportTripSummaryModel`'s EditorTemplate,
// `TMD/Views/Import/EditorTemplates/ImportTripSummaryModel.cshtml:12-16,
// 25-29`, emits ONLY a `Trip.{id}.Remove` button, for BOTH the "Started
// imports" (draft) and "Finished imports" (`IsImported`) sections -- no
// `IsImported` branch in the controller either. `removeTrip` below is
// therefore this action's full, only inner action.
//
// `ImportRepository.Remove(t)` (`TMD.Infrastructure/Repositories/
// ImportRepository.cs:29-34`):
//   Model.Repositories.Trees.RemoveMeasurementsByTrip(t);
//   Model.Repositories.Sites.RemoveVisitsByTrip(t);
//   Registry.Session.Delete(t);
// Run UNCONDITIONALLY -- draft-only trips simply have zero canonical
// `tree_measurements`/`site_visits` rows tagged with `importing_trip_id`, so
// the first two calls are no-ops for them (verified: both cleanup helpers
// early-return when their row scan is empty) and only the draft-row deletes
// below do anything. For an ALREADY-IMPORTED trip, this is a real, keepable
// "undo": every canonical measurement/visit this trip ever contributed is
// removed, cascading to delete any tree/site that trip was the SOLE
// contributor to (exactly `reimportTrip`'s cleanup phase, reused verbatim
// via `removeMeasurementsByTrip`/`removeVisitsByTrip` -- see that file's
// header for the full transcribed orphan-cleanup rules) -- but, unlike
// reimport, NO new merge runs afterward; the trip's own `import_*` draft
// rows are deleted too, so nothing is left to re-finish.
// `Registry.Session.Delete(t)` cascades (NHibernate `all-delete-orphan`) to
// `Trip.Sites`/`Trip.Measurers` and (transitively) each site's
// `Trees`/`Trunks`/`Photos` -- reproduced here as explicit deletes in
// dependency order (same rationale as `removeImportSite` above: no DB-level
// `ON DELETE CASCADE` on these FKs, doc 01 §2 note 2).
//
// `recomputeStaleMetrics` (not part of legacy's `Remove` method itself --
// legacy relies on SQL Server triggers to only FLAG staleness, deferring the
// actual recompute to `dbo.UpdateStaleMetrics`'s next lazy call, D-004) is
// run here in the same transaction anyway, matching this migration's own
// established convention for every OTHER site/state-mutating flow
// (`finishTrip`/`reimportTrip`, both call it post-commit in the same
// transaction) -- there is no equivalent lazy/background recompute path in
// this port, so skipping it here would leave a removed trip's stale flags
// dangling indefinitely with nothing left to ever clear them.
// ---------------------------------------------------------------------------

/**
 * Full-cascade remove for BOTH a draft and an already-imported trip.
 * Auth is enforced internally (unlike this file's other mutators, which
 * trust an already-run `assertTripEditable` from their caller) because
 * removal is destructive and irreversible -- see this function's own tests
 * for the auth-edge coverage this makes possible directly at the query
 * layer, per this task's brief.
 */
export async function removeTrip(
  tripId: number,
  userId: number,
  roles: string[],
  sql: SqlTag = defaultSql(),
): Promise<void> {
  await withTransaction(sql, async (trx) => {
    await assertTripEditable(tripId, userId, roles, trx);

    // Canonical-side cleanup -- no-op for a trip with no canonical rows yet
    // (a draft that was never finished).
    await removeMeasurementsByTrip(trx, tripId);
    await removeVisitsByTrip(trx, tripId);

    // Draft-side cascade delete, dependency order (trunks -> trees -> sites
    // -> measurers -> trip), including this trip's own import-side photo
    // references (types 2/3 -- P3-08 not built yet, so these are currently
    // always empty, but deleting them is still correct once that task lands).
    await trx`
      delete from photo_references
      where import_site_id in (select id from import_sites where trip_id = ${tripId})
         or import_tree_id in (
           select t.id from import_trees t join import_sites s on s.id = t.site_id where s.trip_id = ${tripId}
         )
    `;
    await trx`
      delete from import_trunks
      where tree_id in (
        select t.id from import_trees t join import_sites s on s.id = t.site_id where s.trip_id = ${tripId}
      )
    `;
    await trx`delete from import_trees where site_id in (select id from import_sites where trip_id = ${tripId})`;
    await trx`delete from import_sites where trip_id = ${tripId}`;
    await trx`delete from import_trip_measurers where trip_id = ${tripId}`;
    await trx`delete from import_trips where id = ${tripId}`;

    await recomputeStaleMetrics(trx);
  });
}
