import type { Metadata } from "next";

// page.tsx here is necessarily a Client Component (see its header comment on
// the ssr:false MapLibre dynamic import), so it cannot export metadata --
// without this layout the map tab showed the generic site title while every
// other page carries "X - TreesDb".
export const metadata: Metadata = {
  title: "Map - TreesDb",
  description: "Measured trees, sites, and states on an interactive map.",
};

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
