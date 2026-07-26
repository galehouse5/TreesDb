// Trip step -- task P3-03 (doc 05 §P3-03). Port of `ImportController.Trip`
// GET (`TMD/Controllers/ImportController.cs:53-64`) and its view
// (`TMD/Views/Import/Trip.cshtml`): trip name, trip date, measurer contact
// info (+ "make public"), up to three measurers as flat
// "Lastname, Firstname" text fields, and an optional trip-report website --
// the exact field set of `ImportTripModel`
// (`TMD/Models/Import/ImportTripModel.cs:7-26`). No `state`/`county`/brand
// defaults here -- those (`Trip.DefaultState`/`DefaultCounty`/
// `DefaultLaserBrand`/`DefaultClinometerBrand`/`DefaultHeightMeasurementMethod`)
// are set from the Sites step (P3-04, `Site.SetTripDefaults`), out of this
// task's scope.
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SECTION_HEADER_CLASS, SECTION_TITLE_CLASS } from "@/components/import/wizard-ui";
import { getTrip, type TripDraft } from "@/db/queries/import-drafts.sql";
import { toFormalName, type TripStepFieldError, type TripStepFieldName, type TripStepInput } from "@/lib/import-wizard";
import { cn } from "@/lib/utils";
import { saveTripAction } from "./actions";

export const metadata: Metadata = {
  title: "Import - Trip - TreesDb",
  description: "Enter the trip that these measurements were recorded on.",
};

interface TripStepPageProps {
  params: Promise<{ tripId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function errorFor(errors: TripStepFieldError[], field: TripStepFieldName): string | undefined {
  return errors.find((e) => e.field === field)?.message;
}

function draftValues(trip: TripDraft): TripStepInput {
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

export default async function TripStepPage({ params, searchParams }: TripStepPageProps) {
  const { tripId: tripIdParam } = await params;
  const tripId = Number(tripIdParam);
  const sp = await searchParams;

  // The layout (app/import/[tripId]/layout.tsx) already ran
  // assertTripEditable for this request -- this fetch is just the data
  // read, not a second authorization check.
  const trip = await getTrip(tripId);
  if (!trip) notFound();

  let values = draftValues(trip);
  let errors: TripStepFieldError[] = [];

  const stateRaw = firstParam(sp.state);
  if (stateRaw) {
    try {
      // Next.js has already URL-decoded query values by the time they reach
      // `searchParams` -- decoding again here would double-decode.
      const parsed = JSON.parse(stateRaw) as { input: TripStepInput; errors: TripStepFieldError[] };
      values = parsed.input;
      errors = parsed.errors;
    } catch {
      // Malformed/tampered state param -- fall back to the saved draft
      // rather than erroring the whole page.
    }
  }

  return (
    <Card>
      <CardHeader className={SECTION_HEADER_CLASS}>
        <CardTitle className={cn("flex items-center gap-2", SECTION_TITLE_CLASS)}>
          <CarIcon className="size-4 text-primary/70" aria-hidden />
          Enter trip
        </CardTitle>
        <CardDescription>Trip details apply to every site and tree measured on this trip.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <form action={saveTripAction} className="space-y-4">
          <input type="hidden" name="tripId" value={tripId} />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label htmlFor="name" className="text-sm font-medium">
                Trip name
              </label>
              <Input id="name" name="name" defaultValue={values.name} aria-invalid={!!errorFor(errors, "name")} />
              {errorFor(errors, "name") ? (
                <p role="alert" className="text-xs text-destructive">
                  {errorFor(errors, "name")}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="date" className="text-sm font-medium">
                Trip date
              </label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={values.date}
                aria-invalid={!!errorFor(errors, "date")}
              />
              {errorFor(errors, "date") ? (
                <p role="alert" className="text-xs text-destructive">
                  {errorFor(errors, "date")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="measurerContactInfo" className="text-sm font-medium">
              Measurer contact
            </label>
            <Textarea
              id="measurerContactInfo"
              name="measurerContactInfo"
              defaultValue={values.measurerContactInfo}
              aria-invalid={!!errorFor(errors, "measurerContactInfo")}
              rows={3}
            />
            {errorFor(errors, "measurerContactInfo") ? (
              <p role="alert" className="text-xs text-destructive">
                {errorFor(errors, "measurerContactInfo")}
              </p>
            ) : null}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="makeMeasurerContactInfoPublic"
              name="makeMeasurerContactInfoPublic"
              type="checkbox"
              defaultChecked={values.makeMeasurerContactInfoPublic}
              className="size-4 rounded border-input accent-primary"
            />
            <label htmlFor="makeMeasurerContactInfoPublic" className="text-sm font-medium">
              Make contact public
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1">
              <label htmlFor="firstMeasurer" className="text-sm font-medium">
                First measurer
              </label>
              <Input
                id="firstMeasurer"
                name="firstMeasurer"
                placeholder="Lastname, Firstname"
                defaultValue={values.firstMeasurer}
                aria-invalid={!!errorFor(errors, "firstMeasurer")}
              />
              {errorFor(errors, "firstMeasurer") ? (
                <p role="alert" className="text-xs text-destructive">
                  {errorFor(errors, "firstMeasurer")}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="secondMeasurer" className="text-sm font-medium">
                Second measurer
              </label>
              <Input
                id="secondMeasurer"
                name="secondMeasurer"
                placeholder="Lastname, Firstname"
                defaultValue={values.secondMeasurer}
                aria-invalid={!!errorFor(errors, "secondMeasurer")}
              />
              {errorFor(errors, "secondMeasurer") ? (
                <p role="alert" className="text-xs text-destructive">
                  {errorFor(errors, "secondMeasurer")}
                </p>
              ) : null}
            </div>

            <div className="space-y-1">
              <label htmlFor="thirdMeasurer" className="text-sm font-medium">
                Third measurer
              </label>
              <Input
                id="thirdMeasurer"
                name="thirdMeasurer"
                placeholder="Lastname, Firstname"
                defaultValue={values.thirdMeasurer}
                aria-invalid={!!errorFor(errors, "thirdMeasurer")}
              />
              {errorFor(errors, "thirdMeasurer") ? (
                <p role="alert" className="text-xs text-destructive">
                  {errorFor(errors, "thirdMeasurer")}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1">
            <label htmlFor="website" className="text-sm font-medium">
              Trip report URL
            </label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={values.website}
              aria-invalid={!!errorFor(errors, "website")}
            />
            {errorFor(errors, "website") ? (
              <p role="alert" className="text-xs text-destructive">
                {errorFor(errors, "website")}
              </p>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg">
              Continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
