// Sites step -- task P3-04 (doc 05 §P3-04). Port of `ImportController.Sites`
// GET (`TMD/Controllers/ImportController.cs:84-97`) and its views
// (`Sites.cshtml`/`SitesPartial.cshtml`/`SitePartial.cshtml`): a list of the
// trip's sites, each either a read-only summary row or (by default, for any
// site currently failing Required-tag validation -- e.g. every freshly
// created blank site -- or when explicitly opened via "Edit") an inline
// edit form for `ImportSiteModel`'s exact field set
// (`TMD/Models/Import/ImportSiteModel.cs:9-36`): Name, Coordinates (+ the
// MapLibre picker), State, County, OwnershipType, OwnershipContactInfo (+
// "make public"), Comments. Trees/Photos are Site.cs fields too but are
// OUT of this task's scope (P3-05/P3-08, not built yet) -- see
// lib/import-sites.ts's header for why the Required-tag validation below
// deliberately excludes them.
//
// Design departure from legacy worth flagging (see actions.ts's header for
// the full reasoning): each site's own form saves ITSELF immediately on
// submit (closer to legacy's AJAX autosave path than to the non-JS
// full-page-POST fallback `SaveSites` implements) -- there is no single
// "submit the whole multi-site page" request in this port.
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MapPinIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CoordinatePicker } from "@/components/import/coordinate-picker";
import { ConfirmSubmitButton } from "@/components/import/confirm-submit-button";
import { NATIVE_SELECT_CLASS_NAME, SECTION_HEADER_CLASS, SECTION_TITLE_CLASS } from "@/components/import/wizard-ui";
import { cn } from "@/lib/utils";
import {
  ensureSiteExists,
  getTrip,
  listImportSites,
  listStates,
  type ImportSite,
  type ImportStateOption,
} from "@/db/queries/import-drafts.sql";
import {
  buildSiteStep,
  siteToStepInput,
  type SiteStepFieldError,
  type SiteStepFieldName,
  type SiteStepInput,
} from "@/lib/import-sites";
import { addSiteAction, continueSitesAction, removeSiteAction, saveSiteAction } from "./actions";

export const metadata: Metadata = {
  title: "Import - Sites - TreesDb",
  description: "Enter each site where trees were measured on this trip.",
};

interface SitesStepPageProps {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function errorFor(errors: SiteStepFieldError[], field: SiteStepFieldName): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

interface RedisplayState {
  siteId: number;
  input: SiteStepInput;
  errors: SiteStepFieldError[];
}

export default async function SitesStepPage({ params, searchParams }: SitesStepPageProps) {
  const { tripId: tripIdParam } = await params;
  const tripId = Number(tripIdParam);
  const sp = await searchParams;

  // The layout (app/import/[tripId]/layout.tsx) already ran
  // assertTripEditable for this request.
  const trip = await getTrip(tripId);
  if (!trip) notFound();

  // `trip.InitializeSites(); Repositories.Imports.Save(trip);`
  // (`ImportController.cs:91-92`) -- runs on EVERY GET, unconditionally
  // stamping `last_saved` (see `ensureSiteExists`'s own header).
  await ensureSiteExists(tripId, { stateId: trip.defaultStateId, county: trip.defaultCounty }, new Date());

  const [sites, states] = await Promise.all([listImportSites(tripId), listStates()]);

  const editParam = firstParam(sp.edit);
  const forcedEditId = editParam ? Number(editParam) : null;
  const showOptionalBanner = firstParam(sp.optional) === "1";

  let redisplay: RedisplayState | null = null;
  const stateRaw = firstParam(sp.state);
  if (stateRaw) {
    try {
      redisplay = JSON.parse(stateRaw) as RedisplayState;
    } catch {
      // Malformed/tampered state param -- ignore, fall back to stored data.
    }
  }

  // `ImportMapping.cs:62-63` -- `IsEditing` defaults to true for any site
  // currently failing Required-tag validation (e.g. every freshly-added
  // blank site), independent of the explicit `?edit=` toggle below.
  const editingIds = new Set<number>();
  for (const site of sites) {
    const { errors } = buildSiteStep(siteToStepInput(site));
    if (errors.length > 0) editingIds.add(site.id);
  }
  if (forcedEditId !== null) editingIds.add(forcedEditId);
  const anyEditing = editingIds.size > 0;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden py-0 gap-0">
        <CardHeader className="bg-primary/5 py-4">
          <CardTitle className="flex items-center gap-2 text-primary">
            <MapPinIcon className="size-4 text-primary/70" aria-hidden />
            Enter sites
          </CardTitle>
          <CardDescription>
            Add one entry for each distinct site (a stand of trees, a park, a single tree&apos;s location) measured
            on this trip.
          </CardDescription>
        </CardHeader>
      </Card>

      {sites.map((site) =>
        editingIds.has(site.id) ? (
          <SiteEditCard
            key={site.id}
            tripId={tripId}
            site={site}
            states={states}
            isRemovable={sites.length > 1}
            redisplay={redisplay && redisplay.siteId === site.id ? redisplay : null}
          />
        ) : (
          <SiteSummaryCard key={site.id} tripId={tripId} site={site} states={states} />
        ),
      )}

      {/* Full-width dashed "add" affordance so the control reads as part of
          the site list rather than a stray button on the page background
          (design-review finding). */}
      <form action={addSiteAction}>
        <input type="hidden" name="tripId" value={tripId} />
        <Button type="submit" variant="outline" className="w-full border-dashed">
          Add site
        </Button>
      </form>

      {showOptionalBanner ? (
        <p
          role="alert"
          className="rounded-md border border-amber-500/40 bg-amber-50 p-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
        >
          One or more sites have coordinates that appear to fall outside their state&apos;s boundaries. Double check
          them, or continue anyway.
        </p>
      ) : null}

      <Card>
        <CardContent className="flex items-center justify-between gap-3 pt-6">
          <Link href={`/import/${tripId}/trip`} className={cn(buttonVariants({ variant: "outline" }))}>
            Back
          </Link>
          <div className="flex items-center gap-3">
            {anyEditing ? <span className="text-sm text-muted-foreground">Save your open site first.</span> : null}
            <form action={continueSitesAction}>
              <input type="hidden" name="tripId" value={tripId} />
              <input type="hidden" name="ignoreOptionalErrors" value={showOptionalBanner ? "true" : "false"} />
              <Button
                type="submit"
                size="lg"
                variant={anyEditing ? "outline" : "default"}
                className={cn(!anyEditing && showOptionalBanner && "bg-amber-600 text-white hover:bg-amber-600/90")}
              >
                {showOptionalBanner ? "Continue, ignoring optional errors" : "Continue"}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function stateLabel(state: ImportStateOption): string {
  return `${state.name} (${state.code})`;
}

function SiteSummaryCard({
  tripId,
  site,
  states,
}: {
  tripId: number;
  site: ImportSite;
  states: ImportStateOption[];
}) {
  const state = states.find((s) => s.id === site.stateId);
  return (
    <Card className="border-l-4 border-l-primary/40">
      <CardContent className="flex items-center justify-between gap-4">
        <div>
          <p className="font-medium">{site.name || "(unnamed site)"}</p>
          <p className="text-sm text-muted-foreground">
            {[site.county, state?.name].filter(Boolean).join(", ")}
            {site.ownershipType ? ` · ${site.ownershipType}` : ""}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {/* Code-audit finding: standardized on the plain `<Link
              className={cn(buttonVariants(...))}>` idiom `trees/page.tsx`
              already uses for its own per-item "Edit" link, instead of this
              page's other idiom (`Button nativeButton={false} render={
              <Link/>}`) for the exact same affordance. */}
          <Link
            href={`/import/${tripId}/sites?edit=${site.id}`}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Edit
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function SiteEditCard({
  tripId,
  site,
  states,
  isRemovable,
  redisplay,
}: {
  tripId: number;
  site: ImportSite;
  states: ImportStateOption[];
  isRemovable: boolean;
  redisplay: RedisplayState | null;
}) {
  const values: SiteStepInput = redisplay ? redisplay.input : siteToStepInput(site);
  const errors = redisplay ? redisplay.errors : [];
  const coordinatesInputId = `coordinates-${site.id}`;
  // `saveSiteAction` only ever redisplays Optional-tag errors (the
  // state-bounds warning) once the Required tier is already clean -- every
  // message in that case is Site.cs's `"(Optional) ..."`-prefixed text
  // (Site.cs:45). Detecting that here lets the retry submit flip
  // `ignoreOptionalErrors`, mirroring legacy's "Continue, ignoring optional
  // errors" button swap (`Sites.cshtml:47-49`, one level up the page; this
  // is the per-SITE equivalent `SaveSite` needs since `siteModel.
  // HasOptionalError` (`ImportController.cs:150`) is a per-site flag too).
  const hasOnlyOptionalErrors = errors.length > 0 && errors.every((e) => e.message.startsWith("(Optional)"));

  return (
    <Card>
      <CardHeader className={SECTION_HEADER_CLASS}>
        <CardTitle className={cn("text-base", SECTION_TITLE_CLASS)}>{site.name || "New site"}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form action={saveSiteAction} className="space-y-4">
          <input type="hidden" name="tripId" value={tripId} />
          <input type="hidden" name="siteId" value={site.id} />
          <input type="hidden" name="ignoreOptionalErrors" value={hasOnlyOptionalErrors ? "true" : "false"} />

          <div className="space-y-1">
            <label htmlFor={`name-${site.id}`} className="text-sm font-medium">
              Site name
            </label>
            <Input
              id={`name-${site.id}`}
              name="name"
              defaultValue={values.name}
              aria-invalid={!!errorFor(errors, "name")}
            />
            {errorFor(errors, "name") ? (
              <p role="alert" className="text-xs text-destructive">
                {errorFor(errors, "name")}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label htmlFor={coordinatesInputId} className="text-sm font-medium">
              Coordinates
            </label>
            <p className="text-xs text-muted-foreground">
              Optional - calculated from tree locations if left blank. E.g. 41 29.959, -81 41.662 or 41.49932,
              -81.69437 or 41 29 57, -81 41 39.
            </p>
            <div className="flex gap-2">
              <Input
                id={coordinatesInputId}
                name="coordinates"
                defaultValue={values.coordinates}
                aria-invalid={!!errorFor(errors, "coordinates")}
              />
              <CoordinatePicker targetInputId={coordinatesInputId} />
            </div>
            {errors
              .filter((e) => e.field === "coordinates")
              .map((e, i) => (
                <p key={i} role="alert" className="text-xs text-destructive">
                  {e.message}
                </p>
              ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor={`stateId-${site.id}`} className="text-sm font-medium">
                State
              </label>
              <select
                id={`stateId-${site.id}`}
                name="stateId"
                defaultValue={values.stateId ?? ""}
                aria-invalid={!!errorFor(errors, "stateId")}
                className={NATIVE_SELECT_CLASS_NAME}
              >
                <option value="">None selected</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>
                    {stateLabel(s)}
                  </option>
                ))}
              </select>
              {errorFor(errors, "stateId") ? (
                <p role="alert" className="text-xs text-destructive">
                  {errorFor(errors, "stateId")}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor={`county-${site.id}`} className="text-sm font-medium">
                County
              </label>
              <Input
                id={`county-${site.id}`}
                name="county"
                defaultValue={values.county}
                aria-invalid={!!errorFor(errors, "county")}
              />
              {errorFor(errors, "county") ? (
                <p role="alert" className="text-xs text-destructive">
                  {errorFor(errors, "county")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor={`ownershipType-${site.id}`} className="text-sm font-medium">
              Ownership type
            </label>
            <Input
              id={`ownershipType-${site.id}`}
              name="ownershipType"
              defaultValue={values.ownershipType}
              aria-invalid={!!errorFor(errors, "ownershipType")}
            />
            {errorFor(errors, "ownershipType") ? (
              <p role="alert" className="text-xs text-destructive">
                {errorFor(errors, "ownershipType")}
              </p>
            ) : null}
          </div>

          <div className="space-y-1">
            <label htmlFor={`ownershipContactInfo-${site.id}`} className="text-sm font-medium">
              Ownership contact
            </label>
            <Textarea
              id={`ownershipContactInfo-${site.id}`}
              name="ownershipContactInfo"
              defaultValue={values.ownershipContactInfo}
              aria-invalid={!!errorFor(errors, "ownershipContactInfo")}
              rows={2}
            />
            {errorFor(errors, "ownershipContactInfo") ? (
              <p role="alert" className="text-xs text-destructive">
                {errorFor(errors, "ownershipContactInfo")}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <input
              id={`makeOwnershipContactInfoPublic-${site.id}`}
              name="makeOwnershipContactInfoPublic"
              type="checkbox"
              defaultChecked={values.makeOwnershipContactInfoPublic}
              className="size-4 rounded border-input accent-primary"
            />
            <label htmlFor={`makeOwnershipContactInfoPublic-${site.id}`} className="text-sm font-medium">
              Make contact public
            </label>
          </div>

          <div className="space-y-1">
            <label htmlFor={`comments-${site.id}`} className="text-sm font-medium">
              Comments
            </label>
            <Textarea
              id={`comments-${site.id}`}
              name="comments"
              defaultValue={values.comments}
              aria-invalid={!!errorFor(errors, "comments")}
              rows={3}
            />
            {errorFor(errors, "comments") ? (
              <p role="alert" className="text-xs text-destructive">
                {errorFor(errors, "comments")}
              </p>
            ) : null}
          </div>

          <div className="flex justify-between gap-2">
            <Button
              type="submit"
              className={cn(hasOnlyOptionalErrors && "bg-amber-600 text-white hover:bg-amber-600/90")}
            >
              {hasOnlyOptionalErrors ? "Save anyway" : "Save site"}
            </Button>
            {isRemovable ? (
              <ConfirmSubmitButton
                formAction={removeSiteAction}
                variant="destructive"
                message="Remove this site and its trees?"
              >
                Remove
              </ConfirmSubmitButton>
            ) : null}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
