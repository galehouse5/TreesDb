import { ResponseCookies } from "next/dist/compiled/@edge-runtime/cookies";
import { describe, expect, it } from "vitest";
import { isSessionTokenCookie, makeSessionCookiesSessionOnly } from "./session-persistence";

function store(): ResponseCookies {
  return new ResponseCookies(new Headers());
}

describe("session persistence", () => {
  it("recognises Auth.js session-token cookie names only", () => {
    expect(isSessionTokenCookie("authjs.session-token")).toBe(true);
    expect(isSessionTokenCookie("__Secure-authjs.session-token")).toBe(true);
    expect(isSessionTokenCookie("__Secure-authjs.session-token.1")).toBe(true);
    expect(isSessionTokenCookie("authjs.csrf-token")).toBe(false);
    expect(isSessionTokenCookie("treesdb.session-only")).toBe(false);
  });

  it("drops Expires and Max-Age from the session cookie and keeps its other attributes", () => {
    const s = store();
    s.set({
      name: "__Secure-authjs.session-token",
      value: "jwt",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: new Date(Date.now() + 86_400_000),
    });
    s.set({ name: "authjs.csrf-token", value: "x", expires: new Date(Date.now() + 86_400_000) });

    expect(makeSessionCookiesSessionOnly(s)).toBe(1);
    const session = s.get("__Secure-authjs.session-token")!;
    expect(session.expires).toBeUndefined();
    expect(session.maxAge).toBeUndefined();
    expect(session).toMatchObject({ value: "jwt", httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    expect(s.get("authjs.csrf-token")?.expires).toBeDefined();
  });

  it("leaves a sign-out deletion alone", () => {
    const s = store();
    s.set({ name: "authjs.session-token", value: "", expires: new Date(0) });
    s.set({ name: "__Secure-authjs.session-token", value: "jwt", maxAge: 0 });
    expect(makeSessionCookiesSessionOnly(s)).toBe(0);
  });
});
