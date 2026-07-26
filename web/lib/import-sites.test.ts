/**
 * P3-04 lib/import-sites.ts tests (pure, doc 05 §P3-04, doc 01 §10).
 */
import { describe, expect, it } from "vitest";
import {
  buildSiteStep,
  formatStoredCoordinates,
  normalizeCounty,
  normalizeOwnershipType,
  normalizeSiteName,
  siteToStepInput,
  validateSiteOptional,
  type SiteStepInput,
} from "./import-sites";
import { CoordinatesFormat } from "./units/parse-coordinates";

function baseInput(overrides: Partial<SiteStepInput> = {}): SiteStepInput {
  return {
    name: "north grove",
    coordinates: "",
    stateId: 1,
    county: "cuyahoga",
    ownershipType: "city park",
    ownershipContactInfo: "",
    makeOwnershipContactInfoPublic: true,
    comments: "",
    ...overrides,
  };
}

describe("import-sites", () => {
  describe("normalizeSiteName / normalizeCounty (title-case + trim)", () => {
    it("title-cases and trims", () => {
      expect(normalizeSiteName("  north  grove ")).toBe("North  Grove");
      expect(normalizeCounty("cuyahoga")).toBe("Cuyahoga");
    });
  });

  describe("normalizeOwnershipType (trim only, NOT title-cased)", () => {
    it("trims without changing case", () => {
      expect(normalizeOwnershipType("  city PARK  ")).toBe("city PARK");
    });
  });

  describe("buildSiteStep required-tag validation", () => {
    it("accepts a fully valid input with blank (unspecified) coordinates", () => {
      const { normalized, errors } = buildSiteStep(baseInput());
      expect(errors).toEqual([]);
      expect(normalized.name).toBe("North Grove");
      expect(normalized.isSpecified).toBe(false);
      expect(normalized.latitudeInputFormat).toBe(CoordinatesFormat.Unspecified);
      expect(normalized.longitudeInputFormat).toBe(CoordinatesFormat.Unspecified);
    });

    it("requires a name", () => {
      const { errors } = buildSiteStep(baseInput({ name: "" }));
      expect(errors).toContainEqual({ field: "name", message: "Site name must be specified." });
    });

    it("rejects a name over 100 characters", () => {
      const { errors } = buildSiteStep(baseInput({ name: "x".repeat(101) }));
      expect(errors).toContainEqual({
        field: "name",
        message: "Site name must not exceed 100 characters.",
      });
    });

    it("requires a state", () => {
      const { errors } = buildSiteStep(baseInput({ stateId: null }));
      expect(errors).toContainEqual({ field: "stateId", message: "Site state must be specified." });
    });

    it("requires a county", () => {
      const { errors } = buildSiteStep(baseInput({ county: "   " }));
      expect(errors).toContainEqual({ field: "county", message: "Site county must be specified." });
    });

    it("requires an ownership type", () => {
      const { errors } = buildSiteStep(baseInput({ ownershipType: "" }));
      expect(errors).toContainEqual({
        field: "ownershipType",
        message: "Site ownership type name must be specified.",
      });
    });

    it("allows blank ownership contact info (Length-only constraint)", () => {
      const { errors } = buildSiteStep(baseInput({ ownershipContactInfo: "" }));
      expect(errors.filter((e) => e.field === "ownershipContactInfo")).toEqual([]);
    });

    it("rejects ownership contact info over 200 characters", () => {
      const { errors } = buildSiteStep(baseInput({ ownershipContactInfo: "x".repeat(201) }));
      expect(errors).toContainEqual({
        field: "ownershipContactInfo",
        message: "Site ownership contact info must not exceed 200 characters.",
      });
    });

    it("allows blank comments and rejects comments over 1000 characters", () => {
      expect(buildSiteStep(baseInput({ comments: "" })).errors.filter((e) => e.field === "comments")).toEqual([]);
      const { errors } = buildSiteStep(baseInput({ comments: "x".repeat(1001) }));
      expect(errors).toContainEqual({
        field: "comments",
        message: "Site comments must not exceed 1,000 characters.",
      });
    });

    it("does not require Trees or Photos (out of this task's scope)", () => {
      // buildSiteStep has no concept of trees/photos at all -- this test
      // just documents that a site with zero trees validates cleanly,
      // unlike a literal port of Site.Validate(Required) would.
      const { errors } = buildSiteStep(baseInput());
      expect(errors).toEqual([]);
    });

    it("accepts valid DDM coordinates", () => {
      const { normalized, errors } = buildSiteStep(baseInput({ coordinates: "41 29.959, -81 41.662" }));
      expect(errors).toEqual([]);
      expect(normalized.isSpecified).toBe(true);
      expect(normalized.latitudeInputFormat).toBe(CoordinatesFormat.DegreesDecimalMinutes);
      expect(normalized.longitudeInputFormat).toBe(CoordinatesFormat.DegreesDecimalMinutes);
      expect(normalized.latitude).toBeCloseTo(41.49932, 5);
      expect(normalized.longitude).toBeCloseTo(-81.69437, 5);
    });

    it("rejects malformed coordinate text with a format error attributed to 'coordinates'", () => {
      const { errors } = buildSiteStep(baseInput({ coordinates: "not a coordinate, also not one" }));
      expect(errors).toContainEqual({
        field: "coordinates",
        message: "Latitude must be in dd_mm_ss.s, dd_mm.mmm, or dd.ddddd format.",
      });
      expect(errors).toContainEqual({
        field: "coordinates",
        message: "Longitude must be in ddd_mm_ss.s, ddd_mm.mmm, or ddd.ddddd format.",
      });
    });

    it("rejects an out-of-range latitude", () => {
      const { errors } = buildSiteStep(baseInput({ coordinates: "95 30, -81 41.662" }));
      expect(errors).toContainEqual({
        field: "coordinates",
        message: "Latitude must be in the range of -90 to +90 degrees.",
      });
    });

    it("rejects an out-of-range longitude", () => {
      const { errors } = buildSiteStep(baseInput({ coordinates: "41 29.959, 185 0" }));
      expect(errors).toContainEqual({
        field: "coordinates",
        message: "Longitude must be in the range of -180 to +180 degrees.",
      });
    });
  });

  describe("validateSiteOptional (Site.OptionalValidate, state-bounds warning)", () => {
    const ohioBounds = { neLatitude: 42, neLongitude: -80.5, swLatitude: 38, swLongitude: -84.8 };

    it("is clean when coordinates are unspecified", () => {
      const { normalized } = buildSiteStep(baseInput());
      expect(validateSiteOptional(normalized, ohioBounds)).toEqual([]);
    });

    it("is clean when specified coordinates fall inside the state's bounds", () => {
      const { normalized } = buildSiteStep(baseInput({ coordinates: "41 29.959, -81 41.662" }));
      expect(validateSiteOptional(normalized, ohioBounds)).toEqual([]);
    });

    it("warns (non-blocking) when specified coordinates fall outside the state's bounds", () => {
      const { normalized } = buildSiteStep(baseInput({ coordinates: "50 0, -81 41.662" }));
      expect(validateSiteOptional(normalized, ohioBounds)).toEqual([
        {
          field: "coordinates",
          message:
            "(Optional) Coordinates appear to fall outside the state's boundaries.  You might want to double check them.",
        },
      ]);
    });
  });

  describe("siteToStepInput (persisted row -> SiteStepInput round trip)", () => {
    it("round-trips a freshly-created (blank/unspecified) site as required-invalid", () => {
      const input = siteToStepInput({
        name: "",
        latitude: 0,
        latitudeInputFormat: CoordinatesFormat.Unspecified,
        longitude: 0,
        longitudeInputFormat: CoordinatesFormat.Unspecified,
        stateId: null,
        county: "",
        ownershipType: "",
        ownershipContactInfo: "",
        makeOwnershipContactInfoPublic: true,
        comments: "",
      });
      expect(input.coordinates).toBe("");
      const { errors } = buildSiteStep(input);
      expect(errors.length).toBeGreaterThan(0); // name/state/county/ownershipType all blank
    });

    it("round-trips a fully-populated saved site as required-valid", () => {
      const input = siteToStepInput({
        name: "North Grove",
        latitude: 41.49932,
        latitudeInputFormat: CoordinatesFormat.DecimalDegrees,
        longitude: -81.69437,
        longitudeInputFormat: CoordinatesFormat.DecimalDegrees,
        stateId: 7,
        county: "Cuyahoga",
        ownershipType: "City Park",
        ownershipContactInfo: "",
        makeOwnershipContactInfoPublic: true,
        comments: "",
      });
      expect(input.coordinates).toBe("41.49932, -081.69437");
      const { errors } = buildSiteStep(input);
      expect(errors).toEqual([]);
    });
  });

  describe("formatStoredCoordinates (Coordinates.ToString(), own-format-per-axis round trip)", () => {
    it("renders blank for an unspecified coordinate pair", () => {
      expect(formatStoredCoordinates(0, CoordinatesFormat.Unspecified, 0, CoordinatesFormat.Unspecified)).toBe("");
    });

    it("round-trips DDM-formatted stored values", () => {
      const { normalized } = buildSiteStep(baseInput({ coordinates: "41 29.959, -81 41.662" }));
      const text = formatStoredCoordinates(
        normalized.latitude,
        normalized.latitudeInputFormat,
        normalized.longitude,
        normalized.longitudeInputFormat,
      );
      // Longitude pads its whole-degrees component to 3 digits
      // (`formatCoordinate`'s `intDigits` -- max magnitude 180), so "-81"
      // round-trips as "-081", not fewer digits.
      expect(text).toBe("41 29.959, -081 41.662");
    });

    it("round-trips decimal-degrees-formatted stored values", () => {
      const { normalized } = buildSiteStep(baseInput({ coordinates: "41.49932, -81.69437" }));
      const text = formatStoredCoordinates(
        normalized.latitude,
        normalized.latitudeInputFormat,
        normalized.longitude,
        normalized.longitudeInputFormat,
      );
      expect(text).toBe("41.49932, -081.69437");
    });

    it("renders each axis independently in ITS OWN stored format", () => {
      // Latitude typed as DDM, longitude typed as decimal degrees -- both
      // parse individually valid, so buildSiteStep accepts them even
      // though the two axes carry different formats.
      const { normalized } = buildSiteStep(baseInput({ coordinates: "41 29.959, -81.69437" }));
      expect(normalized.latitudeInputFormat).toBe(CoordinatesFormat.DegreesDecimalMinutes);
      expect(normalized.longitudeInputFormat).toBe(CoordinatesFormat.DecimalDegrees);
      const text = formatStoredCoordinates(
        normalized.latitude,
        normalized.latitudeInputFormat,
        normalized.longitude,
        normalized.longitudeInputFormat,
      );
      expect(text).toBe("41 29.959, -081.69437");
    });
  });
});
