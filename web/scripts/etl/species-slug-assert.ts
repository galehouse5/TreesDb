/**
 * D-011 (docs/migration/DECISIONS.md; doc 03 §"Species slug"): the
 * `/species/{slug}` URL segment is `speciesSlug(scientificName,
 * commonName)` (lib/slug.ts), so it must be injective over every distinct
 * (scientific_name, common_name) pair the ETL actually loaded into `trees`.
 * "collision -> fail loudly, decide then" (doc 03) -- this throws rather
 * than silently picking a winner or waiving the collision.
 *
 * Intended to run after the D-016 normalization step (species-normalize.ts)
 * so it observes the post-cleanup pairs -- D-016 exists precisely because 3
 * whitespace-run duplicates collided under this exact check before that
 * cleanup was applied.
 */
import { speciesSlug } from "../../lib/slug";
import type { SqlExecutor } from "./executor";

interface SpeciesPair {
  scientific_name: string;
  common_name: string;
}

/**
 * Throws if `speciesSlug` is not injective over the distinct
 * (scientific_name, common_name) pairs currently in `trees`. The error
 * message lists every colliding slug and the pairs that produced it.
 */
export async function assertSpeciesSlugUniqueness(
  executor: SqlExecutor,
): Promise<void> {
  const { rows } = await executor.query<SpeciesPair>(
    `SELECT DISTINCT scientific_name, common_name FROM trees`,
  );

  const bySlug = new Map<string, SpeciesPair[]>();
  for (const pair of rows) {
    const slug = speciesSlug(pair.scientific_name, pair.common_name);
    const bucket = bySlug.get(slug);
    if (bucket) bucket.push(pair);
    else bySlug.set(slug, [pair]);
  }

  const collisions = [...bySlug.entries()].filter(([, pairs]) => pairs.length > 1);
  if (collisions.length === 0) return;

  const detail = collisions
    .map(([slug, pairs]) => {
      const pairList = pairs
        .map((p) => `(${p.scientific_name}, ${p.common_name})`)
        .join(" vs ");
      return `  "${slug}": ${pairList}`;
    })
    .join("\n");
  throw new Error(
    `D-011 species slug collision(s): speciesSlug is not injective over the ` +
      `distinct (scientific_name, common_name) pairs loaded into trees:\n${detail}`,
  );
}
