import { describe, expect, it } from "vitest";
import { siteScopedSpeciesHash, speciesHash, stateScopedSpeciesHash } from "./species-hash";

describe("speciesHash", () => {
  // Doc 07 §7.1.5 / §7.3 primary vector, cross-checked directly against the
  // SQL formula in Tmd.Migrations/Scripts/CreateObjectsAndTypes.sql:30-33.
  it("('Quercus alba', 'White Oak') -> 279197145", () => {
    expect(speciesHash("Quercus alba", "White Oak")).toBe(279197145);
  });

  it("is insensitive to case and surrounding whitespace (lower(trim(...)))", () => {
    expect(speciesHash("  QUERCUS ALBA  ", "  white oak  ")).toBe(279197145);
  });

  // Non-ASCII vectors from the 2026-07-12 production dump (parity §7.1.5
  // initially flagged these three): names containing U+2019 / U+2018 curly
  // quotes, which live in the CP1252-only 0x80-0x9F byte range. A latin1
  // encoding gets these wrong; production hashes CP1252 bytes
  // (SQL_Latin1_General_CP1_CI_AS, code page 1252). Expected values are the
  // ComputedMeasuredSpeciesId column values dumped from production.
  it("CP1252 curly-quote names match production hashes", () => {
    expect(speciesHash("Carya x dunbarii", "Dunbar’S Hickory")).toBe(530910614);
    expect(speciesHash("Aesculus x mississippiensis", "Bush’S Buckeye")).toBe(377471773);
    expect(
      speciesHash("M. acuminata var. subcordata x m. x soulangeana ‘alexandrina’", "Yellow Lantern Magnolia"),
    ).toBe(1260420807);
  });

  it("the (Unidentified) placeholder hashes to a stable value", () => {
    expect(speciesHash("(Unidentified)", "(Unidentified)")).toBe(0);
  });
});

describe("siteScopedSpeciesHash", () => {
  // Additionally XORs in castInt(md5(String(siteId))) ^ castInt(md5('Site')).
  it("('Quercus alba', 'White Oak', site 1) -> 211723370", () => {
    expect(siteScopedSpeciesHash("Quercus alba", "White Oak", 1)).toBe(211723370);
  });

  it("('Quercus alba', 'White Oak', site 42) -> 1756923817", () => {
    expect(siteScopedSpeciesHash("Quercus alba", "White Oak", 42)).toBe(1756923817);
  });

  it("differs from the unscoped hash and from other site ids", () => {
    const unscoped = speciesHash("Quercus alba", "White Oak");
    const site1 = siteScopedSpeciesHash("Quercus alba", "White Oak", 1);
    const site42 = siteScopedSpeciesHash("Quercus alba", "White Oak", 42);
    expect(site1).not.toBe(unscoped);
    expect(site1).not.toBe(site42);
  });
});

describe("stateScopedSpeciesHash", () => {
  // Additionally XORs in castInt(md5(String(stateId))) ^ castInt(md5('State')).
  it("('Quercus alba', 'White Oak', state 1) -> 971367711", () => {
    expect(stateScopedSpeciesHash("Quercus alba", "White Oak", 1)).toBe(971367711);
  });

  it("('Quercus alba', 'White Oak', state 35) -> 1470424418", () => {
    expect(stateScopedSpeciesHash("Quercus alba", "White Oak", 35)).toBe(1470424418);
  });

  it("differs from the site-scoped hash for the same numeric id", () => {
    expect(stateScopedSpeciesHash("Quercus alba", "White Oak", 1)).not.toBe(
      siteScopedSpeciesHash("Quercus alba", "White Oak", 1),
    );
  });
});
