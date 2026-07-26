# 01 — Legacy System Reference

Factual reference for how the legacy app behaves, compiled from the code.
Every claim cites a file (and usually line) so it can be re-verified. When
implementing, **read the cited code before writing the replacement.**

The app: a public registry of measured trees. Anonymous visitors browse
sites/trees/species/states, search, view a map, and download CSV exports.
Registered users (role `Import`) submit measurement trips through a
multi-step wizard; on "finish" the trip is merged into the canonical
`Trees`/`Sites` tables.

---

## 1. Routes / URL surface

From `TMD/Global.asax.cs` `RegisterRoutes` (lines 33–81). Routes are matched
top-down; the stock `{controller}/{action}/{id}` default is commented out.
Species URLs literally contain a space and parentheses:
`Browse/Species/{botanicalName} ({commonName})/Details`.

| Public URL pattern | Handler | Notes |
|---|---|---|
| `/` | Main/Index | **redirects to `/Map`** |
| `/Map` | Map/Index | map page |
| `/Map/AllMarkers` | Map/AllMarkers | JSON, anonymous, output-cached varying on `LastMetricsUpdateTimestamp` |
| `/Map/{id}/TreeMarker`, `/Map/{id}/SiteMarker` | via `DefaultWithId` route `{controller}/{id}/{action}` (id must be `\d+`) | JSON |
| `/Map/{id}/StateMarkerInfo`, `…/SiteMarkerInfo`, `…/TreeMarkerInfo` | Map/*MarkerInfo | **HTML partials** loaded into map popups |
| `/Map/ViewMarkersForImport/{id}/Tree/{treeId}` (+ `/Site/{siteId}`) | Map/ImportTree(Site)Markers | auth: trip editor |
| `/Browse` | Browse/Index | |
| `/Browse/Locations` | Browse/Locations | sites grid, page size 40, filters `stateFilter`/`countyFilter`/`siteFilter`, params `page`/`sort`/`sortAsc` |
| `/Browse/Species` | Browse/Species | global species grid, page size 40, filters `botanicalNameFilter`/`commonNameFilter` |
| `/Browse/Trees/{id}/Details` | Browse/TreeDetails | |
| `/Browse/Sites/{id}/Details` | Browse/SiteDetails | + species grid (page size 10, params `page`/`sort`/`sortAsc`) |
| `/Browse/States/{id}/Details` | Browse/StateDetails | + two grids, param prefixes `stateSpecies*` and `sites*`, page size 10 |
| `/Browse/Species/{botanicalName} ({commonName})/Details` | Browse/SpeciesDetails | + three grids, prefixes `stateSpecies*`, `trees*`, `siteSpecies*`, page size 10 |
| `/Browse/Sites/{siteId}/Species/{bn} ({cn})/Details`, `/Browse/States/{stateId}/Species/{bn} ({cn})/Details` | SpeciesDetails scoped to site/state | |
| `/Search?term=…` | Search/Index | AJAX (`X-Requested-With`) → JSON, else HTML. 5 results/category AJAX, 25 non-AJAX |
| `/Trees/FindKnownSpeciesWithSimilarCommonName?term=&results=` (+ `…ScientificName`) | Trees/* | JSON autocomplete over `Trees.KnownSpecies` |
| `/Export/Trees/{id}`, `/Export/Sites/{id}`, `/Export/States/{id}` | Export/* | CSV; **anonymous works** (anonymous user carries Export role) |
| `/Export/Species/{bn} ({cn})`, `/Export/Sites/{id}/Species/{bn} ({cn})`, `/Export/States/{id}/Species/{bn} ({cn})` | Export/* | CSV |
| `/Export/SpeciesByFilters?...`, `/Export/LocationsByFilters?...` | Export/* | CSV matching current grid filters |
| `/Photos/{id}/{size}` (`size` defaults `Original`) | Photos/View | image bytes; sizes in §11 |
| `/Photos/{id}/Caption`, `/Photos/{id}/Remove`, `/Photos/AddTo…` | Photos/* | auth-checked per reference |
| `/Account/Logon`, `/Logout`, `/Register`, `/PasswordAssistance`, `/Edit` | Account/* | |
| `/Account/{token}/CompleteRegistration`, `/Account/{token}/CompletePasswordAssistance` | Account/* | token = 43-char url-safe string (§6.3) |
| `/Import`, `/Import/History`, `/Import/{id}/Trip|Sites|Trees|Review`, `/Import/{id}/Finish`, `/Import/{id}/View` | Import/* | role `Import` + trip-creator check |
| anything else | Error/NotFound (404) | catch-all route |

Quirks: route `Import/New` points at a nonexistent action (dead). A global
`ValidateInput(false)` and a browser-compatibility redirect filter exist —
neither is carried forward (ground rules §3).

**Authorization matrix**: everything Browse/Search/Map(non-import)/Export/
Photos-view/Trees/Main is anonymous. `Account/Edit` requires login. All
`Import/*` requires role `Import` **and** per-trip `creator == user`. Photo
add/remove and import-map endpoints do imperative checks
(`IsAuthorizedToView/Add/Remove`, `IsAuthorizedToEdit(trip)`).
Roles bitmask (`TMD.Model/Users/UserRoles.cs`): `Import=1, Export=2, Admin=4`
(`Registered=8` exists in the enum but is never persisted). New users get
`Import|Export`=3; the anonymous user gets `Export`=2
(`TMD/WebUserSessionProvider.cs:16`).

---

## 2. Effective database schema (post-Y2019)

Baseline DDL: `Tmd.Migrations/Baseline/CreateSchema.sql` (**UTF-16** — use
`iconv -f UTF-16 -t UTF-8` to read). Then FluentMigrator migrations
M001–M006 apply. **Three baseline tables no longer exist** (`Imports.Subsites`,
`Sites.Subsites`, `Sites.SubsiteVisits` — the subsite tier was flattened by
`Tmd.Migrations/Y2019/M005_RemoveSubsiteTables.cs`). The effective tables:

| Table | Purpose / key columns beyond Id (int identity PK) |
|---|---|
| `Users.Users` | Email varchar(100) **unique** (stored trimmed+lowercased), Firstname/Lastname varchar(50) (title-cased), Roles tinyint, PasswordHash binary(32), PasswordNumerics/Uppercase/Lowercase/Specials/Length int, Created, LastLogin, EmailVerificationToken binary(32), EmailVerified datetime?, RecentlyFailedLoginAttempts, LastFailedLoginAttempt?, ForgottenPasswordAssistanceToken binary(32)?, …TokenIssued?, …TokenUsed? |
| `Locations.Countries` | DoubleLetterCode char(2), TripleLetterCode char(3), Name, NE/SW bounding box (4 × real) |
| `Locations.States` | CountryId, codes, Name, bounding box, **Computed** metric columns: ComputedRHI5/10/20, ComputedRGI5/10/20 (float?), ComputedTreesMeasuredCount, ComputedLastMeasurementDate, ComputedContainsEntityWithCoordinates, AreMetricsStale bit, LastMetricsUpdateTimestamp |
| `Sites.Sites` | Name, StateId→States, County, OwnershipType, OwnershipContactInfo, MakeOwnershipContactInfoPublic, Coordinates (Latitude real + LatitudeInputFormat tinyint + Longitude + LongitudeInputFormat), Calculated* quadruple (+ Calculated*InputFormat from M001), VisitCount, same Computed*/AreMetricsStale metric columns as States, ComputedLastMeasurementDate date? |
| `Sites.SiteVisits` | SiteId→Sites **cascade**, ImportingTripId→Imports.Trips, Visited date, Name, StateId, County, OwnershipType, OwnershipContactInfo, MakeOwnershipContactInfoPublic, Coordinates + Calculated* quadruples, Comments nvarchar(1000), TripReportUrl varchar(100) default '' |
| `Sites.Visitors` | SiteId?, SiteVisitId?, FirstName, LastName (composite-element bag — no entity identity in ORM) |
| `Trees.Trees` | SiteId→Sites.Sites NOT NULL, **ComputedMeasuredSpeciesId** (computed column, §4), LastMeasured date, CommonName, ScientificName, Height real + HeightInputFormat, HeightMeasurementMethod, Girth + fmt, CrownSpread + fmt, Coordinates + Calculated* quadruples, Elevation + fmt, Diameter + fmt, ENTSPTS?, ENTSPTS2?, ConicalVolume + fmt, ChampionPoints?, AbbreviatedChampionPoints? |
| `Trees.Measurements` | TreeId?, ImportingTripId?, ComputedMeasuredSpeciesId (computed), Measured date, same measurement columns as Trees.Trees, GeneralComments nvarchar(1000) |
| `Trees.Measurers` | TreeId?, MeasurementId?, FirstName, LastName (composite-element bag) |
| `Trees.KnownSpecies` | AcceptedSymbol varchar(10), ScientificName, CommonName — read-only lookup (~USDA plant list) |
| `Photos.Photos` | CreatorUserId?, Created, Width, Height, Bytes (size int, ≤5 MB), Format tinyint (Jpeg/Gif/Png). **Image bytes are NOT in the DB** — one file per photo named `{Id}` (no extension) in the photo store |
| `Photos.References` | Type tinyint discriminator: 1 Public, 2 ImportSite (ImportSiteId), 3 ImportTree (ImportTreeId), 4 Site (SiteId), 5 SiteVisit (SiteVisitId), 6 Tree (TreeId), 7 TreeMeasurement (TreeMeasurementId); PhotoId, Caption |
| `Imports.Trips` | CreatorUserId, Created, **Imported datetime?** (null = draft), Name, Date date?, Website, PhotosAvailable, MeasurerContactInfo (+MakePublic), Default LaserBrand/ClinometerBrand/HeightMeasurementMethod/StateId/County, LastSaved |
| `Imports.Measurers` | TripId **cascade**, FirstName, LastName |
| `Imports.Sites` | TripId **cascade**, CreatorUserId, Name, Coordinates quadruple, Comments nvarchar(1000), StateId, County, OwnershipType, OwnershipContactInfo, MakeOwnershipContactInfoPublic |
| `Imports.Trees` | SiteId→Imports.Sites, **Type tinyint discriminator** (1 SingleTrunkTree, 2 MultiTrunkTree), TreeName, TreeNumber?, CommonName, ScientificName, Status/AgeClass/AgeType tinyint enums, Age?, ~50 measurement columns (each `real` value + tinyint InputFormat pairs: Height, HeightMeasurements{DistanceTop,AngleTop,DistanceBottom,AngleBottom,VerticalOffset}, Girth, GirthMeasurementHeight, GirthRootCollarHeight, CrownSpread, MaximumLimbLength, BaseCrownHeight, CrownVolume, TrunkVolume, Elevation, Coordinates), method/brand/comment varchars (comments nvarchar(1000)), FormType/TerrainType tinyint, TerrainShapeIndex?, LandformIndex?, CombinedGirthNumberOfTrunks? |
| `Imports.Trunks` | TreeId→Imports.Trees, per-trunk Girth/GirthMeasurementHeight/Height + HeightMeasurements quadruples, IncludeHeightDistanceAndAngleMeasurements bit, TrunkComments |
| `Logging.Errors` | **not migrated** |

**Type mapping SQL Server → Postgres** (mandatory):
`int identity` → `integer generated always as identity`; `real` → `real`
(**never** double precision — ground rules §3); `tinyint` → `smallint`;
`bit` → `boolean`; `datetime` → `timestamptz` (see D-002 in DECISIONS.md:
legacy `DateTime.Now` on Azure App Service ran UTC — treat legacy values as
UTC); `date` → `date`; `binary(32)` → `bytea`; `varchar/nvarchar/char` →
`varchar/char` same lengths.

Migration history worth knowing (`Tmd.Migrations/Y*/`): M001 added
`Calculated{Lat,Long}InputFormat` columns (default 2, backfilled 1 where
coord = 0); M002 widened comments 300→1000 and dropped `Users.LastActivity`;
M003 added all `Computed*` metric columns + `AreMetricsStale` +
`LastMetricsUpdateTimestamp`; M004 fixed state/country bounding boxes from
an embedded CSV; M005 removed subsites (above); M006 stripped the literal
`' County'` suffix from county names. Maintenance migrations drop and
recreate all views/functions/procs from
`Tmd.Migrations/Scripts/CreateObjectsAndTypes.sql` on every run — **that
file is the source of truth for SQL objects**, not the baseline.

---

## 3. Enum integer encodings (persisted as tinyint — preserve!)

- `DistanceFormat` (`TMD.Model/ValueObjects/Distance.cs:6`): 0 Invalid,
  1 **Unspecified**, 2 Default, 3 FeetDecimalInches, 4 DecimalFeet,
  5 DecimalInches, 6 DecimalMeters, 7 DecimalYards, 8 DecimalCentimeters.
- `CoordinatesFormat` (`Coordinates.cs:6`): 0 Invalid, 1 **Unspecified**,
  2 Default, 3 DegreesMinutesDecimalSeconds, 4 DegreesDecimalMinutes,
  5 DecimalDegrees.
- "Is specified" checks throughout SQL and C# are `InputFormat != 1`.
- `TreeStatus` 0–6, `TreeAgeClass` 0–5, `TreeAgeType` 0–3,
  `TreeHeightMeasurementMethod` 0–4, `TreeTerrainType` 0–5 (see
  `TMD.Model/Imports/TreeBase.cs`), `PhotoFormat` (Jpeg/Gif/Png),
  photo-reference `Type` 1–7 (§2), import tree `Type` 1–2, `Units`
  (0 Default=feet, 1 Feet, 2 Meters, 3 Yards).

---

## 4. SQL objects (views / functions / procs)

All in `Tmd.Migrations/Scripts/CreateObjectsAndTypes.sql`; line refs to that
file. These embody real business logic and must be re-implemented (as
Postgres views or Drizzle queries — implementer's choice, parity-checked
either way).

**Species identity hash** (used as the `Id` of species aggregates and the
`ComputedMeasuredSpeciesId` columns):
`abs(castInt(md5(lower(trim(ScientificName)))) XOR castInt(md5(lower(trim(CommonName)))))`
where `castInt` = SQL Server `CAST(varbinary(16) AS int)` = **last 4 bytes of
the MD5, big-endian, signed**. Site/state-scoped variants XOR in
`castInt(md5(cast(SiteId as varchar))) ^ castInt(md5('Site'))` (resp.
`StateId`/`'State'`). Postgres equivalent of castInt:
`('x' || right(md5(x), 8))::bit(32)::int`. Strings hash in the DB's
single-byte code page — ASCII-safe; verify any non-ASCII species names
against the legacy dump during parity. **Decision D-003**: the new app keys
species by the natural pair (ScientificName, CommonName) and does NOT expose
hash IDs; the hash must still be computed correctly in the ETL parity checks
because legacy grids/exports rely on grouping equivalence.

- **`Trees.MeasuredSpecies`** (L28): group `Trees.Trees` by
  (ScientificName, CommonName); per group emit `MAX(Height|Girth|CrownSpread)`,
  a representative `Max*TreeId` (`TOP 1` tree whose value equals the max —
  ties broken by physical order; new impl: lowest Id, waiver W-001),
  `Max*InputFormat` = Invalid(0) if max = 0 else Default(2), and
  `COUNT(*) Number`.
- **`Trees.MeasuredSpeciesBySite`** (L106) / **`ByState`** (L191): same,
  additionally grouped by `SiteId` (resp. `StateId` via join to
  `Sites.Sites`).
- **`dbo.SiteMetrics`** (L544): CTE `species` = per (SiteId, ScientificName):
  `max(Height) MaxHeight, max(Girth) MaxGirth`. Then per site, for
  N ∈ {5,10,20}: `RHI_N = avg of top-N species MaxHeight, NULL if the site
  has fewer than N species` (`case when count(*)>=N then sum/count`over
  `TOP N … ORDER BY MaxHeight DESC`); `RGI_N` likewise with MaxGirth. Plus
  `TreesMeasuredCount`, `LastMeasurementDate = max(LastMeasured)`,
  `ContainsEntityWithCoordinates = LatitudeInputFormat != 1 AND
  LongitudeInputFormat != 1` on the site row.
- **`dbo.StateMetrics`** (L478): identical shape; species maxima grouped by
  (StateId, ScientificName) over trees joined through their site.
- **`dbo.UpdateStaleMetrics`** (L604): copies SiteMetrics/StateMetrics into
  the `Computed*` columns for rows `WHERE AreMetricsStale = 1`, stamps
  `LastMetricsUpdateTimestamp = getdate()`, clears the flag. Staleness is
  set by triggers: insert/update/delete on `Trees.Trees` flags the affected
  `Sites.Sites` rows; changes on `Sites.Sites` flag `Locations.States`
  (L651, L673). The proc runs at app start, after migrations, and the
  repository calls it lazily. **New impl (D-004)**: same recompute logic as
  a TypeScript job triggered after any import/edit commits; on-demand
  fallback if `AreMetricsStale` — semantics preserved, mechanism simplified.
- **`dbo.MeasurerActivity`** (L284): group `Trees.Measurers` joined to
  `Trees.Trees` by (LastName, FirstName): distinct trees, distinct sites,
  `max(LastMeasured)`.
- **Search TVFs** (L310, L339, L368) — replicate ranking exactly:
  - `SearchMeasuredSpecies(expr)`: over MeasuredSpecies; rank = sum of six
    +1 flags: ScientificName LIKE `expr%`, `%expr`, `%expr%`, and the same
    three for CommonName; filter: contains-match on either.
  - `SearchSites(expr)`: same six-flag pattern on Name and County.
  - `SearchStates(expr)`: three +1 flags on Name (prefix/suffix/contains)
    plus **+2 each** for exact DoubleLetterCode or TripleLetterCode match;
    filter: Name contains OR either code equals.
  SQL Server LIKE is case-insensitive under the default collation → use
  `ILIKE` in Postgres. Results ordered rank DESC (see repository callers,
  e.g. `TMD.Infrastructure/Repositories/SiteRepository.cs:119`).
- **Helpers**: `DistanceEuclidean(x1,y1,x2,y2) = sqrt((x1−x2)² + (y1−y2)²)`;
  `Max(a,b)` branchless max; `ToTitleCase` (only used for data cleanup).
- **`ValueObjects.DistanceFormats`**: static id↔name lookup mirroring the
  `DistanceFormat` enum (0–7).

---

## 5. Metrics surfaced in models (derived, not stored)

Tree-level derived numbers stored on `Trees.Trees`/`Measurements` rows
(ENTSPTS, ENTSPTS2, ChampionPoints, AbbreviatedChampionPoints, ConicalVolume)
are computed in C# on write — find and transcribe from
`TMD.Model/Trees/Measurement.cs` / `Tree.cs` (`RecalculateProperties`,
`Measurement.Create`) during Phase 3; they come across as data in the ETL,
so read paths need no formulas. `ConicalVolume = π·r²·h/3`
(`Volume.CalculateConical`, `Volume.cs:185`).

---

## 6. Users, passwords, tokens

### 6.1 Password hashing — **the salt is the user's email**

`TMD.Model/Users/Password.cs:61-67` and `User.cs:136,169`. There is no
stored salt. The scheme:

```
hash = SHA256( UTF16LE_bytes( password + trim(lower(email)) ) )   // 32 bytes
```

- Concatenation order: password first, then normalized email.
- Encoding: .NET `Encoding.Unicode` = **UTF-16 little-endian**, no BOM.
- Single pass, no iterations, no HMAC.
- `VerifyPassword` trims the candidate password before hashing
  (`Password.cs:57`); `Create` does **not** trim — preserve the asymmetry
  on the verify path.
- Stored in `PasswordHash binary(32)`. Companion metrics columns
  (Numerics/Uppercase/Lowercase/Specials/Length) describe the password
  composition — new app does not need to maintain them post-rehash (D-005).
- Consequence: **changing a user's email without rehashing breaks their
  password.** (Legacy has this landmine too; carry the constraint until a
  user's hash is upgraded.)

Test vectors (SHA-256 hex; computed from the algorithm above — confirm the
implementation reproduces all four, see doc 07 §7):

| password | email (raw) | hash |
|---|---|---|
| `Password1` | `alice@example.com` | `974bcde0bd9738e8fda880914e25a67e855d107a29774ad7aecd92638b3e3e5f` |
| `correct horse battery staple` | `bob@treesdb.org` | `15b5b75e8cf8a1637ee6d297bbcf5dfd15a5630c7bce077dc13f8424df90c775` |
| `Tr0ub4dor&3` | `  Carol@Example.COM  ` (normalizes to `carol@example.com`) | `25c3ef82258912347ce37c5478c134e8f7f00cac34a0b9652535f7ac1854990e` |
| `pässwörd1` | `dave@example.com` | `4f91e54466e4b38d0b39ad178538111becd3765579e8e4a3322f30b7558abbc0` |

Password policy (`Password.cs:29`, `TMD.Model/Settings.cs`): min length 8,
min 2 of the 4 character classes.

### 6.2 Login bookkeeping

`User.AttemptLogon` (`User.cs:139-157`): failed attempts increment
`RecentlyFailedLoginAttempts`, resetting when the previous failure is older
than 1 hour. **No hard lockout is enforced.** Email must be verified to log
in (`IsEmailVerified`).

### 6.3 SecureToken (email verification + password reset)

`TMD.Model/Users/SecureToken.cs`. 32 crypto-random bytes stored in
`binary(32)`. URL form: standard Base64, **drop the single trailing `=`**,
then `/`→`_`, `+`→`-` → 43-char string. Decode reverses substitutions and
appends one `=`. (This is *not* RFC 4648 base64url — same alphabet, but the
padding-drop is positional; keep the exact codec.) Vectors:

- bytes `000102…1e1f` → `AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8`
- bytes `fbeffe3edffabf3bfefff93eefbffbfffdffbe3fdffbff7ffefffbbfffeff3ff` →
  `--_-Pt_6vzv-__k-77_7__3_vj_f-_9__v_7v__v8_8`

Semantics: email-verification token — no expiry, single value per user,
compared by URL-encoded string equality. Password-assistance token — valid
for **1 hour** from `…TokenIssued`, single-use (`…TokenUsed` stamp), cleared
constraint checked in `User.cs:87-95`. New implementation: same storage +
codec, but compare with `timingSafeEqual` (ground rules §3).

---

## 7. Value objects: storage units, parsing, formatting

Full detail in `TMD.Model/ValueObjects/`. Universal facts:

- Every measured quantity is persisted as **imperial float32** plus a
  tinyint `InputFormat` recalling how the user typed it: `Distance.Feet`,
  `Elevation.Feet`, `Volume.CubicFeet`, `Angle.Degrees`,
  `Latitude/Longitude.TotalDegrees`.
- Conversion constants — use these exact literals, as float32:
  feet↔meters **3.2808399**; feet↔yards 3; feet↔inches 12; m↔cm 100;
  ft³→m³ **0.0283168466**; ft³→yd³ **0.037037037**.
- Empty input → `Unspecified` (1); unparseable input → `Invalid` (0),
  value 0. `IsSpecified` = format ≠ Unspecified. Note: Invalid **counts as
  specified** — parity-relevant for "contains coordinates" logic which
  tests `!= 1` only.
- Display formatting by unit preference (`ToString(Units)`, .NET custom
  format strings; `'` and `''` are literal suffixes):

| Quantity | Feet/Default | Meters | Yards | Sub-unit render |
|---|---|---|---|---|
| Distance (height, girth, spread…) | `0.0` + `'` | `0.00` + ` m` | `0.00` + ` yd` | feet/yards → whole inches + `''`; meters → whole cm + ` cm` |
| Elevation | `0.0 ft` | `0.00 m` | `0.00 yd` | — |
| Volume | `0.0 ft³` | `0.00 m³` | `0.00 yd³` | — |
| RuckerIndex | `0.00` (no unit suffix) | `0.000` | `0.000` | — |
| Coordinates | DecimalDegrees `00.00000` (5 dp); DDM `dd mm.mmm`; DMS `dd mm ss.s` | same | — | — |

  Reference outputs (float32 arithmetic; mid-point rounding caveat in doc
  07 §6): 123.456 ft → `123.5'` / `37.63 m` / `41.15 yd` / `1481''` /
  `3763 cm`; 200 ft → `200.0'` / `60.96 m` / `66.67 yd`. Rucker 134.82 →
  `134.82` (ft) / `41.093` (m) / `44.940` (yd).
- Parsing: ordered regex lists per type (quote them from
  `Distance.cs:124-182`, `Volume.cs:123-163`, `Latitude.cs`,
  `Longitude.cs` when implementing). E.g. Distance accepts
  `12.5`, `12.5'`, `12 ft`, `12' 6''`, `40 m`, `13 yd`, inches with `"`.
  The centimeters branch is broken in legacy (ground rules §3).
- Height from clinometer measurements (`HeightMeasurements.cs:34-44`):
  `height_ft = sin(angleTop_rad)·distanceTop_ft + sin(angleBottom_rad)·distanceBottom_ft + verticalOffset_ft`.
- Coordinates: parse rounds `TotalDegrees` to **5 decimals, banker's
  rounding**; stored float32. `Coordinates.CalculateDistanceInMinutesTo` =
  planar `sqrt(Δlat² + Δlng²) × 60` (`Coordinates.cs:41-47`) — deliberately
  not great-circle.

Units preference: **anonymous cookie** `unitsPreference` holding the enum
name (`Feet|Meters|Yards|Default`), 10-year expiry, set by POST
`/Main/SetUnits` (`TMD/Extensions/CookieExtensions.cs`,
`MainController.cs:23`). Affects every formatted number, CSV headers, and
export filenames. New app: same cookie contract (D-006).

---

## 8. CSV exports

`TMD.Model/Exports/TreeCsvExporter.cs` (hand-rolled, not the CsvHelper lib)
serialized by `TMD/ActionResults/CsvFileResult.cs`: **every field wrapped in
double quotes**, embedded `"` doubled, CRLF line endings. All eight export
actions funnel into `IExportRepository.GetTrees(...)` with different filters
(one row per *tree*). Exact 25 columns in order — headers 6/7 are literally
`Site Latitude (DegreesDecimalMinutes)` style; 16–20 embed the current
unit's abbreviation:

1 `Common Name`, 2 `Botanical Name`, 3 `State`, 4 `County`, 5 `Site`,
6 Site latitude (DegreesDecimalMinutes format), 7 site longitude,
8 `Location comments`, 9 tree name (**always empty** — legacy emits null),
10 tree id, 11 measurement count, 12 tree latitude (DDM), 13 longitude,
14 elevation (DecimalFeet — **always feet regardless of pref**), 15
ownership type, 16 height (pref units, Distance default render), 17 height
measurement method, 18 girth (PrefixOnly), 19 girth (SubprefixOnly — inches
or cm), 20 crown spread, 21 last-measurement general comments, 22
measurers joined, 23 measured date `yyyy-MM-dd`, 24 trip-report URL
(URL-encoded), 25 photos available `Y`/`N`.

Filename: `{Key-Value }… Trees ({units}).csv`, e.g.
`State-OH Species-Quercus alba Trees (Feet).csv`; `All Trees (Feet).csv`
when unfiltered. Content-Type per legacy `CsvFileResult`.

---

## 9. Map data

`TMD/Controllers/MapController.cs`, `TMD/Models/Map/MapMarkerModel.cs:16-28`,
AutoMapper config `TMD/Mappings/MapMapping.cs:63-106`.

Marker JSON object: `{ Title, MinZoom, MaxZoom, Latitude, Longitude,
InfoLoaderUrl, IconUrl }`. Zoom bands: states 0–6 (0–30 if no contained
coordinates), sites 7–13 (7–30 likewise), trees 14–30. `AllMarkers` returns
`{ Markers: [...] }` for: states with `ComputedTreesMeasuredCount > 0`,
sites with specified coords, trees with specified coords. Info popups are
**HTML partials** at `…MarkerInfo` URLs carrying: states — RHI/RGI 5/10/20,
tree count, last measurement; sites — same + county/ownership + photos;
trees — height/girth/spread/elevation, ENTSPTS/TDI, champion points,
photos, last measured. Import-scoped marker endpoints additionally return
`CalculatedCoordinates` when derivable and are gated on trip editorship.

New app (D-007): same JSON contract for markers (parity-checked); info
popups become React components fed by a JSON endpoint carrying the same
fields the partials displayed (extractor parity per doc 07 §5.4).

---

## 10. Import wizard & merge algorithm

Wizard flow (all `ImportController`, role Import + creator check): Trip
metadata → Sites (add/edit/remove, per-site state/county/ownership/coords)
→ Trees (per site; single- or multi-trunk with per-trunk measurements) →
Review → **Finish**. Drafts autosave into the `Imports.*` tables
(`LastSaved`); finishing stamps `Imported` and merges. Trips remain after
import (History / View pages); re-finishing triggers **Reimport**.

Merge path (`ImportController.Finish` →
`TMD.Infrastructure/Repositories/ImportRepository.cs:36-67` →
`TMD.Model/Sites/Site.cs`, `TMD.Model/Trees/Tree.cs`):

1. For each `Imports.Sites` row build a full domain graph:
   `Site.Create(importSite)` — copies name/state/county, creates one
   `SiteVisit.Create(importSite)` (carrying ImportingTrip, visited date =
   trip date, ownership, coords, comments, visitors ← trip measurers,
   photos), and one `Tree.Create(importTree)` per import tree, each with one
   `Measurement.Create(importTree)` (Measured = trip.Date; ScientificName
   defaults to `(Unidentified)` when blank; Measurers ← trip measurers;
   photos copied as TreeMeasurementPhotoReference).
2. **Site matching** (`SiteRepository.Merge`, `SiteRepository.cs:25-38`):
   candidates = existing sites whose CalculatedCoordinates fall in a
   ±25-arc-minute bounding box; first candidate where `ShouldMerge` holds
   absorbs the new site, else the new site is inserted.
   `Site.ShouldMerge` (`Site.cs:114-121`): Name equal (OrdinalIgnoreCase) ∧
   State equal ∧ County equal (OrdinalIgnoreCase) ∧ planar distance ≤ 25
   arc-minutes.
3. **Site.Merge** (`Site.cs:123-139`): append all visits; for each incoming
   tree, find existing tree with `Tree.ShouldMerge` (`Tree.cs:112-123`:
   CommonName ∧ ScientificName equal case-insensitive ∧ both coordinate
   sets specified ∧ **exact float32 TotalDegrees equality**) → append its
   measurements to that tree, else add as new tree.
4. `RecalculateProperties` cascades: tree recomputes its headline values
   from the latest measurement; site recomputes ownership/coords/photos
   from last visit, VisitCount, dedups visitors. Metrics flagged stale →
   `UpdateStaleMetrics` refreshes Computed* columns.
5. **Reimport** (`ImportRepository.cs:59-67`): delete this trip's
   measurements and visits (`Measurements.ImportingTripId`,
   `SiteVisits.ImportingTripId`), flush, then import again. Note: trees or
   sites left childless by the deletion are cleaned up in the repository
   remove methods — read `RemoveMeasurementsByTrip`/`RemoveVisitsByTrip`
   before implementing.

The fact that every merged row is tagged with `ImportingTripId` makes
**replay parity** possible — see doc 07 §8.

---

## 11. Photos

- Originals only are persisted: DB row (`Photos.Photos`) + one bytes file
  named `{Id}` (no extension). Store provider is pluggable: local dir
  `PhotoStore/` (`TMD.Model/Photos/DefaultPhotoStoreProvider.cs`) or Azure
  Blob (`Tmd.WindowsAzure/BlobStoragePhotoStoreProvider.cs`) — check the
  deployed Web.config to learn which the production site uses before
  migrating blobs.
- Variants are generated **on demand** per request (`Photo.Get(size)`,
  `PhotoSize.cs`). Sizes (max width-or-height px; square = center-crop,
  non-square = fit): Original ∞, Large 800, Medium 500, Small 240,
  Thumbnail 100, SquareThumbnail 100□, Square 60□, MiniSquare 32□,
  MapSquare 60□ +3px white border, SmallMapSquare 30□ +2px, MiniMapSquare
  15□ +1px. Bicubic high-quality resampling.
- Upload limit 5 MB; formats Jpeg/Gif/Png; missing file falls back to an
  embedded `icon.png`.
- New app (D-008): originals to R2 keyed `photos/{id}`; variants generated
  with sharp on upload **and** on-demand fallback, cached in R2 under
  `photos/{id}/{size}`. Parity: dimensions + content-type per size (not
  pixel equality — resampler differs; waiver W-002).

---

## 12. Email

Two transactional emails (SMTP, templates in `TMD.Model` +
`TMD/Views`/resources): email-verification (link
`/Account/{token}/CompleteRegistration`) and password-assistance (link
`/Account/{token}/CompletePasswordAssistance`, 1-hour validity). Wording
can be modernized (D-009); the token URL contract cannot.

---

## 13. Known legacy bugs / quirks (do-not-blindly-fix list)

Authoritative list referenced by ground rules §3: broken cm parsing
(`Distance.cs:166`), `SmallMapSquare.Size` mislabel (`PhotoSize.cs:123`),
`Volume.ToString(format)` ignores its argument (`Volume.cs:69`),
`HeightMeasurements.Offset` uses distanceBottom twice
(`HeightMeasurements.cs:46-55`), `ToTitleCase` internal varchar(255)
truncation, non-constant-time comparisons, dead `Import/New` route, CSV
column 9 always empty, `Registered` role unstorable, no login lockout
enforcement, `Password.Create`/`VerifyPassword` trim asymmetry.
