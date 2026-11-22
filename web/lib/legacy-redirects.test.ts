/**
 * P4-01 table-driven tests (doc 06 §P4-01, doc 07 §5.6) over every
 * doc-listed legacy shape, including the encoding/casing variants doc 06
 * calls out explicitly: raw-space / `%20` / `+` path encodings, mixed case,
 * nested parens (the Vitis labrusca case), scoped species with query
 * params, all eight `/Export/**` shapes asserting 302, token routes, and
 * unresolvable species -> `null`.
 */
import { describe, expect, it } from "vitest";
import { legacyRedirect } from "./legacy-redirects";
import { speciesSlug } from "./slug";

const BALSAM_FIR_SLUG = speciesSlug("Abies balsamea var. balsamea", "Balsam Fir");
const SILVER_FIR_SLUG = speciesSlug("Abies alba", "Silver Fir");
// Nested-parens case -- real corpus data (parity/corpus.json). The redirect
// splits at the " (" that balances the final ")", so the slug is the one the
// species page itself uses (its DB names are "Vitis labrusca" + "Northern
// Fox Grape (Vine)"). A plain last-" (" split gave
// "vitis-labrusca-northern-fox-grape--vine", which 404s.
const GRAPE_SLUG = speciesSlug("Vitis labrusca", "Northern Fox Grape (Vine)");

const TOKEN = "AbCd1234-_AbCd1234-_AbCd1234-_AbCd1234-_AbC"; // 43 chars, [A-Za-z0-9_-]
if (TOKEN.length !== 43) throw new Error("test setup: TOKEN must be exactly 43 chars");

describe("legacyRedirect", () => {
  describe("map", () => {
    it("/Map -> /map (301)", () => {
      expect(legacyRedirect("GET", "/Map", "")).toEqual({ status: 301, location: "/map" });
    });

    it("/Map/AllMarkers -> /api/map/markers (301)", () => {
      expect(legacyRedirect("GET", "/Map/AllMarkers", "")).toEqual({ status: 301, location: "/api/map/markers" });
    });

    it("/Map/{id}/StateMarkerInfo -> /api/map/states/{id}/info", () => {
      expect(legacyRedirect("GET", "/Map/7/StateMarkerInfo", "")).toEqual({
        status: 301,
        location: "/api/map/states/7/info",
      });
    });

    it("/Map/{id}/SiteMarkerInfo -> /api/map/sites/{id}/info", () => {
      expect(legacyRedirect("GET", "/Map/45/SiteMarkerInfo", "")).toEqual({
        status: 301,
        location: "/api/map/sites/45/info",
      });
    });

    it("/Map/{id}/TreeMarkerInfo -> /api/map/trees/{id}/info", () => {
      expect(legacyRedirect("GET", "/Map/123/TreeMarkerInfo", "")).toEqual({
        status: 301,
        location: "/api/map/trees/123/info",
      });
    });

    it("/Map/{id}/TreeMarker and /SiteMarker have no new-app target yet -> null (documented gap)", () => {
      expect(legacyRedirect("GET", "/Map/123/TreeMarker", "")).toBeNull();
      expect(legacyRedirect("GET", "/Map/45/SiteMarker", "")).toBeNull();
    });

    it("case-insensitive: /MAP, /mAp resolve (bare lowercase /map is already canonical -- see self-redirect guard below)", () => {
      for (const p of ["/MAP", "/mAp"]) {
        expect(legacyRedirect("GET", p, "")).toEqual({ status: 301, location: "/map" });
      }
    });
  });

  describe("browse list/detail pages", () => {
    it("/Browse/Locations -> /locations, query passed through verbatim", () => {
      expect(legacyRedirect("GET", "/Browse/Locations", "?page=2&sort=Name&sortAsc=false")).toEqual({
        status: 301,
        location: "/locations?page=2&sort=Name&sortAsc=false",
      });
    });

    it("/Browse/Species (list) -> /species, query passed through", () => {
      expect(legacyRedirect("GET", "/Browse/Species", "?botanicalNameFilter=oak")).toEqual({
        status: 301,
        location: "/species?botanicalNameFilter=oak",
      });
    });

    it("bare /Browse -> null (legacy itself has no Index action -- confirmed via BrowseController.cs + Global.asax.cs)", () => {
      expect(legacyRedirect("GET", "/Browse", "")).toBeNull();
    });

    it("/Browse/Activity -> /activity", () => {
      expect(legacyRedirect("GET", "/Browse/Activity", "")).toEqual({ status: 301, location: "/activity" });
    });

    it("/Browse/Trees/{id}/Details -> /trees/{id}, query passed through", () => {
      expect(legacyRedirect("GET", "/Browse/Trees/123/Details", "?treesSort=LastMeasured")).toEqual({
        status: 301,
        location: "/trees/123?treesSort=LastMeasured",
      });
    });

    it("/Browse/Sites/{id}/Details -> /sites/{id}", () => {
      expect(legacyRedirect("GET", "/Browse/Sites/45/Details", "")).toEqual({ status: 301, location: "/sites/45" });
    });

    it("/Browse/States/{id}/Details -> /states/{id}", () => {
      expect(legacyRedirect("GET", "/Browse/States/7/Details", "")).toEqual({ status: 301, location: "/states/7" });
    });
  });

  describe("species details -- encoding variants + last ' (' split", () => {
    const expected = { status: 301 as const, location: `/species/${BALSAM_FIR_SLUG}` };

    it("raw space + parens", () => {
      expect(
        legacyRedirect("GET", "/Browse/Species/Abies balsamea var. balsamea (Balsam Fir)/Details", ""),
      ).toEqual(expected);
    });

    it("%20-encoded", () => {
      expect(
        legacyRedirect(
          "GET",
          "/Browse/Species/Abies%20balsamea%20var.%20balsamea%20(Balsam%20Fir)/Details",
          "",
        ),
      ).toEqual(expected);
    });

    it("+-encoded", () => {
      expect(
        legacyRedirect("GET", "/Browse/Species/Abies+balsamea+var.+balsamea+(Balsam+Fir)/Details", ""),
      ).toEqual(expected);
    });

    it("mixed encoding (some %20, some +, some raw)", () => {
      expect(
        legacyRedirect("GET", "/Browse/Species/Abies%20balsamea+var. balsamea+(Balsam%20Fir)/Details", ""),
      ).toEqual(expected);
    });

    it("mixed case path segments", () => {
      expect(
        legacyRedirect("GET", "/browse/SPECIES/Abies balsamea var. balsamea (Balsam Fir)/DeTaIls", ""),
      ).toEqual(expected);
    });

    it("nested parens (Vitis labrusca / 'Northern Fox Grape (Vine)') resolves to the species' real slug", () => {
      expect(
        legacyRedirect("GET", "/Browse/Species/Vitis labrusca (Northern Fox Grape (Vine))/Details", ""),
      ).toEqual({ status: 301, location: `/species/${GRAPE_SLUG}` });
    });

    it("the grape slug is the species page's own", () => {
      expect(GRAPE_SLUG).toBe("vitis-labrusca--northern-fox-grape-vine");
    });

    it("unbalanced parens fall back to the last ' (' split", () => {
      expect(legacyRedirect("GET", "/Browse/Species/Quercus alba (White Oak))/Details", "")).toEqual({
        status: 301,
        location: `/species/${speciesSlug("Quercus alba", "White Oak)")}`,
      });
    });

    it("unresolvable segment (no ' (' at all) -> null, falls through to the 404-with-search-box", () => {
      expect(legacyRedirect("GET", "/Browse/Species/NotAValidSegment/Details", "")).toBeNull();
    });

    it("query-param scoped form (?siteId=) translates to ?site=", () => {
      expect(
        legacyRedirect(
          "GET",
          "/Browse/Species/Abies balsamea var. balsamea (Balsam Fir)/Details",
          "?siteId=436",
        ),
      ).toEqual({ status: 301, location: `/species/${BALSAM_FIR_SLUG}?site=436` });
    });

    it("query-param scoped form (?stateId=) translates to ?state=", () => {
      expect(
        legacyRedirect(
          "GET",
          "/Browse/Species/Abies balsamea var. balsamea (Balsam Fir)/Details",
          "?stateId=12",
        ),
      ).toEqual({ status: 301, location: `/species/${BALSAM_FIR_SLUG}?state=12` });
    });
  });

  describe("scoped species (nested-path form)", () => {
    it("/Browse/Sites/{id}/Species/{seg}/Details -> /species/{slug}?site={id}", () => {
      expect(
        legacyRedirect("GET", "/Browse/Sites/436/Species/Abies alba (Silver Fir)/Details", ""),
      ).toEqual({ status: 301, location: `/species/${SILVER_FIR_SLUG}?site=436` });
    });

    it("drops a mangled, URL-encoded sort query (live crawler alert 2026-11-22) instead of carrying it over", () => {
      expect(
        legacyRedirect(
          "GET",
          "/Browse/Sites/436/Species/Abies alba (Silver Fir)/Details",
          "?siteSpeciesSort=Site%26siteSpeciesSortAsc=True%26stateSpeciesSort=State%26stateSpeciesSortAsc=True%26treesSort=Girth%26treesSortAsc=False",
        ),
      ).toEqual({ status: 301, location: `/species/${SILVER_FIR_SLUG}?site=436` });
    });

    it("/Browse/States/{id}/Species/{seg}/Details -> /species/{slug}?state={id}", () => {
      expect(
        legacyRedirect("GET", "/Browse/States/12/Species/Abies alba (Silver Fir)/Details", ""),
      ).toEqual({ status: 301, location: `/species/${SILVER_FIR_SLUG}?state=12` });
    });

    it("nested-path scoped form with an unresolvable segment -> null", () => {
      expect(legacyRedirect("GET", "/Browse/Sites/436/Species/NoParens/Details", "")).toBeNull();
    });
  });

  describe("search", () => {
    it("/Search?term=oak -> /search?term=oak", () => {
      expect(legacyRedirect("GET", "/Search", "?term=oak")).toEqual({ status: 301, location: "/search?term=oak" });
    });

    it("bare /Search (no query) -> /search", () => {
      expect(legacyRedirect("GET", "/Search", "")).toEqual({ status: 301, location: "/search" });
    });
  });

  describe("export -- all eight shapes, 302", () => {
    it("/Export/Trees/{id}", () => {
      expect(legacyRedirect("GET", "/Export/Trees/123", "")).toEqual({ status: 302, location: "/export/trees/123" });
    });

    it("/Export/Sites/{id}", () => {
      expect(legacyRedirect("GET", "/Export/Sites/45", "")).toEqual({ status: 302, location: "/export/sites/45" });
    });

    it("/Export/States/{id}", () => {
      expect(legacyRedirect("GET", "/Export/States/7", "")).toEqual({ status: 302, location: "/export/states/7" });
    });

    it("/Export/Species/{bn} ({cn}) -- literal mirror, NOT the D-011 slug", () => {
      const seg = "Abies balsamea var. balsamea (Balsam Fir)";
      expect(legacyRedirect("GET", `/Export/Species/${seg}`, "")).toEqual({
        status: 302,
        location: `/export/species/${encodeURIComponent(seg)}`,
      });
    });

    it("/Export/Sites/{id}/Species/{bn} ({cn}) -- literal mirror", () => {
      const seg = "Abies alba (Silver Fir)";
      expect(legacyRedirect("GET", `/Export/Sites/45/Species/${seg}`, "")).toEqual({
        status: 302,
        location: `/export/sites/45/species/${encodeURIComponent(seg)}`,
      });
    });

    it("/Export/States/{id}/Species/{bn} ({cn}) -- literal mirror", () => {
      const seg = "Abies alba (Silver Fir)";
      expect(legacyRedirect("GET", `/Export/States/12/Species/${seg}`, "")).toEqual({
        status: 302,
        location: `/export/states/12/species/${encodeURIComponent(seg)}`,
      });
    });

    it("/Export/SpeciesByFilters -- lowercased mirror, query forwarded", () => {
      expect(legacyRedirect("GET", "/Export/SpeciesByFilters", "?botanicalNameFilter=oak")).toEqual({
        status: 302,
        location: "/export/speciesbyfilters?botanicalNameFilter=oak",
      });
    });

    it("/Export/LocationsByFilters -- lowercased mirror, query forwarded", () => {
      expect(legacyRedirect("GET", "/Export/LocationsByFilters", "?stateFilter=OH")).toEqual({
        status: 302,
        location: "/export/locationsbyfilters?stateFilter=OH",
      });
    });

    it("case-insensitive export path", () => {
      expect(legacyRedirect("GET", "/eXpOrT/tReEs/123", "")).toEqual({ status: 302, location: "/export/trees/123" });
    });
  });

  describe("photos", () => {
    it("/Photos/{id}/{size}", () => {
      expect(legacyRedirect("GET", "/Photos/123/Original", "")).toEqual({
        status: 301,
        location: "/photos/123/Original",
      });
    });

    it("/Photos/{id} (no size) defaults to Original", () => {
      expect(legacyRedirect("GET", "/Photos/123", "")).toEqual({ status: 301, location: "/photos/123/Original" });
    });

    it("size segment's case is preserved verbatim (new route matches PhotoSize case-insensitively)", () => {
      expect(legacyRedirect("GET", "/Photos/123/thumbnail", "")).toEqual({
        status: 301,
        location: "/photos/123/thumbnail",
      });
    });
  });

  describe("account pages", () => {
    it("LogOn -> /account/login, any case", () => {
      expect(legacyRedirect("GET", "/Account/LogOn", "")).toEqual({ status: 301, location: "/account/login" });
      expect(legacyRedirect("GET", "/account/logon", "")).toEqual({ status: 301, location: "/account/login" });
    });

    it("LogOn carries a same-site ReturnUrl as callbackUrl and drops anything else", () => {
      expect(legacyRedirect("GET", "/Account/LogOn", "?ReturnUrl=%2fImport")).toEqual({
        status: 301,
        location: "/account/login?callbackUrl=%2FImport",
      });
      expect(legacyRedirect("GET", "/Account/LogOn", "?ReturnUrl=https%3a%2f%2fevil.example")).toEqual({
        status: 301,
        location: "/account/login",
      });
      expect(legacyRedirect("GET", "/Account/LogOn", "?ReturnUrl=%2f%2fevil.example")).toEqual({
        status: 301,
        location: "/account/login",
      });
    });

    it("Register, PasswordAssistance and Edit", () => {
      expect(legacyRedirect("GET", "/Account/Register", "")).toEqual({ status: 301, location: "/account/register" });
      expect(legacyRedirect("GET", "/Account/PasswordAssistance", "")).toEqual({
        status: 301,
        location: "/account/password-assistance",
      });
      expect(legacyRedirect("GET", "/Account/Edit", "")).toEqual({ status: 301, location: "/account" });
    });

    it("leaves the new app's own account pages alone", () => {
      expect(legacyRedirect("GET", "/account/register", "")).toBeNull();
      expect(legacyRedirect("GET", "/account/password-assistance", "")).toBeNull();
      expect(legacyRedirect("GET", "/account/login", "")).toBeNull();
      expect(legacyRedirect("POST", "/Account/LogOn", "")).toBeNull();
    });
  });

  describe("account token routes (emailed links)", () => {
    it("CompleteRegistration -> /account/verify/{token}", () => {
      expect(legacyRedirect("GET", `/Account/${TOKEN}/CompleteRegistration`, "")).toEqual({
        status: 301,
        location: `/account/verify/${TOKEN}`,
      });
    });

    it("CompletePasswordAssistance -> /account/password-assistance/{token}", () => {
      expect(legacyRedirect("GET", `/Account/${TOKEN}/CompletePasswordAssistance`, "")).toEqual({
        status: 301,
        location: `/account/password-assistance/${TOKEN}`,
      });
    });

    it("case-insensitive action name", () => {
      expect(legacyRedirect("GET", `/Account/${TOKEN}/completeregistration`, "")).toEqual({
        status: 301,
        location: `/account/verify/${TOKEN}`,
      });
    });

    it("an unmapped /Account/{action} path (not a token route) -> null, defers to the app", () => {
      expect(legacyRedirect("GET", "/Account/Logout", "")).toBeNull();
    });
  });

  describe("/Main (legacy odds and ends, doc 07 §5.6)", () => {
    it("/Main -> /map (301; not in normalize.ts's table, added here)", () => {
      expect(legacyRedirect("GET", "/Main", "")).toEqual({ status: 301, location: "/map" });
    });

    it("case-insensitive", () => {
      expect(legacyRedirect("GET", "/MAIN", "")).toEqual({ status: 301, location: "/map" });
    });
  });

  describe("self-redirect guard (case-insensitive matching can hit already-canonical new-app paths)", () => {
    it("/map (already canonical) -> null", () => {
      expect(legacyRedirect("GET", "/map", "")).toBeNull();
    });

    it("/export/trees/123 (already canonical) -> null", () => {
      expect(legacyRedirect("GET", "/export/trees/123", "")).toBeNull();
    });

    it("/search?term=oak (already canonical) -> null", () => {
      expect(legacyRedirect("GET", "/search", "?term=oak")).toBeNull();
    });

    it("/photos/123/Original (already canonical) -> null", () => {
      expect(legacyRedirect("GET", "/photos/123/Original", "")).toBeNull();
    });
  });

  describe("everything else -> 404 (null, no redirect)", () => {
    it("an unmapped path under a covered prefix", () => {
      expect(legacyRedirect("GET", "/Map/SomeFutureAction", "")).toBeNull();
    });

    it("a path entirely outside any legacy shape", () => {
      expect(legacyRedirect("GET", "/Totally/Unrelated/Path", "")).toBeNull();
    });

    it("non-GET/HEAD methods never redirect, even for an otherwise-valid shape", () => {
      expect(legacyRedirect("POST", "/Browse/Trees/123/Details", "")).toBeNull();
      expect(legacyRedirect("PUT", "/Map", "")).toBeNull();
    });

    it("HEAD is treated the same as GET", () => {
      expect(legacyRedirect("HEAD", "/Map", "")).toEqual({ status: 301, location: "/map" });
    });
  });
});
