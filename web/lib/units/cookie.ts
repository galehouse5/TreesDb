// Units-preference cookie helper.
//
// Source of truth for semantics: `TMD/Extensions/CookieExtensions.cs`
// (`Keys.UnitsPreference = "unitsPreference"`, `GetUnitsPreference`,
// `SetUnitsPreference`) and `TMD/Controllers/MainController.cs:22-27`
// (`SetUnits` action). Doc: docs/migration/01-system-reference.md §7.
//
// Contract preserved exactly (D-006): cookie name `unitsPreference`, value
// is the `Units` enum NAME (`Default|Feet|Meters|Yards`, not a number),
// path `/`, 10-year expiry, absent/unparseable -> `Units.Default`. Legacy
// sets this as a plain (non-HttpOnly) cookie since nothing server-only
// depends on it and the value only ever drives client-visible formatting;
// this file lives outside `web/lib/slug.ts` as a documented exception to
// the P1-01 file-ownership rule (task brief explicitly calls it out).
//
// This module is imported both by the route handler (`app/api/units/route.ts`,
// which owns writing the cookie) and by server components that need to read
// the current preference (e.g. `app/layout.tsx`).

import { Units } from "./format";

export const UNITS_COOKIE_NAME = "unitsPreference";

/** `DateTime.Now.AddYears(10)` (CookieExtensions.cs:30), expressed as maxAge seconds. */
export const UNITS_COOKIE_MAX_AGE_SECONDS = 315360000; // 10 * 365 * 24 * 60 * 60

const UNITS_NAME_TO_ENUM: Record<string, Units> = {
  Default: Units.Default,
  Feet: Units.Feet,
  Meters: Units.Meters,
  Yards: Units.Yards,
};

/** The four valid cookie values / POST `units` form values, in enum declaration order. */
export const UNITS_NAMES = ["Default", "Feet", "Meters", "Yards"] as const;
export type UnitsName = (typeof UNITS_NAMES)[number];

export function isValidUnitsName(value: string): value is UnitsName {
  return Object.prototype.hasOwnProperty.call(UNITS_NAME_TO_ENUM, value);
}

/** Reverse of `isValidUnitsName` lookup -- `Units.Meters` -> `"Meters"`. */
export function unitsToName(units: Units): UnitsName {
  return (Units[units] as UnitsName | undefined) ?? "Default";
}

/**
 * Minimal shape both `next/headers` `cookies()` (ReadonlyRequestCookies) and
 * `NextRequest.cookies` satisfy -- kept structural so this helper doesn't
 * import Next's internal cookie types.
 */
export interface CookieReader {
  get(name: string): { value: string } | undefined;
}

/**
 * Mirrors `CookieExtensions.GetUnitsPreference` (CookieExtensions.cs:18-25):
 * cookie absent, or present but not one of the four enum names, -> Default.
 */
export function readUnitsPreference(cookieStore: CookieReader): Units {
  const raw = cookieStore.get(UNITS_COOKIE_NAME)?.value;
  if (raw !== undefined && isValidUnitsName(raw)) {
    return UNITS_NAME_TO_ENUM[raw];
  }
  return Units.Default;
}
