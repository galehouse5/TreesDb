import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Diff } from "./comparator";
import { parseWaivers, type Waiver } from "./waivers";
import { buildReport, writeReport } from "./report";

const WAIVER_MD = `# waivers

## W-999: synthetic test waiver
- Category / artifacts affected: \`data\`
- Field(s): flaky_field
- Legacy behavior / new behavior: n/a
- Reason: test fixture
- Comparator rule: waived
- Approved by: test
`;

describe("buildReport", () => {
  const waivers: Waiver[] = parseWaivers(WAIVER_MD);

  it("computes pass = checksRun - fail - waived", () => {
    const diffs: Diff[] = [
      { kind: "field", table: "trees", field: "height", message: "mismatch" },
      { kind: "field", table: "trees", field: "flaky_field", message: "waived one" },
    ];
    const summary = buildReport({ category: "data", checksRun: 10, diffs, waivers, now: () => new Date("2024-01-01T00:00:00Z") });
    expect(summary.fail).toBe(1);
    expect(summary.waived).toBe(1);
    expect(summary.pass).toBe(8);
    expect(summary.generatedAt).toBe("2024-01-01T00:00:00.000Z");
  });

  it("never lets a waived diff disappear silently - it's still listed, just in its own bucket", () => {
    const diffs: Diff[] = [{ kind: "field", table: "trees", field: "flaky_field", message: "waived one" }];
    const summary = buildReport({ category: "data", checksRun: 5, diffs, waivers });
    expect(summary.diffs).toHaveLength(0);
    expect(summary.waivedDiffs).toHaveLength(1);
    expect(summary.waivedDiffs[0]!.waiverId).toBe("W-999");
  });

  it("caps both diff lists at 50", () => {
    const diffs: Diff[] = Array.from({ length: 120 }, (_, i) => ({
      kind: "field" as const,
      table: "trees",
      field: `f${i}`,
      message: `diff ${i}`,
    }));
    const summary = buildReport({ category: "data", checksRun: 1000, diffs, waivers });
    expect(summary.diffs).toHaveLength(50);
  });

  it("redacts non-aggregate diffs for PII-listed tables (users)", () => {
    const diffs: Diff[] = [
      { kind: "field", table: "users", id: 42, field: "email", expected: "a@b.com", actual: "c@d.com", message: "mismatch" },
      { kind: "pk-missing", table: "users", expected: [1, 2, 3], message: "missing ids" },
      { kind: "row-count", table: "users", expected: 10, actual: 9, message: "count mismatch" },
      { kind: "aggregate", table: "users", field: "password_length", expected: 8, actual: 7, message: "agg mismatch" },
    ];
    const summary = buildReport({ category: "data", checksRun: 4, diffs, waivers, redactTables: ["users"] });
    const fieldDiff = summary.diffs.find((d) => d.kind === "field");
    const pkDiff = summary.diffs.find((d) => d.kind === "pk-missing");
    const rowCountDiff = summary.diffs.find((d) => d.kind === "row-count");
    const aggDiff = summary.diffs.find((d) => d.kind === "aggregate");

    // Row-count and aggregate diffs pass through untouched - they carry no PII.
    expect(rowCountDiff).toEqual(diffs[2]);
    expect(aggDiff).toEqual(diffs[3]);

    // Field and PK diffs are redacted: no id/field/expected/actual leak into the report.
    expect(fieldDiff!.id).toBeUndefined();
    expect(fieldDiff!.field).toBeUndefined();
    expect(fieldDiff!.expected).toBeUndefined();
    expect(fieldDiff!.actual).toBeUndefined();
    expect(JSON.stringify(fieldDiff)).not.toContain("@");
    expect(pkDiff!.expected).toBeUndefined();
  });
});

describe("writeReport", () => {
  let dir: string;

  beforeEach(async () => {
    dir = await mkdtemp(path.join(tmpdir(), "parity-report-test-"));
  });

  afterEach(async () => {
    await rm(dir, { recursive: true, force: true });
  });

  it("writes both a JSON report and a Markdown summary, named by category and date", async () => {
    const summary = buildReport({
      category: "data",
      checksRun: 3,
      diffs: [{ kind: "field", table: "trees", field: "height", message: "mismatch" }],
      waivers: [],
      now: () => new Date("2024-03-15T12:00:00Z"),
    });
    const { jsonPath, mdPath } = await writeReport(dir, summary);
    expect(path.basename(jsonPath)).toBe("data-2024-03-15.json");
    expect(path.basename(mdPath)).toBe("data-2024-03-15.md");

    const json = JSON.parse(await readFile(jsonPath, "utf-8"));
    expect(json.pass).toBe(2);
    expect(json.fail).toBe(1);

    const md = await readFile(mdPath, "utf-8");
    expect(md).toContain("# Parity report: data");
    expect(md).toContain("trees");
  });
});
