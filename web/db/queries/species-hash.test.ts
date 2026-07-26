import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  speciesHashSql,
  siteScopedSpeciesHashSql,
  stateScopedSpeciesHashSql,
} from "./species-hash.sql";
import { createTestDb, pgliteSqlTagAsciiOnly } from "./test-helpers";
import type { SqlTag } from "./sql-tag";

// Vectors cross-checked against web/lib/species-hash.ts's already-verified
// TS twin (same task-independent source: CreateObjectsAndTypes.sql
// L30-33/108-113/193-198) and against a standalone PGlite run during
// implementation. See species-hash.sql.ts's header for the `convert_to(...,
// 'LATIN1')` / PGlite divergence this suite works around via
// pgliteSqlTagAsciiOnly (a test-transport-only adapter; the production SQL
// is unmodified).
describe("species-hash.sql", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTagAsciiOnly(db);
  }, 30000);

  afterAll(async () => {
    await db.close();
  });

  describe("speciesHashSql", () => {
    it("('Quercus alba', 'White Oak') -> 279197145", async () => {
      expect(await speciesHashSql("Quercus alba", "White Oak", sql)).toBe(279197145);
    });

    it("is insensitive to case and surrounding whitespace", async () => {
      expect(
        await speciesHashSql("  QUERCUS ALBA  ", "  white oak  ", sql),
      ).toBe(279197145);
    });
  });

  describe("siteScopedSpeciesHashSql", () => {
    it("('Quercus alba', 'White Oak', site 1) -> 211723370", async () => {
      expect(
        await siteScopedSpeciesHashSql("Quercus alba", "White Oak", 1, sql),
      ).toBe(211723370);
    });

    it("('Quercus alba', 'White Oak', site 42) -> 1756923817", async () => {
      expect(
        await siteScopedSpeciesHashSql("Quercus alba", "White Oak", 42, sql),
      ).toBe(1756923817);
    });

    it("differs from the unscoped hash", async () => {
      const unscoped = await speciesHashSql("Quercus alba", "White Oak", sql);
      const scoped = await siteScopedSpeciesHashSql(
        "Quercus alba",
        "White Oak",
        1,
        sql,
      );
      expect(scoped).not.toBe(unscoped);
    });
  });

  describe("stateScopedSpeciesHashSql", () => {
    it("('Quercus alba', 'White Oak', state 1) -> 971367711", async () => {
      expect(
        await stateScopedSpeciesHashSql("Quercus alba", "White Oak", 1, sql),
      ).toBe(971367711);
    });

    it("('Quercus alba', 'White Oak', state 35) -> 1470424418", async () => {
      expect(
        await stateScopedSpeciesHashSql("Quercus alba", "White Oak", 35, sql),
      ).toBe(1470424418);
    });

    it("differs from the site-scoped hash for the same numeric id", async () => {
      const site = await siteScopedSpeciesHashSql("Quercus alba", "White Oak", 1, sql);
      const state = await stateScopedSpeciesHashSql("Quercus alba", "White Oak", 1, sql);
      expect(state).not.toBe(site);
    });
  });
});
