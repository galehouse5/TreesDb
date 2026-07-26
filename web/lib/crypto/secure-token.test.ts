import { describe, expect, it } from "vitest";
import {
  decodeToken,
  encodeToken,
  generateToken,
  SECURE_TOKEN_BYTE_LENGTH,
  SECURE_TOKEN_ENCODED_LENGTH,
  tokensEqual,
} from "./secure-token";

function hexToBytes(hex: string): Buffer {
  return Buffer.from(hex, "hex");
}

// Doc 01 §6.3 vectors.
describe("encodeToken - doc 01 §6.3 vectors", () => {
  it("bytes 000102...1e1f", () => {
    const bytes = Buffer.from(Array.from({ length: 32 }, (_, i) => i));
    expect(encodeToken(bytes)).toBe(
      "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8",
    );
    expect(encodeToken(bytes)).toHaveLength(SECURE_TOKEN_ENCODED_LENGTH);
  });

  it("bytes fbeffe3edffabf3bfefff93eefbffbfffdffbe3fdffbff7ffefffbbfffeff3ff", () => {
    const bytes = hexToBytes(
      "fbeffe3edffabf3bfefff93eefbffbfffdffbe3fdffbff7ffefffbbfffeff3ff",
    );
    expect(bytes).toHaveLength(32);
    expect(encodeToken(bytes)).toBe(
      "--_-Pt_6vzv-__k-77_7__3_vj_f-_9__v_7v__v8_8",
    );
  });
});

describe("decodeToken - inverse of the doc 01 §6.3 vectors", () => {
  it("decodes back to bytes 000102...1e1f", () => {
    const expected = Buffer.from(Array.from({ length: 32 }, (_, i) => i));
    const decoded = decodeToken("AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8");
    expect(decoded.equals(expected)).toBe(true);
  });

  it("decodes back to the second vector's bytes", () => {
    const expected = hexToBytes(
      "fbeffe3edffabf3bfefff93eefbffbfffdffbe3fdffbff7ffefffbbfffeff3ff",
    );
    const decoded = decodeToken("--_-Pt_6vzv-__k-77_7__3_vj_f-_9__v_7v__v8_8");
    expect(decoded.equals(expected)).toBe(true);
  });
});

describe("round-trip property (500 random tokens)", () => {
  it("encode then decode recovers the original bytes", () => {
    for (let i = 0; i < 500; i++) {
      const original = generateToken();
      const encoded = encodeToken(original);
      expect(encoded).toHaveLength(SECURE_TOKEN_ENCODED_LENGTH);
      const decoded = decodeToken(encoded);
      expect(decoded.equals(original)).toBe(true);
    }
  });
});

describe("generateToken", () => {
  it("produces 32 bytes", () => {
    expect(generateToken()).toHaveLength(SECURE_TOKEN_BYTE_LENGTH);
  });

  it("produces distinct values across calls", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a.equals(b)).toBe(false);
  });
});

describe("decodeToken rejects malformed / wrong-length input", () => {
  it("rejects a too-short encoded string (zero-fills, 32 bytes)", () => {
    const decoded = decodeToken("AAEC");
    expect(decoded).toHaveLength(SECURE_TOKEN_BYTE_LENGTH);
    expect(decoded.equals(Buffer.alloc(32))).toBe(true);
  });

  it("rejects a too-long encoded string (zero-fills, 32 bytes)", () => {
    const tooLong = "AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8" + "AAAA";
    const decoded = decodeToken(tooLong);
    expect(decoded).toHaveLength(SECURE_TOKEN_BYTE_LENGTH);
    expect(decoded.equals(Buffer.alloc(32))).toBe(true);
  });

  it("rejects input with invalid characters (zero-fills, 32 bytes)", () => {
    const decoded = decodeToken("!!!!AwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8");
    expect(decoded).toHaveLength(SECURE_TOKEN_BYTE_LENGTH);
    expect(decoded.equals(Buffer.alloc(32))).toBe(true);
  });

  it("rejects a 43-char input that decodes to the wrong byte length (zero-fills)", () => {
    // 42 'A's + '=' passes the length gate but base64-decodes (after the
    // codec re-appends its own '=') to 31 bytes, not 32 -- exercises the
    // decoded-length guard distinctly from the character-set guard.
    const decoded = decodeToken("A".repeat(42) + "=");
    expect(decoded).toHaveLength(SECURE_TOKEN_BYTE_LENGTH);
    expect(decoded.equals(Buffer.alloc(32))).toBe(true);
  });
});

describe("tokensEqual", () => {
  it("is true for identical byte arrays", () => {
    const a = generateToken();
    const b = Buffer.from(a);
    expect(tokensEqual(a, b)).toBe(true);
  });

  it("is false for different byte arrays", () => {
    const a = Buffer.alloc(32, 1);
    const b = Buffer.alloc(32, 2);
    expect(tokensEqual(a, b)).toBe(false);
  });

  it("is false for different-length arrays", () => {
    expect(tokensEqual(Buffer.alloc(32), Buffer.alloc(16))).toBe(false);
  });
});
