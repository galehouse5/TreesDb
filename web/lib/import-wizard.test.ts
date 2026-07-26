/**
 * P3-03 lib/import-wizard.ts tests (pure, doc 05 §P3-03, doc 01 §10).
 */
import { describe, expect, it } from "vitest";
import {
  buildTripStep,
  deriveMeasurers,
  normalizeTripName,
  normalizeTrimOnly,
  parseFormalName,
  toFormalName,
  type TripStepInput,
} from "./import-wizard";

function baseInput(overrides: Partial<TripStepInput> = {}): TripStepInput {
  return {
    name: "spring survey",
    date: "2026-04-01",
    measurerContactInfo: "email me",
    makeMeasurerContactInfoPublic: true,
    firstMeasurer: "Doe, John",
    secondMeasurer: "",
    thirdMeasurer: "",
    website: "",
    ...overrides,
  };
}

describe("import-wizard", () => {
  describe("parseFormalName (Name.CreateFromFormalName)", () => {
    it("parses Lastname, Firstname into title-cased parts", () => {
      expect(parseFormalName("doe, john")).toEqual({ firstName: "John", lastName: "Doe" });
    });

    it("returns Name.Null() for blank input", () => {
      expect(parseFormalName("")).toEqual({ firstName: "", lastName: "" });
      expect(parseFormalName("   ")).toEqual({ firstName: "", lastName: "" });
    });

    it("returns Name.Null() when there is no comma", () => {
      expect(parseFormalName("JustOneWord")).toEqual({ firstName: "", lastName: "" });
    });

    it("drops text after a second comma (legacy Split(',') quirk)", () => {
      // parts = ["Doe", " John", " Extra"]; only parts[0]/parts[1] are used.
      expect(parseFormalName("Doe, John, Extra")).toEqual({ firstName: "John", lastName: "Doe" });
    });

    it("produces an invalid (blank-first-name) Name for a trailing comma", () => {
      expect(parseFormalName("John,")).toEqual({ firstName: "", lastName: "John" });
    });
  });

  describe("toFormalName", () => {
    it("formats as Lastname, Firstname when both halves are present", () => {
      expect(toFormalName({ firstName: "John", lastName: "Doe" })).toBe("Doe, John");
    });

    it("is blank unless both halves are specified", () => {
      expect(toFormalName({ firstName: "John", lastName: "" })).toBe("");
      expect(toFormalName({ firstName: "", lastName: "Doe" })).toBe("");
      expect(toFormalName({ firstName: "", lastName: "" })).toBe("");
    });
  });

  describe("deriveMeasurers (ImportMapping.cs AfterMap)", () => {
    it("returns zero slots when all three fields are blank", () => {
      expect(deriveMeasurers("", "", "")).toEqual([]);
    });

    it("returns exactly one slot when only First is filled", () => {
      expect(deriveMeasurers("Doe, John", "", "")).toEqual([{ firstName: "John", lastName: "Doe" }]);
    });

    it("trailing blanks truncate: a filled First with blank Second/Third yields 1 slot", () => {
      const result = deriveMeasurers("Doe, John", "", "");
      expect(result).toHaveLength(1);
    });

    it("a filled Third with a blank Second still yields 3 slots, with slot 1 invalid/blank", () => {
      const result = deriveMeasurers("Doe, John", "", "Lee, Amy");
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ firstName: "John", lastName: "Doe" });
      expect(result[1]).toEqual({ firstName: "", lastName: "" }); // Name.Null() from blank Second
      expect(result[2]).toEqual({ firstName: "Amy", lastName: "Lee" });
    });

    it("all three filled yields 3 ordered slots", () => {
      const result = deriveMeasurers("Doe, John", "Roe, Jane", "Lee, Amy");
      expect(result).toEqual([
        { firstName: "John", lastName: "Doe" },
        { firstName: "Jane", lastName: "Roe" },
        { firstName: "Amy", lastName: "Lee" },
      ]);
    });
  });

  describe("normalizeTripName / normalizeTrimOnly (Trip.cs setters)", () => {
    it("title-cases and trims the trip name", () => {
      expect(normalizeTripName("  spring survey  ")).toBe("Spring Survey");
    });

    it("trims other free-text fields without title-casing", () => {
      expect(normalizeTrimOnly("  Call ANYTIME  ")).toBe("Call ANYTIME");
    });
  });

  describe("buildTripStep validation (Trip.cs Required-tagged attributes)", () => {
    it("accepts a fully-valid submission with no errors", () => {
      const { errors, normalized } = buildTripStep(baseInput());
      expect(errors).toEqual([]);
      expect(normalized.name).toBe("Spring Survey");
      expect(normalized.date).toBe("2026-04-01");
      expect(normalized.measurers).toEqual([{ firstName: "John", lastName: "Doe" }]);
    });

    it("requires a trip name", () => {
      const { errors } = buildTripStep(baseInput({ name: "  " }));
      expect(errors).toContainEqual({ field: "name", message: "Trip name must be specified." });
    });

    it("rejects a trip name over 100 characters (post-title-case)", () => {
      const { errors } = buildTripStep(baseInput({ name: "a".repeat(101) }));
      expect(errors).toContainEqual({
        field: "name",
        message: "Trip name must not exceed 100 characters.",
      });
    });

    it("requires a date", () => {
      const { errors } = buildTripStep(baseInput({ date: "" }));
      expect(errors).toContainEqual({ field: "date", message: "Trip date must be specified." });
    });

    it("requires measurer contact info", () => {
      const { errors } = buildTripStep(baseInput({ measurerContactInfo: "   " }));
      expect(errors).toContainEqual({
        field: "measurerContactInfo",
        message: "Measurer contact must be specified for this trip.",
      });
    });

    it("rejects measurer contact info over 200 characters", () => {
      const { errors } = buildTripStep(baseInput({ measurerContactInfo: "a".repeat(201) }));
      expect(errors).toContainEqual({
        field: "measurerContactInfo",
        message: "Trip measurer contact info must not exceed 200 characters.",
      });
    });

    it("website has no required check, only a length ceiling", () => {
      const { errors: emptyErrors } = buildTripStep(baseInput({ website: "" }));
      expect(emptyErrors.find((e) => e.field === "website")).toBeUndefined();

      const { errors: longErrors } = buildTripStep(baseInput({ website: "a".repeat(101) }));
      expect(longErrors).toContainEqual({
        field: "website",
        message: "Trip website must not exceed 100 characters.",
      });
    });

    it("requires at least one measurer, attributed to firstMeasurer", () => {
      const { errors } = buildTripStep(baseInput({ firstMeasurer: "", secondMeasurer: "", thirdMeasurer: "" }));
      expect(errors).toContainEqual({ field: "firstMeasurer", message: "Name must be specified." });
    });

    it("rejects an unparseable measurer name with the Lastname, Firstname message", () => {
      const { errors } = buildTripStep(baseInput({ firstMeasurer: "NotAFormalName" }));
      expect(errors).toContainEqual({
        field: "firstMeasurer",
        message: "Name must be in Lastname, Firstname format.",
      });
    });

    it("flags the blank middle slot when Third is filled but Second is blank", () => {
      const { errors } = buildTripStep(
        baseInput({ firstMeasurer: "Doe, John", secondMeasurer: "", thirdMeasurer: "Lee, Amy" }),
      );
      expect(errors).toContainEqual({
        field: "secondMeasurer",
        message: "Name must be in Lastname, Firstname format.",
      });
      expect(errors.find((e) => e.field === "firstMeasurer")).toBeUndefined();
      expect(errors.find((e) => e.field === "thirdMeasurer")).toBeUndefined();
    });

    it("collects every applicable error at once (no short-circuit)", () => {
      const { errors } = buildTripStep(
        baseInput({
          name: "",
          date: "",
          measurerContactInfo: "",
          firstMeasurer: "",
          secondMeasurer: "",
          thirdMeasurer: "",
        }),
      );
      const fields = errors.map((e) => e.field).sort();
      expect(fields).toEqual(["date", "firstMeasurer", "measurerContactInfo", "name"].sort());
    });
  });
});
