import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { attemptLogin } from "./auth-flow";
import { ensurePreviewTestUser, isPreviewTestLoginEnabled, PREVIEW_TEST_EMAIL } from "./preview-login";
import { createTestDb, pgliteSqlTag } from "@/db/queries/test-helpers";
import type { SqlTag } from "@/db/queries/sql-tag";

describe("isPreviewTestLoginEnabled", () => {
  it("is on only for a Vercel preview with the flag set to 1", () => {
    expect(isPreviewTestLoginEnabled({ VERCEL_ENV: "preview", PREVIEW_TEST_LOGIN: "1" })).toBe(true);
  });

  it("refuses in production even with the flag set", () => {
    expect(isPreviewTestLoginEnabled({ VERCEL_ENV: "production", PREVIEW_TEST_LOGIN: "1" })).toBe(false);
  });

  it("refuses locally, in CI and in development", () => {
    expect(isPreviewTestLoginEnabled({ PREVIEW_TEST_LOGIN: "1" })).toBe(false);
    expect(isPreviewTestLoginEnabled({ VERCEL_ENV: "development", PREVIEW_TEST_LOGIN: "1" })).toBe(false);
  });

  it("refuses a preview without the flag, or with any value other than 1", () => {
    expect(isPreviewTestLoginEnabled({ VERCEL_ENV: "preview" })).toBe(false);
    expect(isPreviewTestLoginEnabled({ VERCEL_ENV: "preview", PREVIEW_TEST_LOGIN: "true" })).toBe(false);
    expect(isPreviewTestLoginEnabled({ VERCEL_ENV: "preview", PREVIEW_TEST_LOGIN: "" })).toBe(false);
  });
});

describe("ensurePreviewTestUser", () => {
  let db: PGlite;
  let sql: SqlTag;

  beforeAll(async () => {
    db = await createTestDb();
    sql = pgliteSqlTag(db);
  });

  afterAll(async () => {
    await db.close();
  });

  it("creates the test account once, with the import and export roles", async () => {
    const first = await ensurePreviewTestUser(sql);
    const second = await ensurePreviewTestUser(sql);
    expect(second.id).toBe(first.id);
    expect(first.email).toBe(PREVIEW_TEST_EMAIL);
    expect(first.roles).toEqual(["import", "export"]);
    const rows = await sql<{ n: number }>`select count(*)::int as n from users where email = ${PREVIEW_TEST_EMAIL}`;
    expect(rows[0]!.n).toBe(1);
  });

  it("can't be signed in to through the password form", async () => {
    await ensurePreviewTestUser(sql);
    for (const guess of ["", "password", "preview", PREVIEW_TEST_EMAIL]) {
      const result = await attemptLogin(PREVIEW_TEST_EMAIL, guess || " ", new Date(), sql);
      expect(result.ok).toBe(false);
    }
  });
});
