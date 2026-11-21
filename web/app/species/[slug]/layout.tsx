// Real 404 for an unknown species slug. The page's loading.tsx streams a
// skeleton before the page's queries finish, which would turn a notFound()
// there into a 200; this layout renders before that boundary (see
// db/queries/exists.sql.ts). The resolution is cached per request, so the
// page reuses it.
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { resolveSpeciesSlugCached } from "./resolve";

export default async function SpeciesLayout({ children, params }: { children: ReactNode; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!(await resolveSpeciesSlugCached(slug))) notFound();
  return children;
}
