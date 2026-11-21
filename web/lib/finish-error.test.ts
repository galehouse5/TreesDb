import { describe, expect, it } from "vitest";
import { FINISH_DB_ERROR_MESSAGE, finishErrorMessage, isDatabaseError } from "./finish-error";

function pgError(message: string): Error {
  return Object.assign(new Error(message), { name: "PostgresError", code: "42P01", severity: "ERROR" });
}

describe("finishErrorMessage", () => {
  it("hides a database error behind a plain message", () => {
    const err = pgError('relation "species" does not exist');
    expect(isDatabaseError(err)).toBe(true);
    expect(finishErrorMessage(err)).toBe(FINISH_DB_ERROR_MESSAGE);
    expect(finishErrorMessage(err)).not.toContain("species");
  });

  it("recognises a database error by code and severity alone", () => {
    const err = Object.assign(new Error("duplicate key"), { code: "23505", severity: "ERROR" });
    expect(finishErrorMessage(err)).toBe(FINISH_DB_ERROR_MESSAGE);
  });

  it("keeps an engine error's own message", () => {
    expect(finishErrorMessage(new Error("Import trip 5 not found"))).toBe("Import trip 5 not found");
  });

  it("falls back for a non-Error throw", () => {
    expect(finishErrorMessage("boom")).toBe("Finish failed.");
    expect(isDatabaseError(null)).toBe(false);
  });
});
