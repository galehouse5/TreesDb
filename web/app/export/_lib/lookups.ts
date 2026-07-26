// Existence/lookup helpers backing the 404 semantics of the `/export/**`
// routes. Legacy checks entity existence via a *separate* repository
// lookup before ever calling `IExportRepository.GetTrees` (ExportController.cs:
// `Repositories.Trees.FindById(id)` / `Repositories.Sites.FindById(id)` /
// `Repositories.Locations.FindStateById(id)`, each returning
// `NotFoundResult` when null) -- this matters because a *site*/*state* that
// exists but has zero matching trees must still export a 200 (header-only)
// CSV, not 404. Only `Export/Trees/{id}` can conflate "entity missing" with
// "GetTrees returned nothing" (a tree is always present in its own
// `GetTrees(treeId: ...)` result), so that route doesn't need a separate
// lookup -- see `route.ts` there.

import { getSql } from "@/db";

export async function siteExists(id: number): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`select 1 from sites where id = ${id} limit 1`;
  return rows.length > 0;
}

/**
 * `State.Code` (State.cs:25-35): `DoubleLetterCode` unless blank, else
 * `TripleLetterCode`. Returns `null` when the state id doesn't exist.
 */
export async function findStateCode(id: number): Promise<string | null> {
  const sql = getSql();
  const rows = await sql<{ code: string }[]>`
    select coalesce(nullif(trim(double_letter_code), ''), triple_letter_code) as code
    from states where id = ${id} limit 1
  `;
  return rows[0]?.code ?? null;
}
