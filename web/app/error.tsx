"use client";

// P1-14 branded 500 / runtime-error boundary. Must be a client component
// (Next.js error.tsx convention) -- it renders in place of the segment that
// threw, inside the root layout (this is not global-error.tsx, so no
// <html>/<body> here).
//
// Design-audit fix: this used to be bare centered text while
// `app/not-found.tsx` got a Card + brand tree icon treatment for the same
// kind of "the page you wanted isn't here" moment -- brought into line with
// that same Card + icon shell (only the "500"/heading/copy differ, plus the
// extra client-only "Try again" reset button this boundary alone needs).
// Judgment call: the "500" label uses `text-destructive` rather than
// not-found's `text-primary` -- an actual runtime error reads better in the
// error color than the brand green, unlike a plain "page doesn't exist".
import { useEffect } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-4">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- 64px static brand asset, no optimization needed */}
          <img src="/tree-icon.png" alt="" className="h-10 w-10 opacity-30" />
          <p className="text-sm font-semibold uppercase tracking-wide text-destructive">500</p>
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-muted-foreground">
            An unexpected error occurred. You can try again, or head back to
            the map.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className={cn(buttonVariants({ variant: "default" }))}
            >
              Try again
            </button>
            <Link href="/map" className={cn(buttonVariants({ variant: "outline" }))}>
              Back to the map
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
