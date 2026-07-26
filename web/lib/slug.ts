// D-011 species slug helper.
//
// Doc: docs/migration/03-phase1-readonly.md (URL-equivalence table:
// `/species/{slug}` replaces legacy
// `/Browse/Species/{botanicalName} ({commonName})/Details`; species-slug
// spec paragraph directly below that table).
//
// slugify(s)                       = lowercase, spaces -> '-', strip
//                                     everything not in [a-z0-9-].
// speciesSlug(botanical, common)   = slugify(botanical) + '--' + slugify(common)
//
// NOTE on parseSpeciesSlug: there is deliberately no inverse function here.
// The transform is lossy -- case, punctuation, and non-ASCII characters are
// all discarded -- and the '--' separator is itself ambiguous whenever a
// slugified name contains a run of hyphens (e.g. from stripped punctuation
// adjacent to a space) or starts/ends with one. Recovering
// (botanicalName, commonName) from a slug string alone is therefore not
// possible in general. Callers that need to resolve a slug back to a
// species must look it up against the known (botanicalName, commonName)
// pairs -- re-derive each candidate's slug with `speciesSlug` and compare,
// don't parse the slug text. ETL parity separately checks that `slugify`
// is injective over the real production (bn, cn) pairs (doc 03: "collision
// -> fail loudly, decide then").

/**
 * Lossy, URL-safe slug: lowercase, whitespace runs to a single hyphen,
 * then strip every character outside `[a-z0-9-]`.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * D-011: the `/species/{slug}` path segment identifying a species by its
 * botanical + common name pair. Forward-only -- see the module note above
 * for why there is no `parseSpeciesSlug`.
 */
export function speciesSlug(botanicalName: string, commonName: string): string {
  return `${slugify(botanicalName)}--${slugify(commonName)}`;
}
