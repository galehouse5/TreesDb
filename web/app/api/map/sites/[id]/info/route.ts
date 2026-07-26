// GET /api/map/sites/{id}/info -- port of `Map/SiteMarkerInfo` (`TMD/
// Controllers/MapController.cs:142-147`), doc 01 §9, doc 03 P1-10.
//
// See app/api/map/states/[id]/info/route.ts's header for the shared design
// notes (D-007 JSON-instead-of-partial, units-cookie-driven formatting,
// near-identity `parity/extractors/new/marker-info-site.ts` mapping). Shape
// = `SiteMarkerInfoJson` (`parity/extractors/schema.ts`).
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { siteMarkerInfo } from "@/db/queries/map.sql";
import { readUnitsPreference } from "@/lib/units/cookie";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid site id" }, { status: 400 });
  }

  const units = readUnitsPreference(await cookies());
  const info = await siteMarkerInfo(id, units);
  if (!info) {
    return NextResponse.json({ error: "site not found" }, { status: 404 });
  }
  return NextResponse.json(info);
}
