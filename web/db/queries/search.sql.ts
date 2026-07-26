/**
 * Port of dbo.SearchMeasuredSpecies / dbo.SearchSites / dbo.SearchStates
 * (Tmd.Migrations/Scripts/CreateObjectsAndTypes.sql:310-387) -- task P0-05,
 * doc 02 §P0-05, doc 01 §4, D-010.
 *
 * Every TVF returns only `(Id, Rank)` -- callers (e.g.
 * TMD.Infrastructure/Repositories/SiteRepository.cs:119-129,
 * `SearchSites`) join back to the full entity table themselves:
 *   select site.* from dbo.SearchSites(:expression) rank
 *   join Sites.Sites site on site.Id = rank.Id
 *   order by rank.Rank desc
 * This port mirrors that split: these functions return only the natural
 * key + rank (species has no exposed id per D-003, so `(scientificName,
 * commonName)` stands in for `Id`); joining back to full rows is left to
 * the caller/repository layer, matching the legacy structure and staying
 * out of this task's scope.
 *
 * Ordering: `SiteRepository.cs:119` orders `rank.Rank desc` only -- no
 * secondary key anywhere in the SQL or the one C# caller inspected. Ties
 * were therefore physical/unspecified order in legacy, same situation as
 * the metrics TOP-N tie note in metrics.sql.ts, except here a rank tie can
 * genuinely hold DIFFERENT underlying rows (unlike the metrics case, a
 * `Rank` tie doesn't imply the tied rows are otherwise identical). This
 * port adds `id asc` (resp. `scientific_name asc, common_name asc`) as an
 * explicit, documented, deterministic secondary sort -- an intentional
 * choice, not a reproduction of any legacy guarantee (there wasn't one).
 *
 * D-010 (search LIKE metacharacters NOT escaped): every `%`/`_` in `term`
 * is preserved verbatim in the pattern strings built below (`term + '%'`,
 * `'%' + term'`, `'%' + term + '%'`) and passed as ordinary bound
 * parameters -- bound parameters prevent SQL injection but do NOT change
 * how ILIKE interprets `%`/`_` *within* the bound pattern value, so a term
 * like `50%` still matches as "50" + wildcard, exactly reproducing SQL
 * Server's unescaped `LIKE @expression + '%'` behavior.
 *
 * `SearchStates`' code-match flags use SQL `=`, not `LIKE`
 * (CreateObjectsAndTypes.sql:380-381,384-385:
 * `case DoubleLetterCode when @expression then 2 else 0 end` /
 * `... or DoubleLetterCode = @expression`) -- under SQL Server's default
 * case-insensitive collation this is a case-insensitive EXACT match, with
 * NO wildcard behavior (unlike the `LIKE` flags). This port replicates
 * that with `lower(code) = lower(term)`, not `ILIKE` -- using ILIKE here
 * would incorrectly let `%`/`_` in `term` act as wildcards against the
 * code columns, which legacy's `=` comparison never did.
 */
import { type SqlTag, defaultSql } from "./sql-tag";

export interface SearchSiteResult {
  id: number;
  rank: number;
}

export interface SearchStateResult {
  id: number;
  rank: number;
}

export interface SearchMeasuredSpeciesResult {
  scientificName: string;
  commonName: string;
  rank: number;
}

/** Port of `dbo.SearchSites` (CreateObjectsAndTypes.sql:339-358). */
export async function searchSites(
  term: string,
  sql: SqlTag = defaultSql(),
): Promise<SearchSiteResult[]> {
  const prefix = `${term}%`;
  const suffix = `%${term}`;
  const contains = `%${term}%`;
  return sql<SearchSiteResult>`
    select
      s.id as id,
      (
        (case when s.name ilike ${prefix} then 1 else 0 end)
        + (case when s.name ilike ${suffix} then 1 else 0 end)
        + (case when s.name ilike ${contains} then 1 else 0 end)
        + (case when s.county ilike ${prefix} then 1 else 0 end)
        + (case when s.county ilike ${suffix} then 1 else 0 end)
        + (case when s.county ilike ${contains} then 1 else 0 end)
      )::int as rank
    from sites s
    where s.name ilike ${contains} or s.county ilike ${contains}
    order by rank desc, s.id asc
  `;
}

/** Port of `dbo.SearchStates` (CreateObjectsAndTypes.sql:368-387). */
// SQL Server equality on char/varchar uses ANSI-padding semantics: the
// shorter operand is space-padded before comparing, so trailing spaces are
// ignored ('ND' = 'nd ' is TRUE) while leading spaces still mismatch.
// Discovered via production parity: corpus term "nd " ranked North Dakota
// (code match, +2) in the legacy dump but not in this port. rtrim on BOTH
// sides replicates it exactly (production data itself contains a
// whitespace-only triple_letter_code, state id 26). LIKE flags are
// unaffected -- SQL Server LIKE does not pad.
export async function searchStates(
  term: string,
  sql: SqlTag = defaultSql(),
): Promise<SearchStateResult[]> {
  const prefix = `${term}%`;
  const suffix = `%${term}`;
  const contains = `%${term}%`;
  return sql<SearchStateResult>`
    select
      st.id as id,
      (
        (case when st.name ilike ${prefix} then 1 else 0 end)
        + (case when st.name ilike ${suffix} then 1 else 0 end)
        + (case when st.name ilike ${contains} then 1 else 0 end)
        + (case when lower(rtrim(st.double_letter_code)) = lower(rtrim(${term})) then 2 else 0 end)
        + (case when lower(rtrim(st.triple_letter_code)) = lower(rtrim(${term})) then 2 else 0 end)
      )::int as rank
    from states st
    where st.name ilike ${contains}
      or lower(rtrim(st.double_letter_code)) = lower(rtrim(${term}))
      or lower(rtrim(st.triple_letter_code)) = lower(rtrim(${term}))
    order by rank desc, st.id asc
  `;
}

/** Port of `dbo.SearchMeasuredSpecies` (CreateObjectsAndTypes.sql:310-329). */
export async function searchMeasuredSpecies(
  term: string,
  sql: SqlTag = defaultSql(),
): Promise<SearchMeasuredSpeciesResult[]> {
  const prefix = `${term}%`;
  const suffix = `%${term}`;
  const contains = `%${term}%`;
  const rows = await sql<{ scientific_name: string; common_name: string; rank: number }>`
    with species as (
      select distinct scientific_name, common_name from trees
    )
    select
      scientific_name,
      common_name,
      (
        (case when scientific_name ilike ${prefix} then 1 else 0 end)
        + (case when scientific_name ilike ${suffix} then 1 else 0 end)
        + (case when scientific_name ilike ${contains} then 1 else 0 end)
        + (case when common_name ilike ${prefix} then 1 else 0 end)
        + (case when common_name ilike ${suffix} then 1 else 0 end)
        + (case when common_name ilike ${contains} then 1 else 0 end)
      )::int as rank
    from species
    where scientific_name ilike ${contains} or common_name ilike ${contains}
    order by rank desc, scientific_name asc, common_name asc
  `;
  return rows.map((r) => ({
    scientificName: r.scientific_name,
    commonName: r.common_name,
    rank: r.rank,
  }));
}
