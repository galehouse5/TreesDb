// GET /api/import/{tripId}/markers?site=|tree= -- port of `Map/
// ImportSiteMarkers`/`Map/ImportTreeMarkers` (`TMD/Controllers/
// MapController.cs:70-113`), task P3-09 (doc 05 §P3-09). Payload assembly
// lives in `lib/import-markers.ts` (pure) + `db/queries/import-drafts.sql.ts`
// (`listImportSites`)/`db/queries/import-trees.sql.ts`
// (`listAllSiteTreesForTrip`)/`db/queries/import-markers.sql.ts`
// (`importMarkerPhotoIcons`) -- see those files' headers for the full
// transcribed marker/CalculatedCoordinates rules; this route is just the
// HTTP shell: parse params, authorize, fetch, call the pure builder, map
// its result to a status code.
//
// Authorization: legacy has NO `[AuthorizeUser]` attribute on either action
// (unlike every `ImportController` action) -- only the inline
// `if (!User.IsAuthorizedToEdit(trip)) return new UnauthorizedResult();`
// check (`MapController.cs:72-73,96-97`), which for an anonymous/no-Import-
// role user already evaluates false (no matching `UserRole` instance,
// `db/queries/import-drafts.sql.ts`'s file header). Ported here as an
// explicit two-step check for the 401-vs-403 distinction the task brief
// asks for (legacy collapses both into one `UnauthorizedResult`, HTTP 401 --
// this is a deliberate, minor improvement, not a deviation the parity gate
// cares about, since this endpoint was never scraped/asserted by the replay
// harness): no session at all -> 401; a session that fails
// `assertTripEditable` (wrong role, or authenticated-but-not-the-trip's-
// creator) -> 403; a `tripId` that doesn't resolve to any trip -> 404 (same
// "not-found" `TripAccessError` reason every other wizard route already
// distinguishes, e.g. app/import/[tripId]/layout.tsx).
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { asAppSession } from "@/auth.config";
import { TripAccessError, assertTripEditable, listImportSites } from "@/db/queries/import-drafts.sql";
import { listAllSiteTreesForTrip } from "@/db/queries/import-trees.sql";
import { importMarkerPhotoIcons } from "@/db/queries/import-markers.sql";
import { buildImportSiteMarkers, buildImportTreeMarkers, type ImportMarkersData } from "@/lib/import-markers";

export async function GET(request: Request, { params }: { params: Promise<{ tripId: string }> }) {
  const { tripId: tripIdParam } = await params;
  const tripId = Number(tripIdParam);
  if (!Number.isInteger(tripId) || tripId <= 0) {
    return NextResponse.json({ error: "invalid trip id" }, { status: 400 });
  }

  const session = asAppSession(await auth());
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await assertTripEditable(tripId, session.userId, session.roles);
  } catch (err) {
    if (err instanceof TripAccessError && err.reason === "not-found") {
      return NextResponse.json({ error: "trip not found" }, { status: 404 });
    }
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const siteParam = searchParams.get("site");
  const treeParam = searchParams.get("tree");
  if (siteParam == null && treeParam == null) {
    return NextResponse.json({ error: "a site or tree query parameter is required" }, { status: 400 });
  }

  const [sites, treesBySite, photoIcons] = await Promise.all([
    listImportSites(tripId),
    listAllSiteTreesForTrip(tripId),
    importMarkerPhotoIcons(tripId),
  ]);
  const data: ImportMarkersData = { tripId, sites, treesBySite, ...photoIcons };

  if (siteParam != null) {
    const siteId = Number(siteParam);
    if (!Number.isInteger(siteId) || siteId <= 0) {
      return NextResponse.json({ error: "invalid site id" }, { status: 400 });
    }
    const result = buildImportSiteMarkers(data, siteId);
    if (result === "site-not-found") {
      return NextResponse.json({ error: "site not found in this trip" }, { status: 404 });
    }
    return NextResponse.json(result);
  }

  const treeId = Number(treeParam);
  if (!Number.isInteger(treeId) || treeId <= 0) {
    return NextResponse.json({ error: "invalid tree id" }, { status: 400 });
  }
  const result = buildImportTreeMarkers(data, treeId);
  if (result === "tree-not-found") {
    return NextResponse.json({ error: "tree not found in this trip" }, { status: 404 });
  }
  return NextResponse.json(result);
}
