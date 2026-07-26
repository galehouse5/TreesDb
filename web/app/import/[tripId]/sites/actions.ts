"use server";

// Sites-step server actions -- task P3-04 (doc 05 §P3-04). Ports
// `ImportController.AddSite`/`SaveSite`/`RemoveSite`/`SaveSites`
// (`TMD/Controllers/ImportController.cs:99-220`), split into one action per
// button the way this repo's Trip-step precedent
// (app/import/[tripId]/trip/actions.ts) established, rather than legacy's
// single dispatching `Sites(model, innerAction)` POST endpoint -- Next.js
// server actions are individually-addressable functions, so the
// `ImportInnerActionModel` "Level.Id.Action" dispatch string legacy needs
// to fan a single endpoint out has no equivalent purpose here.
//
// Design departure from legacy worth flagging: legacy's `SaveSites`
// (the page-level "Continue" button) maps and validates EVERY site's
// fields from ONE big multi-site form POST in a single request. This
// module instead persists each site's own fields as soon as ITS OWN form
// is submitted (`saveSiteAction`) -- closer to what legacy's AJAX path
// already does when JavaScript is enabled (`SitePartial`/`SitesPartial`
// partial POSTs autosave one site at a time; `Request.IsAjaxRequest()`
// branches in `ImportController.cs:130-177`) than to the non-JS full-page
// fallback. `continueSitesAction` (the page-level "Continue" button) then
// only needs to RE-VALIDATE the already-persisted sites (mirroring
// `Site.Validate` on loaded entities), not map fresh form fields for all
// of them at once.
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import {
  assertTripEditable,
  createImportSite,
  getTrip,
  listImportSites,
  listStates,
  removeImportSite,
  saveImportSite,
  setTripSiteDefaults,
  type ImportStateOption,
} from "@/db/queries/import-drafts.sql";
import {
  buildSiteStep,
  siteToStepInput,
  validateSiteOptional,
  type SiteStepFieldError,
  type SiteStepInput,
} from "@/lib/import-sites";

interface SiteRedisplayState {
  siteId: number;
  input: SiteStepInput;
  errors: SiteStepFieldError[];
}

function encodeState(state: SiteRedisplayState): string {
  return encodeURIComponent(JSON.stringify(state));
}

async function requireEditableTrip(tripIdRaw: string, callbackPath: string): Promise<number> {
  const tripId = Number(tripIdRaw);
  const session = asAppSession(await auth());
  if (!session) {
    redirect(`/account/login?callbackUrl=${encodeURIComponent(callbackPath)}`);
  }
  try {
    await assertTripEditable(tripId, session.userId, session.roles);
  } catch {
    // Same "just redirect back into the step, let its own auth check
    // render the right not-found/unauthorized outcome" pattern as the
    // Trip step's action (app/import/[tripId]/trip/actions.ts).
    redirect(`/import/${tripId}/sites`);
  }
  return tripId;
}

function readSiteStepInput(formData: FormData): SiteStepInput {
  return {
    name: String(formData.get("name") ?? ""),
    coordinates: String(formData.get("coordinates") ?? ""),
    stateId: formData.get("stateId") ? Number(formData.get("stateId")) : null,
    county: String(formData.get("county") ?? ""),
    ownershipType: String(formData.get("ownershipType") ?? ""),
    ownershipContactInfo: String(formData.get("ownershipContactInfo") ?? ""),
    makeOwnershipContactInfoPublic: formData.get("makeOwnershipContactInfoPublic") === "on",
    comments: String(formData.get("comments") ?? ""),
  };
}

async function findStateBounds(stateId: number | null, states: ImportStateOption[]): Promise<ImportStateOption | null> {
  if (stateId === null) return null;
  return states.find((s) => s.id === stateId) ?? null;
}

/** `ImportController.AddSite` (`ImportController.cs:120-134`): `trip.AddSite()`
 * then an unconditional save -- always inserts a new blank site, seeded
 * from the trip's CURRENT `DefaultState`/`DefaultCounty` (which the most
 * recently successfully-saved site may have updated, `Site.SetTripDefaults`). */
export async function addSiteAction(formData: FormData): Promise<void> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const tripId = await requireEditableTrip(tripIdRaw, `/import/${tripIdRaw}/sites`);

  const trip = await getTrip(tripId);
  if (!trip) redirect(`/import/${tripId}/sites`);

  const newSiteId = await createImportSite(
    tripId,
    { stateId: trip.defaultStateId, county: trip.defaultCounty },
    new Date(),
  );

  redirect(`/import/${tripId}/sites?edit=${newSiteId}`);
}

/**
 * `ImportController.SaveSite` (`ImportController.cs:136-163`): Required-tag
 * validation first (blocks unconditionally on failure); then Optional-tag
 * validation (`Site.OptionalValidate`, the state-bounds warning), which
 * only blocks when `ignoreOptionalErrors` is false -- the "Continue" vs.
 * "Continue, ignoring optional errors" button distinction, carried here as
 * a hidden form field the redisplayed form flips on for its retry submit.
 */
export async function saveSiteAction(formData: FormData): Promise<void> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const siteId = Number(formData.get("siteId") ?? "");
  const ignoreOptionalErrors = formData.get("ignoreOptionalErrors") === "true";
  const tripId = await requireEditableTrip(tripIdRaw, `/import/${tripIdRaw}/sites`);

  const input = readSiteStepInput(formData);
  const { normalized, errors } = buildSiteStep(input);

  if (errors.length > 0) {
    redirect(
      `/import/${tripId}/sites?edit=${siteId}&state=${encodeState({ siteId, input, errors })}`,
    );
  }

  if (!ignoreOptionalErrors) {
    const states = await listStates();
    const bounds = await findStateBounds(normalized.stateId, states);
    const optionalErrors = bounds ? validateSiteOptional(normalized, bounds) : [];
    if (optionalErrors.length > 0) {
      redirect(
        `/import/${tripId}/sites?edit=${siteId}&state=${encodeState({ siteId, input, errors: optionalErrors })}`,
      );
    }
  }

  await saveImportSite(
    siteId,
    tripId,
    {
      name: normalized.name,
      latitude: normalized.latitude,
      latitudeInputFormat: normalized.latitudeInputFormat,
      longitude: normalized.longitude,
      longitudeInputFormat: normalized.longitudeInputFormat,
      stateId: normalized.stateId,
      county: normalized.county,
      ownershipType: normalized.ownershipType,
      ownershipContactInfo: normalized.ownershipContactInfo,
      makeOwnershipContactInfoPublic: normalized.makeOwnershipContactInfoPublic,
      comments: normalized.comments,
    },
    new Date(),
  );

  redirect(`/import/${tripId}/sites`);
}

/**
 * `ImportController.RemoveSite` (`ImportController.cs:165-178`) ->
 * `Trip.RemoveSite` -> cascading delete of the site's trees/trunks
 * (`removeImportSite`'s own header). No minimum-site-count guard here,
 * matching legacy exactly: `IsRemovable = Sites.Count > 1`
 * (`ImportMapping.cs:64`) is a UI-only hint (this page hides the Remove
 * button on the last remaining site) that the REMOVE ACTION ITSELF never
 * re-checks -- if a trip is somehow left with zero sites, the very next
 * GET to this page self-heals via `ensureSiteExists`, exactly mirroring
 * `trip.InitializeSites()` running unconditionally on every legacy Sites
 * GET (`ImportController.cs:91`).
 */
export async function removeSiteAction(formData: FormData): Promise<void> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const siteId = Number(formData.get("siteId") ?? "");
  const tripId = await requireEditableTrip(tripIdRaw, `/import/${tripIdRaw}/sites`);

  await removeImportSite(siteId, tripId, new Date());

  redirect(`/import/${tripId}/sites`);
}

/**
 * `ImportController.SaveSites` (`ImportController.cs:99-118`), the
 * page-level "Continue" button. Re-validates every ALREADY-PERSISTED site
 * (see this file's header for why this module saves per-site immediately
 * rather than deferring to this action) against the Required tag first
 * (unconditional block on the first failing site, mirroring
 * `trip.VisitSites(... ValidationTag.Required); if (!ModelState.IsValid)
 * return View(model);`); then the Optional tag across every site
 * (`ValidationTag.Optional`), gated by the same `ignoreOptionalErrors` flag
 * as `saveSiteAction`. On success, `trip.Sites.Last().SetTripDefaults()`
 * (`ImportController.cs:113`) and redirect to the Trees step (`RedirectToAction(
 * MVC.Import.Trees(trip.Id))`, cs:117) -- the Trees step (P3-05) doesn't
 * exist yet, so this 404s for now, same as every other not-yet-built
 * forward redirect in this wizard.
 */
export async function continueSitesAction(formData: FormData): Promise<void> {
  const tripIdRaw = String(formData.get("tripId") ?? "");
  const ignoreOptionalErrors = formData.get("ignoreOptionalErrors") === "true";
  const tripId = await requireEditableTrip(tripIdRaw, `/import/${tripIdRaw}/sites`);

  const sites = await listImportSites(tripId);
  const states = await listStates();

  for (const site of sites) {
    const input = siteToStepInput(site);
    const { errors } = buildSiteStep(input);
    if (errors.length > 0) {
      redirect(`/import/${tripId}/sites?edit=${site.id}&state=${encodeState({ siteId: site.id, input, errors })}`);
    }
  }

  if (!ignoreOptionalErrors) {
    for (const site of sites) {
      const input = siteToStepInput(site);
      const { normalized } = buildSiteStep(input);
      const bounds = await findStateBounds(normalized.stateId, states);
      const optionalErrors = bounds ? validateSiteOptional(normalized, bounds) : [];
      if (optionalErrors.length > 0) {
        redirect(`/import/${tripId}/sites?optional=1`);
      }
    }
  }

  const lastSite = sites[sites.length - 1];
  if (lastSite) {
    await setTripSiteDefaults(tripId, lastSite.stateId, lastSite.county);
  }

  redirect(`/import/${tripId}/trees`);
}
