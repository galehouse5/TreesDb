import { describe, expect, it } from "vitest";
import { applyFilterAndLimit, inferUnitsPreference, partitionByLegacyStatus } from "./manifest";

describe("partitionByLegacyStatus", () => {
  it("buckets legacy 404/500 (and other >=400) entries separately, leaving 2xx/3xx to be compared", () => {
    const entries = [{ status: 200 }, { status: 404 }, { status: 500 }, { status: 302 }, { status: 403 }];
    const { ok, legacyErrors } = partitionByLegacyStatus(entries);
    expect(ok).toEqual([{ status: 200 }, { status: 302 }]);
    expect(legacyErrors).toEqual([{ status: 404 }, { status: 500 }, { status: 403 }]);
  });
});

describe("applyFilterAndLimit", () => {
  const entries = [{ url: "/a/1" }, { url: "/a/2" }, { url: "/b/1" }];

  it("filters by substring match against url", () => {
    expect(applyFilterAndLimit(entries, "/a/")).toEqual([{ url: "/a/1" }, { url: "/a/2" }]);
  });

  it("applies limit after filtering", () => {
    expect(applyFilterAndLimit(entries, "/a/", 1)).toEqual([{ url: "/a/1" }]);
  });

  it("is a no-op with neither filter nor limit", () => {
    expect(applyFilterAndLimit(entries)).toEqual(entries);
  });
});

describe("inferUnitsPreference", () => {
  it("recovers Meters/Yards from the savePathBase suffix convention", () => {
    expect(inferUnitsPreference("Browse/Trees/164406/Details--Meters")).toBe("Meters");
    expect(inferUnitsPreference("Browse/Trees/164406/Details--Yards")).toBe("Yards");
  });

  it("returns undefined (implicit Feet) when there is no units suffix", () => {
    expect(inferUnitsPreference("Browse/Trees/164406/Details")).toBeUndefined();
  });
});
