/**
 * Pure Review/Finish-step logic for the import wizard -- task P3-06 (doc 05
 * §P3-06, doc 01 §10). No DB access, same convention as
 * lib/import-{wizard,sites,trees}.ts: app/import/[tripId]/review/** loads
 * the trip's persisted `import_*` graph and shapes it into this module's
 * input types; this module composes the three earlier steps' own pure
 * validators (`buildTripStep`/`buildSiteStep`/`buildTreeStep`/
 * `buildTrunkInput`) plus the two STRUCTURAL constraints every earlier step
 * deliberately deferred (their own file headers say so explicitly):
 *
 *   - `Trip.Sites` (`TMD.Model/Imports/Trip.cs:56`): `[Size(1, 100,
 *     Message = "You must add site visits to your trip.",
 *     Tags = ValidationTag.Required)]` -- a trip needs >=1 site.
 *   - `Site.Trees` (`TMD.Model/Imports/Site.cs:110`): `[Size2(1,
 *     int.MaxValue, Message = "You must add tree measurements to this
 *     site.", Tags = ValidationTag.Required)]` -- a site needs >=1 tree.
 *
 * Together with every per-field Required-tag rule the Trip/Sites/Trees
 * steps' own modules already enforce, this reproduces the FULL set of
 * constraints `ImportRepository.Import`/`Reimport`
 * (`TMD.Model/Imports/ImportRepository.cs:20-37`) checks via
 * `t.AssertIsValid(ValidationTag.Required)` before merging -- legacy lets
 * that assertion throw an uncaught exception into a 500 error page when it
 * fails (`Review.cshtml`/`Finish` render no validation UI at all: `Review`
 * just `Html.DisplayFor`s the trip, and `Finish` blindly calls
 * `Repositories.Imports.Import(trip)`/`Reimport(trip)` -- confirmed by
 * reading both, `TMD/Views/Import/Review.cshtml` +
 * `TMD/Controllers/ImportController.cs:365-388`); this port instead
 * surfaces every failure as a readable, non-throwing list on the Review
 * page and blocks the Finish button, which is strictly friendlier without
 * changing what ultimately gets imported.
 *
 * Optional-tag warnings (`Site.OptionalValidate`'s state-bounds check,
 * `TreeBase.OptionalValidate`'s site-distance check) are surfaced here too,
 * but --- per the same reading of legacy's `Finish` action --- legacy NEVER
 * evaluates the Optional tag at Finish time (only `SaveSite`/`SaveSites`/
 * `SaveTree`/`SaveTrees` do, during the Sites/Trees steps themselves, each
 * gated by its own "ignoring optional errors" button). There is therefore
 * no legacy "ignore optional errors" semantics to reproduce at THIS step:
 * `validateTripForFinish`'s `optionalErrors` are purely informational and
 * never block `hasBlockingErrors`/Finish, with no ignore-flag needed.
 */
import {
  buildTripStep,
  toFormalName,
  type MeasurerName,
  type TripStepFieldName,
  type TripStepInput,
} from "./import-wizard";
import {
  buildSiteStep,
  validateSiteOptional,
  type SiteStepFieldName,
  type SiteStepInput,
  type StateBounds,
} from "./import-sites";
import {
  buildTreeStep,
  buildTrunkInput,
  distanceToEditableText,
  elevationToEditableText,
  coordinatesToEditableText,
  ImportTreeType,
  type TreeAgeClass,
  type TreeAgeType,
  type TreeFieldName,
  type TreeFormType,
  type TreeHeightMeasurementMethod,
  type TreeStatus,
  type TreeStepInput,
  type TreeTerrainType,
  type TrunkFieldName,
  type TrunkInput,
} from "./import-trees";
import type { DistanceFormat, ElevationFormat } from "./units/parse";
import type { CoordinatesFormat } from "./units/parse-coordinates";

// ---------------------------------------------------------------------------
// Persisted-row -> step-input reconstruction (mirrors lib/import-sites.ts's
// own `siteToStepInput`, reused directly for sites below -- these three are
// the Trip/Tree/Trunk equivalents, needed here because neither
// lib/import-wizard.ts nor lib/import-trees.ts exports one: the Trip step's
// own page (app/import/[tripId]/trip/page.tsx's local, unexported
// `draftValues`) and the Trees step's page never needed a *trip-graph-wide*
// reconstruction, only their own single-entity edit forms).
// ---------------------------------------------------------------------------

export interface TripDraftForFinish {
  name: string;
  date: string | null;
  measurerContactInfo: string;
  makeMeasurerContactInfoPublic: boolean;
  website: string;
  measurers: MeasurerName[];
}

/** Mirrors `app/import/[tripId]/trip/page.tsx`'s local `draftValues` --
 * duplicated intentionally (different file-ownership boundary), same
 * "Lastname, Firstname" round trip via `toFormalName`. */
export function tripDraftToStepInput(trip: TripDraftForFinish): TripStepInput {
  return {
    name: trip.name,
    date: trip.date ?? "",
    measurerContactInfo: trip.measurerContactInfo,
    makeMeasurerContactInfoPublic: trip.makeMeasurerContactInfoPublic,
    firstMeasurer: trip.measurers[0] ? toFormalName(trip.measurers[0]) : "",
    secondMeasurer: trip.measurers[1] ? toFormalName(trip.measurers[1]) : "",
    thirdMeasurer: trip.measurers[2] ? toFormalName(trip.measurers[2]) : "",
    website: trip.website,
  };
}

export interface TreeRecordForFinish {
  type: ImportTreeType;
  commonName: string;
  scientificName: string;
  status: TreeStatus;
  ageClass: TreeAgeClass;
  ageType: TreeAgeType;
  age: number | null;
  height: number;
  heightInputFormat: DistanceFormat;
  heightMeasurementMethod: TreeHeightMeasurementMethod;
  girth: number;
  girthInputFormat: DistanceFormat;
  combinedGirthNumberOfTrunks: number | null;
  crownSpread: number;
  crownSpreadInputFormat: DistanceFormat;
  elevation: number;
  elevationInputFormat: ElevationFormat;
  terrainType: TreeTerrainType;
  formType: TreeFormType;
  latitude: number;
  latitudeInputFormat: CoordinatesFormat;
  longitude: number;
  longitudeInputFormat: CoordinatesFormat;
  generalComments: string;
}

/** Round-trips a persisted `import_trees` row (`db/queries/import-trees.sql.ts`'s
 * `TreeRecord`, structurally compatible) back into `TreeStepInput` shape via
 * the same `distanceToEditableText`/`elevationToEditableText`/
 * `coordinatesToEditableText` helpers the Trees step's own redisplay uses --
 * so `buildTreeStep` can be reused to VALIDATE already-saved data, same
 * pattern as `siteToStepInput` + `buildSiteStep` (lib/import-sites.ts). Only
 * "specified vs. not / valid vs. invalid" needs to survive the round trip
 * for validation purposes (the reconstructed text's exact rounding doesn't
 * matter -- this function's caller only reads `requiredErrors`/
 * `optionalErrors`, never `normalized`). */
export function treeRecordToStepInput(tree: TreeRecordForFinish): TreeStepInput {
  return {
    treeType: tree.type,
    commonName: tree.commonName,
    scientificName: tree.scientificName,
    status: tree.status,
    ageClass: tree.ageClass,
    ageType: tree.ageType,
    age: tree.age === null ? "" : String(tree.age),
    height: distanceToEditableText(tree.height, tree.heightInputFormat),
    heightMeasurementMethod: tree.heightMeasurementMethod,
    girth: distanceToEditableText(tree.girth, tree.girthInputFormat),
    combinedGirthNumberOfTrunks:
      tree.combinedGirthNumberOfTrunks === null ? "" : String(tree.combinedGirthNumberOfTrunks),
    crownSpread: distanceToEditableText(tree.crownSpread, tree.crownSpreadInputFormat),
    elevation: elevationToEditableText(tree.elevation, tree.elevationInputFormat),
    terrainType: tree.terrainType,
    formType: tree.formType,
    coordinates: coordinatesToEditableText(
      tree.latitude,
      tree.latitudeInputFormat,
      tree.longitude,
      tree.longitudeInputFormat,
    ),
    generalComments: tree.generalComments,
  };
}

export interface TrunkRecordForFinish {
  girth: number;
  girthInputFormat: DistanceFormat;
  girthMeasurementHeight: number;
  girthMeasurementHeightInputFormat: DistanceFormat;
  height: number;
  heightInputFormat: DistanceFormat;
  trunkComments: string;
}

export function trunkRecordToStepInput(trunk: TrunkRecordForFinish): TrunkInput {
  return {
    girth: distanceToEditableText(trunk.girth, trunk.girthInputFormat),
    girthMeasurementHeight: distanceToEditableText(trunk.girthMeasurementHeight, trunk.girthMeasurementHeightInputFormat),
    height: distanceToEditableText(trunk.height, trunk.heightInputFormat),
    trunkComments: trunk.trunkComments,
  };
}

// ---------------------------------------------------------------------------
// Full-graph input shape (app/import/[tripId]/review/load-graph.ts builds
// this from the persisted import_* tables).
// ---------------------------------------------------------------------------

export interface FinishTrunkInput {
  id: number;
  step: TrunkInput;
}

export interface FinishTreeInput {
  id: number;
  /** Display label for error messages -- `ScientificName` (or
   * "(Unidentified)" when blank), matching `ImportFinishedTreeModel`'s own
   * header (`ImportFinishedTreeModel.cshtml:4`). */
  label: string;
  step: TreeStepInput;
  trunks: FinishTrunkInput[];
}

export interface FinishSiteInput {
  id: number;
  name: string;
  step: SiteStepInput;
  /** The selected state's coordinate-bounds row, for the Optional-tag
   * check (`validateSiteOptional`) -- `null` when unresolvable (already a
   * Required-tag `stateId` error in that case, so the Optional pass simply
   * doesn't run, matching `buildSiteStep`'s own two-phase gate). */
  stateBounds: StateBounds | null;
  trees: FinishTreeInput[];
}

export interface FinishGraphInput {
  trip: TripStepInput;
  sites: FinishSiteInput[];
}

// ---------------------------------------------------------------------------
// Composed validation
// ---------------------------------------------------------------------------

export type FinishError =
  | { level: "trip"; field: TripStepFieldName; message: string }
  | { level: "trip-sites"; message: string }
  | { level: "site"; siteId: number; siteName: string; field: SiteStepFieldName; message: string }
  | { level: "site-trees"; siteId: number; siteName: string; message: string }
  | {
      level: "tree";
      siteId: number;
      siteName: string;
      treeId: number;
      treeLabel: string;
      field: TreeFieldName;
      message: string;
    }
  | {
      level: "trunk";
      siteId: number;
      siteName: string;
      treeId: number;
      treeLabel: string;
      trunkId: number;
      field: TrunkFieldName;
      message: string;
    };

export interface FinishValidation {
  requiredErrors: FinishError[];
  optionalErrors: FinishError[];
}

/**
 * The finish-time full-graph check (doc 05 §P3-06). Composes, in order:
 * `buildTripStep` (Trip.cs's own Required-tagged fields, incl. Measurers),
 * the `Trip.Sites` `>=1` structural minimum, `buildSiteStep` +
 * `validateSiteOptional` per site, the `Site.Trees` `>=1` structural
 * minimum per site, `buildTreeStep` per tree (Required AND Optional tiers --
 * unlike the Trees step's own `saveTreeAction`, both tiers are always
 * evaluated here rather than gated behind an "ignoring optional" submit,
 * since Optional-tag results are collected into `optionalErrors` for
 * display, never used to block), and `buildTrunkInput` per trunk of every
 * multi-trunk tree. Every applicable error across the whole trip is
 * collected (not short-circuited), matching every earlier step's own
 * "surface everything at once" convention.
 */
export function validateTripForFinish(graph: FinishGraphInput): FinishValidation {
  const requiredErrors: FinishError[] = [];
  const optionalErrors: FinishError[] = [];

  const { errors: tripErrors } = buildTripStep(graph.trip);
  for (const e of tripErrors) {
    requiredErrors.push({ level: "trip", field: e.field, message: e.message });
  }

  // Trip.cs:56 -- `[Size(1, 100, ..., Tags = ValidationTag.Required)]`.
  if (graph.sites.length === 0) {
    requiredErrors.push({ level: "trip-sites", message: "You must add site visits to your trip." });
  }

  for (const site of graph.sites) {
    const { normalized: siteNormalized, errors: siteErrors } = buildSiteStep(site.step);
    for (const e of siteErrors) {
      requiredErrors.push({ level: "site", siteId: site.id, siteName: site.name, field: e.field, message: e.message });
    }

    // `Site.cs`'s own two-phase gate (`buildSiteStep`'s Required tier must
    // be clean before `validateSiteOptional`'s Optional tier can even
    // resolve a `State.CoordinateBounds` row) -- see lib/import-sites.ts's
    // file header.
    if (siteErrors.length === 0 && site.stateBounds) {
      const siteOptionalErrors = validateSiteOptional(siteNormalized, site.stateBounds);
      for (const e of siteOptionalErrors) {
        optionalErrors.push({ level: "site", siteId: site.id, siteName: site.name, field: e.field, message: e.message });
      }
    }

    // Site.cs:110 -- `[Size2(1, int.MaxValue, ..., Tags = ValidationTag.Required)]`.
    if (site.trees.length === 0) {
      requiredErrors.push({
        level: "site-trees",
        siteId: site.id,
        siteName: site.name,
        message: "You must add tree measurements to this site.",
      });
    }

    // `TreeBase.OptionalValidate`'s first clause (TreeBase.cs:136-141) needs
    // the SITE's own (Required-tag-valid) coordinates -- same gating
    // `app/import/[tripId]/trees/actions.ts`'s `saveTreeAction` already
    // applies for the single-tree case, reused here per-site for the
    // whole-graph pass.
    const siteCoordinates =
      siteNormalized.isSpecified ? { totalDegreesLat: siteNormalized.latitude, totalDegreesLng: siteNormalized.longitude } : undefined;

    for (const tree of site.trees) {
      const trunksCount = tree.trunks.length;
      const { requiredErrors: treeRequired, optionalErrors: treeOptional } = buildTreeStep(tree.step, trunksCount, {
        siteCoordinates,
      });
      for (const e of treeRequired) {
        requiredErrors.push({
          level: "tree",
          siteId: site.id,
          siteName: site.name,
          treeId: tree.id,
          treeLabel: tree.label,
          field: e.field,
          message: e.message,
        });
      }
      for (const e of treeOptional) {
        optionalErrors.push({
          level: "tree",
          siteId: site.id,
          siteName: site.name,
          treeId: tree.id,
          treeLabel: tree.label,
          field: e.field,
          message: e.message,
        });
      }

      if (tree.step.treeType === ImportTreeType.MultiTrunk) {
        for (const trunk of tree.trunks) {
          const { errors: trunkErrors } = buildTrunkInput(trunk.step);
          for (const e of trunkErrors) {
            requiredErrors.push({
              level: "trunk",
              siteId: site.id,
              siteName: site.name,
              treeId: tree.id,
              treeLabel: tree.label,
              trunkId: trunk.id,
              field: e.field,
              message: e.message,
            });
          }
        }
      }
    }
  }

  return { requiredErrors, optionalErrors };
}

/** Required-tier errors block Finish; Optional-tier ones never do (file header). */
export function hasBlockingErrors(validation: FinishValidation): boolean {
  return validation.requiredErrors.length > 0;
}

/** A single human-readable line per error, for the Review page's list and
 * for redirect-with-`?error=` banners -- prefixes site/tree context so an
 * error is locatable without needing to also render ids. */
export function describeFinishError(e: FinishError): string {
  switch (e.level) {
    case "trip":
    case "trip-sites":
      return e.message;
    case "site":
    case "site-trees":
      return `${e.siteName}: ${e.message}`;
    case "tree":
      return `${e.siteName} - ${e.treeLabel}: ${e.message}`;
    case "trunk":
      return `${e.siteName} - ${e.treeLabel} (trunk): ${e.message}`;
  }
}
