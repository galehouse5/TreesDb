import { cache } from "react";
import { resolveSpeciesSlug } from "@/db/queries/species-state-details.sql";

/** One slug resolution per request, shared by layout.tsx, generateMetadata and page.tsx. */
export const resolveSpeciesSlugCached = cache(resolveSpeciesSlug);
