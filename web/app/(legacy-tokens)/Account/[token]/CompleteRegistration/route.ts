// Legacy token URL handler: `/Account/{token}/CompleteRegistration`
// (doc 01 §1/§12, doc 04 §P2-04 "implement the handlers now so emailed
// legacy links work at cutover"). Legacy: `AccountController.CompleteRegistration`
// (`TMD/Controllers/AccountController.cs:145-159`). Every already-sent
// legacy email links here; this route does no verification itself -- it
// just redirects to the new app's `/account/verify/{token}` page (which owns
// the actual `verifyEmail` call), carrying the token through unchanged.
//
// Route shape: this file lives under the `(legacy-tokens)` route group (adds
// no path segment) at `Account/[token]/CompleteRegistration`, matching the
// literal (case-sensitive) legacy URL `/Account/{token}/CompleteRegistration`
// exactly (doc 01 §1 routing table).
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return NextResponse.redirect(new URL(`/account/verify/${encodeURIComponent(token)}`, request.url));
}
