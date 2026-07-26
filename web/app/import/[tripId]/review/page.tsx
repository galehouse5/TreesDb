// Review step -- task P3-06 (doc 05 §P3-06). Port of `ImportController.Review`
// GET (`TMD/Controllers/ImportController.cs:365-371`) and its view
// (`Review.cshtml` + `DisplayTemplates/ImportFinishedTripModel.cshtml` +
// `ImportFinishedSiteModel.cshtml` + `ImportFinishedTreeModel.cshtml`): trip
// summary (Name, Date, MeasurerContactInfo, First/Second/ThirdMeasurer),
// then one card per site (Name, State, County, OwnershipType) each listing
// its trees (ScientificName header, CommonName, Height/Girth/CrownSpread
// when specified) -- same structure/field set as those three legacy
// DisplayTemplates, using this repo's Card layout and
// `components/details/legacy-format.ts` formatters instead of `Html.
// SummaryDisplayFor`/`IfSpecifiedSummaryDisplayFor`.
//
// Deviation from legacy (see lib/import-finish.ts's file header): legacy's
// Review renders no validation UI at all -- this page additionally computes
// and displays the full-graph check every GET (no `?state=` redisplay
// needed, see actions.ts's header), listing blocking Required-tier errors
// and non-blocking Optional-tier warnings, and disables the Finish button
// while blocking errors exist (the server action re-validates regardless,
// so this is a UX nicety, not the actual gate).
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ClipboardCheckIcon } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { concatenateNames, formatDateMMDDYYYY, formatDistanceField, isSpecifiedFormat } from "@/components/details/legacy-format";
import { DataBadge, SECTION_HEADER_CLASS, SECTION_TITLE_CLASS } from "@/components/import/wizard-ui";
import { readUnitsPreference } from "@/lib/units/cookie";
import { describeFinishError, validateTripForFinish, type FinishError } from "@/lib/import-finish";
import { ImportTreeType } from "@/lib/import-trees";
import { cn } from "@/lib/utils";
import { loadReviewGraph, toFinishGraphInput } from "./load-graph";
import { finishAction } from "./actions";

export const metadata: Metadata = {
  title: "Import - Review - TreesDb",
  description: "Review the trip before finishing the import.",
};

interface ReviewStepPageProps {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function errorList(errors: FinishError[]): string[] {
  return errors.map(describeFinishError);
}

/** Guards the Trip report row's link-ification (item 11): only render as a
 * real `<a>` when the stored text actually parses as an http(s) URL --
 * legacy never validated this field as a URL, so it can contain arbitrary
 * text; render that case as plain text instead. */
function asHttpUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? value : null;
  } catch {
    return null;
  }
}

/** BRAND.md's detail-row idiom: a specified measurement renders as an
 * amber `DataBadge`; "(no data)" (formatDistanceField's own fallback text
 * for an unspecified value) stays plain muted text, not a badge. */
function MeasurementValue({ value, inputFormat }: { value: string; inputFormat: number }) {
  if (!isSpecifiedFormat(inputFormat)) return <span className="text-muted-foreground">{value}</span>;
  return <DataBadge>{value}</DataBadge>;
}

export default async function ReviewStepPage({ params, searchParams }: ReviewStepPageProps) {
  const { tripId: tripIdParam } = await params;
  const tripId = Number(tripIdParam);
  const sp = await searchParams;
  const errorBanner = firstParam(sp.error);

  // The layout (app/import/[tripId]/layout.tsx) already ran
  // assertTripEditable for this request.
  const graph = await loadReviewGraph(tripId);
  if (!graph) notFound();

  const validation = validateTripForFinish(toFinishGraphInput(graph));
  const requiredMessages = errorList(validation.requiredErrors);
  const optionalMessages = errorList(validation.optionalErrors);

  const cookieStore = await cookies();
  const units = readUnitsPreference(cookieStore);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className={SECTION_HEADER_CLASS}>
          <CardTitle className={cn("flex items-center gap-2", SECTION_TITLE_CLASS)}>
            <ClipboardCheckIcon className="size-4 text-primary/70" aria-hidden />
            {graph.trip.name || "(untitled trip)"}
          </CardTitle>
          <CardDescription>
            {graph.trip.isImported
              ? "This trip has already been imported. Finishing again will reimport it."
              : "Review the trip below, then finish to merge it in."}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4">
          <ul className="divide-y divide-border/60 text-sm">
            <li className="flex flex-wrap items-center justify-between gap-2 py-1.5">
              <span className="text-muted-foreground">Date</span>
              {graph.trip.date ? <DataBadge>{formatDateMMDDYYYY(graph.trip.date)}</DataBadge> : <span>(no date)</span>}
            </li>
            <li className="flex flex-wrap items-center justify-between gap-2 py-1.5">
              <span className="text-muted-foreground">Measurer contact</span>
              <span>{graph.trip.measurerContactInfo || "(none)"}</span>
            </li>
            <li className="flex flex-wrap items-center justify-between gap-2 py-1.5">
              <span className="text-muted-foreground">Measurers</span>
              {concatenateNames(graph.trip.measurers) ? (
                <DataBadge>{concatenateNames(graph.trip.measurers)}</DataBadge>
              ) : (
                <span>(none)</span>
              )}
            </li>
            {graph.trip.website ? (
              <li className="flex flex-wrap items-center justify-between gap-2 py-1.5">
                <span className="text-muted-foreground">Trip report</span>
                {asHttpUrl(graph.trip.website) ? (
                  <a
                    href={graph.trip.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-link underline-offset-4 hover:underline"
                  >
                    {graph.trip.website}
                  </a>
                ) : (
                  <span className="text-link">{graph.trip.website}</span>
                )}
              </li>
            ) : null}
          </ul>
        </CardContent>
      </Card>

      {errorBanner ? (
        <Card>
          <CardContent>
            <p role="alert" className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-sm text-destructive">
              {errorBanner}
            </p>
          </CardContent>
        </Card>
      ) : null}

      {requiredMessages.length > 0 ? (
        <Card className="border border-destructive/40">
          <CardHeader className="border-b border-destructive/30 bg-destructive/5">
            <CardTitle className="text-base text-destructive">Fix these before finishing</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-1 text-sm text-destructive">
              {requiredMessages.map((message, i) => (
                <li key={i} role="alert">
                  {message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {optionalMessages.length > 0 ? (
        <Card className="border border-amber-500/40">
          <CardHeader className="border-b border-amber-500/30 bg-amber-50 dark:bg-amber-950/20">
            <CardTitle className="text-base text-amber-700 dark:text-amber-400">
              Double check these - they won&apos;t block Finish
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-400">
              {optionalMessages.map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {graph.sites.map(({ site, trees }) => {
        const state = graph.states.find((s) => s.id === site.stateId);
        return (
          <Card key={site.id}>
            <CardHeader className={SECTION_HEADER_CLASS}>
              <CardTitle className={cn("text-base", SECTION_TITLE_CLASS)}>{site.name || "(unnamed site)"}</CardTitle>
              <CardDescription>
                {[site.county, state?.name].filter(Boolean).join(", ")}
                {site.ownershipType ? ` · ${site.ownershipType}` : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {trees.length === 0 ? <p className="text-sm text-muted-foreground">No trees recorded yet.</p> : null}
              {trees.map(({ tree, trunks }) => (
                <div key={tree.id} className="rounded-lg border bg-card p-3 shadow-sm">
                  <h4 className="font-medium">{tree.scientificName.trim() !== "" ? tree.scientificName : "(Unidentified)"}</h4>
                  <p className="mt-0.5 text-sm text-muted-foreground">{tree.commonName || "(no common name)"}</p>
                  <dl className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                    <div className="flex items-center gap-1.5">
                      <dt className="text-muted-foreground">Height</dt>
                      <dd>
                        <MeasurementValue
                          value={formatDistanceField(tree.height, tree.heightInputFormat, units)}
                          inputFormat={tree.heightInputFormat}
                        />
                      </dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <dt className="text-muted-foreground">
                        {tree.type === ImportTreeType.MultiTrunk ? "Combined girth" : "Girth"}
                      </dt>
                      <dd>
                        <MeasurementValue
                          value={formatDistanceField(tree.girth, tree.girthInputFormat, units)}
                          inputFormat={tree.girthInputFormat}
                        />
                      </dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <dt className="text-muted-foreground">Crown spread</dt>
                      <dd>
                        <MeasurementValue
                          value={formatDistanceField(tree.crownSpread, tree.crownSpreadInputFormat, units)}
                          inputFormat={tree.crownSpreadInputFormat}
                        />
                      </dd>
                    </div>
                    {trunks.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <dt className="text-muted-foreground">Trunks</dt>
                        <dd><DataBadge>{trunks.length}</DataBadge></dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              ))}
            </CardContent>
          </Card>
        );
      })}

      <Card>
        <CardContent className="flex items-center justify-between gap-3 pt-6">
          <Link href={`/import/${tripId}/trees`} className={cn(buttonVariants({ variant: "outline" }))}>
            Back
          </Link>
          <form action={finishAction}>
            <input type="hidden" name="tripId" value={tripId} />
            <Button type="submit" size="lg" disabled={requiredMessages.length > 0}>
              {graph.trip.isImported ? "Reimport" : "Finish"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
