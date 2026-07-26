import { describe, expect, it } from "vitest";
import { csvResponse, exportNotFound, treeExportFilename } from "./csv-response";
import { Units } from "@/lib/export/tree-csv";

describe("csvResponse", () => {
  it("sets Content-Type and a quoted, ASCII-safe Content-Disposition filename", () => {
    const res = csvResponse([], Units.Feet, "Site 436 (Feet).csv");
    expect(res.headers.get("content-type")).toBe("text/csv");
    expect(res.headers.get("content-disposition")).toBe('attachment; filename="Site 436 (Feet).csv"; filename*=UTF-8\'\'Site%20436%20(Feet).csv');
  });

  // BUGFIX regression (surfaced by the P1-15 sweep): a non-Latin1 character
  // in the filename (e.g. curly quotes from a species common name) used to
  // throw when constructing the Response - a real 500 on
  // /export/species/{name containing such a character}. See this file's
  // BUGFIX doc comment.
  it("does not throw and produces a valid header when the filename contains non-Latin1 characters", () => {
    const filename = "Species-M. acuminata var. subcordata x m. x soulangeana ‘alexandrina’ (Feet).csv";
    expect(() => csvResponse([], Units.Feet, filename)).not.toThrow();
    const res = csvResponse([], Units.Feet, filename);
    const disposition = res.headers.get("content-disposition")!;
    expect(disposition).toContain('filename="Species-M. acuminata var. subcordata x m. x soulangeana _alexandrina_ (Feet).csv"');
    expect(disposition).toContain("filename*=UTF-8''");
    expect(decodeURIComponent(disposition.split("UTF-8''")[1]!)).toBe(filename);
  });

  it("still backslash-escapes embedded quotes/backslashes in the ASCII fallback", () => {
    const res = csvResponse([], Units.Feet, 'weird "name".csv');
    expect(res.headers.get("content-disposition")).toContain('filename="weird \\"name\\".csv"');
  });
});

describe("exportNotFound", () => {
  it("returns a 404 with body 'Not Found'", async () => {
    const res = exportNotFound();
    expect(res.status).toBe(404);
    expect(await res.text()).toBe("Not Found");
  });
});

describe("treeExportFilename", () => {
  it("matches legacy's Tree-{id} ({unit}).csv shape", () => {
    expect(treeExportFilename(42, Units.Meters)).toBe("Tree-42 (m).csv");
    expect(treeExportFilename(42, Units.Yards)).toBe("Tree-42 (yd).csv");
    expect(treeExportFilename(42, Units.Feet)).toBe("Tree-42 (ft).csv");
  });
});
