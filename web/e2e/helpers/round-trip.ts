// Inverse formatters: stored float32 value + *_input_format code -> text a
// user could type into the real wizard form that reparses (through the
// REAL app parsers, lib/units/parse.ts + parse-coordinates.ts) to the exact
// same float32 value AND the exact same format code. This is the "typing
// script" generator doc 05 §P3-10 asks for -- the walkthrough must exercise
// the parsers by typing text, not by injecting values, and the reproduced
// *_input_format column is itself compared by the replay differ, so
// reproducing the ORIGINAL format code (not just the original value) is
// load-bearing, not cosmetic.
//
// lib/import-trees.ts's own `distanceToEditableText`/`elevationToEditableText`
// look similar but are NOT reusable here: they always render decimal-feet
// text regardless of the stored input_format (a deliberate simplification
// for that file's "redisplay an editor field" use case), which would
// silently flip e.g. a FeetDecimalInches(3) girth to DecimalFeet(4) on
// re-save -- exactly the kind of drift this walkthrough exists to catch, so
// this module reimplements the inverse relationship precisely instead.
//
// Coordinates deliberately do NOT reuse lib/import-sites.ts's
// `formatStoredCoordinates` (a first attempt here did, expecting it to be
// exact -- it turned out not to be, see below). This module reimplements the
// coordinate axis formatter with the same search-and-verify strategy as
// Distance/Elevation instead.
//
// --- Why a search instead of closed-form inversion ---------------------
// `parseDistance`/`parseElevation`/`parseLatitude`/`parseLongitude` store
// whatever `fround(Number(capturedDigits))` (times a unit-conversion
// constant, for non-feet/non-decimal-degrees formats) produces -- inverting
// that by simple division/multiplication is only an approximation:
// double-rounding through two more float32 operations (the inversion here,
// then the parser's own forward conversion) is not guaranteed to land back
// on the exact original float32 bit pattern. Rather than hand-deriving each
// format's exact rounding error, this module computes a
// mathematically-reasonable candidate and then SEARCHES its nearby float32
// neighbors (bit-exact ULP steps), verifying each one by actually calling
// the real parser and checking for exact equality -- self-verifying by
// construction (a wrong candidate simply fails the check and the search
// continues; if every candidate in the search radius fails, this throws
// loudly at typing-script-generation time, long before any browser opens).
//
// Coordinates specifically also rule out the seemingly-obvious shortcut of
// reusing `lib/geo/coordinates.ts`'s `formatLatitude`/`formatLongitude`
// (what `formatStoredCoordinates` itself calls) directly: those format for
// HUMAN DISPLAY at fixed precision (DDM minutes to 3dp, DMS seconds to
// 1dp) -- rounding for legibility, not for exactness. Empirically (see this
// module's own dev-time round-trip check against oracle trip 906's real
// site coordinates), formatting 42.902931213378906 as DDM ("42 54.176")
// and reparsing it back does NOT reproduce the original float32 value --
// it lands on 42.90293884277344 instead, a real, `Object.is`-visible
// difference (rounding the minutes component to 3dp is lossy whenever the
// true minutes value needs more precision to round-trip). Since
// `DEGREES_DECIMAL_MINUTES`'s regex accepts any number of decimal digits
// (`[0-9]{1,2}(?:\.[0-9]+)?`), not just 3, this module instead searches for
// a minutes/seconds text with WHATEVER precision reproduces the target
// exactly, rather than the fixed display precision `formatLatitude` uses.
import {
  DistanceFormat,
  ElevationFormat,
  parseDistance,
  parseElevation,
} from "../../lib/units/parse";
import { fround } from "../../lib/units/float32";
import {
  CM_PER_M,
  FEET_PER_METER,
  FEET_PER_YARD,
  INCHES_PER_FOOT,
} from "../../lib/units/format";
import {
  CoordinatesFormat,
  parseLatitude,
  parseLongitude,
  type ParsedCoordinate,
} from "../../lib/units/parse-coordinates";

// ---------------------------------------------------------------------------
// float32 neighbor search
// ---------------------------------------------------------------------------

function float32ToBits(v: number): number {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setFloat32(0, v, false);
  return new DataView(buf).getUint32(0, false);
}

function bitsToFloat32(bits: number): number {
  const buf = new ArrayBuffer(4);
  new DataView(buf).setUint32(0, bits >>> 0, false);
  return new DataView(buf).getFloat32(0, false);
}

/** Float32 values within `radius` representable-ULPs of `v` (both directions),
 * including `fround(v)` itself. Restricted to non-negative `v` (every
 * quantity this module formats -- height/girth/elevation/... -- is a
 * non-negative physical measurement), where the raw bit pattern increases
 * monotonically with magnitude, so a simple integer bit-offset walk is a
 * correct "next/previous representable float32" step. */
function float32Neighbors(v: number, radius: number): number[] {
  if (v < 0) throw new Error(`float32Neighbors: only non-negative inputs supported, got ${v}`);
  const bits = float32ToBits(fround(v));
  const out: number[] = [];
  for (let d = -radius; d <= radius; d++) {
    const b = bits + d;
    if (b < 0) continue;
    out.push(bitsToFloat32(b));
  }
  return out;
}

/** Renders a float32-representable double with just enough digits to
 * round-trip it exactly (JS's `Number.prototype.toString()` guarantees
 * `Number(v.toString()) === v`), which is what every candidate text below
 * embeds before handing it to the real parser. */
function num(v: number): string {
  return String(v);
}

class RoundTripError extends Error {}

function searchDistance(
  candidates: readonly number[],
  makeText: (v: number) => string,
  expectedFormat: DistanceFormat,
  target: number,
): string {
  for (const v of candidates) {
    const text = makeText(v);
    const parsed = parseDistance(text);
    if (parsed.inputFormat === expectedFormat && Object.is(fround(parsed.feet), target)) {
      return text;
    }
  }
  throw new RoundTripError(
    `distanceTypingText: no exact round-trip text found for target=${target} format=${DistanceFormat[expectedFormat]} (tried ${candidates.length} candidates)`,
  );
}

function searchElevation(
  candidates: readonly number[],
  makeText: (v: number) => string,
  expectedFormat: ElevationFormat,
  target: number,
): string {
  for (const v of candidates) {
    const text = makeText(v);
    const parsed = parseElevation(text);
    if (parsed.inputFormat === expectedFormat && Object.is(fround(parsed.feet), target)) {
      return text;
    }
  }
  throw new RoundTripError(
    `elevationTypingText: no exact round-trip text found for target=${target} format=${ElevationFormat[expectedFormat]} (tried ${candidates.length} candidates)`,
  );
}

const SEARCH_RADIUS = 12;

// ---------------------------------------------------------------------------
// Distance (height / girth / crown spread / trunk girth-height)
// ---------------------------------------------------------------------------

export function distanceTypingText(feetValue: number, format: DistanceFormat): string {
  const target = fround(feetValue);

  switch (format) {
    case DistanceFormat.Unspecified:
      return "";

    case DistanceFormat.DecimalFeet:
      return searchDistance(float32Neighbors(target, SEARCH_RADIUS), (v) => `${num(v)}'`, format, target);

    case DistanceFormat.DecimalInches: {
      const guess = fround(target * INCHES_PER_FOOT);
      return searchDistance(float32Neighbors(guess, SEARCH_RADIUS), (v) => `${num(v)}''`, format, target);
    }

    case DistanceFormat.DecimalMeters: {
      const guess = fround(target / FEET_PER_METER);
      return searchDistance(float32Neighbors(guess, SEARCH_RADIUS), (v) => `${num(v)} m`, format, target);
    }

    case DistanceFormat.DecimalYards: {
      const guess = fround(target / FEET_PER_YARD);
      return searchDistance(float32Neighbors(guess, SEARCH_RADIUS), (v) => `${num(v)} yd`, format, target);
    }

    case DistanceFormat.DecimalCentimeters: {
      const meters = fround(target / FEET_PER_METER);
      const guess = fround(meters * CM_PER_M);
      return searchDistance(float32Neighbors(guess, SEARCH_RADIUS), (v) => `${num(v)} cm`, format, target);
    }

    case DistanceFormat.FeetDecimalInches: {
      // Two free parameters (whole feet + inches). The inches remainder is
      // constructed to land in [0, 12) for the primary attempt, with the
      // adjacent whole-feet values tried too in case the true remainder
      // sits right at a rounding boundary (e.g. target very close to a
      // whole foot).
      const primaryFeet = Math.floor(target);
      for (const feetInt of [primaryFeet, Math.max(0, primaryFeet - 1), primaryFeet + 1]) {
        const inchesGuess = fround((target - feetInt) * INCHES_PER_FOOT);
        if (inchesGuess < -1 || inchesGuess > INCHES_PER_FOOT + 1) continue;
        try {
          return searchDistance(
            float32Neighbors(Math.max(0, inchesGuess), SEARCH_RADIUS),
            (v) => `${feetInt}' ${num(v)}''`,
            format,
            target,
          );
        } catch (e) {
          if (!(e instanceof RoundTripError)) throw e;
          // try the next feetInt candidate
        }
      }
      throw new RoundTripError(`distanceTypingText: FeetDecimalInches search exhausted for target=${target}`);
    }

    case DistanceFormat.Invalid:
    case DistanceFormat.Default:
    default:
      throw new Error(
        `distanceTypingText: format ${DistanceFormat[format]} (${format}) is not directly typable through the wizard's text field -- pick a different oracle trip/field.`,
      );
  }
}

// ---------------------------------------------------------------------------
// Elevation
// ---------------------------------------------------------------------------

export function elevationTypingText(feetValue: number, format: ElevationFormat): string {
  const target = fround(feetValue);

  switch (format) {
    case ElevationFormat.Unspecified:
      return "";

    case ElevationFormat.DecimalFeet:
      return searchElevation(float32Neighbors(target, SEARCH_RADIUS), (v) => `${num(v)} ft`, format, target);

    case ElevationFormat.DecimalMeters: {
      const guess = fround(target / FEET_PER_METER);
      return searchElevation(float32Neighbors(guess, SEARCH_RADIUS), (v) => `${num(v)} m`, format, target);
    }

    case ElevationFormat.DecimalYards: {
      const guess = fround(target / FEET_PER_YARD);
      return searchElevation(float32Neighbors(guess, SEARCH_RADIUS), (v) => `${num(v)} yd`, format, target);
    }

    case ElevationFormat.Invalid:
    case ElevationFormat.Default:
    default:
      throw new Error(
        `elevationTypingText: format ${ElevationFormat[format]} (${format}) is not directly typable through the wizard's text field -- pick a different oracle trip/field.`,
      );
  }
}

// ---------------------------------------------------------------------------
// Coordinates -- one axis at a time (search-and-verify against the real
// parseLatitude/parseLongitude), then joined "lat, lng" the way the wizard's
// single combined Coordinates field expects (lib/units/parse-coordinates.ts's
// `parseCoordinates`: comma-split, each side independently parsed).
// ---------------------------------------------------------------------------

function searchCoordinateAxis(
  candidates: readonly number[],
  makeText: (v: number) => string,
  expectedFormat: CoordinatesFormat,
  target: number,
  parseAxis: (text: string) => ParsedCoordinate,
): string {
  for (const v of candidates) {
    const text = makeText(v);
    const parsed = parseAxis(text);
    if (parsed.inputFormat === expectedFormat && Object.is(fround(parsed.totalDegrees), target)) {
      return text;
    }
  }
  throw new RoundTripError(
    `coordinateAxisTypingText: no exact round-trip text found for target=${target} format=${CoordinatesFormat[expectedFormat]} (tried ${candidates.length} candidates)`,
  );
}

/** Formats one axis (latitude OR longitude) back to typable text faithful to
 * its stored `*_input_format`. `kind` only affects which real parser
 * verifies candidates (Latitude.cs/Longitude.cs have distinct digit-width
 * regexes, both already ported in parse-coordinates.ts). */
function coordinateAxisTypingText(
  totalDegreesValue: number,
  format: CoordinatesFormat,
  parseAxis: (text: string) => ParsedCoordinate,
): string {
  const target = fround(totalDegreesValue);

  if (format === CoordinatesFormat.Unspecified) return "";

  const sign = target < 0 ? -1 : 1;
  const abs = Math.abs(target);
  const signStr = sign < 0 ? "-" : "";

  switch (format) {
    case CoordinatesFormat.DecimalDegrees:
      return searchCoordinateAxis(float32Neighbors(abs, SEARCH_RADIUS), (v) => `${signStr}${num(v)}`, format, target, parseAxis);

    case CoordinatesFormat.DegreesDecimalMinutes: {
      const whole = Math.floor(abs);
      const minutesGuess = fround((abs - whole) * 60);
      return searchCoordinateAxis(
        float32Neighbors(minutesGuess, SEARCH_RADIUS),
        (v) => `${signStr}${whole} ${num(v)}`,
        format,
        target,
        parseAxis,
      );
    }

    case CoordinatesFormat.DegreesMinutesDecimalSeconds: {
      const whole = Math.floor(abs);
      const minutesExact = fround((abs - whole) * 60);
      const minutesWhole = Math.floor(minutesExact);
      const secondsGuess = fround((minutesExact - minutesWhole) * 60);
      // The minutes whole-number component can itself be off by one at a
      // rounding boundary (e.g. seconds guess landing at/just past 60) --
      // try the neighboring whole-minutes value too, same defensive pattern
      // as FeetDecimalInches's whole-feet retry above.
      for (const minWhole of [minutesWhole, Math.max(0, minutesWhole - 1), minutesWhole + 1]) {
        try {
          return searchCoordinateAxis(
            float32Neighbors(Math.max(0, secondsGuess), SEARCH_RADIUS),
            (v) => `${signStr}${whole} ${minWhole} ${num(v)}`,
            format,
            target,
            parseAxis,
          );
        } catch (e) {
          if (!(e instanceof RoundTripError)) throw e;
        }
      }
      throw new RoundTripError(`coordinateAxisTypingText: DMS search exhausted for target=${target}`);
    }

    case CoordinatesFormat.Invalid:
    case CoordinatesFormat.Default:
    default:
      throw new Error(
        `coordinateAxisTypingText: format ${CoordinatesFormat[format]} (${format}) is not directly typable through the wizard's text field -- pick a different oracle trip/field.`,
      );
  }
}

/** Combined "lat, lng" text for the wizard's single Coordinates field
 * (Sites step and Trees step both use one text input for both axes,
 * comma-joined -- lib/units/parse-coordinates.ts's `parseCoordinates`).
 * Blank/blank -> "" (both axes Unspecified, matching `parseCoordinates`'s
 * own blank-input short-circuit). */
export function coordinatesTypingText(
  latitude: number,
  latitudeInputFormat: number,
  longitude: number,
  longitudeInputFormat: number,
): string {
  if (latitudeInputFormat === CoordinatesFormat.Unspecified && longitudeInputFormat === CoordinatesFormat.Unspecified) {
    return "";
  }
  const latText = coordinateAxisTypingText(latitude, latitudeInputFormat, parseLatitude);
  const lngText = coordinateAxisTypingText(longitude, longitudeInputFormat, parseLongitude);
  return `${latText}, ${lngText}`;
}
