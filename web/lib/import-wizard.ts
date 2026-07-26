/**
 * Pure Trip-step logic for the import wizard -- task P3-03 (doc 05
 * §P3-03..07, doc 01 §10). No DB access; db/queries/import-drafts.sql.ts
 * calls into this module, and app/import/[tripId]/trip/actions.ts calls it
 * directly to validate a submission before persisting.
 *
 * Ports (read before touching this file):
 * - `TMD.Model/Imports/Trip.cs` -- the entity's own field setters (which
 *   apply `OrEmptyAndTrim(ToTitleCase)`, see `normalizeTripName`/
 *   `normalizeTrimOnly` below) and its `[NotEmptyOrWhitesapce]`/`[Length]`/
 *   `[NotNull]`/`[Size2]` validation attributes, all tagged
 *   `ValidationTag.Required` -- Trip.cs has no `Optional`-tagged attributes,
 *   so (per doc 05 §P3-03's "required-on-finish vs allowed-while-draft"
 *   distinction) EVERY field validated here fires on every Trip-step submit,
 *   not just at Finish. Finish additionally validates the whole trip graph
 *   (Sites/Trees, not built by this task) via the same Required tag --
 *   that's the "Import ruleset" doc 05 refers to; Trip.cs's own fields are a
 *   strict subset of what Finish checks, so this module's validation is
 *   already a safe, non-duplicated piece of it.
 * - `TMD.Model/ValueObjects/Name.cs` -- `Create`/`CreateFromFormalName`/
 *   `ToFormalName`/`Null` (measurer name parsing).
 * - `TMD/Mappings/ImportMapping.cs` `configureForTrip()` -- the
 *   `CreateMap<ImportTripModel, Trip>().AfterMap(...)` block that turns the
 *   wizard's three flat text inputs (First/Second/ThirdMeasurer) into the
 *   entity's `IList<Name> Measurers`, including its "trailing blank
 *   truncates, embedded blank becomes an invalid Name" quirk (ported
 *   verbatim in `deriveMeasurers` below) -- and the `ValidationMapper`
 *   `.ForPath`/`.UseMessage` calls that decide which of the three UI fields
 *   an entity-level Measurers[i] error is attributed to, and with which
 *   display message.
 */
import { legacyTitleCase } from "./account-flows";

// ---------------------------------------------------------------------------
// Name parsing (Name.cs)
// ---------------------------------------------------------------------------

export interface MeasurerName {
  firstName: string;
  lastName: string;
}

/** `Name.Null()` -- both fields blank. */
function nullName(): MeasurerName {
  return { firstName: "", lastName: "" };
}

/**
 * `Name.CreateFromFormalName` (Name.cs:41-52). Splits on EVERY comma (not
 * just the first) -- `string.Split(',')` with no count limit -- then, if
 * there were at least two pieces, keeps only pieces [0] (last name) and [1]
 * (first name); any text after a second comma is silently dropped (a legacy
 * quirk, preserved bug-compatibly). Blank/no-comma input -> `Name.Null()`.
 */
export function parseFormalName(raw: string): MeasurerName {
  if (raw == null || raw.trim() === "") return nullName();
  const parts = raw.split(",");
  if (parts.length <= 1) return nullName();
  // Name.Create(first, last) -- args are (parts[1], parts[0]): "Lastname, Firstname".
  return {
    firstName: legacyTitleCase(parts[1] ?? ""),
    lastName: legacyTitleCase(parts[0] ?? ""),
  };
}

/** `Name.ToFormalName()` (Name.cs:27-32) -- blank unless BOTH names are specified. */
export function toFormalName(name: MeasurerName): string {
  if (name.firstName.trim() !== "" && name.lastName.trim() !== "") {
    return `${name.lastName}, ${name.firstName}`;
  }
  return "";
}

/** A parsed slot counts as a valid `Name` only when both halves are non-blank
 * (`Name.FirstName`/`LastName`'s own `[NotEmptyOrWhitesapce]`, Required tag). */
function isValidName(name: MeasurerName): boolean {
  return name.firstName.trim() !== "" && name.lastName.trim() !== "";
}

/**
 * `ImportMapping.cs` `configureForTrip()`'s `AfterMap` block (lines 38-53).
 * `lastSpecifiedMeasurer` is picked by walking backward from Third: the
 * first NON-BLANK field starting from Third wins the slot count, so a
 * filled Third with a blank Second still yields 3 slots (with slot 1 an
 * *invalid* `Name.Null()`, surfaced as a validation error on
 * `secondMeasurer` -- see `validateTripStep`). Returns 0-3 parsed slots.
 */
export function deriveMeasurers(first: string, second: string, third: string): MeasurerName[] {
  const lastSpecified = third.trim() !== "" ? 3 : second.trim() !== "" ? 2 : first.trim() !== "" ? 1 : 0;
  const raw = [first, second, third].slice(0, lastSpecified);
  return raw.map((r) => parseFormalName(r));
}

// ---------------------------------------------------------------------------
// Scalar field normalization (Trip.cs property setters)
// ---------------------------------------------------------------------------

/** `Trip.Name` setter: `value.OrEmptyAndTrimToTitleCase()` (Trip.cs:27). */
export function normalizeTripName(raw: string): string {
  return legacyTitleCase(raw ?? "");
}

/** `Trip.Website`/`Trip.MeasurerContactInfo` setters: `value.OrEmptyAndTrim()`
 * (Trip.cs:40,51) -- trimmed, NOT title-cased. */
export function normalizeTrimOnly(raw: string): string {
  return (raw ?? "").trim();
}

// ---------------------------------------------------------------------------
// Trip-step validation (Trip.cs's Required-tagged attributes)
// ---------------------------------------------------------------------------

export type TripStepFieldName =
  | "name"
  | "date"
  | "measurerContactInfo"
  | "website"
  | "firstMeasurer"
  | "secondMeasurer"
  | "thirdMeasurer";

export interface TripStepFieldError {
  field: TripStepFieldName;
  message: string;
}

export interface TripStepInput {
  name: string;
  /** "" (blank <input type=date>) or "YYYY-MM-DD". */
  date: string;
  measurerContactInfo: string;
  makeMeasurerContactInfoPublic: boolean;
  firstMeasurer: string;
  secondMeasurer: string;
  thirdMeasurer: string;
  website: string;
}

export interface NormalizedTripStep {
  name: string;
  date: string | null;
  measurerContactInfo: string;
  makeMeasurerContactInfoPublic: boolean;
  website: string;
  measurers: MeasurerName[];
}

/**
 * Applies every `Trip.cs` setter transform, THEN validates the result
 * against every Required-tagged attribute on `Trip`/`Name` reachable from
 * the wizard's Trip-step fields -- mirroring
 * `this.ValidateMappedModel<Trip, ImportTripModel>(trip, ValidationTag.Required)`
 * (`ImportController.cs:76`), which runs unconditionally on every Trip-step
 * POST (no draft-lenient deferral for THIS step's own fields -- see this
 * file's header). Collects every applicable error (NHibernate's validator
 * does not short-circuit), same as legacy surfacing every field error at
 * once via ModelState.
 */
export function buildTripStep(input: TripStepInput): {
  normalized: NormalizedTripStep;
  errors: TripStepFieldError[];
} {
  const errors: TripStepFieldError[] = [];

  const name = normalizeTripName(input.name);
  if (name === "") {
    errors.push({ field: "name", message: "Trip name must be specified." }); // Trip.cs:22
  } else if (name.length > 100) {
    errors.push({ field: "name", message: "Trip name must not exceed 100 characters." }); // Trip.cs:23
  }

  const date = input.date && input.date.trim() !== "" ? input.date : null;
  if (date === null) {
    errors.push({ field: "date", message: "Trip date must be specified." }); // Trip.cs:32
  }

  const measurerContactInfo = normalizeTrimOnly(input.measurerContactInfo);
  if (measurerContactInfo === "") {
    errors.push({
      field: "measurerContactInfo",
      message: "Measurer contact must be specified for this trip.", // Trip.cs:46
    });
  } else if (measurerContactInfo.length > 200) {
    errors.push({
      field: "measurerContactInfo",
      message: "Trip measurer contact info must not exceed 200 characters.", // Trip.cs:47
    });
  }

  const website = normalizeTrimOnly(input.website);
  if (website.length > 100) {
    errors.push({ field: "website", message: "Trip website must not exceed 100 characters." }); // Trip.cs:36
  }

  const measurers = deriveMeasurers(input.firstMeasurer, input.secondMeasurer, input.thirdMeasurer);
  const measurerFields: TripStepFieldName[] = ["firstMeasurer", "secondMeasurer", "thirdMeasurer"];
  if (measurers.length === 0) {
    // Trip.cs:59 Size2(1, MaxValue), message overridden by
    // ImportMapping.cs's `.UseMessage("Measurers", "Name must be specified.")`
    // when surfaced on FirstMeasurer.
    errors.push({ field: "firstMeasurer", message: "Name must be specified." });
  } else {
    measurers.forEach((m, i) => {
      if (!isValidName(m)) {
        errors.push({
          field: measurerFields[i]!,
          message: "Name must be in Lastname, Firstname format.", // ImportMapping.cs:33-35
        });
      }
    });
  }

  return {
    normalized: {
      name,
      date,
      measurerContactInfo,
      makeMeasurerContactInfoPublic: input.makeMeasurerContactInfoPublic,
      website,
      measurers,
    },
    errors,
  };
}
