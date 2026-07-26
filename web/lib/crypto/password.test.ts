import { describe, expect, it } from "vitest";
import {
  analyzePasswordComposition,
  hashPasswordHex,
  meetsPasswordPolicy,
  verifyPassword,
} from "./password";

// Doc 01 §6.1 vectors (also doc 07 §7.3 "Password vectors, all four").
describe("hashPasswordHex - doc 01 §6.1 vectors", () => {
  it("Password1 / alice@example.com", () => {
    expect(hashPasswordHex("Password1", "alice@example.com")).toBe(
      "974bcde0bd9738e8fda880914e25a67e855d107a29774ad7aecd92638b3e3e5f",
    );
  });

  it("correct horse battery staple / bob@treesdb.org", () => {
    expect(hashPasswordHex("correct horse battery staple", "bob@treesdb.org")).toBe(
      "15b5b75e8cf8a1637ee6d297bbcf5dfd15a5630c7bce077dc13f8424df90c775",
    );
  });

  it("Tr0ub4dor&3 / '  Carol@Example.COM  ' (normalizes to carol@example.com)", () => {
    expect(hashPasswordHex("Tr0ub4dor&3", "  Carol@Example.COM  ")).toBe(
      "25c3ef82258912347ce37c5478c134e8f7f00cac34a0b9652535f7ac1854990e",
    );
  });

  it("pässwörd1 / dave@example.com", () => {
    expect(hashPasswordHex("pässwörd1", "dave@example.com")).toBe(
      "4f91e54466e4b38d0b39ad178538111becd3765579e8e4a3322f30b7558abbc0",
    );
  });
});

describe("verifyPassword - trim asymmetry (Create does not trim, Verify does)", () => {
  it("verifies correctly against an untrimmed-create hash when candidate has no whitespace", () => {
    const stored = Buffer.from(
      hashPasswordHex("Password1", "alice@example.com"),
      "hex",
    );
    expect(verifyPassword("Password1", "alice@example.com", stored)).toBe(true);
  });

  it("verify trims the candidate: '  Password1  ' verifies against the untrimmed hash", () => {
    const stored = Buffer.from(
      hashPasswordHex("Password1", "alice@example.com"),
      "hex",
    );
    expect(verifyPassword("  Password1  ", "alice@example.com", stored)).toBe(true);
  });

  it("create does NOT trim: a hash created from '  Password1  ' does NOT verify against trimmed 'Password1'", () => {
    // Password.Create('  Password1  ', salt) hashes the untrimmed string.
    const stored = hashPasswordHex("  Password1  ", "alice@example.com");
    const storedBuf = Buffer.from(stored, "hex");
    // verifyPassword trims the candidate, so 'Password1' (trimmed) does NOT
    // match a hash that was created from the untrimmed '  Password1  '.
    expect(verifyPassword("Password1", "alice@example.com", storedBuf)).toBe(false);
    // But re-supplying the exact untrimmed original does verify, because
    // trimming '  Password1  ' is a no-op only if it had no surrounding
    // whitespace; here it does, so trimming CHANGES the candidate and the
    // hash no longer matches either -- this hash is simply unverifiable
    // via the trimming verify path, exactly mirroring the legacy landmine.
    expect(verifyPassword("  Password1  ", "alice@example.com", storedBuf)).toBe(false);
  });

  it("email normalization: raw/whitespace/case email variants all verify the same hash", () => {
    const stored = Buffer.from(
      hashPasswordHex("Tr0ub4dor&3", "  Carol@Example.COM  "),
      "hex",
    );
    expect(verifyPassword("Tr0ub4dor&3", "carol@example.com", stored)).toBe(true);
    expect(verifyPassword("Tr0ub4dor&3", "  CAROL@example.COM  ", stored)).toBe(true);
  });

  it("rejects a wrong password", () => {
    const stored = Buffer.from(
      hashPasswordHex("Password1", "alice@example.com"),
      "hex",
    );
    expect(verifyPassword("wrong-password", "alice@example.com", stored)).toBe(false);
  });

  it("rejects a stored hash of the wrong length", () => {
    expect(verifyPassword("Password1", "alice@example.com", Buffer.alloc(31))).toBe(false);
    expect(verifyPassword("Password1", "alice@example.com", Buffer.alloc(33))).toBe(false);
  });
});

describe("password policy (Password.cs:29, Settings.cs default 8 / 2 classes)", () => {
  it("rejects passwords shorter than 8 characters", () => {
    expect(meetsPasswordPolicy("Ab1!xyz")).toBe(false); // 7 chars
  });

  it("rejects passwords with fewer than 2 character classes", () => {
    expect(meetsPasswordPolicy("abcdefgh")).toBe(false); // lowercase only
    expect(meetsPasswordPolicy("12345678")).toBe(false); // numeric only
  });

  it("accepts a password with >=8 chars and >=2 classes", () => {
    expect(meetsPasswordPolicy("Password1")).toBe(true); // upper+lower+numeric
    expect(meetsPasswordPolicy("password!")).toBe(true); // lower+special
  });

  it("analyzePasswordComposition counts classes and flags invalid characters", () => {
    const c = analyzePasswordComposition("Ab1!  ");
    expect(c.length).toBe(6);
    expect(c.uppercase).toBe(1);
    expect(c.lowercase).toBe(1);
    expect(c.numerics).toBe(1);
    expect(c.specials).toBe(1);
    expect(c.characterTypes).toBe(4);
    // 2 trailing spaces are not counted in any of the four classes.
    expect(c.hasInvalidCharacters).toBe(true);
  });
});
