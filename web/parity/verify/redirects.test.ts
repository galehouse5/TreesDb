import { describe, expect, it } from "vitest";
import { compareRedirect } from "./redirects";

describe("compareRedirect", () => {
  it("passes when status matches and Location maps via the confirmed route mapping", () => {
    const result = compareRedirect("/", { status: 302, location: "/Map" }, { status: 302, location: "/map" });
    expect(result.diffs).toEqual([]);
    expect(result.checksRun).toBe(2);
  });

  it("fails on a status mismatch", () => {
    const result = compareRedirect("/", { status: 302, location: "/Map" }, { status: 308, location: "/map" });
    expect(result.diffs.some((d) => d.field === "status")).toBe(true);
  });

  it("fails when Location is not route-equivalent", () => {
    const result = compareRedirect("/", { status: 302, location: "/Map" }, { status: 302, location: "/somewhere-else" });
    expect(result.diffs.some((d) => d.field === "location")).toBe(true);
  });

  it("both-null Location is fine (no redirect on either side)", () => {
    const result = compareRedirect("/NotFound", { status: 404, location: null }, { status: 404, location: null });
    expect(result.diffs).toEqual([]);
  });

  it("falls back to verbatim string comparison for a Location shape not in the URL-equivalence table", () => {
    const result = compareRedirect("/Main", { status: 302, location: "/Unmapped/Path" }, { status: 302, location: "/Unmapped/Path" });
    expect(result.diffs).toEqual([]);
    const mismatch = compareRedirect("/Main", { status: 302, location: "/Unmapped/Path" }, { status: 302, location: "/Other" });
    expect(mismatch.diffs.some((d) => d.field === "location")).toBe(true);
  });
});
