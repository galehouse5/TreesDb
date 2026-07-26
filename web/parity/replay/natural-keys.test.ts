import { describe, expect, it } from "vitest";
import { diffRow, filterByExactSiteProximity, matchMultiset, normalizeValue, rowSignature, siteIdentityKey, treeIdentityKey } from "./natural-keys";

describe("normalizeValue", () => {
  it("renders a UTC-midnight Date as its calendar date, ignoring local timezone", () => {
    expect(normalizeValue(new Date(Date.UTC(2020, 5, 15)))).toBe("2020-06-15");
  });

  it("frounds numbers and unifies -0/0", () => {
    expect(normalizeValue(1.1)).toBe(Math.fround(1.1));
    expect(normalizeValue(-0)).toBe(0);
  });

  it("passes through strings/booleans/null unchanged", () => {
    expect(normalizeValue("abc")).toBe("abc");
    expect(normalizeValue(true)).toBe(true);
    expect(normalizeValue(null)).toBe(null);
  });
});

describe("diffRow", () => {
  it("finds no diffs on identical rows", () => {
    const row = { id: 1, name: "Oak", height: 10.5 };
    expect(diffRow(row, { ...row, id: 2 }, new Set(["id"]))).toEqual([]);
  });

  it("reports a field-level mismatch", () => {
    const pre = { id: 1, name: "Oak", height: 10.5 };
    const post = { id: 2, name: "Oak", height: 11.0 };
    expect(diffRow(pre, post, new Set(["id"]))).toEqual([{ field: "height", expected: 10.5, actual: 11 }]);
  });

  it("treats float32-equal-but-float64-different values as equal (the whole point of fround comparison)", () => {
    // 0.1 + 0.2 !== 0.3 in float64, but both round-trip through float32 identically here.
    const pre = { girth: Math.fround(3.3) };
    const post = { girth: Math.fround(3.3) + Number.EPSILON };
    expect(diffRow(pre, post, new Set())).toEqual([]);
  });

  it("distinguishes null from a real value", () => {
    expect(diffRow({ entspts: null }, { entspts: 5 }, new Set())).toEqual([{ field: "entspts", expected: null, actual: 5 }]);
  });
});

describe("siteIdentityKey / treeIdentityKey", () => {
  it("is case-insensitive on name/county", () => {
    const a = { name: "Big Oak Park", state_id: 5, county: "Franklin", calculated_latitude: 39.1, calculated_longitude: -84.5 };
    const b = { name: "BIG OAK PARK", state_id: 5, county: "FRANKLIN", calculated_latitude: 39.1, calculated_longitude: -84.5 };
    expect(siteIdentityKey(a)).toBe(siteIdentityKey(b));
  });

  it("distinguishes different states even with the same name/county", () => {
    const a = { name: "Big Oak Park", state_id: 5, county: "Franklin", calculated_latitude: 39.1, calculated_longitude: -84.5 };
    const b = { name: "Big Oak Park", state_id: 6, county: "Franklin", calculated_latitude: 39.1, calculated_longitude: -84.5 };
    expect(siteIdentityKey(a)).not.toBe(siteIdentityKey(b));
  });

  it("does NOT conflate two distinct same-name/county/state sites that are geographically far apart (regression: two real 'Pennypack Park, Philadelphia' sites 40+ miles apart, found in the task investigation -- shouldMergeSite correctly keeps them distinct, and the harness must too)", () => {
    const philly1 = { name: "Pennypack Park", state_id: 36, county: "Philadelphia", calculated_latitude: 0, calculated_longitude: 0 };
    const philly2 = { name: "Pennypack Park", state_id: 36, county: "Philadelphia", calculated_latitude: 40.0503, calculated_longitude: -75.03538 };
    expect(siteIdentityKey(philly1)).not.toBe(siteIdentityKey(philly2));
  });

  it("tolerates float32-recompute-level coordinate noise between a pre- and post-reimport snapshot of the SAME site (far finer than the 25-arcminute merge threshold)", () => {
    const pre = { name: "Sand Run", state_id: 33, county: "Summit", calculated_latitude: 41.133056640625, calculated_longitude: -81.5 };
    const post = { name: "Sand Run", state_id: 33, county: "Summit", calculated_latitude: 41.13304901123047, calculated_longitude: -81.5 };
    expect(siteIdentityKey(pre)).toBe(siteIdentityKey(post));
  });

  it("tree identity survives id churn but distinguishes a coordinate difference (doc 01 §10: exact float32 equality, no epsilon)", () => {
    const a = { id: 1, common_name: "White Oak", scientific_name: "Quercus alba", latitude: 39.1, longitude: -84.5 };
    const b = { id: 999, common_name: "white oak", scientific_name: "QUERCUS ALBA", latitude: 39.1, longitude: -84.5 };
    // Smallest float32 step above 39.1 -- confirms the key is built from the
    // *frounded* coordinate, not a coarser/rounded comparison.
    const nextFloat32 = Math.fround(39.1) + 2 ** -18;
    expect(Math.fround(nextFloat32)).not.toBe(Math.fround(39.1));
    const c = { id: 2, common_name: "White Oak", scientific_name: "Quercus alba", latitude: nextFloat32, longitude: -84.5 };
    expect(treeIdentityKey(a)).toBe(treeIdentityKey(b));
    expect(treeIdentityKey(a)).not.toBe(treeIdentityKey(c));
  });
});

describe("filterByExactSiteProximity", () => {
  it("excludes a candidate that passes an axis-aligned bounding box but exceeds the true circular 25' distance (regression: two real 'Brecksville Reservation, Cuyahoga County, OH' sites, found in the task investigation)", () => {
    const reference = { latitude: 41.289, longitude: -81.57322 };
    const near = { calculated_latitude: 41.289, calculated_longitude: -81.57322 }; // the site itself
    const farButInBox = { calculated_latitude: 41.70482, calculated_longitude: -81.7787 }; // ~0.4158/~0.2055 degree axis deltas -- inside a ~0.4167-degree-per-axis box, but ~29.9' true distance
    const result = filterByExactSiteProximity([near, farButInBox], reference.latitude, reference.longitude);
    expect(result).toEqual([near]);
  });

  it("keeps a candidate genuinely within 25' of the reference point", () => {
    const reference = { latitude: 41.289, longitude: -81.57322 };
    const close = { calculated_latitude: 41.2895, calculated_longitude: -81.5735 };
    expect(filterByExactSiteProximity([close], reference.latitude, reference.longitude)).toEqual([close]);
  });
});

describe("matchMultiset", () => {
  it("pairs identical rows by content signature even when order differs", () => {
    const pre = [{ id: 1, measured: "2020-01-01", height: 10 }, { id: 2, measured: "2020-02-01", height: 20 }];
    const post = [{ id: 20, measured: "2020-02-01", height: 20 }, { id: 10, measured: "2020-01-01", height: 10 }];
    const key = (r: (typeof pre)[number]) => r.measured;
    const sig = (r: (typeof pre)[number]) => JSON.stringify([r.measured, r.height]);
    const result = matchMultiset(pre, post, key, sig);
    expect(result.pairs).toHaveLength(2);
    expect(result.missing).toHaveLength(0);
    expect(result.extra).toHaveLength(0);
    // matched by content, not array position
    expect(result.pairs.find((p) => p.pre.id === 1)?.post.id).toBe(10);
  });

  it("reports a genuinely new row as extra and a vanished row as missing", () => {
    const pre = [{ measured: "2020-01-01", height: 10 }];
    const post = [{ measured: "2020-01-01", height: 10 }, { measured: "2020-03-01", height: 30 }];
    const key = (r: (typeof pre)[number]) => r.measured;
    const sig = (r: (typeof pre)[number]) => JSON.stringify([r.measured, r.height]);
    const result = matchMultiset(pre, post, key, sig);
    expect(result.pairs).toHaveLength(1);
    expect(result.missing).toHaveLength(0);
    expect(result.extra).toEqual([{ measured: "2020-03-01", height: 30 }]);
  });

  it("falls back to positional pairing within a coarse-key bucket when signatures differ (surfaces a field-level diff instead of a blind missing+extra pair)", () => {
    // Same date bucket, but content actually changed -- this is the "same
    // measurement, one field mutated" case discussed in differ.ts's header.
    const pre = [{ measured: "2020-01-01", height: 10 }];
    const post = [{ measured: "2020-01-01", height: 99 }];
    const key = (r: (typeof pre)[number]) => r.measured;
    const sig = (r: (typeof pre)[number]) => JSON.stringify([r.measured, r.height]);
    const result = matchMultiset(pre, post, key, sig);
    expect(result.pairs).toEqual([{ pre: pre[0], post: post[0] }]);
    expect(result.missing).toHaveLength(0);
    expect(result.extra).toHaveLength(0);
  });

  it("handles multiple same-key candidates (e.g. several unspecified-coordinate trees) by exact-signature greedy matching", () => {
    const pre = [
      { id: 1, key: "k", sig: "a" },
      { id: 2, key: "k", sig: "b" },
    ];
    const post = [
      { id: 20, key: "k", sig: "b" },
      { id: 10, key: "k", sig: "a" },
    ];
    const result = matchMultiset(pre, post, (r) => r.key, (r) => r.sig);
    expect(result.pairs).toHaveLength(2);
    expect(result.pairs.find((p) => p.pre.id === 1)?.post.id).toBe(10);
    expect(result.pairs.find((p) => p.pre.id === 2)?.post.id).toBe(20);
  });
});

describe("rowSignature", () => {
  it("is stable regardless of key insertion order and excludes listed fields", () => {
    const a = { b: 1, a: 2, id: 99 };
    const b = { a: 2, id: 100, b: 1 };
    expect(rowSignature(a, new Set(["id"]))).toBe(rowSignature(b, new Set(["id"])));
  });

  it("changes when a non-excluded field differs", () => {
    expect(rowSignature({ a: 1 }, new Set())).not.toBe(rowSignature({ a: 2 }, new Set()));
  });
});
