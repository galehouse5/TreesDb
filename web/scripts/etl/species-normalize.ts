/**
 * D-016 (docs/migration/DECISIONS.md): on load, collapses whitespace runs
 * (`\s+` -> single space) in `scientific_name`/`common_name` for `trees`
 * and `tree_measurements` ONLY, and recomputes `computed_measured_species_id`
 * for touched rows from the normalized names via lib/species-hash.ts's
 * `speciesHash` -- the same TS hash port ETL/parity checks use elsewhere
 * (doc 07 §7.1 #5), so the loaded value and any later recomputation can
 * never diverge by construction. `import_trees`/`import_sites` are the
 * historical import log and are out of scope per D-016; `known_species` was
 * already clean and is also out of scope.
 *
 * Targets the same rows as scripts/maintenance/d016-species-whitespace-
 * cleanup.sql's WHERE clause (only rows that still contain a whitespace
 * run), so this is idempotent and a no-op on already-clean data -- but
 * computes the hash via the shared TS function rather than a parallel SQL
 * formula (that maintenance file's own inline SQL formula is kept only
 * because it has to run standalone via psql, with no Node runtime).
 */
import { speciesHash } from "../../lib/species-hash";
import type { SqlExecutor } from "./executor";
import { quoteIdent } from "./load-table";

/** Tables whose scientific_name/common_name are normalized on load. Exactly
 * the D-016 scope -- adding a table here means it opts into normalization,
 * so this list intentionally does NOT include import_trees/import_sites. */
export const SPECIES_NORMALIZED_TABLES = ["trees", "tree_measurements"] as const;
export type SpeciesNormalizedTable = (typeof SPECIES_NORMALIZED_TABLES)[number];

function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ");
}

/**
 * Normalizes whitespace-run rows in `table` and recomputes their
 * `computed_measured_species_id`. Returns the number of rows touched.
 */
export async function normalizeSpeciesWhitespace(
  executor: SqlExecutor,
  table: SpeciesNormalizedTable,
): Promise<number> {
  const t = quoteIdent(table);
  const { rows } = await executor.query<{
    id: number;
    scientific_name: string;
    common_name: string;
  }>(
    `SELECT id, scientific_name, common_name FROM ${t} ` +
      `WHERE scientific_name ~ '\\s\\s' OR common_name ~ '\\s\\s'`,
  );

  for (const row of rows) {
    const scientificName = collapseWhitespace(row.scientific_name);
    const commonName = collapseWhitespace(row.common_name);
    await executor.query(
      `UPDATE ${t} SET scientific_name = $1, common_name = $2, computed_measured_species_id = $3 WHERE id = $4`,
      [scientificName, commonName, speciesHash(scientificName, commonName), row.id],
    );
  }

  return rows.length;
}
