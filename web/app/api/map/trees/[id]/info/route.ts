// GET /api/map/trees/{id}/info -- port of `Map/TreeMarkerInfo` (`TMD/
// Controllers/MapController.cs:149-154`), doc 01 §9, doc 03 P1-10 (whose
// example URL for this route is cited directly in `normalize.ts`'s
// "map-tree-marker-info" entry).
//
// See app/api/map/states/[id]/info/route.ts's header for the shared design
// notes. Shape = `TreeMarkerInfoJson` (`parity/extractors/schema.ts`).
// Elevation is deliberately excluded -- see db/queries/map.sql.ts's file
// header for why (the model carries it, the legacy view never renders it).
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { treeMarkerInfo } from "@/db/queries/map.sql";
import { readUnitsPreference } from "@/lib/units/cookie";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid tree id" }, { status: 400 });
  }

  const units = readUnitsPreference(await cookies());
  const info = await treeMarkerInfo(id, units);
  if (!info) {
    return NextResponse.json({ error: "tree not found" }, { status: 404 });
  }
  return NextResponse.json(info);
}
