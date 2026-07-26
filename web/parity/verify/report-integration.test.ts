/**
 * Demonstrates verify.ts's categories feeding the SHARED report writer/
 * waiver parser from `web/parity/data/` (doc 07 §1 deliverable: reuse, not
 * fork) - waiver bucketing (doc §9: "a waiver never turns a check green
 * silently" - waived diffs are counted separately from pass/fail) and
 * legacy-error bucketing (doc §5: 404/500 legacy artifacts are collected
 * without ever being fetched/compared).
 */
import { describe, expect, it } from "vitest";
import { buildReport } from "../data/report";
import { parseWaivers } from "../data/waivers";
import { compareExport } from "./exports";
import { partitionByLegacyStatus } from "./manifest";

describe("waiver bucketing", () => {
  it("buckets a waived diff separately from pass/fail, keeping fail=0", () => {
    const legacy = { body: 'Id,Name\r\n"1","Oak"\r\n', contentDisposition: 'attachment; filename="Site 436 (Feet).csv"' };
    const nextGood = { ...legacy };
    const nextBadFilename = { ...legacy, contentDisposition: 'attachment; filename="Site 436 (Meters).csv"' };

    const good = compareExport("/Export/Sites/436", legacy, nextGood);
    const bad = compareExport("/Export/Sites/437", legacy, nextBadFilename);

    const waivers = parseWaivers(`
## W-900: test-only filename waiver
- Category / artifacts affected: \`exports\`
- Field(s): \`content-disposition-filename\`
- Legacy behavior / new behavior: n/a (test fixture)
- Reason: n/a
- Comparator rule: n/a
- Approved by: test
`);
    const summary = buildReport({
      category: "exports",
      checksRun: good.checksRun + bad.checksRun,
      diffs: [...good.diffs, ...bad.diffs],
      waivers,
    });

    expect(summary.fail).toBe(0);
    expect(summary.waived).toBe(1);
    expect(summary.waivedDiffs[0]!.waiverId).toBe("W-900");
  });

  it("a diff not covered by any waiver's category/field still fails", () => {
    const legacy = { body: "a\r\n", contentDisposition: null };
    const next = { body: "b\r\n", contentDisposition: null };
    const { diffs, checksRun } = compareExport("/Export/Sites/1", legacy, next);

    const waivers = parseWaivers(`
## W-901: unrelated waiver (wrong category)
- Category / artifacts affected: \`markers\`
- Field(s): \`InfoLoaderUrl\`
- Legacy behavior / new behavior: n/a
- Reason: n/a
- Comparator rule: n/a
- Approved by: test
`);
    const summary = buildReport({ category: "exports", checksRun, diffs, waivers });
    expect(summary.fail).toBe(1);
    expect(summary.waived).toBe(0);
  });
});

describe("legacy-error bucketing", () => {
  it("separates legacy-error (status >= 400) manifest entries from ones eligible for fetch/compare", () => {
    const manifestEntries = [
      { url: "/Export/Trees/1", status: 200 },
      { url: "/Export/Trees/2", status: 404 },
      { url: "/Export/Trees/3", status: 500 },
    ];
    const { ok, legacyErrors } = partitionByLegacyStatus(manifestEntries);
    expect(ok.map((e) => e.url)).toEqual(["/Export/Trees/1"]);
    expect(legacyErrors.map((e) => e.url)).toEqual(["/Export/Trees/2", "/Export/Trees/3"]);
  });
});
