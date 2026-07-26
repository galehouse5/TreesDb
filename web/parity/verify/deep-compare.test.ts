import { describe, expect, it } from "vitest";
import { countLeaves, deepCompareJson, diffJson, pathnameOnly } from "./deep-compare";

describe("deepCompareJson", () => {
  it("treats float32-equal numbers as equal even when float64-distinct", () => {
    expect(diffJson({ height: 123.456 }, { height: Math.fround(123.456) })).toEqual([]);
  });

  it("reports a numeric mismatch beyond float32 precision", () => {
    const diffs = diffJson({ height: 100 }, { height: 100.5 });
    expect(diffs).toHaveLength(1);
    expect(diffs[0]!.path).toBe("height");
  });

  it("is key-order-insensitive for objects", () => {
    expect(diffJson({ a: 1, b: 2 }, { b: 2, a: 1 })).toEqual([]);
  });

  it("reports a key present on only one side", () => {
    const diffs = diffJson({ a: 1 }, { a: 1, b: 2 });
    expect(diffs).toHaveLength(1);
    expect(diffs[0]!.path).toBe("b");
  });

  it("compares strings verbatim by default (formatted-string parity)", () => {
    expect(diffJson({ height: "123.5'" }, { height: "123.5 ft" })).toHaveLength(1);
    expect(diffJson({ height: "123.5'" }, { height: "123.5'" })).toEqual([]);
  });

  it("compares href-like fields via URL-equivalence instead of strict equality", () => {
    expect(
      diffJson({ href: "/Browse/Trees/4242/Details" }, { href: "/trees/4242" }),
    ).toEqual([]);
    expect(diffJson({ href: "/Browse/Trees/4242/Details" }, { href: "/trees/9999" })).toHaveLength(1);
  });

  it("compares icon/thumbnail-like fields by pathname only, ignoring query strings", () => {
    expect(
      diffJson({ IconUrl: "/images/icons/Site32.png?v=2" }, { IconUrl: "/images/icons/Site32.png" }),
    ).toEqual([]);
    expect(
      diffJson({ IconUrl: "/images/icons/Site32.png" }, { IconUrl: "/images/icons/Tree32.png" }),
    ).toHaveLength(1);
  });

  it("recurses into nested objects and arrays, reporting a path-qualified diff", () => {
    const diffs = diffJson(
      { measurements: [{ heading: "Measured on 2018", details: { Height: "10.0'" } }] },
      { measurements: [{ heading: "Measured on 2018", details: { Height: "11.0'" } }] },
    );
    expect(diffs).toHaveLength(1);
    expect(diffs[0]!.path).toBe("measurements[0].details.Height");
  });

  it("reports array length mismatches plus per-index diffs for the overlapping prefix", () => {
    const diffs = diffJson({ photos: [1, 2, 3] }, { photos: [1, 2] });
    expect(diffs.some((d) => d.path === "photos")).toBe(true);
  });

  it("treats null and undefined as equally 'missing' on either side", () => {
    expect(diffJson({ state: null }, { state: undefined })).toEqual([]);
    expect(diffJson({ state: { text: "Ohio", href: "/x" } }, { state: null })).toHaveLength(1);
  });
});

describe("pathnameOnly", () => {
  it("strips query string and origin", () => {
    expect(pathnameOnly("https://example.com/images/icons/Site32.png?v=2")).toBe("/images/icons/Site32.png");
    expect(pathnameOnly("/images/icons/Site32.png?v=2")).toBe("/images/icons/Site32.png");
  });
});

describe("countLeaves", () => {
  it("counts scalar leaves recursively", () => {
    expect(countLeaves({ a: 1, b: { c: 2, d: 3 } })).toBe(3);
  });

  it("counts empty containers/null as one leaf", () => {
    expect(countLeaves(null)).toBe(1);
    expect(countLeaves({})).toBe(1);
    expect(countLeaves([])).toBe(1);
  });
});
