// Loads a historical, already-imported trip's `import_*` draft rows and
// shapes them into a "typing plan" -- the exact text the Playwright spec
// types into each real wizard field to faithfully reproduce that trip's
// data (doc 05 §P3-10). Reads live from the DB (never a baked-in snapshot)
// so the walkthrough always exercises whatever `import_*` rows the chosen
// oracle trip currently has.
import type { TestSql } from "./db";
import { toFormalName, type MeasurerName } from "../../lib/import-wizard";
import { distanceTypingText, elevationTypingText, coordinatesTypingText } from "./round-trip";
import { DistanceFormat, ElevationFormat } from "../../lib/units/parse";
import { CoordinatesFormat } from "../../lib/units/parse-coordinates";
import { fround } from "../../lib/units/float32";

export interface OracleTreePlan {
  sourceTreeId: number;
  commonName: string;
  scientificName: string;
  /** Only set when it needs to change from the wizard's own default (0 /
   * NotSpecified) -- see helpers/README note in walkthrough.e2e.ts: this
   * oracle trip's trees all use enum defaults except heightMeasurementMethod. */
  heightMeasurementMethod: number;
  height: string;
  girth: string;
  crownSpread: string;
  elevation: string;
  coordinates: string;
}

export interface OracleSitePlan {
  sourceSiteId: number;
  name: string;
  coordinates: string;
  stateId: number;
  county: string;
  ownershipType: string;
  ownershipContactInfo: string;
  makeOwnershipContactInfoPublic: boolean;
  comments: string;
  trees: OracleTreePlan[];
}

export interface OracleTripPlan {
  sourceTripId: number;
  name: string;
  /** "YYYY-MM-DD" for the <input type="date"> field. */
  date: string;
  measurerContactInfo: string;
  makeMeasurerContactInfoPublic: boolean;
  firstMeasurer: string;
  secondMeasurer: string;
  thirdMeasurer: string;
  website: string;
  sites: OracleSitePlan[];
}

interface RawTripRow {
  id: number;
  name: string;
  date: string; // cast to text below
  measurer_contact_info: string;
  make_measurer_contact_info_public: boolean;
  website: string;
}

interface RawMeasurerRow {
  first_name: string;
  last_name: string;
}

interface RawSiteRow {
  id: number;
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

interface RawTreeRow {
  id: number;
  site_id: number;
  type: number;
  common_name: string;
  scientific_name: string;
  height: number;
  height_input_format: number;
  height_measurement_method: number;
  girth: number;
  girth_input_format: number;
  crown_spread: number;
  crown_spread_input_format: number;
  elevation: number;
  elevation_input_format: number;
  latitude: number;
  latitude_input_format: number;
  longitude: number;
  longitude_input_format: number;
}

function threeMeasurers(rows: RawMeasurerRow[]): [string, string, string] {
  const names: MeasurerName[] = rows.map((r) => ({ firstName: r.first_name, lastName: r.last_name }));
  const formal = names.map(toFormalName);
  return [formal[0] ?? "", formal[1] ?? "", formal[2] ?? ""];
}

/** Loads oracle trip `tripId`'s `import_trips`/`import_trip_measurers`/
 * `import_sites`/`import_trees` rows and builds the typing plan. Throws
 * (loudly, before any browser opens) if any field's stored format code
 * isn't directly typable (`round-trip.ts`'s own guard) -- callers should
 * pick oracle trips whose draft rows are all reachable through the real
 * wizard's text fields (see e2e/README.md for how trip 906 was chosen).
 */
export async function loadOracleTrip(sql: TestSql, tripId: number): Promise<OracleTripPlan> {
  const tripRows = await sql<RawTripRow[]>`
    select id, name, date::text as date, measurer_contact_info,
           make_measurer_contact_info_public, website
    from import_trips where id = ${tripId}
  `;
  const trip = tripRows[0];
  if (!trip) throw new Error(`loadOracleTrip: import_trips ${tripId} not found`);
  if (!trip.date) throw new Error(`loadOracleTrip: trip ${tripId} has no date`);

  const measurerRows = await sql<RawMeasurerRow[]>`
    select first_name, last_name from import_trip_measurers where trip_id = ${tripId} order by id asc
  `;
  const [firstMeasurer, secondMeasurer, thirdMeasurer] = threeMeasurers(measurerRows);

  const siteRows = await sql<RawSiteRow[]>`
    select id, name, latitude, latitude_input_format, longitude, longitude_input_format,
           state_id, county, ownership_type, ownership_contact_info,
           make_ownership_contact_info_public, comments
    from import_sites where trip_id = ${tripId} order by id asc
  `;
  if (siteRows.length === 0) throw new Error(`loadOracleTrip: trip ${tripId} has no sites`);

  const sites: OracleSitePlan[] = [];
  for (const site of siteRows) {
    if (site.state_id === null) throw new Error(`loadOracleTrip: site ${site.id} has no state_id`);

    const treeRows = await sql<RawTreeRow[]>`
      select id, site_id, type, common_name, scientific_name,
             height, height_input_format, height_measurement_method,
             girth, girth_input_format,
             crown_spread, crown_spread_input_format,
             elevation, elevation_input_format,
             latitude, latitude_input_format, longitude, longitude_input_format
      from import_trees where site_id = ${site.id} order by id asc
    `;
    if (treeRows.length === 0) throw new Error(`loadOracleTrip: site ${site.id} has no trees`);

    const trees: OracleTreePlan[] = treeRows.map((t) => {
      if (t.type !== 1) {
        throw new Error(
          `loadOracleTrip: tree ${t.id} is multi-trunk (type=${t.type}) -- this oracle only supports single-trunk trees (see e2e/README.md).`,
        );
      }
      return {
        sourceTreeId: t.id,
        commonName: t.common_name,
        scientificName: t.scientific_name,
        heightMeasurementMethod: t.height_measurement_method,
        height: distanceTypingText(fround(t.height), t.height_input_format as DistanceFormat),
        girth: distanceTypingText(fround(t.girth), t.girth_input_format as DistanceFormat),
        crownSpread: distanceTypingText(fround(t.crown_spread), t.crown_spread_input_format as DistanceFormat),
        elevation: elevationTypingText(fround(t.elevation), t.elevation_input_format as ElevationFormat),
        coordinates: coordinatesTypingText(
          t.latitude,
          t.latitude_input_format as CoordinatesFormat,
          t.longitude,
          t.longitude_input_format as CoordinatesFormat,
        ),
      };
    });

    sites.push({
      sourceSiteId: site.id,
      name: site.name,
      coordinates: coordinatesTypingText(
        site.latitude,
        site.latitude_input_format as CoordinatesFormat,
        site.longitude,
        site.longitude_input_format as CoordinatesFormat,
      ),
      stateId: site.state_id,
      county: site.county,
      ownershipType: site.ownership_type,
      ownershipContactInfo: site.ownership_contact_info,
      makeOwnershipContactInfoPublic: site.make_ownership_contact_info_public,
      comments: site.comments,
      trees,
    });
  }

  return {
    sourceTripId: trip.id,
    name: trip.name,
    date: trip.date.slice(0, 10),
    measurerContactInfo: trip.measurer_contact_info,
    makeMeasurerContactInfoPublic: trip.make_measurer_contact_info_public,
    firstMeasurer,
    secondMeasurer,
    thirdMeasurer,
    website: trip.website,
    sites,
  };
}
