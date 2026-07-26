// Legacy token URL handler: `/Account/{token}/CompletePasswordAssistance`
// (doc 01 §1/§12, doc 04 §P2-05 "implement the handlers now so emailed
// legacy links work at cutover"). Legacy:
// `AccountController.CompletePasswordAssistance`
// (`TMD/Controllers/AccountController.cs:190-227`). Redirects to the new
// app's `/account/password-assistance/{token}` page (which owns the actual
// token-validity check and completion form), carrying the token through
// unchanged -- no verification happens in this route itself.
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return NextResponse.redirect(
    new URL(`/account/password-assistance/${encodeURIComponent(token)}`, request.url),
  );
}
