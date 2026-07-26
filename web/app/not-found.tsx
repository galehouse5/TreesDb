// P1-14 branded 404. Legacy: catch-all route -> Error/NotFound
// (docs/migration/01-system-reference.md §1, last row).
import type { Metadata } from "next";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Page not found - TreesDb",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- 64px static brand asset, no optimization needed */}
          <img src="/tree-icon.png" alt="" className="h-10 w-10 opacity-30" />
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">404</p>
          <h1 className="text-2xl font-semibold">Page not found</h1>
          <p className="max-w-md text-muted-foreground">
            The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
          </p>
          <Link href="/map" className={cn(buttonVariants({ variant: "default" }))}>
            Back to the map
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
