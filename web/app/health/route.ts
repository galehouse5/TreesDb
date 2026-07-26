import { NextResponse } from "next/server";
import { getSql, hasDatabaseUrl } from "@/db";

// Acceptance check for P0-01: /health returns a DB round-trip time.
// Degrades gracefully to status "no-database" when DATABASE_URL is unset,
// so the skeleton is verifiably running before Neon/local Postgres exists.
export const dynamic = "force-dynamic";

export async function GET() {
  if (!hasDatabaseUrl()) {
    return NextResponse.json(
      {
        status: "no-database",
        message: "DATABASE_URL is not set; skeleton is running. See web/.env.example.",
      },
      { status: 200 },
    );
  }

  try {
    const sql = getSql();
    const start = performance.now();
    await sql`select 1 as ok`;
    const roundTripMs = Math.round((performance.now() - start) * 100) / 100;
    return NextResponse.json({ status: "ok", roundTripMs });
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        message: err instanceof Error ? err.message : String(err),
      },
      { status: 503 },
    );
  }
}
