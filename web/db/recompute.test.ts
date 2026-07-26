/**
 * Tests for db/recompute.ts -- port of dbo.UpdateStaleMetrics + the two
 * staleness triggers (CreateObjectsAndTypes.sql:604-685). See recompute.ts's
 * header for the full transcription notes.
 */
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  markSiteStaleForTree,
  markStatesStaleForSite,
  recomputeStaleMetrics,
} from "./recompute";
import {
  createTestDb,
  insertCountry,
  insertSite,
  insertState,
  insertTree,
  pgliteSqlTag,
} from "./queries/test-helpers";
import type { SqlTag } from "./queries/sql-tag";

describe("recomputeStaleMetrics", () => {
  let db: PGlite;
  let sql: SqlTag;
  let stateId: number;
  let staleSite: number;
  let freshSite: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    stateId = await insertState(db, countryId);

    // `are_metrics_stale` defaults to true (schema.ts) -- this site starts
    // stale and has real tree data to recompute from.
    staleSite = await insertSite(db, stateId, { name: "Stale Site" });
    for (const [i, height] of [10, 20, 30, 40, 50].entries()) {
      await insertTree(db, staleSite, {
        scientificName: `Species ${i}`,
        commonName: `Common ${i}`,
        height,
        girth: height * 2,
        lastMeasured: "2022-05-01",
      });
    }

    // This site is explicitly marked NOT stale with sentinel computed
    // values that don't match what a real recompute would produce --
    // recomputeStaleMetrics() must leave it untouched.
    freshSite = await insertSite(db, stateId, { name: "Fresh Site" });
    await insertTree(db, freshSite, {
      scientificName: "Should Not Be Recomputed",
      commonName: "Sentinel",
      height: 999,
    });
    await sql`
      update sites set
        are_metrics_stale = false,
        computed_trees_measured_count = 12345,
        last_metrics_update_timestamp = '2000-01-01T00:00:00Z'
      where id = ${freshSite}
    `;
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  it("recomputes only stale sites/states, clears the flag, and stamps the timestamp", async () => {
    const before = Date.now();
    const result = await recomputeStaleMetrics(sql);
    expect(result.sitesUpdated).toBeGreaterThanOrEqual(1);
    expect(result.statesUpdated).toBeGreaterThanOrEqual(1);

    const [staleRow] = await sql<{
      are_metrics_stale: boolean;
      computed_rhi5: number | null;
      computed_trees_measured_count: number;
      last_metrics_update_timestamp: string;
    }>`
      select are_metrics_stale, computed_rhi5, computed_trees_measured_count, last_metrics_update_timestamp
      from sites where id = ${staleSite}
    `;
    expect(staleRow!.are_metrics_stale).toBe(false);
    // 5 distinct species -> RHI5 = avg(10,20,30,40,50) = 30.
    expect(staleRow!.computed_rhi5).toBeCloseTo(30, 5);
    expect(staleRow!.computed_trees_measured_count).toBe(5);
    expect(new Date(staleRow!.last_metrics_update_timestamp).getTime()).toBeGreaterThanOrEqual(
      before - 1000,
    );

    const [freshRow] = await sql<{
      are_metrics_stale: boolean;
      computed_trees_measured_count: number;
      last_metrics_update_timestamp: string;
    }>`
      select are_metrics_stale, computed_trees_measured_count, last_metrics_update_timestamp
      from sites where id = ${freshSite}
    `;
    // Untouched: the sentinel values prove recompute skipped this row.
    expect(freshRow!.are_metrics_stale).toBe(false);
    expect(freshRow!.computed_trees_measured_count).toBe(12345);
    expect(new Date(freshRow!.last_metrics_update_timestamp).toISOString()).toBe(
      "2000-01-01T00:00:00.000Z",
    );

    const [stateRow] = await sql<{
      are_metrics_stale: boolean;
      computed_trees_measured_count: number;
    }>`select are_metrics_stale, computed_trees_measured_count from states where id = ${stateId}`;
    expect(stateRow!.are_metrics_stale).toBe(false);
    expect(stateRow!.computed_trees_measured_count).toBe(6);
  });

  it("is idempotent -- running again with nothing stale updates nothing", async () => {
    const result = await recomputeStaleMetrics(sql);
    expect(result.sitesUpdated).toBe(0);
    expect(result.statesUpdated).toBe(0);
  });
});

describe("markSiteStaleForTree / markStatesStaleForSite (trigger port)", () => {
  let db: PGlite;
  let sql: SqlTag;
  let stateId: number;
  let siteA: number;
  let siteB: number;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
    const countryId = await insertCountry(db);
    stateId = await insertState(db, countryId);
    siteA = await insertSite(db, stateId, { name: "A" });
    siteB = await insertSite(db, stateId, { name: "B" });
    // Clear the flags set by the schema default so the tests below observe
    // a real true/false transition rather than "already true".
    await sql`update sites set are_metrics_stale = false where id in (${siteA}, ${siteB})`;
    await sql`update states set are_metrics_stale = false where id = ${stateId}`;
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  it("markSiteStaleForTree flags exactly the given site id(s), matching Trees.FlagStaleMetrics_Trees's inserted/deleted union", async () => {
    await markSiteStaleForTree(siteA, sql);
    const [a] = await sql<{ are_metrics_stale: boolean }>`select are_metrics_stale from sites where id = ${siteA}`;
    const [b] = await sql<{ are_metrics_stale: boolean }>`select are_metrics_stale from sites where id = ${siteB}`;
    expect(a!.are_metrics_stale).toBe(true);
    expect(b!.are_metrics_stale).toBe(false);

    // A tree moving between sites flags BOTH the old and new site (the
    // trigger's `inserted.SiteId OR deleted.SiteId`).
    await markSiteStaleForTree([siteA, siteB], sql);
    const [a2] = await sql<{ are_metrics_stale: boolean }>`select are_metrics_stale from sites where id = ${siteA}`;
    const [b2] = await sql<{ are_metrics_stale: boolean }>`select are_metrics_stale from sites where id = ${siteB}`;
    expect(a2!.are_metrics_stale).toBe(true);
    expect(b2!.are_metrics_stale).toBe(true);
  });

  it("markStatesStaleForSite flags the given state id(s)", async () => {
    await markStatesStaleForSite(stateId, sql);
    const [state] = await sql<{ are_metrics_stale: boolean }>`select are_metrics_stale from states where id = ${stateId}`;
    expect(state!.are_metrics_stale).toBe(true);
  });
});
