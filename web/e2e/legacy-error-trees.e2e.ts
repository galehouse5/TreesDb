// D-018/D-019/D-021 regression: the six trees whose pages legacy has
// answered with HTTP 500 (NHibernate ObjectNotFoundException on a missing
// GlobalMeasuredSpecies row) since 2016. Each has an older measurement
// recorded under a species name that no tree carries any more:
//   - legacy species 1790989718 = Carya alba / Mockernut Hickory (W-107 rename)
//   - legacy species 1344794096 = Quercus prinus / Chestnut Oak (W-107 rename)
//   - legacy species 555512959 = Quecus montana / Chestnut Oak (a misspelling)
//
// Visited the way the alerts were triggered, through the legacy URL, which
// must redirect to the new page and render it: no error page, and a TDI3 row
// for every measurement. Needs the migrated production data and the dev
// server, like the rest of this suite (see README.md); a tree missing from
// the database being run against is skipped, not failed.
import { expect, test } from "@playwright/test";

const LEGACY_ERROR_TREES: { treeId: number; legacySpeciesId: number }[] = [
  { treeId: 18629, legacySpeciesId: 1790989718 },
  { treeId: 16010, legacySpeciesId: 1790989718 },
  { treeId: 40619, legacySpeciesId: 1790989718 },
  { treeId: 128081, legacySpeciesId: 1344794096 },
  { treeId: 40163, legacySpeciesId: 1344794096 },
  { treeId: 134862, legacySpeciesId: 555512959 },
];

test.describe("trees whose legacy page 500s (missing species row)", () => {
  for (const { treeId, legacySpeciesId } of LEGACY_ERROR_TREES) {
    test(`tree ${treeId} (legacy species ${legacySpeciesId}) renders from its legacy URL`, async ({ page, request }) => {
      const direct = await request.get(`/trees/${treeId}`, { maxRedirects: 0 });
      test.skip(direct.status() === 404, `tree ${treeId} is not in this database`);
      expect(direct.status()).toBe(200);

      const response = await page.goto(`/Browse/Trees/${treeId}/Details`);
      expect(response?.status()).toBe(200);
      expect(new URL(page.url()).pathname).toBe(`/trees/${treeId}`);

      // One TDI3 row for the tree summary plus one per measurement.
      const tdi3Rows = page.getByText("TDI3", { exact: true });
      await expect(tdi3Rows.first()).toBeVisible();
      expect(await tdi3Rows.count()).toBeGreaterThan(1);
    });
  }
});
