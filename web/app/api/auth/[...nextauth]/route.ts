// Standard Auth.js v5 App Router catch-all (task P2-03). Exposes the whole
// REST surface (`/api/auth/csrf`, `/api/auth/session`,
// `/api/auth/callback/credentials`, ...) that auth.ts's config drives.
import { handlers } from "@/auth";

export const { GET, POST } = handlers;
