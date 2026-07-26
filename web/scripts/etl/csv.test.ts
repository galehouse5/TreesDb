import { describe, expect, it } from "vitest";
import {
  CsvParser,
  fieldToNullableString,
  parseCsv,
  parseCsvHeader,
  rowToNullableStrings,
  type CsvRow,
} from "./csv";

function values(row: CsvRow): string[] {
  return row.map((f) => f.value);
}
function quotedFlags(row: CsvRow): boolean[] {
  return row.map((f) => f.quoted);
}

describe("parseCsv", () => {
  it("parses a simple quoted row with CRLF terminator", () => {
    const rows = parseCsv('"a","b","c"\r\n"1","2","3"\r\n');
    expect(rows).toHaveLength(2);
    expect(values(rows[0]!)).toEqual(["a", "b", "c"]);
    expect(values(rows[1]!)).toEqual(["1", "2", "3"]);
    expect(quotedFlags(rows[1]!)).toEqual([true, true, true]);
  });

  it("unescapes doubled quotes inside a quoted field", () => {
    const rows = parseCsv('"He said ""hi""","plain"\r\n');
    expect(values(rows[0]!)).toEqual(['He said "hi"', "plain"]);
  });

  it("treats a bare unquoted NULL token as SQL NULL, distinct from a quoted empty string", () => {
    // Matches the P0-03 dump convention exactly: NULL 'NULL' style.
    const rows = parseCsv('"Id","Name","Comments"\r\n"1",NULL,""\r\n');
    const dataRow = rows[1]!;
    expect(dataRow[1]!.quoted).toBe(false);
    expect(dataRow[1]!.value).toBe("NULL");
    expect(dataRow[2]!.quoted).toBe(true);
    expect(dataRow[2]!.value).toBe("");

    expect(fieldToNullableString(dataRow[1]!)).toBeNull();
    expect(fieldToNullableString(dataRow[2]!)).toBe("");
  });

  it("treats a QUOTED field whose text is literally NULL as the string, not SQL NULL", () => {
    const rows = parseCsv('"NULL","x"\r\n');
    const row = rows[0]!;
    expect(row[0]!.quoted).toBe(true);
    expect(fieldToNullableString(row[0]!)).toBe("NULL");
  });

  it("parses embedded commas and CRLF-only newlines inside quoted fields", () => {
    const rows = parseCsv('"a,b","line1\r\nline2"\r\n');
    expect(values(rows[0]!)).toEqual(["a,b", "line1\r\nline2"]);
  });

  it("handles a file with no trailing newline", () => {
    const rows = parseCsv('"a","b"\r\n"1","2"');
    expect(rows).toHaveLength(2);
    expect(values(rows[1]!)).toEqual(["1", "2"]);
  });

  it("rowToNullableStrings resolves a full row at once", () => {
    const rows = parseCsv('"1",NULL,""\r\n');
    expect(rowToNullableStrings(rows[0]!)).toEqual(["1", null, ""]);
  });

  it("handles multiple data rows with mixed NULL/empty/value fields", () => {
    const csv =
      '"Id","Email","LastLogin"\r\n' +
      '"1","a@example.com","2020-01-01T00:00:00.000"\r\n' +
      '"2",NULL,NULL\r\n' +
      '"3","",""\r\n';
    const rows = parseCsv(csv);
    expect(rows).toHaveLength(4);
    expect(rowToNullableStrings(rows[2]!)).toEqual(["2", null, null]);
    expect(rowToNullableStrings(rows[3]!)).toEqual(["3", "", ""]);
  });
});

describe("CsvParser (chunked/streaming)", () => {
  it("produces the same rows regardless of how the input is chunked", () => {
    const csv = '"Id","Name"\r\n"1","alpha"\r\n"2","beta, with comma"\r\n';
    const whole = parseCsv(csv);

    // Feed byte-by-byte to exercise every chunk-boundary case, including
    // mid-quote and mid-CRLF splits.
    const parser = new CsvParser();
    const chunked: CsvRow[] = [];
    for (const ch of csv) {
      chunked.push(...parser.feed(ch));
    }
    chunked.push(...parser.end());

    expect(chunked.map(values)).toEqual(whole.map(values));
    expect(chunked.map(quotedFlags)).toEqual(whole.map(quotedFlags));
  });

  it("splits exactly at a doubled-quote escape without corrupting it", () => {
    const csv = '"a""b"\r\n';
    // Split right between the two quote characters of the "" escape.
    const splitPoint = csv.indexOf('""') + 1;
    const parser = new CsvParser();
    const rows = [
      ...parser.feed(csv.slice(0, splitPoint)),
      ...parser.feed(csv.slice(splitPoint)),
      ...parser.end(),
    ];
    expect(values(rows[0]!)).toEqual(['a"b']);
  });
});

describe("parseCsvHeader", () => {
  it("returns just the header row's decoded values", () => {
    const header = parseCsvHeader(
      '"Id","DoubleLetterCode","TripleLetterCode"\r\n"1","US","USA"\r\n',
    );
    expect(header).toEqual(["Id", "DoubleLetterCode", "TripleLetterCode"]);
  });

  it("throws on an empty file", () => {
    expect(() => parseCsvHeader("")).toThrow(/no header row/);
  });
});
