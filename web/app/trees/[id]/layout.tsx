// Real 404 for a missing tree id. The page's loading.tsx streams a
// skeleton before the page's own queries finish, which would turn a
// notFound() there into a 200; this layout renders before that boundary
// (see db/queries/exists.sql.ts).
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { parseDetailId, treeExists } from "@/db/queries/exists.sql";

export default async function TreeLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;
  const treeId = parseDetailId(id);
  if (treeId === null || !(await treeExists(treeId))) notFound();
  return children;
}
