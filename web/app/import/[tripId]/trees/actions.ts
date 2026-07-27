"use server";

// Trees-step server actions -- task P3-05 (doc 05 §P3-05). Ports
// `ImportController.Trees(...)`'s inner-action dispatch (`ImportController.cs
// :332-363`) onto one server action per inner action, matching the Trip
// step's `actions.ts` conventions (redirect-with-`?state=` redisplay on
// validation failure, re-run `assertTripEditable` on every POST since a
// hidden `tripId`/`treeId`/`trunkId` field is attacker-controlled input, not
// just trusted from the page's own GET-time check).
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { TripAccessError, assertTripEditable, listImportSites } from "@/db/queries/import-drafts.sql";
import {
  TreeAccessError,
  addTrunk,
  createSingleTrunkTree,
  getTree,
  initializeTreesForTrip,
  removeTree,
  removeTrunk,
  updateTree,
  updateTrunk,
} from "@/db/queries/import-trees.sql";
import { defaultSql } from "@/db/queries/sql-tag";
import {
  ImportTreeType,
  TreeAgeClass,
  TreeAgeType,
  TreeFormType,
  TreeHeightMeasurementMethod,
  TreeStatus,
  TreeTerrainType,
  buildTreeStep,
  buildTrunkInput,
  type TreeFieldError,
  type TreeStepInput,
  type TrunkFieldError,
  type TrunkInput,
} from "@/lib/import-trees";

async function requireEditableTrip(tripIdRaw: string): Promise<{ tripId: number; userId: number }> {
  const tripId = Number(tripIdRaw);
  const session = asAppSession(await auth());
  if (!session) {
    redirect(`/account/login?callbackUrl=${encodeURIComponent(`/import/${tripIdRaw}/trees`)}`);
  }
  try {
    await assertTripEditable(tripId, session.userId, session.roles);
  } catch (err) {
    if (err instanceof TripAccessError) redirect(`/import/${tripId}/trees`);
    throw err;
  }
  return { tripId, userId: session.userId };
}

// ---------------------------------------------------------------------------
// Redisplay state (mirrors app/import/[tripId]/trip/actions.ts's `?state=`
// pattern, extended with the trunk sub-form's per-row errors).
// ---------------------------------------------------------------------------

export interface TreeRedisplayState {
  input: TreeStepInput;
  trunkInputs: Record<number, TrunkInput>;
  requiredErrors: TreeFieldError[];
  optionalErrors: TreeFieldError[];
  trunkErrors: Record<number, TrunkFieldError[]>;
}

function encodeState(state: TreeRedisplayState): string {
  return encodeURIComponent(JSON.stringify(state));
}

function editUrl(tripId: number, treeId: number, state?: TreeRedisplayState): string {
  const base = `/import/${tripId}/trees?edit=${treeId}`;
  return state ? `${base}&state=${encodeState(state)}` : base;
}

// ---------------------------------------------------------------------------
// Add tree -- `AddTree` (ImportController.cs:275-291): always
// `site.AddSingleTrunkTree()`. New trees start "editing" (their blank
// CommonName fails Required validation -- `ImportMapping.cs:85-86`'s
// `IsEditing` derivation), so this redirects straight into edit mode.
// ---------------------------------------------------------------------------

export async function addTreeAction(formData: FormData): Promise<void> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const siteId = Number(formData.get("siteId") ?? "");
  const { tripId, userId } = await requireEditableTrip(tripIdRaw);

  await initializeTreesForTrip(tripId, new Date());
  const treeId = await createSingleTrunkTree(tripId, siteId, userId, new Date());
  redirect(editUrl(tripId, treeId));
}

// ---------------------------------------------------------------------------
// Remove tree -- `Site.RemoveTree` (Site.cs:128-129) + trunk cascade.
// ---------------------------------------------------------------------------

export async function removeTreeAction(formData: FormData): Promise<void> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const treeId = Number(formData.get("treeId") ?? "");
  const { tripId } = await requireEditableTrip(tripIdRaw);

  try {
    await removeTree(tripId, treeId, new Date());
  } catch (err) {
    if (!(err instanceof TreeAccessError)) throw err;
  }
  redirect(`/import/${tripId}/trees`);
}

// ---------------------------------------------------------------------------
// Save tree -- `SaveTree` (ImportController.cs:236-264): Required tag always
// blocks; Optional tag blocks unless the "ignoring optional errors" button
// was used (`saveUnlessOptionalErrors` param -> here, `intent` form field).
//
// Save-first intents (UX audit 2026-07 P0): the old standalone Add-trunk/
// Remove-trunk/Add-tree/Continue forms silently discarded everything typed
// into the open tree form. Every one of those controls now submits THIS
// action with a compound `intent` -- the typed fields are validated and
// saved (or redisplayed with errors, values intact) before the follow-up
// mutation/navigation runs:
//   saveAndAddTrunk            save, then addTrunk, back to edit
//   saveAndRemoveTrunk:{id}    save (excluding that trunk), remove it
//   saveAndAddTree:{siteId}    save, then create a tree in that site
//   saveAndContinue            save, then run the Continue gate below
// ---------------------------------------------------------------------------

function readTreeInput(formData: FormData): TreeStepInput {
  return {
    treeType: Number(formData.get("treeType")) === ImportTreeType.MultiTrunk ? ImportTreeType.MultiTrunk : ImportTreeType.SingleTrunk,
    commonName: String(formData.get("commonName") ?? ""),
    scientificName: String(formData.get("scientificName") ?? ""),
    status: Number(formData.get("status") ?? TreeStatus.NotSpecified) as TreeStatus,
    ageClass: Number(formData.get("ageClass") ?? TreeAgeClass.NotSpecified) as TreeAgeClass,
    ageType: Number(formData.get("ageType") ?? TreeAgeType.NotSpecified) as TreeAgeType,
    age: String(formData.get("age") ?? ""),
    height: String(formData.get("height") ?? ""),
    heightMeasurementMethod: Number(
      formData.get("heightMeasurementMethod") ?? TreeHeightMeasurementMethod.NotSpecified,
    ) as TreeHeightMeasurementMethod,
    girth: String(formData.get("girth") ?? ""),
    combinedGirthNumberOfTrunks: String(formData.get("combinedGirthNumberOfTrunks") ?? ""),
    crownSpread: String(formData.get("crownSpread") ?? ""),
    elevation: String(formData.get("elevation") ?? ""),
    terrainType: Number(formData.get("terrainType") ?? TreeTerrainType.NotSpecified) as TreeTerrainType,
    formType: Number(formData.get("formType") ?? TreeFormType.Multi) as TreeFormType,
    coordinates: String(formData.get("coordinates") ?? ""),
    generalComments: String(formData.get("generalComments") ?? ""),
  };
}

function readTrunkInput(formData: FormData, trunkId: number): TrunkInput {
  return {
    girth: String(formData.get(`trunk_${trunkId}_girth`) ?? ""),
    girthMeasurementHeight: String(formData.get(`trunk_${trunkId}_girthMeasurementHeight`) ?? ""),
    height: String(formData.get(`trunk_${trunkId}_height`) ?? ""),
    trunkComments: String(formData.get(`trunk_${trunkId}_trunkComments`) ?? ""),
  };
}

export async function saveTreeAction(formData: FormData): Promise<void> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const treeId = Number(formData.get("treeId") ?? "");
  const { tripId, userId } = await requireEditableTrip(tripIdRaw);

  const existing = await getTree(tripId, treeId);
  if (!existing) redirect(`/import/${tripId}/trees`);

  const intent = String(formData.get("intent") ?? "save");
  // A trunk being removed is excluded from validation AND the update loop:
  // requiring a trunk's values to validate before it can be deleted would
  // trap users behind errors on a row they're discarding.
  const removingTrunkId = intent.startsWith("saveAndRemoveTrunk:")
    ? Number(intent.slice("saveAndRemoveTrunk:".length))
    : null;

  const trunkIdsRaw = String(formData.get("trunkIds") ?? "");
  const trunkIds = trunkIdsRaw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n > 0 && n !== removingTrunkId);

  const input = readTreeInput(formData);
  const trunkInputs: Record<number, TrunkInput> = {};
  for (const id of trunkIds) trunkInputs[id] = readTrunkInput(formData, id);

  // TreeBase.OptionalValidate's first clause needs the containing site's
  // coordinates (TreeBase.cs:136-141) -- fetched here, not owned by this
  // file's CRUD surface (see import-trees.sql.ts header) -- reuses the Sites
  // step's own `listImportSites`.
  const sites = await listImportSites(tripId);
  const site = sites.find((s) => s.id === existing.siteId);
  const siteCoordinates =
    site && site.latitudeInputFormat !== 1 && site.longitudeInputFormat !== 1
      ? { totalDegreesLat: site.latitude, totalDegreesLng: site.longitude }
      : undefined;

  const trunksCount = input.treeType === ImportTreeType.MultiTrunk ? trunkIds.length : 0;
  const { normalized, requiredErrors, optionalErrors } = buildTreeStep(input, trunksCount, { siteCoordinates });

  const trunkErrors: Record<number, TrunkFieldError[]> = {};
  const normalizedTrunks: Record<number, ReturnType<typeof buildTrunkInput>["normalized"]> = {};
  if (input.treeType === ImportTreeType.MultiTrunk) {
    for (const id of trunkIds) {
      const { normalized: n, errors } = buildTrunkInput(trunkInputs[id]!);
      normalizedTrunks[id] = n;
      if (errors.length > 0) trunkErrors[id] = errors;
    }
  }

  const hasRequiredErrors = requiredErrors.length > 0 || Object.keys(trunkErrors).length > 0;
  const hasOptionalErrors = optionalErrors.length > 0;

  if (hasRequiredErrors || (hasOptionalErrors && intent !== "saveIgnoringOptional")) {
    redirect(
      editUrl(tripId, treeId, { input, trunkInputs, requiredErrors, optionalErrors, trunkErrors }),
    );
  }

  await updateTree(
    tripId,
    treeId,
    {
      type: normalized.treeType,
      commonName: normalized.commonName,
      scientificName: normalized.scientificName,
      status: normalized.status,
      ageClass: normalized.ageClass,
      ageType: normalized.ageType,
      age: normalized.age,
      height: normalized.height.feet,
      heightInputFormat: normalized.height.inputFormat,
      heightMeasurementMethod: normalized.heightMeasurementMethod,
      girth: normalized.girth.feet,
      girthInputFormat: normalized.girth.inputFormat,
      combinedGirthNumberOfTrunks: normalized.combinedGirthNumberOfTrunks,
      crownSpread: normalized.crownSpread.feet,
      crownSpreadInputFormat: normalized.crownSpread.inputFormat,
      elevation: normalized.elevation.feet,
      elevationInputFormat: normalized.elevation.inputFormat,
      terrainType: normalized.terrainType,
      formType: normalized.formType,
      numberOfTrunks: normalized.numberOfTrunks,
      latitude: normalized.coordinates.latitude.totalDegrees,
      latitudeInputFormat: normalized.coordinates.latitude.inputFormat,
      longitude: normalized.coordinates.longitude.totalDegrees,
      longitudeInputFormat: normalized.coordinates.longitude.inputFormat,
      generalComments: normalized.generalComments,
    },
    new Date(),
  );

  for (const id of trunkIds) {
    const n = normalizedTrunks[id]!;
    await updateTrunk(tripId, id, {
      girth: n.girth.feet,
      girthInputFormat: n.girth.inputFormat,
      girthMeasurementHeight: n.girthMeasurementHeight.feet,
      girthMeasurementHeightInputFormat: n.girthMeasurementHeight.inputFormat,
      height: n.height.feet,
      heightInputFormat: n.height.inputFormat,
      trunkComments: n.trunkComments,
    }, new Date());
  }

  // Follow-up mutation/navigation for the compound intents (fields are
  // safely persisted by this point).
  if (intent === "saveAndAddTrunk") {
    try {
      await addTrunk(tripId, treeId, userId, new Date());
    } catch (err) {
      if (!(err instanceof TreeAccessError)) throw err;
    }
    redirect(editUrl(tripId, treeId));
  }
  if (removingTrunkId !== null) {
    try {
      await removeTrunk(tripId, removingTrunkId, new Date());
    } catch (err) {
      if (!(err instanceof TreeAccessError)) throw err;
    }
    redirect(editUrl(tripId, treeId));
  }
  if (intent.startsWith("saveAndAddTree:")) {
    const targetSiteId = Number(intent.slice("saveAndAddTree:".length));
    const newTreeId = await createSingleTrunkTree(tripId, targetSiteId, userId, new Date());
    redirect(editUrl(tripId, newTreeId));
  }
  if (intent === "saveAndContinue") {
    await redirectPastTreesGate(tripId);
  }

  redirect(`/import/${tripId}/trees`);
}

// ---------------------------------------------------------------------------
// Continue -- `SaveTrees` (ImportController.cs:310-329). Simplified gate (see
// this task's report): every tree row this step's own Save persists is
// already Required-tag valid at the moment it's written (saveTreeAction
// above enforces that before any UPDATE runs); the only way an invalid row
// can still be sitting in `import_trees` is a just-created, never-yet-saved
// tree, whose `common_name` is still the `''` `SingleTrunkTree.Create()`
// default (TreeBase.cs:103's `NotEmptyOrWhitesapce` is the one Required rule
// blank defaults actually violate -- every other default is a valid, merely
// Unspecified value). Checking for that is a faithful, much cheaper proxy
// for re-running full per-field validation across every tree in the trip.
// ---------------------------------------------------------------------------

async function redirectPastTreesGate(tripId: number): Promise<never> {
  const incomplete = await defaultSql()<{ count: string }>`
    select count(*)::text as count from import_trees t
    join import_sites s on s.id = t.site_id
    where s.trip_id = ${tripId} and t.common_name = ''
  `;
  if (Number(incomplete[0]?.count ?? "0") > 0) {
    redirect(`/import/${tripId}/trees?error=${encodeURIComponent("Every tree needs at least a common name before continuing.")}`);
  }
  redirect(`/import/${tripId}/review`);
}

export async function continueAction(formData: FormData): Promise<void> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const { tripId } = await requireEditableTrip(tripIdRaw);

  await initializeTreesForTrip(tripId, new Date());
  await redirectPastTreesGate(tripId);
}
