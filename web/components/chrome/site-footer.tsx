"use client";

// Route-aware footer visibility. Legacy treesdb.org suppresses the site
// footer on the map page so the map owns the full viewport below the header;
// we mirror that. The footer markup itself stays in app/layout.tsx (a server
// component -- it reads the units cookie), and is passed through here as
// children; this wrapper only decides whether to show it. usePathname()
// resolves during SSR too, so /map never flashes a footer.
import { usePathname } from "next/navigation";

export function SiteFooter({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/map") return null;
  return <>{children}</>;
}
