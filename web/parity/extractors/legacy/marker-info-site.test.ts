import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./marker-info-site";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "marker-info-site.html"), "utf-8");

describe("legacy marker-info-site extractor", () => {
  it("reads siteId from the details link and header name", () => {
    const result = extract(html);
    expect(result.siteId).toBe(17);
    expect(result.name).toBe("Old Growth Preserve");
  });

  it("captures State as plain ReportDisplayFor text, not a link (State.cshtml has no anchor)", () => {
    const { rows } = extract(html);
    expect(rows["State"]).toBe("Ohio (US)");
    expect(rows["County"]).toBe("Hamilton");
    expect(rows["Ownership type"]).toBe("Public");
  });

  it("extracts photo thumbnails and excludes the Photos row from `rows`", () => {
    const { photos, rows } = extract(html);
    expect(photos).toEqual([{ thumbnailSrc: "/Photos/9001/Square" }, { thumbnailSrc: "/Photos/9002/Square" }]);
    expect(rows["Photos"]).toBeUndefined();
  });

  it("pulls LastMeasurementDate out separately, after the Photos row", () => {
    const { lastMeasurementDate, rows } = extract(html);
    expect(lastMeasurementDate).toBe("05/12/2018");
    expect(rows["Last measurement date"]).toBeUndefined();
  });
});
