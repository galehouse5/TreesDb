// Real 404 for a missing site id. The page's loading.tsx streams a
// skeleton before the page's own queries finish, which would turn a
// notFound() there into a 200; this layout renders before that boundary
// (see db/queries/exists.sql.ts).
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { parseDetailId, siteExists } from "@/db/queries/exists.sql";

export default async function SiteLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const siteId = parseDetailId(id);
  if (siteId === null || !(await siteExists(siteId))) notFound();
  return children;
}
