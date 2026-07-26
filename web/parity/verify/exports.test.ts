import { describe, expect, it } from "vitest";
import { compareExport, extractContentDispositionFilename, stripTrailingNewline } from "./exports";

describe("stripTrailingNewline", () => {
  it("strips exactly one trailing CRLF", () => {
    expect(stripTrailingNewline("a,b\r\nc,d\r\n")).toBe("a,b\r\nc,d");
  });

  it("strips exactly one trailing LF, leaving interior newlines untouched", () => {
    expect(stripTrailingNewline("a\nb\n")).toBe("a\nb");
  });

  it("is a no-op when there is no trailing newline", () => {
    expect(stripTrailingNewline("a,b")).toBe("a,b");
  });
});

describe("extractContentDispositionFilename", () => {
  it("extracts a quoted filename", () => {
    expect(extractContentDispositionFilename('attachment; filename="All Trees (Feet).csv"')).toBe("All Trees (Feet).csv");
  });

  it("returns null when the header is absent", () => {
    expect(extractContentDispositionFilename(null)).toBeNull();
  });
});

describe("compareExport", () => {
  const csv = 'Id,Name\r\n"1","Oak"\r\n';

  it("passes byte-identical bodies + filenames with no diffs", () => {
    const artifact = { body: csv, contentDisposition: 'attachment; filename="Site 436 (Feet).csv"' };
    const result = compareExport("https://legacy/Export/Sites/436", artifact, { ...artifact });
    expect(result.diffs).toEqual([]);
    expect(result.checksRun).toBe(2);
  });

  it("ignores a trailing-newline-only difference (doc §5.1 normalization)", () => {
    const legacy = { body: csv, contentDisposition: null };
    const next = { body: csv.slice(0, -2), contentDisposition: null }; // same content, no trailing CRLF
    expect(compareExport("x", legacy, next).diffs).toEqual([]);
  });

  it("fails on a real body byte difference", () => {
    const legacy = { body: csv, contentDisposition: null };
    const next = { body: 'Id,Name\r\n"1","Maple"\r\n', contentDisposition: null };
    const result = compareExport("x", legacy, next);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0]!.field).toBe("body");
  });

  it("fails on a Content-Disposition filename mismatch even when the body matches", () => {
    const legacy = { body: csv, contentDisposition: 'attachment; filename="Site 436 (Feet).csv"' };
    const next = { body: csv, contentDisposition: 'attachment; filename="Site 436 (Meters).csv"' };
    const result = compareExport("x", legacy, next);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0]!.field).toBe("content-disposition-filename");
  });

  it("skips the filename check entirely when legacy.contentDisposition is undefined (capture.ts never stored it - known gap)", () => {
    const legacy = { body: csv, contentDisposition: undefined };
    const next = { body: csv, contentDisposition: 'attachment; filename="whatever.csv"' };
    const result = compareExport("x", legacy, next);
    expect(result.diffs).toEqual([]);
    expect(result.checksRun).toBe(1);
  });

  // W-003 (activated by the P1-15 sweep - see this file's header comment).
  // 25-column-shaped rows (tree id at index 9, measurement number at index
  // 10, matching lib/export/tree-csv.ts's csvHeaders()) so the rescue logic
  // can find its sort keys.
  function treeRow(treeId: number, measurementNumber: number, commonName: string): string {
    const cols = new Array(25).fill("");
    cols[0] = commonName;
    cols[9] = String(treeId);
    cols[10] = String(measurementNumber);
    return cols.map((v) => `"${v}"`).join(",");
  }
  const header25 = new Array(25).fill("H").map((_, i) => `"col${i}"`).join(",");

  it("W-003: a body mismatch that is ONLY a row-order difference is tagged waiverHint W-003, not a hard failure", () => {
    const rowA = treeRow(100, 1, "White Oak");
    const rowB = treeRow(200, 1, "Red Maple");
    const legacy = { body: `${header25}\r\n${rowA}\r\n${rowB}\r\n`, contentDisposition: undefined };
    const next = { body: `${header25}\r\n${rowB}\r\n${rowA}\r\n`, contentDisposition: undefined }; // same rows, swapped order
    const result = compareExport("x", legacy, next);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0]!.waiverHint).toBe("W-003");
  });

  it("W-003 rescue does not mask a genuine content difference (still a hard failure, no waiverHint)", () => {
    const rowA = treeRow(100, 1, "White Oak");
    const rowBLegacy = treeRow(200, 1, "Red Maple");
    const rowBNext = treeRow(200, 1, "Sugar Maple"); // real content change, not just reordered
    const legacy = { body: `${header25}\r\n${rowA}\r\n${rowBLegacy}\r\n`, contentDisposition: undefined };
    const next = { body: `${header25}\r\n${rowBNext}\r\n${rowA}\r\n`, contentDisposition: undefined };
    const result = compareExport("x", legacy, next);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0]!.waiverHint).toBeUndefined();
  });

  // W-010 (D-016 species whitespace-duplicate cleanup) - exports scope is
  // name-cell text only (waivers.md's entry), tried after W-003 has already
  // failed to reconcile the bodies.
  function treeRowWithName(treeId: number, measurementNumber: number, commonName: string, scientificName: string): string {
    const cols = new Array(25).fill("");
    cols[0] = commonName;
    cols[1] = scientificName;
    cols[9] = String(treeId);
    cols[10] = String(measurementNumber);
    return cols.map((v) => `"${v}"`).join(",");
  }

  it("W-010: a row differing ONLY by a whitespace-collapse-equal name cell is tagged waiverHint W-010, not a hard failure", () => {
    const legacyRow = treeRowWithName(100, 1, "Judas-Tree", "Cercis  siliquastrum"); // double space
    const nextRow = treeRowWithName(100, 1, "Judas-Tree", "Cercis siliquastrum"); // collapsed
    const legacy = { body: `${header25}\r\n${legacyRow}\r\n`, contentDisposition: undefined };
    const next = { body: `${header25}\r\n${nextRow}\r\n`, contentDisposition: undefined };
    const result = compareExport("x", legacy, next);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0]!.waiverHint).toBe("W-010");
  });

  it("W-010 rescue does not mask a genuine name-cell content difference (still a hard failure, no waiverHint)", () => {
    const legacyRow = treeRowWithName(100, 1, "White Oak", "Quercus alba");
    const nextRow = treeRowWithName(100, 1, "White Oak", "Quercus rubra"); // real content change, not whitespace
    const legacy = { body: `${header25}\r\n${legacyRow}\r\n`, contentDisposition: undefined };
    const next = { body: `${header25}\r\n${nextRow}\r\n`, contentDisposition: undefined };
    const result = compareExport("x", legacy, next);
    expect(result.diffs).toHaveLength(1);
    expect(result.diffs[0]!.waiverHint).toBeUndefined();
  });

  // W-010 prong 3 (closed 7-artifact `/Export/Species/{bn} ({cn})` allowlist,
  // waivers.md's entry) - real report shape from
  // parity/reports/exports-2026-07-18.md's 7 failures.
  describe("W-010 prong 3 (species-export artifact allowlist)", () => {
    function withCell(treeId: number, measurementNumber: number, commonName: string, scientificName: string, colIndex: number, value: string): string {
      const cols = new Array(25).fill("");
      cols[0] = commonName;
      cols[1] = scientificName;
      cols[9] = String(treeId);
      cols[10] = String(measurementNumber);
      cols[colIndex] = value;
      return cols.map((v) => `"${v}"`).join(",");
    }

    it("duplicate-variant: legacy has data, new is header-only -> tagged W-010", () => {
      const url = "https://www.treesdb.org/Export/Species/Cercis%20%20siliquastrum%20(Judas-Tree)";
      const legacyRow = treeRowWithName(100, 1, "Judas-Tree", "Cercis  siliquastrum");
      const legacy = { body: `${header25}\r\n${legacyRow}\r\n`, contentDisposition: undefined };
      const next = { body: `${header25}\r\n`, contentDisposition: undefined }; // header only - species merged/renamed away
      const result = compareExport(url, legacy, next);
      expect(result.diffs).toHaveLength(1);
      expect(result.diffs[0]!.waiverHint).toBe("W-010");
    });

    it("duplicate-variant: new is NOT header-only (unexplained content) -> still fails, untagged", () => {
      const url = "https://www.treesdb.org/Export/Species/Cercis%20%20siliquastrum%20(Judas-Tree)";
      const legacyRow = treeRowWithName(100, 1, "Judas-Tree", "Cercis  siliquastrum");
      const nextRow = treeRowWithName(999, 1, "Something Else", "Unrelated genus"); // a real (unexplained) row on the new side
      const legacy = { body: `${header25}\r\n${legacyRow}\r\n`, contentDisposition: undefined };
      const next = { body: `${header25}\r\n${nextRow}\r\n`, contentDisposition: undefined };
      const result = compareExport(url, legacy, next);
      expect(result.diffs).toHaveLength(1);
      expect(result.diffs[0]!.waiverHint).toBeUndefined();
    });

    it("clean-twin: legacy rows are a subset of new rows (new gained the absorbed duplicate's tree) -> tagged W-010", () => {
      const url = "https://www.treesdb.org/Export/Species/Cercis%20siliquastrum%20(Judas-Tree)";
      const sharedRow = treeRowWithName(100, 1, "Judas-Tree", "Cercis siliquastrum");
      const absorbedRow = treeRowWithName(200, 1, "Judas-Tree", "Cercis siliquastrum"); // the merged-in duplicate's tree
      const legacy = { body: `${header25}\r\n${sharedRow}\r\n`, contentDisposition: undefined };
      const next = { body: `${header25}\r\n${sharedRow}\r\n${absorbedRow}\r\n`, contentDisposition: undefined };
      const result = compareExport(url, legacy, next);
      expect(result.diffs).toHaveLength(1);
      expect(result.diffs[0]!.waiverHint).toBe("W-010");
    });

    it("clean-twin: a shared row's non-name cell genuinely differs -> still fails, untagged (not masked)", () => {
      const url = "https://www.treesdb.org/Export/Species/Cercis%20siliquastrum%20(Judas-Tree)";
      const legacyRow = withCell(100, 1, "Judas-Tree", "Cercis siliquastrum", 5, "12.3");
      const nextRow = withCell(100, 1, "Judas-Tree", "Cercis siliquastrum", 5, "45.6"); // real value change, not whitespace
      const absorbedRow = treeRowWithName(200, 1, "Judas-Tree", "Cercis siliquastrum");
      const legacy = { body: `${header25}\r\n${legacyRow}\r\n`, contentDisposition: undefined };
      const next = { body: `${header25}\r\n${nextRow}\r\n${absorbedRow}\r\n`, contentDisposition: undefined };
      const result = compareExport(url, legacy, next);
      expect(result.diffs).toHaveLength(1);
      expect(result.diffs[0]!.waiverHint).toBeUndefined();
    });

    it("does not apply to a species export URL outside the closed D-016 list (still fails, untagged)", () => {
      const url = "https://www.treesdb.org/Export/Species/Quercus%20alba%20(White%20Oak)";
      const legacyRow = treeRowWithName(100, 1, "White Oak", "Quercus alba");
      const nextRow = treeRowWithName(100, 1, "White Oak", "Quercus rubra");
      const legacy = { body: `${header25}\r\n${legacyRow}\r\n`, contentDisposition: undefined };
      const next = { body: `${header25}\r\n${nextRow}\r\n`, contentDisposition: undefined };
      const result = compareExport(url, legacy, next);
      expect(result.diffs).toHaveLength(1);
      expect(result.diffs[0]!.waiverHint).toBeUndefined();
    });
  });
});
