// GET /api/map/states/{id}/info -- port of `Map/StateMarkerInfo` (`TMD/
// Controllers/MapController.cs:135-140`), doc 01 §9, doc 03 P1-10.
//
// Legacy renders an HTML partial (`Views/Map/StateMarkerInfo.cshtml`) into
// the map popup; this route returns the same displayed fields as JSON (D-007)
// -- shape = `StateMarkerInfoJson` (`parity/extractors/schema.ts`), so
// `parity/extractors/new/marker-info-state.ts` is a near-identity mapping.
//
// Units preference: RHI/RGI values are formatted server-side via
// `lib/units/format.ts` using the visitor's `unitsPreference` cookie (same
// source `MapStateMarkerInfoModel`'s Razor partial reads via
// `UserSession.Units` -- `RuckerIndex.cshtml`).
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { stateMarkerInfo } from "@/db/queries/map.sql";
import { readUnitsPreference } from "@/lib/units/cookie";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "invalid state id" }, { status: 400 });
  }

  const units = readUnitsPreference(await cookies());
  const info = await stateMarkerInfo(id, units);
  if (!info) {
    return NextResponse.json({ error: "state not found" }, { status: 404 });
  }
  return NextResponse.json(info);
}
