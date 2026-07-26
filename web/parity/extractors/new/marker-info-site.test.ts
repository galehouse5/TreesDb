import { describe, expect, it } from "vitest";
import { extract } from "./marker-info-site";

/**
 * BUGFIX regression (surfaced by the P1-15 sweep): a JSON API string field
 * with a literal double space (e.g. from underlying data like
 * "Foo  (Bar)") must be collapsed the same way the legacy HTML extractor's
 * `collapseWhitespace` collapses rendered markup - both render as an
 * ordinary HTML text node, which every browser visually collapses to a
 * single space, so the two "displayed text" values are genuinely equal.
 */
describe("new marker-info-site extractor", () => {
  it("collapses internal whitespace runs in name, rows values, and detailsLink.text", () => {
    const raw = JSON.stringify({
      siteId: 1649,
      name: "Mountains-To-Sea Trail  (Busbee Reservoir)",
      detailsLink: { text: "Mountains-To-Sea  Trail", href: "/sites/1649" },
      rows: { "Ownership type": "Public -  National Forest", County: "St.  Louis" },
      photos: [],
      lastMeasurementDate: "2020-01-01",
    });
    const result = extract(raw);
    expect(result.name).toBe("Mountains-To-Sea Trail (Busbee Reservoir)");
    expect(result.detailsLink.text).toBe("Mountains-To-Sea Trail");
    expect(result.rows["Ownership type"]).toBe("Public - National Forest");
    expect(result.rows["County"]).toBe("St. Louis");
  });

  it("throws on a malformed response body", () => {
    expect(() => extract("not json")).toThrow();
    expect(() => extract(JSON.stringify({ siteId: 1 }))).toThrow();
  });
});
