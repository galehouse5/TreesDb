import { describe, expect, it } from "vitest";
import { CsvScanner, parseCsvRecordsSync, parseCsvStringSync } from "./csv";

describe("parseCsvStringSync", () => {
  it("parses quoted fields, unquoting embedded doubled quotes", () => {
    const rows = parseCsvStringSync('"a","say ""hi""","c"\r\n');
    expect(rows).toEqual([["a", 'say "hi"', "c"]]);
  });

  it("parses the bare unquoted NULL token as null, distinct from a quoted empty string", () => {
    const rows = parseCsvStringSync('"Id","Name"\r\n"1",NULL\r\n"2",""\r\n');
    expect(rows).toEqual([
      ["Id", "Name"],
      ["1", null],
      ["2", ""],
    ]);
  });

  it("handles multiple rows separated by CRLF", () => {
    const rows = parseCsvStringSync('"a","b"\r\n"c","d"\r\n"e","f"\r\n');
    expect(rows).toEqual([
      ["a", "b"],
      ["c", "d"],
      ["e", "f"],
    ]);
  });

  it("flushes a trailing row with no terminating newline", () => {
    const rows = parseCsvStringSync('"a","b"');
    expect(rows).toEqual([["a", "b"]]);
  });

  it("tolerates a bare LF as a row terminator", () => {
    const rows = parseCsvStringSync('"a","b"\n"c","d"\n');
    expect(rows).toEqual([
      ["a", "b"],
      ["c", "d"],
    ]);
  });

  it("commas and CR/LF inside quotes are literal, not delimiters", () => {
    const rows = parseCsvStringSync('"a,b","line1\r\nline2"\r\n');
    expect(rows).toEqual([["a,b", "line1\r\nline2"]]);
  });
});

describe("parseCsvRecordsSync", () => {
  it("zips the header row into keyed records", () => {
    const records = parseCsvRecordsSync('"Id","Name"\r\n"1","Old Growth"\r\n"2",NULL\r\n');
    expect(records).toEqual([
      { Id: "1", Name: "Old Growth" },
      { Id: "2", Name: null },
    ]);
  });

  it("throws when a row's field count does not match the header", () => {
    expect(() => parseCsvRecordsSync('"Id","Name"\r\n"1"\r\n')).toThrow(/field count/);
  });
});

describe("CsvScanner streaming robustness", () => {
  it("reassembles a `\"\"` escape sequence split across two feed() calls", () => {
    const scanner = new CsvScanner();
    const rows1 = scanner.feed('"say ""');
    const rows2 = scanner.feed('hi"""\r\n');
    const last = scanner.finish();
    expect(rows1).toEqual([]);
    expect(rows2).toEqual([['say "hi"']]);
    expect(last).toBeNull();
  });

  it("reassembles a CRLF row terminator split across two feed() calls", () => {
    const scanner = new CsvScanner();
    const rows1 = scanner.feed('"a","b"\r');
    const rows2 = scanner.feed('\n"c","d"\r\n');
    expect(rows1).toEqual([["a", "b"]]);
    expect(rows2).toEqual([["c", "d"]]);
  });

  it("distinguishes a closing quote immediately followed by end-of-chunk from an escape", () => {
    const scanner = new CsvScanner();
    const rows1 = scanner.feed('"abc"');
    const rows2 = scanner.feed(",def\r\n");
    expect([...rows1, ...rows2]).toEqual([["abc", "def"]]);
  });
});
