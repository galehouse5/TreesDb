import { describe, expect, it } from "vitest";
import {
  AGE_CLASS_OPTIONS,
  AGE_TYPE_OPTIONS,
  HEIGHT_MEASUREMENT_METHOD_OPTIONS,
  ImportTreeType,
  MULTI_TRUNK_FORM_OPTIONS,
  STATUS_OPTIONS,
  TERRAIN_OPTIONS,
  TreeAgeClass,
  TreeAgeType,
  TreeFormType,
  TreeHeightMeasurementMethod,
  TreeStatus,
  TreeTerrainType,
  buildTreeStep,
  buildTrunkInput,
  coordinatesToEditableText,
  deriveMultiTrunkNumberOfTrunks,
  distanceToEditableText,
  elevationToEditableText,
  normalizeCommentsField,
  normalizeCommonName,
  normalizeScientificName,
  type TreeStepInput,
  type TrunkInput,
} from "./import-trees";
import { DistanceFormat, ElevationFormat } from "./units/parse";
import { CoordinatesFormat } from "./units/parse-coordinates";

function baseTreeInput(overrides: Partial<TreeStepInput> = {}): TreeStepInput {
  return {
    treeType: ImportTreeType.SingleTrunk,
    commonName: "white oak",
    scientificName: "quercus alba",
    status: TreeStatus.NotSpecified,
    ageClass: TreeAgeClass.NotSpecified,
    ageType: TreeAgeType.NotSpecified,
    age: "",
    height: "",
    heightMeasurementMethod: TreeHeightMeasurementMethod.NotSpecified,
    girth: "",
    combinedGirthNumberOfTrunks: "",
    crownSpread: "",
    elevation: "",
    terrainType: TreeTerrainType.NotSpecified,
    formType: TreeFormType.Multi,
    coordinates: "",
    generalComments: "",
    ...overrides,
  };
}

function baseTrunkInput(overrides: Partial<TrunkInput> = {}): TrunkInput {
  return { girth: "", girthMeasurementHeight: "", height: "", trunkComments: "", ...overrides };
}

describe("enum tables (doc 01 §3)", () => {
  it("TreeStatus codes 0-6", () => {
    expect(STATUS_OPTIONS.map((o) => o.value)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });
  it("TreeAgeClass codes 0-5", () => {
    expect(AGE_CLASS_OPTIONS.map((o) => o.value)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it("TreeAgeType codes 0-3", () => {
    expect(AGE_TYPE_OPTIONS.map((o) => o.value)).toEqual([0, 1, 2, 3]);
  });
  it("TreeHeightMeasurementMethod codes 0-4", () => {
    expect(HEIGHT_MEASUREMENT_METHOD_OPTIONS.map((o) => o.value)).toEqual([0, 1, 2, 3, 4]);
  });
  it("TreeTerrainType codes 0-5", () => {
    expect(TERRAIN_OPTIONS.map((o) => o.value)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it("TreeFormType multi-trunk options exclude Single(1)", () => {
    expect(MULTI_TRUNK_FORM_OPTIONS.map((o) => o.value)).toEqual([0, 2, 3, 4, 5, 6]);
  });
});

describe("normalizeCommonName / normalizeScientificName / normalizeCommentsField", () => {
  it("title-cases common name", () => {
    expect(normalizeCommonName("  white oak  ")).toBe("White Oak");
  });
  it("sentence-cases scientific name", () => {
    expect(normalizeScientificName("QUERCUS ALBA")).toBe("Quercus alba");
    expect(normalizeScientificName("")).toBe("");
  });
  it("trims comments without case conversion", () => {
    expect(normalizeCommentsField("  Some COMMENT  ")).toBe("Some COMMENT");
  });
});

describe("deriveMultiTrunkNumberOfTrunks (MultiTrunkTree.cs:30-45)", () => {
  it("no override, <=1 trunk -> null", () => {
    expect(deriveMultiTrunkNumberOfTrunks(null, 0)).toBeNull();
    expect(deriveMultiTrunkNumberOfTrunks(null, 1)).toBeNull();
  });
  it("no override, >1 trunk -> trunk count", () => {
    expect(deriveMultiTrunkNumberOfTrunks(null, 3)).toBe(3);
  });
  it("override present -> max(override, trunksCount), monotonic", () => {
    expect(deriveMultiTrunkNumberOfTrunks(5, 2)).toBe(5);
    expect(deriveMultiTrunkNumberOfTrunks(2, 5)).toBe(5);
    expect(deriveMultiTrunkNumberOfTrunks(1, 0)).toBe(1);
  });
});

describe("buildTreeStep -- single-trunk", () => {
  it("valid minimal input has no errors, formType forced Single, numberOfTrunks 1", () => {
    const { normalized, requiredErrors } = buildTreeStep(baseTreeInput(), 0);
    expect(requiredErrors).toEqual([]);
    expect(normalized.formType).toBe(TreeFormType.Single);
    expect(normalized.numberOfTrunks).toBe(1);
    expect(normalized.commonName).toBe("White Oak");
  });

  it("blank common name is a required error (TreeBase.cs:103)", () => {
    const { requiredErrors } = buildTreeStep(baseTreeInput({ commonName: "" }), 0);
    expect(requiredErrors).toContainEqual({ field: "commonName", message: "Common name must be specified." });
  });

  it("parses height '12' 6''' to feet + FeetDecimalInches(3) format code", () => {
    const { normalized } = buildTreeStep(baseTreeInput({ height: "12' 6''" }), 0);
    expect(normalized.height.inputFormat).toBe(DistanceFormat.FeetDecimalInches);
    expect(normalized.height.feet).toBeCloseTo(12.5, 5);
  });

  it("unparseable height is Invalid and a required error", () => {
    const { normalized, requiredErrors } = buildTreeStep(baseTreeInput({ height: "not a distance" }), 0);
    expect(normalized.height.inputFormat).toBe(DistanceFormat.Invalid);
    expect(requiredErrors.some((e) => e.field === "height")).toBe(true);
  });

  it("blank height is Unspecified, not an error", () => {
    const { normalized, requiredErrors } = buildTreeStep(baseTreeInput({ height: "" }), 0);
    expect(normalized.height.inputFormat).toBe(DistanceFormat.Unspecified);
    expect(requiredErrors.some((e) => e.field === "height")).toBe(false);
  });

  it("elevation out of 0-17000ft range is a required error (Elevation.cs:24)", () => {
    const { requiredErrors } = buildTreeStep(baseTreeInput({ elevation: "20000" }), 0);
    expect(requiredErrors).toContainEqual({
      field: "elevation",
      message: "Elevation must fall within sea level to 17000 feet.",
    });
  });

  it("coordinates parse and round-trip through combinedInputFormat", () => {
    const { normalized } = buildTreeStep(baseTreeInput({ coordinates: "41.49932, -81.69437" }), 0);
    expect(normalized.coordinates.inputFormat).toBe(CoordinatesFormat.DecimalDegrees);
    expect(normalized.coordinates.isSpecified).toBe(true);
  });

  it("age must be non-negative integer (TreeBase.cs:273)", () => {
    expect(buildTreeStep(baseTreeInput({ age: "-1" }), 0).requiredErrors).toContainEqual({
      field: "age",
      message: "Age must be non-negative.",
    });
    expect(buildTreeStep(baseTreeInput({ age: "10" }), 0).normalized.age).toBe(10);
    expect(buildTreeStep(baseTreeInput({ age: "" }), 0).normalized.age).toBeNull();
  });

  it("optional-tag: coordinates >1 arc-minute from site is a warning, not a required error", () => {
    const { requiredErrors, optionalErrors } = buildTreeStep(baseTreeInput({ coordinates: "41.0, -81.0" }), 0, {
      siteCoordinates: { totalDegreesLat: 42.0, totalDegreesLng: -81.0 },
    });
    expect(requiredErrors.some((e) => e.field === "coordinates")).toBe(false);
    expect(optionalErrors.some((e) => e.field === "coordinates")).toBe(true);
  });

  it("optional-tag: coordinates within 1 arc-minute of site produces no warning", () => {
    const { optionalErrors } = buildTreeStep(baseTreeInput({ coordinates: "41.00001, -81.0" }), 0, {
      siteCoordinates: { totalDegreesLat: 41.0, totalDegreesLng: -81.0 },
    });
    expect(optionalErrors).toEqual([]);
  });
});

describe("buildTreeStep -- multi-trunk", () => {
  it("combinedGirthNumberOfTrunks blank is allowed (no NotNull, only Range -- legacy quirk)", () => {
    const { requiredErrors, normalized } = buildTreeStep(
      baseTreeInput({ treeType: ImportTreeType.MultiTrunk, combinedGirthNumberOfTrunks: "" }),
      3,
    );
    expect(requiredErrors.some((e) => e.field === "combinedGirthNumberOfTrunks" && e.message.includes("positive"))).toBe(
      false,
    );
    expect(normalized.combinedGirthNumberOfTrunks).toBeNull();
  });

  it("combinedGirthNumberOfTrunks <1 is a required error (MultiTrunkTree.cs:64)", () => {
    const { requiredErrors } = buildTreeStep(
      baseTreeInput({ treeType: ImportTreeType.MultiTrunk, combinedGirthNumberOfTrunks: "0" }),
      3,
    );
    expect(requiredErrors).toContainEqual({
      field: "combinedGirthNumberOfTrunks",
      message: "Number of trunks in combined girth must be positive.",
    });
  });

  it("formType Single is rejected for multi-trunk trees (MultiTrunkTree.cs:47)", () => {
    const { requiredErrors } = buildTreeStep(
      baseTreeInput({ treeType: ImportTreeType.MultiTrunk, formType: TreeFormType.Single }),
      3,
    );
    expect(requiredErrors).toContainEqual({ field: "formType", message: "Form type must not be single." });
  });

  it("with 0-1 trunks and no explicit override, numberOfTrunks is null and NOT an error (legacy quirk)", () => {
    const { requiredErrors, normalized } = buildTreeStep(baseTreeInput({ treeType: ImportTreeType.MultiTrunk }), 0);
    expect(normalized.numberOfTrunks).toBeNull();
    expect(requiredErrors.some((e) => e.message.includes("greater than one"))).toBe(false);
  });

  it("with >1 trunks, numberOfTrunks derives from trunk count and passes", () => {
    const { requiredErrors, normalized } = buildTreeStep(baseTreeInput({ treeType: ImportTreeType.MultiTrunk }), 3);
    expect(normalized.numberOfTrunks).toBe(3);
    expect(requiredErrors.some((e) => e.message.includes("greater than one"))).toBe(false);
  });
});

describe("buildTrunkInput (Trunk.cs)", () => {
  it("blank girth and height both fail 'must specify a height or girth'", () => {
    const { errors } = buildTrunkInput(baseTrunkInput());
    expect(errors).toContainEqual({ field: "girth", message: "You must specify a height or girth." });
    expect(errors).toContainEqual({ field: "height", message: "You must specify a height or girth." });
  });

  it("girth alone satisfies the height-or-girth rule", () => {
    const { errors } = buildTrunkInput(baseTrunkInput({ girth: "8.5'" }));
    expect(errors.some((e) => e.message.includes("height or girth"))).toBe(false);
  });

  it("height alone satisfies the height-or-girth rule", () => {
    const { errors } = buildTrunkInput(baseTrunkInput({ height: "60'" }));
    expect(errors.some((e) => e.message.includes("height or girth"))).toBe(false);
  });

  it("unparseable girth is an Invalid-format error", () => {
    const { errors, normalized } = buildTrunkInput(baseTrunkInput({ girth: "garbage" }));
    expect(normalized.girth.inputFormat).toBe(DistanceFormat.Invalid);
    expect(errors.some((e) => e.field === "girth")).toBe(true);
  });

  it("trunk comments over 1000 chars is an error", () => {
    const { errors } = buildTrunkInput(baseTrunkInput({ height: "10'", trunkComments: "x".repeat(1001) }));
    expect(errors).toContainEqual({ field: "trunkComments", message: "Trunk comments must not exceed 1,000 characters." });
  });
});

describe("redisplay round trip", () => {
  it("distanceToEditableText blank for Unspecified/Invalid", () => {
    expect(distanceToEditableText(0, DistanceFormat.Unspecified)).toBe("");
    expect(distanceToEditableText(0, DistanceFormat.Invalid)).toBe("");
  });
  it("distanceToEditableText renders a specified value", () => {
    expect(distanceToEditableText(12.5, DistanceFormat.DecimalFeet)).toBe("12.5'");
  });
  it("elevationToEditableText blank for Unspecified", () => {
    expect(elevationToEditableText(0, ElevationFormat.Unspecified)).toBe("");
  });
  it("elevationToEditableText renders a specified value", () => {
    expect(elevationToEditableText(1000, ElevationFormat.DecimalFeet)).toBe("1000 ft");
  });
  it("coordinatesToEditableText blank when both unspecified", () => {
    expect(coordinatesToEditableText(0, CoordinatesFormat.Unspecified, 0, CoordinatesFormat.Unspecified)).toBe("");
  });
  it("coordinatesToEditableText renders lat, lng", () => {
    expect(coordinatesToEditableText(41.5, CoordinatesFormat.DecimalDegrees, -81.5, CoordinatesFormat.DecimalDegrees)).toBe(
      "41.5, -81.5",
    );
  });
});
