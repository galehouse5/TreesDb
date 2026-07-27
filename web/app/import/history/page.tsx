// `/import/history` folded into `/import` (owner request 2026-07): the
// History tables were a strict superset of the entry page's draft list, so
// the index now renders them directly -- see app/import/page.tsx. This stub
// keeps the old URL working (bookmarks, stale links) as a permanent
// redirect. Legacy's `/Import/History` never had a public redirect-map
// entry (auth-gated, so the parity crawl never covered it) -- nothing else
// depends on this path.
import { permanentRedirect } from "next/navigation";

export default function ImportHistoryRedirect(): never {
  permanentRedirect("/import");
}
