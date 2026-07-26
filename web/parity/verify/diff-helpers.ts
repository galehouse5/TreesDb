/**
 * Adapts this task's per-category comparison results onto the SHARED
 * `Diff`/report-writer machinery from `web/parity/data/` (doc 07 §1
 * deliverable: "REUSE the report writer + waiver parser"). `data/comparator.ts`'s
 * `Diff.kind` is a closed union tuned for the dump-comparison categories
 * (`row-count`, `pk-missing`, ...) - none of those names fit "CSV byte
 * mismatch" or "marker JSON mismatch" naturally, and that file isn't owned
 * by this task, so rather than fork the report writer this module always
 * uses the most generic kind, `"field"`, and repurposes `Diff.table` as the
 * human-readable ARTIFACT label (legacy URL, savePathBase, or similar) -
 * `report.ts`'s waiver matcher never inspects `table` for matching (only
 * `field` + the category string passed to `findApplicableWaiver`
 * separately), so this is a safe, non-invasive reuse.
 */
import type { Diff } from "../data/comparator";
import type { FieldMismatch } from "./deep-compare";

/** Builds one parity `Diff` for a single artifact-scoped mismatch. `artifact` becomes `Diff.table` (see file header); `field` should be a short, stable name a waiver's `Field(s)` backtick tokens can match against. */
export function makeDiff(params: {
  artifact: string;
  field?: string;
  expected?: unknown;
  actual?: unknown;
  message: string;
  waiverHint?: string;
}): Diff {
  return {
    kind: "field",
    table: params.artifact,
    field: params.field,
    expected: params.expected,
    actual: params.actual,
    message: params.message,
    waiverHint: params.waiverHint,
  };
}

/** Converts a batch of `deep-compare.ts` `FieldMismatch`es (already scoped to one artifact) into `Diff`s. */
export function diffsFromMismatches(artifact: string, mismatches: FieldMismatch[]): Diff[] {
  return mismatches.map((m) =>
    makeDiff({
      artifact,
      field: m.path || undefined,
      expected: m.expected,
      actual: m.actual,
      message: `${artifact}: ${m.message}`,
    }),
  );
}
