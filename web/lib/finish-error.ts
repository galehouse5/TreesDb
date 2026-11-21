/**
 * The banner text Review shows when Finish throws. Engine errors (a trip
 * graph the engine refuses, an ambiguous tree match) keep their message, as
 * the review action intends. A database error (postgres.js `PostgresError`,
 * recognised by its string `code` and `severity`) gets a plain sentence
 * instead, so a missing table or constraint name never reaches the page or
 * the URL.
 */
export const FINISH_DB_ERROR_MESSAGE =
  "Finishing this import failed because of a problem on our side. Please try again later, or contact technical help if it keeps happening.";

export function isDatabaseError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { code?: unknown; severity?: unknown; name?: unknown };
  return (
    e.name === "PostgresError" ||
    (typeof e.code === "string" && typeof e.severity === "string")
  );
}

export function finishErrorMessage(err: unknown): string {
  if (isDatabaseError(err)) return FINISH_DB_ERROR_MESSAGE;
  return err instanceof Error ? err.message : "Finish failed.";
}
