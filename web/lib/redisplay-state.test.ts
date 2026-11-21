import { describe, expect, it } from "vitest";
import { openState, sealState } from "./redisplay-state";

describe("redisplay state", () => {
  const state = { input: { measurerContactInfo: "zed@example.com", name: "Trip" }, errors: [] };

  it("round-trips and is URL-safe", () => {
    const token = sealState(state);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(openState(token)).toEqual(state);
  });

  it("does not expose what was typed", () => {
    const token = sealState(state);
    expect(token).not.toContain("zed");
    expect(Buffer.from(token, "base64url").toString("latin1")).not.toContain("zed@example.com");
  });

  it("rejects tampered, garbage, legacy plain-JSON and empty values", () => {
    const token = sealState(state);
    const flipped = token.slice(0, -2) + (token.endsWith("A") ? "B" : "A") + token.slice(-1);
    expect(openState(flipped)).toBeNull();
    expect(openState("not-a-token")).toBeNull();
    expect(openState(JSON.stringify(state))).toBeNull();
    expect(openState("")).toBeNull();
    expect(openState(undefined)).toBeNull();
  });

  it("expires after an hour", () => {
    const now = 1_800_000_000_000;
    const token = sealState(state, now);
    expect(openState(token, now + 59 * 60 * 1000)).toEqual(state);
    expect(openState(token, now + 61 * 60 * 1000)).toBeNull();
  });
});
