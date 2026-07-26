import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extract } from "./marker-info-state";

const fixturesDir = path.dirname(fileURLToPath(import.meta.url)) + "/__fixtures__";
const html = readFileSync(path.join(fixturesDir, "marker-info-state.html"), "utf-8");

describe("legacy marker-info-state extractor", () => {
  it("reads stateId from the details link and header name from the <strong> cell", () => {
    const result = extract(html);
    expect(result.stateId).toBe(5);
    expect(result.name).toBe("Ohio");
    expect(result.detailsLink).toEqual({ text: "View more details", href: "/Browse/States/5/Details" });
  });

  it("omits unspecified RHI20/RGI20 rows entirely (IfSpecified with no NullDisplayText)", () => {
    const { rows } = extract(html);
    expect(rows["RHI5"]).toBe("134.82");
    expect(rows["RHI20"]).toBeUndefined();
    expect(rows["Trees measured"]).toBe("842");
    expect(rows["Country"]).toBe("United States");
  });
});
