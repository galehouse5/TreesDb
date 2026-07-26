import { describe, expect, it } from "vitest";
import {
  buildTreeCsvRow,
  csvHeaders,
  describeHeightMeasurementMethod,
  dotNetUrlEncode,
  exportFilename,
  formatMeasurerName,
  serializeCsv,
  Units,
  type ExportTreeRow,
} from "./tree-csv";

// --- csvHeaders --------------------------------------------------------------
// Doc 01 §8 / TreeCsvExporter.cs:37-67. Unit token is the abbreviation
// ("ft"/"m"/"yd"), not the full word -- see the discrepancy note at the top
// of tree-csv.ts (`UserSession.Units.Describe()`/`.Abbreviation()` both
// resolve to the abbreviation; doc 01 §8's "(Feet)" example does not match
// the code).
describe("csvHeaders", () => {
  it("Feet: exact 25 header strings", () => {
    expect(csvHeaders(Units.Feet)).toEqual([
      "Common Name",
      "Botanical Name",
      "State",
      "County",
      "Site",
      "Site Latitude",
      "Site Longitude",
      "Location comments",
      "Tree name",
      "Tree id",
      "Measurement number",
      "Latitude",
      "Longitude",
      "Elevation",
      "Ownership type",
      "Height (ft)",
      "Height measurement method",
      "Girth (ft)",
      "Girth (in)",
      "Crown spread (ft)",
      "Tree comments",
      "Measurer(s)",
      "Measured",
      "Trip report url",
      "Photos available",
    ]);
  });

  it("Meters: exact 25 header strings (unit-dependent columns swap to m/cm)", () => {
    expect(csvHeaders(Units.Meters)).toEqual([
      "Common Name",
      "Botanical Name",
      "State",
      "County",
      "Site",
      "Site Latitude",
      "Site Longitude",
      "Location comments",
      "Tree name",
      "Tree id",
      "Measurement number",
      "Latitude",
      "Longitude",
      "Elevation",
      "Ownership type",
      "Height (m)",
      "Height measurement method",
      "Girth (m)",
      "Girth (cm)",
      "Crown spread (m)",
      "Tree comments",
      "Measurer(s)",
      "Measured",
      "Trip report url",
      "Photos available",
    ]);
  });

  it("Yards: unit-dependent columns use yd/in", () => {
    const headers = csvHeaders(Units.Yards);
    expect(headers[15]).toBe("Height (yd)");
    expect(headers[17]).toBe("Girth (yd)");
    expect(headers[18]).toBe("Girth (in)");
    expect(headers[19]).toBe("Crown spread (yd)");
  });

  it("has exactly 25 columns", () => {
    expect(csvHeaders(Units.Feet)).toHaveLength(25);
    expect(csvHeaders(Units.Meters)).toHaveLength(25);
    expect(csvHeaders(Units.Yards)).toHaveLength(25);
  });
});

// --- buildTreeCsvRow ----------------------------------------------------------

// Latitude 39.5 / longitude -82.75 chosen so DegreesDecimalMinutes comes out
// to clean, hand-verifiable values (already golden-tested arithmetic in
// lib/geo/coordinates.test.ts; recomputed here by hand for a literal
// assertion):
//   lat: wholeDeg=39, sign=+1 -> "39"; minutes=60*(39.5-39)=30.000 -> "39 30.000"
//   long: wholeDeg=82, sign=-1 -> "-082" (3-digit pad); minutes=60*0.75=45.000 -> "-082 45.000"
const TREE_LAT_DDM = "39 30.000";
const TREE_LONG_DDM = "-082 45.000";

function baseTree(overrides: Partial<ExportTreeRow> = {}): ExportTreeRow {
  return {
    id: 42,
    commonName: "White Oak",
    scientificName: "Quercus alba",
    stateName: "Ohio",
    county: "Franklin",
    siteName: "Baker Woods",
    siteComments: "Great access, near trailhead",
    ownershipType: "Private",
    tripReportUrl: "https://x.com/a b?c=d",
    latitudeDegrees: 39.5,
    latitudeSpecified: true,
    longitudeDegrees: -82.75,
    longitudeSpecified: true,
    elevationFeet: 812.3,
    elevationSpecified: true,
    measurementCount: 3,
    heightFeet: 123.456,
    heightSpecified: true,
    heightMeasurementMethod: 1,
    girthFeet: 123.456,
    girthSpecified: true,
    crownSpreadFeet: 200,
    crownSpreadSpecified: true,
    treeComments: "Healthy specimen",
    measurers: [
      { firstName: "John", lastName: "Smith" },
      { firstName: "Jane", lastName: "Doe" },
    ],
    measuredDate: "2023-06-15",
    hasPhotos: true,
    ...overrides,
  };
}

describe("buildTreeCsvRow - golden row, Feet", () => {
  it("all 25 values verbatim", () => {
    const row = buildTreeCsvRow(baseTree(), Units.Feet);
    expect(row).toEqual([
      "White Oak", // 1 Common Name
      "Quercus alba", // 2 Botanical Name
      "Ohio", // 3 State
      "Franklin", // 4 County
      "Baker Woods", // 5 Site
      TREE_LAT_DDM, // 6 "Site Latitude" (actually tree coords -- bug #2)
      TREE_LONG_DDM, // 7 "Site Longitude" (ditto)
      "Great access, near trailhead", // 8 Location comments
      "", // 9 Tree name -- always empty
      "42", // 10 Tree id
      "3", // 11 Measurement number
      TREE_LAT_DDM, // 12 Latitude (duplicate of 6)
      TREE_LONG_DDM, // 13 Longitude (duplicate of 7)
      "812.3 ft", // 14 Elevation -- always feet
      "Private", // 15 Ownership type
      "123.5'", // 16 Height (Feet pref; 123.456 -> 123.5')
      "Clinometer/laser rangefinder/sine", // 17 Height measurement method
      "123.5'", // 18 Girth (PrefixOnly)
      "1481''", // 19 Girth (SubprefixOnly; 123.456 ft -> 1481 whole inches)
      "200.0'", // 20 Crown spread (200 ft -> 200.0')
      "Healthy specimen", // 21 Tree comments
      "John Smith, Jane Doe", // 22 Measurer(s)
      "2023-06-15", // 23 Measured
      "https%3A%2F%2Fx.com%2Fa+b%3Fc%3Dd", // 24 Trip report url (dotnet-encoded)
      "Y", // 25 Photos available
    ]);
    expect(row).toHaveLength(25);
  });

  it("column 9 (Tree name) is always empty", () => {
    const row = buildTreeCsvRow(baseTree(), Units.Feet);
    expect(row[8]).toBe("");
  });

  it("columns 6-7 and 12-13 are byte-identical (legacy bug #2)", () => {
    const row = buildTreeCsvRow(baseTree(), Units.Feet);
    expect(row[5]).toBe(row[11]);
    expect(row[6]).toBe(row[12]);
  });
});

describe("buildTreeCsvRow - Meters: height/girth/crown-spread convert, elevation stays feet", () => {
  it("all unit-dependent cells", () => {
    const row = buildTreeCsvRow(baseTree(), Units.Meters);
    expect(row[13]).toBe("812.3 ft"); // Elevation: unaffected by units pref
    expect(row[15]).toBe("37.63 m"); // Height: 123.456 ft -> 37.63 m
    expect(row[17]).toBe("37.63 m"); // Girth PrefixOnly
    expect(row[18]).toBe("3763 cm"); // Girth SubprefixOnly: 123.456 ft -> 3763 cm
    expect(row[19]).toBe("60.96 m"); // Crown spread: 200 ft -> 60.96 m
  });
});

describe("buildTreeCsvRow - IsSpecified gating (empty string when unspecified)", () => {
  it("unspecified coordinates, elevation, height, girth, crown spread all render empty", () => {
    const row = buildTreeCsvRow(
      baseTree({
        latitudeSpecified: false,
        longitudeSpecified: false,
        elevationSpecified: false,
        heightSpecified: false,
        girthSpecified: false,
        crownSpreadSpecified: false,
        heightMeasurementMethod: 0,
      }),
      Units.Feet,
    );
    expect(row[5]).toBe(""); // Site Latitude
    expect(row[6]).toBe(""); // Site Longitude
    expect(row[11]).toBe(""); // Latitude
    expect(row[12]).toBe(""); // Longitude
    expect(row[13]).toBe(""); // Elevation
    expect(row[15]).toBe(""); // Height
    expect(row[16]).toBe(""); // Height measurement method (NotSpecified -> "")
    expect(row[17]).toBe(""); // Girth PrefixOnly
    expect(row[18]).toBe(""); // Girth SubprefixOnly
    expect(row[19]).toBe(""); // Crown spread
  });

  it("hasPhotos: false -> N", () => {
    const row = buildTreeCsvRow(baseTree({ hasPhotos: false }), Units.Feet);
    expect(row[24]).toBe("N");
  });

  it("no measurers -> empty cell", () => {
    const row = buildTreeCsvRow(baseTree({ measurers: [] }), Units.Feet);
    expect(row[21]).toBe("");
  });
});

// --- describeHeightMeasurementMethod ------------------------------------------

describe("describeHeightMeasurementMethod - TreeBase.cs:14-19", () => {
  it("all five codes", () => {
    expect(describeHeightMeasurementMethod(0)).toBe("");
    expect(describeHeightMeasurementMethod(1)).toBe("Clinometer/laser rangefinder/sine");
    expect(describeHeightMeasurementMethod(2)).toBe("Tree climb with tape drop");
    expect(describeHeightMeasurementMethod(3)).toBe("Long measuring pole");
    expect(describeHeightMeasurementMethod(4)).toBe("Formal transit/total station survey");
  });

  it("unknown code renders empty", () => {
    expect(describeHeightMeasurementMethod(99)).toBe("");
  });
});

// --- formatMeasurerName (Name.cs:34-39) ---------------------------------------

describe("formatMeasurerName", () => {
  it("both names present -> 'First Last'", () => {
    expect(formatMeasurerName({ firstName: "John", lastName: "Smith" })).toBe("John Smith");
  });

  it("missing last name -> empty (legacy bug #4: stray join segment)", () => {
    expect(formatMeasurerName({ firstName: "John", lastName: "" })).toBe("");
  });

  it("missing first name -> empty", () => {
    expect(formatMeasurerName({ firstName: "  ", lastName: "Smith" })).toBe("");
  });

  it("a blank measurer mixed into the row produces a stray empty join segment", () => {
    const row = buildTreeCsvRow(
      baseTree({
        measurers: [
          { firstName: "John", lastName: "Smith" },
          { firstName: "", lastName: "" },
          { firstName: "Jane", lastName: "Doe" },
        ],
      }),
      Units.Feet,
    );
    expect(row[21]).toBe("John Smith, , Jane Doe");
  });
});

// --- dotNetUrlEncode (System.Net.WebUtility.UrlEncode) ------------------------

describe("dotNetUrlEncode", () => {
  it("space -> '+', reserved URL chars percent-encoded uppercase", () => {
    expect(dotNetUrlEncode("https://x.com/a b?c=d")).toBe("https%3A%2F%2Fx.com%2Fa+b%3Fc%3Dd");
  });

  it("safe chars (- _ . ! * ( ) alnum) are left alone; ~ is encoded", () => {
    // CORRECTED by production parity (§5.1, 10 corpus artifacts): .NET
    // WebUtility.IsUrlSafeChar allows - _ . ! * ( ) and NOT ~ (the
    // original vector here asserted the reverse and was wrong).
    expect(dotNetUrlEncode("a-b_c.d~e9Z")).toBe("a-b_c.d%7Ee9Z");
    expect(dotNetUrlEncode("a!b*c(d)e")).toBe("a!b*c(d)e");
  });

  it("differs from encodeURIComponent on ' and ~", () => {
    // encodeURIComponent leaves these nine unescaped: - _ . ! ~ * ' ( )
    // .NET WebUtility.UrlEncode leaves seven: - _ . ! * ( )  (no ' or ~)
    expect(dotNetUrlEncode("a'b~c")).toBe("a%27b%7Ec");
    expect(encodeURIComponent("a'b~c")).toBe("a'b~c");
  });

  it("empty / null-ish input -> empty string", () => {
    expect(dotNetUrlEncode("")).toBe("");
    expect(dotNetUrlEncode(undefined)).toBe("");
    expect(dotNetUrlEncode(null)).toBe("");
  });
});

// --- serializeCsv (CsvFileResult.cs:11-21) ------------------------------------

describe("serializeCsv", () => {
  it("quotes every field, CRLF between rows, no trailing newline", () => {
    const csv = serializeCsv(["A", "B"], [["1", "2"], ["3", "4"]]);
    expect(csv).toBe('"A","B"\r\n"1","2"\r\n"3","4"');
    expect(csv.endsWith("\r\n")).toBe(false);
  });

  it("embedded double-quote is doubled", () => {
    const csv = serializeCsv(["H"], [['He said "hi"']]);
    expect(csv).toBe('"H"\r\n"He said ""hi"""');
  });

  it("embedded comma stays inside the quoted field (no premature delimiting)", () => {
    const csv = serializeCsv(["H"], [["a, b, c"]]);
    expect(csv).toBe('"H"\r\n"a, b, c"');
  });

  it("embedded newline stays literally inside the quoted field", () => {
    const csv = serializeCsv(["H"], [["line1\nline2"]]);
    expect(csv).toBe('"H"\r\n"line1\nline2"');
  });

  it("single row, header only", () => {
    expect(serializeCsv(["A", "B", "C"], [])).toBe('"A","B","C"');
  });
});

// --- exportFilename (TreeCsvExporter.cs:14-35) --------------------------------

describe("exportFilename", () => {
  it("unfiltered -> 'All Trees (ft).csv' (NOT '(Feet)' -- see discrepancy #1)", () => {
    expect(exportFilename([], Units.Feet)).toBe("All Trees (ft).csv");
  });

  it("unfiltered, Meters -> 'All Trees (m).csv'", () => {
    expect(exportFilename([], Units.Meters)).toBe("All Trees (m).csv");
  });

  it("State + Species filters, in order -> 'State-OH Species-Quercus alba Trees (ft).csv'", () => {
    expect(
      exportFilename(
        [
          { key: "State", value: "OH" },
          { key: "Species", value: "Quercus alba" },
        ],
        Units.Feet,
      ),
    ).toBe("State-OH Species-Quercus alba Trees (ft).csv");
  });

  it("single Site filter", () => {
    expect(exportFilename([{ key: "Site", value: "123" }], Units.Feet)).toBe(
      "Site-123 Trees (ft).csv",
    );
  });

  it("empty/null/undefined values are skipped", () => {
    expect(
      exportFilename(
        [
          { key: "State", value: "" },
          { key: "County", value: null },
          { key: "Site", value: undefined },
        ],
        Units.Feet,
      ),
    ).toBe("All Trees (ft).csv");
  });

  it("Yards token", () => {
    expect(exportFilename([{ key: "State", value: "OH" }], Units.Yards)).toBe(
      "State-OH Trees (yd).csv",
    );
  });
});

describe("dotNetUrlEncode (.NET WebUtility.UrlEncode safe set)", () => {
  it("leaves ! * ( ) bare and encodes ~ (production parity vector)", () => {
    expect(dotNetUrlEncode("https://groups.google.com/forum/?hl=en#!topic/x")).toBe(
      "https%3A%2F%2Fgroups.google.com%2Fforum%2F%3Fhl%3Den%23!topic%2Fx",
    );
    expect(dotNetUrlEncode("a~b (c)*!")).toBe("a%7Eb+(c)*!");
  });
});
