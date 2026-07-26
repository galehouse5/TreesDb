/**
 * `redirects` category comparator (doc 07 §5.6, Phase 4 gate - but exercised
 * from Phase 1 on for the `/` -> `/map` redirect per this task's smoke
 * test). Pure, no I/O.
 */
import type { Diff } from "../data/comparator";
import { makeDiff } from "./diff-helpers";
import { resolveNewPath } from "./url-resolve";

export interface RedirectArtifact {
  status: number;
  location: string | null;
}

export interface RedirectCompareResult {
  diffs: Diff[];
  checksRun: number;
}

/** Compares a redirect's Location header against the mapped new path when the URL-equivalence table covers it; falls back to exact string comparison otherwise (still a meaningful check, just not route-aware). */
function locationsEquivalent(legacyLocation: string, newLocation: string): { equivalent: boolean; note?: string } {
  const resolved = resolveNewPath(legacyLocation);
  if (resolved.kind === "skip") {
    return { equivalent: legacyLocation === newLocation, note: `no URL-equivalence mapping for Location (${resolved.reason}) - compared verbatim` };
  }
  const stripSlash = (s: string) => (s.length > 1 && s.endsWith("/") ? s.slice(0, -1) : s);
  return { equivalent: stripSlash(resolved.newPath) === stripSlash(newLocation) };
}

export function compareRedirect(label: string, legacy: RedirectArtifact, next: RedirectArtifact): RedirectCompareResult {
  const diffs: Diff[] = [];

  if (legacy.status !== next.status) {
    diffs.push(
      makeDiff({
        artifact: label,
        field: "status",
        expected: legacy.status,
        actual: next.status,
        message: `${label}: status mismatch - legacy ${legacy.status}, new ${next.status}`,
      }),
    );
  }

  if (legacy.location === null || next.location === null) {
    if (legacy.location !== next.location) {
      diffs.push(
        makeDiff({
          artifact: label,
          field: "location",
          expected: legacy.location,
          actual: next.location,
          message: `${label}: Location header mismatch - legacy ${JSON.stringify(legacy.location)}, new ${JSON.stringify(next.location)}`,
        }),
      );
    }
  } else {
    const { equivalent, note } = locationsEquivalent(legacy.location, next.location);
    if (!equivalent) {
      diffs.push(
        makeDiff({
          artifact: label,
          field: "location",
          expected: legacy.location,
          actual: next.location,
          message: `${label}: Location not route-equivalent - legacy ${JSON.stringify(legacy.location)}, new ${JSON.stringify(next.location)}${note ? ` (${note})` : ""}`,
        }),
      );
    }
  }

  return { diffs, checksRun: 2 };
}
