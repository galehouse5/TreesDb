-- =============================================================================
-- dump-legacy.sql -- TreesDb P0-03 legacy table dumps
-- =============================================================================
-- WHAT: One SELECT per effective migrated table (17 tables = the 18
--   effective tables in doc 01 section 2 minus Logging.Errors, which is not
--   migrated). Column lists are explicit, in *effective* schema order,
--   derived from Tmd.Migrations/Baseline/CreateSchema.sql plus migrations
--   M001-M006 (Y2016/Y2017/Y2019). See docs/migration/01-system-reference.md
--   section 2 and docs/migration/07-parity-testing.md section 7.1.
--
-- HOW TO RUN: this file is not meant to be executed directly in one shot for
--   dump purposes -- use web/scripts/dump-legacy.ps1, which parses the
--   `-- ### table: <name> ###` / `-- columns: ...` markers below, runs each
--   SELECT individually via sqlcmd, and writes one CSV per table to
--   -OutDir (default web/parity/dumps/, GITIGNORED). You *can* also open
--   this file in SSMS/Azure Data Studio and run it as a whole (each SELECT
--   is a separate batch, delimited by GO) to eyeball results interactively.
--
-- EXPECTED DURATION: production data is small (hundreds of sites, low tens
--   of thousands of trees/measurements at most) -- the full set of 17
--   queries should complete in well under a minute of DB time; total wall
--   time including CSV re-emission is dominated by sqlcmd process-launch
--   overhead, expect low single-digit minutes end to end.
--
-- *** WARNING: OUTPUT CONTAINS PII ***
--   Users.Users columns include Email, PasswordHash (SHA-256 digest),
--   ForgottenPasswordAssistanceToken, etc. These dumps land in
--   web/parity/dumps/ which is GITIGNORED -- never commit them, never paste
--   them into an issue/chat, and delete local copies once the ETL load
--   (P0-04) and data-parity checks (P0-06/07) are done with them.
--
-- FORMATTING RULES (doc 07 section 7.1, applied uniformly below):
--   real/float  -> CONVERT(varchar(50), CAST(col AS float), 3)   (17-digit round-trip)
--   date/datetime -> CONVERT(varchar(33), col, 126)               (ISO 8601)
--   binary      -> LOWER(CONVERT(varchar(max), col, 2))           (lowercase hex)
--   bit         -> as-is (renders "0"/"1")
--   int/tinyint/varchar/char -> as-is
--   Every expression is wrapped ISNULL(expr, N'NULL'). A true SQL NULL
--   therefore always serializes as the exact 4-character token NULL; the
--   PowerShell wrapper emits that token *unquoted* while every other field
--   is double-quoted, so NULL vs empty-string ('') is unambiguous in the
--   output CSV -- and it matches PostgreSQL's `COPY ... CSV NULL 'NULL'`
--   convention so P0-04 can consume these files directly with that option.
--
-- ORDER BY: `Id` for normal tables. For the four composite-element "bag"
--   tables that have no independent entity identity in the ORM (owner FK
--   can be one of two mutually-exclusive columns, or there's exactly one
--   owner FK), doc 07 section 7.1 requires ORDER BY owner FK then Id:
--     Sites.Visitors (site_visitors)       -> COALESCE(SiteId, SiteVisitId), Id
--     Trees.Measurers (tree_measurers)     -> COALESCE(TreeId, MeasurementId), Id
--     Imports.Measurers (import_trip_measurers) -> TripId, Id
--     Imports.Trunks (import_trunks)       -> TreeId, Id
--   Sites.SiteVisits (site_visits) is ordered by its single owner FK SiteId
--   then Id for the same reason (it is not one of the four named bags in
--   doc 07, but the same repository-order-instability risk applies).
--
-- EFFECTIVE-SCHEMA DELTAS APPLIED (baseline -> M001..M006), by table --
--   full detail also in the PR/task report; short version:
--   * Users.Users: M002 dropped LastActivity.
--   * Locations.States: M003 added 11 Computed*/AreMetricsStale/
--     LastMetricsUpdateTimestamp columns.
--   * Sites.Sites: M001 added Calculated{Lat,Long}InputFormat (tinyint,
--     default 2) and dropped TreesWithSpecifiedCoordinatesCount; M003
--     renamed RHI5/10/20,RGI5/10/20 -> Computed*, renamed LastVisited ->
--     ComputedLastMeasurementDate (now nullable date), added
--     ComputedTreesMeasuredCount/ComputedContainsEntityWithCoordinates/
--     AreMetricsStale/LastMetricsUpdateTimestamp; M005 dropped SubsiteCount,
--     added StateId (nullable -- the NOT NULL alter is commented out in the
--     migration source), County/OwnershipType/OwnershipContactInfo/
--     MakeOwnershipContactInfoPublic (NOT NULL), and the Subsites tier was
--     removed entirely.
--   * Sites.SiteVisits: M001 added Calculated{Lat,Long}InputFormat; M002
--     widened Comments to varchar(1000); M005 added StateId (NOT NULL here,
--     unlike Sites.Sites/Imports.Sites) + County/OwnershipType/
--     OwnershipContactInfo/MakeOwnershipContactInfoPublic (NOT NULL).
--   * Sites.Visitors: M005 dropped SubsiteId and SubsiteVisitId.
--   * Trees.Trees: M001 added Calculated{Lat,Long}InputFormat; M005 added
--     SiteId (NOT NULL) and dropped SubsiteId.
--   * Trees.Measurements: M001 added Calculated{Lat,Long}InputFormat; M002
--     widened GeneralComments to varchar(1000).
--   * Photos.References: M005 added ImportSiteId/SiteId/SiteVisitId and
--     dropped ImportSubsiteId/SubsiteId/SubsiteVisitId.
--   * Imports.Sites: M002 widened Comments to varchar(1000); M005 added
--     StateId (nullable, NOT NULL alter commented out), County/
--     OwnershipType/OwnershipContactInfo/MakeOwnershipContactInfoPublic
--     (NOT NULL), replacing the removed Imports.Subsites tier.
--   * Imports.Trees: M002 widened 7 *Comments columns to varchar(1000);
--     M005 added SiteId (nullable) and dropped SubsiteId.
--   * Imports.Trunks: M002 widened TrunkComments to varchar(1000).
--   * Sites.Subsites, Sites.SubsiteVisits, Imports.Subsites: REMOVED by
--     M005 (Tmd.Migrations/Y2019/M005_RemoveSubsiteTables.cs) -- not dumped.
--   * Logging.Errors: excluded per doc 02/07 (not migrated).
--   * All other tables (Locations.Countries, Trees.Measurers,
--     Trees.KnownSpecies, Photos.Photos, Imports.Trips,
--     Imports.Measurers) are structurally unchanged from baseline.
--
-- Requires: SQL Server 2016+ compatible T-SQL (CONVERT style 126/2, ISNULL,
--   HASHBYTES not used here). Run against the production Azure SQL DB with
--   an account that has SELECT on all listed schemas.
-- =============================================================================

-- ### table: users ###
-- source: [Users].[Users]
-- columns: Id,Email,Firstname,Lastname,Roles,PasswordHash,PasswordNumerics,PasswordUppercase,PasswordLowercase,PasswordSpecials,PasswordLength,Created,LastLogin,EmailVerificationToken,RecentlyFailedLoginAttempts,EmailVerified,LastFailedLoginAttempt,ForgottenPasswordAssistanceToken,ForgottenPasswordAssistanceTokenIssued,ForgottenPasswordAssistanceTokenUsed
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL([Email], N'NULL') AS [Email],
    ISNULL([Firstname], N'NULL') AS [Firstname],
    ISNULL([Lastname], N'NULL') AS [Lastname],
    ISNULL(CAST([Roles] AS varchar(20)), N'NULL') AS [Roles],
    ISNULL(LOWER(CONVERT(varchar(max), [PasswordHash], 2)), N'NULL') AS [PasswordHash],
    ISNULL(CAST([PasswordNumerics] AS varchar(20)), N'NULL') AS [PasswordNumerics],
    ISNULL(CAST([PasswordUppercase] AS varchar(20)), N'NULL') AS [PasswordUppercase],
    ISNULL(CAST([PasswordLowercase] AS varchar(20)), N'NULL') AS [PasswordLowercase],
    ISNULL(CAST([PasswordSpecials] AS varchar(20)), N'NULL') AS [PasswordSpecials],
    ISNULL(CAST([PasswordLength] AS varchar(20)), N'NULL') AS [PasswordLength],
    ISNULL(CONVERT(varchar(33), [Created], 126), N'NULL') AS [Created],
    ISNULL(CONVERT(varchar(33), [LastLogin], 126), N'NULL') AS [LastLogin],
    ISNULL(LOWER(CONVERT(varchar(max), [EmailVerificationToken], 2)), N'NULL') AS [EmailVerificationToken],
    ISNULL(CAST([RecentlyFailedLoginAttempts] AS varchar(20)), N'NULL') AS [RecentlyFailedLoginAttempts],
    ISNULL(CONVERT(varchar(33), [EmailVerified], 126), N'NULL') AS [EmailVerified],
    ISNULL(CONVERT(varchar(33), [LastFailedLoginAttempt], 126), N'NULL') AS [LastFailedLoginAttempt],
    ISNULL(LOWER(CONVERT(varchar(max), [ForgottenPasswordAssistanceToken], 2)), N'NULL') AS [ForgottenPasswordAssistanceToken],
    ISNULL(CONVERT(varchar(33), [ForgottenPasswordAssistanceTokenIssued], 126), N'NULL') AS [ForgottenPasswordAssistanceTokenIssued],
    ISNULL(CONVERT(varchar(33), [ForgottenPasswordAssistanceTokenUsed], 126), N'NULL') AS [ForgottenPasswordAssistanceTokenUsed]
FROM [Users].[Users]
ORDER BY [Id];
GO

-- ### table: countries ###
-- source: [Locations].[Countries]
-- columns: Id,DoubleLetterCode,TripleLetterCode,Name,NELatitude,NELongitude,SWLatitude,SWLongitude
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL([DoubleLetterCode], N'NULL') AS [DoubleLetterCode],
    ISNULL([TripleLetterCode], N'NULL') AS [TripleLetterCode],
    ISNULL([Name], N'NULL') AS [Name],
    ISNULL(CONVERT(varchar(50), CAST([NELatitude] AS float), 3), N'NULL') AS [NELatitude],
    ISNULL(CONVERT(varchar(50), CAST([NELongitude] AS float), 3), N'NULL') AS [NELongitude],
    ISNULL(CONVERT(varchar(50), CAST([SWLatitude] AS float), 3), N'NULL') AS [SWLatitude],
    ISNULL(CONVERT(varchar(50), CAST([SWLongitude] AS float), 3), N'NULL') AS [SWLongitude]
FROM [Locations].[Countries]
ORDER BY [Id];
GO

-- ### table: states ###
-- source: [Locations].[States]
-- columns: Id,CountryId,DoubleLetterCode,TripleLetterCode,Name,NELatitude,NELongitude,SWLatitude,SWLongitude,ComputedRHI5,ComputedRHI10,ComputedRHI20,ComputedRGI5,ComputedRGI10,ComputedRGI20,ComputedTreesMeasuredCount,ComputedLastMeasurementDate,ComputedContainsEntityWithCoordinates,AreMetricsStale,LastMetricsUpdateTimestamp
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([CountryId] AS varchar(20)), N'NULL') AS [CountryId],
    ISNULL([DoubleLetterCode], N'NULL') AS [DoubleLetterCode],
    ISNULL([TripleLetterCode], N'NULL') AS [TripleLetterCode],
    ISNULL([Name], N'NULL') AS [Name],
    ISNULL(CONVERT(varchar(50), CAST([NELatitude] AS float), 3), N'NULL') AS [NELatitude],
    ISNULL(CONVERT(varchar(50), CAST([NELongitude] AS float), 3), N'NULL') AS [NELongitude],
    ISNULL(CONVERT(varchar(50), CAST([SWLatitude] AS float), 3), N'NULL') AS [SWLatitude],
    ISNULL(CONVERT(varchar(50), CAST([SWLongitude] AS float), 3), N'NULL') AS [SWLongitude],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRHI5] AS float), 3), N'NULL') AS [ComputedRHI5],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRHI10] AS float), 3), N'NULL') AS [ComputedRHI10],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRHI20] AS float), 3), N'NULL') AS [ComputedRHI20],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRGI5] AS float), 3), N'NULL') AS [ComputedRGI5],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRGI10] AS float), 3), N'NULL') AS [ComputedRGI10],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRGI20] AS float), 3), N'NULL') AS [ComputedRGI20],
    ISNULL(CAST([ComputedTreesMeasuredCount] AS varchar(20)), N'NULL') AS [ComputedTreesMeasuredCount],
    ISNULL(CONVERT(varchar(33), [ComputedLastMeasurementDate], 126), N'NULL') AS [ComputedLastMeasurementDate],
    ISNULL(CAST([ComputedContainsEntityWithCoordinates] AS varchar(1)), N'NULL') AS [ComputedContainsEntityWithCoordinates],
    ISNULL(CAST([AreMetricsStale] AS varchar(1)), N'NULL') AS [AreMetricsStale],
    ISNULL(CONVERT(varchar(33), [LastMetricsUpdateTimestamp], 126), N'NULL') AS [LastMetricsUpdateTimestamp]
FROM [Locations].[States]
ORDER BY [Id];
GO

-- ### table: sites ###
-- source: [Sites].[Sites]
-- columns: Id,ComputedLastMeasurementDate,Name,Latitude,LatitudeInputFormat,Longitude,LongitudeInputFormat,CalculatedLatitude,CalculatedLongitude,ComputedRHI5,ComputedRHI10,ComputedRHI20,ComputedRGI5,ComputedRGI10,ComputedRGI20,VisitCount,CalculatedLatitudeInputFormat,CalculatedLongitudeInputFormat,ComputedTreesMeasuredCount,ComputedContainsEntityWithCoordinates,AreMetricsStale,LastMetricsUpdateTimestamp,StateId,County,OwnershipType,OwnershipContactInfo,MakeOwnershipContactInfoPublic
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CONVERT(varchar(33), [ComputedLastMeasurementDate], 126), N'NULL') AS [ComputedLastMeasurementDate],
    ISNULL([Name], N'NULL') AS [Name],
    ISNULL(CONVERT(varchar(50), CAST([Latitude] AS float), 3), N'NULL') AS [Latitude],
    ISNULL(CAST([LatitudeInputFormat] AS varchar(20)), N'NULL') AS [LatitudeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Longitude] AS float), 3), N'NULL') AS [Longitude],
    ISNULL(CAST([LongitudeInputFormat] AS varchar(20)), N'NULL') AS [LongitudeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([CalculatedLatitude] AS float), 3), N'NULL') AS [CalculatedLatitude],
    ISNULL(CONVERT(varchar(50), CAST([CalculatedLongitude] AS float), 3), N'NULL') AS [CalculatedLongitude],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRHI5] AS float), 3), N'NULL') AS [ComputedRHI5],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRHI10] AS float), 3), N'NULL') AS [ComputedRHI10],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRHI20] AS float), 3), N'NULL') AS [ComputedRHI20],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRGI5] AS float), 3), N'NULL') AS [ComputedRGI5],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRGI10] AS float), 3), N'NULL') AS [ComputedRGI10],
    ISNULL(CONVERT(varchar(50), CAST([ComputedRGI20] AS float), 3), N'NULL') AS [ComputedRGI20],
    ISNULL(CAST([VisitCount] AS varchar(20)), N'NULL') AS [VisitCount],
    ISNULL(CAST([CalculatedLatitudeInputFormat] AS varchar(20)), N'NULL') AS [CalculatedLatitudeInputFormat],
    ISNULL(CAST([CalculatedLongitudeInputFormat] AS varchar(20)), N'NULL') AS [CalculatedLongitudeInputFormat],
    ISNULL(CAST([ComputedTreesMeasuredCount] AS varchar(20)), N'NULL') AS [ComputedTreesMeasuredCount],
    ISNULL(CAST([ComputedContainsEntityWithCoordinates] AS varchar(1)), N'NULL') AS [ComputedContainsEntityWithCoordinates],
    ISNULL(CAST([AreMetricsStale] AS varchar(1)), N'NULL') AS [AreMetricsStale],
    ISNULL(CONVERT(varchar(33), [LastMetricsUpdateTimestamp], 126), N'NULL') AS [LastMetricsUpdateTimestamp],
    ISNULL(CAST([StateId] AS varchar(20)), N'NULL') AS [StateId],
    ISNULL([County], N'NULL') AS [County],
    ISNULL([OwnershipType], N'NULL') AS [OwnershipType],
    ISNULL([OwnershipContactInfo], N'NULL') AS [OwnershipContactInfo],
    ISNULL(CAST([MakeOwnershipContactInfoPublic] AS varchar(1)), N'NULL') AS [MakeOwnershipContactInfoPublic]
FROM [Sites].[Sites]
ORDER BY [Id];
GO

-- ### table: site_visits ###
-- source: [Sites].[SiteVisits]
-- columns: Id,SiteId,ImportingTripId,Visited,Name,Latitude,LatitudeInputFormat,Longitude,LongitudeInputFormat,CalculatedLatitude,CalculatedLongitude,Comments,TripReportUrl,CalculatedLatitudeInputFormat,CalculatedLongitudeInputFormat,StateId,County,OwnershipType,OwnershipContactInfo,MakeOwnershipContactInfoPublic
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([SiteId] AS varchar(20)), N'NULL') AS [SiteId],
    ISNULL(CAST([ImportingTripId] AS varchar(20)), N'NULL') AS [ImportingTripId],
    ISNULL(CONVERT(varchar(33), [Visited], 126), N'NULL') AS [Visited],
    ISNULL([Name], N'NULL') AS [Name],
    ISNULL(CONVERT(varchar(50), CAST([Latitude] AS float), 3), N'NULL') AS [Latitude],
    ISNULL(CAST([LatitudeInputFormat] AS varchar(20)), N'NULL') AS [LatitudeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Longitude] AS float), 3), N'NULL') AS [Longitude],
    ISNULL(CAST([LongitudeInputFormat] AS varchar(20)), N'NULL') AS [LongitudeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([CalculatedLatitude] AS float), 3), N'NULL') AS [CalculatedLatitude],
    ISNULL(CONVERT(varchar(50), CAST([CalculatedLongitude] AS float), 3), N'NULL') AS [CalculatedLongitude],
    ISNULL([Comments], N'NULL') AS [Comments],
    ISNULL([TripReportUrl], N'NULL') AS [TripReportUrl],
    ISNULL(CAST([CalculatedLatitudeInputFormat] AS varchar(20)), N'NULL') AS [CalculatedLatitudeInputFormat],
    ISNULL(CAST([CalculatedLongitudeInputFormat] AS varchar(20)), N'NULL') AS [CalculatedLongitudeInputFormat],
    ISNULL(CAST([StateId] AS varchar(20)), N'NULL') AS [StateId],
    ISNULL([County], N'NULL') AS [County],
    ISNULL([OwnershipType], N'NULL') AS [OwnershipType],
    ISNULL([OwnershipContactInfo], N'NULL') AS [OwnershipContactInfo],
    ISNULL(CAST([MakeOwnershipContactInfoPublic] AS varchar(1)), N'NULL') AS [MakeOwnershipContactInfoPublic]
FROM [Sites].[SiteVisits]
ORDER BY [SiteId], [Id];
GO

-- ### table: site_visitors ###
-- source: [Sites].[Visitors]
-- columns: Id,SiteId,SiteVisitId,FirstName,LastName
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([SiteId] AS varchar(20)), N'NULL') AS [SiteId],
    ISNULL(CAST([SiteVisitId] AS varchar(20)), N'NULL') AS [SiteVisitId],
    ISNULL([FirstName], N'NULL') AS [FirstName],
    ISNULL([LastName], N'NULL') AS [LastName]
FROM [Sites].[Visitors]
ORDER BY COALESCE([SiteId], [SiteVisitId]), [Id];
GO

-- ### table: trees ###
-- source: [Trees].[Trees]
-- columns: Id,ComputedMeasuredSpeciesId,LastMeasured,CommonName,ScientificName,Height,HeightInputFormat,HeightMeasurementMethod,Girth,GirthInputFormat,CrownSpread,CrownSpreadInputFormat,Latitude,LatitudeInputFormat,Longitude,LongitudeInputFormat,CalculatedLatitude,CalculatedLongitude,Elevation,ElevationInputFormat,Diameter,DiameterInputFormat,ENTSPTS,ConicalVolume,ConicalVolumeInputFormat,ENTSPTS2,ChampionPoints,AbbreviatedChampionPoints,CalculatedLatitudeInputFormat,CalculatedLongitudeInputFormat,SiteId
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([ComputedMeasuredSpeciesId] AS varchar(20)), N'NULL') AS [ComputedMeasuredSpeciesId],
    ISNULL(CONVERT(varchar(33), [LastMeasured], 126), N'NULL') AS [LastMeasured],
    ISNULL([CommonName], N'NULL') AS [CommonName],
    ISNULL([ScientificName], N'NULL') AS [ScientificName],
    ISNULL(CONVERT(varchar(50), CAST([Height] AS float), 3), N'NULL') AS [Height],
    ISNULL(CAST([HeightInputFormat] AS varchar(20)), N'NULL') AS [HeightInputFormat],
    ISNULL(CAST([HeightMeasurementMethod] AS varchar(20)), N'NULL') AS [HeightMeasurementMethod],
    ISNULL(CONVERT(varchar(50), CAST([Girth] AS float), 3), N'NULL') AS [Girth],
    ISNULL(CAST([GirthInputFormat] AS varchar(20)), N'NULL') AS [GirthInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([CrownSpread] AS float), 3), N'NULL') AS [CrownSpread],
    ISNULL(CAST([CrownSpreadInputFormat] AS varchar(20)), N'NULL') AS [CrownSpreadInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Latitude] AS float), 3), N'NULL') AS [Latitude],
    ISNULL(CAST([LatitudeInputFormat] AS varchar(20)), N'NULL') AS [LatitudeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Longitude] AS float), 3), N'NULL') AS [Longitude],
    ISNULL(CAST([LongitudeInputFormat] AS varchar(20)), N'NULL') AS [LongitudeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([CalculatedLatitude] AS float), 3), N'NULL') AS [CalculatedLatitude],
    ISNULL(CONVERT(varchar(50), CAST([CalculatedLongitude] AS float), 3), N'NULL') AS [CalculatedLongitude],
    ISNULL(CONVERT(varchar(50), CAST([Elevation] AS float), 3), N'NULL') AS [Elevation],
    ISNULL(CAST([ElevationInputFormat] AS varchar(20)), N'NULL') AS [ElevationInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Diameter] AS float), 3), N'NULL') AS [Diameter],
    ISNULL(CAST([DiameterInputFormat] AS varchar(20)), N'NULL') AS [DiameterInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([ENTSPTS] AS float), 3), N'NULL') AS [ENTSPTS],
    ISNULL(CONVERT(varchar(50), CAST([ConicalVolume] AS float), 3), N'NULL') AS [ConicalVolume],
    ISNULL(CAST([ConicalVolumeInputFormat] AS varchar(20)), N'NULL') AS [ConicalVolumeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([ENTSPTS2] AS float), 3), N'NULL') AS [ENTSPTS2],
    ISNULL(CONVERT(varchar(50), CAST([ChampionPoints] AS float), 3), N'NULL') AS [ChampionPoints],
    ISNULL(CONVERT(varchar(50), CAST([AbbreviatedChampionPoints] AS float), 3), N'NULL') AS [AbbreviatedChampionPoints],
    ISNULL(CAST([CalculatedLatitudeInputFormat] AS varchar(20)), N'NULL') AS [CalculatedLatitudeInputFormat],
    ISNULL(CAST([CalculatedLongitudeInputFormat] AS varchar(20)), N'NULL') AS [CalculatedLongitudeInputFormat],
    ISNULL(CAST([SiteId] AS varchar(20)), N'NULL') AS [SiteId]
FROM [Trees].[Trees]
ORDER BY [Id];
GO

-- ### table: tree_measurements ###
-- source: [Trees].[Measurements]
-- columns: Id,TreeId,ImportingTripId,ComputedMeasuredSpeciesId,Measured,CommonName,ScientificName,Height,HeightInputFormat,HeightMeasurementMethod,Girth,GirthInputFormat,CrownSpread,CrownSpreadInputFormat,Latitude,LatitudeInputFormat,Longitude,LongitudeInputFormat,CalculatedLatitude,CalculatedLongitude,Elevation,ElevationInputFormat,GeneralComments,Diameter,DiameterInputFormat,ENTSPTS,ConicalVolume,ConicalVolumeInputFormat,ENTSPTS2,ChampionPoints,AbbreviatedChampionPoints,CalculatedLatitudeInputFormat,CalculatedLongitudeInputFormat
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([TreeId] AS varchar(20)), N'NULL') AS [TreeId],
    ISNULL(CAST([ImportingTripId] AS varchar(20)), N'NULL') AS [ImportingTripId],
    ISNULL(CAST([ComputedMeasuredSpeciesId] AS varchar(20)), N'NULL') AS [ComputedMeasuredSpeciesId],
    ISNULL(CONVERT(varchar(33), [Measured], 126), N'NULL') AS [Measured],
    ISNULL([CommonName], N'NULL') AS [CommonName],
    ISNULL([ScientificName], N'NULL') AS [ScientificName],
    ISNULL(CONVERT(varchar(50), CAST([Height] AS float), 3), N'NULL') AS [Height],
    ISNULL(CAST([HeightInputFormat] AS varchar(20)), N'NULL') AS [HeightInputFormat],
    ISNULL(CAST([HeightMeasurementMethod] AS varchar(20)), N'NULL') AS [HeightMeasurementMethod],
    ISNULL(CONVERT(varchar(50), CAST([Girth] AS float), 3), N'NULL') AS [Girth],
    ISNULL(CAST([GirthInputFormat] AS varchar(20)), N'NULL') AS [GirthInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([CrownSpread] AS float), 3), N'NULL') AS [CrownSpread],
    ISNULL(CAST([CrownSpreadInputFormat] AS varchar(20)), N'NULL') AS [CrownSpreadInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Latitude] AS float), 3), N'NULL') AS [Latitude],
    ISNULL(CAST([LatitudeInputFormat] AS varchar(20)), N'NULL') AS [LatitudeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Longitude] AS float), 3), N'NULL') AS [Longitude],
    ISNULL(CAST([LongitudeInputFormat] AS varchar(20)), N'NULL') AS [LongitudeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([CalculatedLatitude] AS float), 3), N'NULL') AS [CalculatedLatitude],
    ISNULL(CONVERT(varchar(50), CAST([CalculatedLongitude] AS float), 3), N'NULL') AS [CalculatedLongitude],
    ISNULL(CONVERT(varchar(50), CAST([Elevation] AS float), 3), N'NULL') AS [Elevation],
    ISNULL(CAST([ElevationInputFormat] AS varchar(20)), N'NULL') AS [ElevationInputFormat],
    ISNULL([GeneralComments], N'NULL') AS [GeneralComments],
    ISNULL(CONVERT(varchar(50), CAST([Diameter] AS float), 3), N'NULL') AS [Diameter],
    ISNULL(CAST([DiameterInputFormat] AS varchar(20)), N'NULL') AS [DiameterInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([ENTSPTS] AS float), 3), N'NULL') AS [ENTSPTS],
    ISNULL(CONVERT(varchar(50), CAST([ConicalVolume] AS float), 3), N'NULL') AS [ConicalVolume],
    ISNULL(CAST([ConicalVolumeInputFormat] AS varchar(20)), N'NULL') AS [ConicalVolumeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([ENTSPTS2] AS float), 3), N'NULL') AS [ENTSPTS2],
    ISNULL(CONVERT(varchar(50), CAST([ChampionPoints] AS float), 3), N'NULL') AS [ChampionPoints],
    ISNULL(CONVERT(varchar(50), CAST([AbbreviatedChampionPoints] AS float), 3), N'NULL') AS [AbbreviatedChampionPoints],
    ISNULL(CAST([CalculatedLatitudeInputFormat] AS varchar(20)), N'NULL') AS [CalculatedLatitudeInputFormat],
    ISNULL(CAST([CalculatedLongitudeInputFormat] AS varchar(20)), N'NULL') AS [CalculatedLongitudeInputFormat]
FROM [Trees].[Measurements]
ORDER BY [Id];
GO

-- ### table: tree_measurers ###
-- source: [Trees].[Measurers]
-- columns: Id,TreeId,MeasurementId,FirstName,LastName
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([TreeId] AS varchar(20)), N'NULL') AS [TreeId],
    ISNULL(CAST([MeasurementId] AS varchar(20)), N'NULL') AS [MeasurementId],
    ISNULL([FirstName], N'NULL') AS [FirstName],
    ISNULL([LastName], N'NULL') AS [LastName]
FROM [Trees].[Measurers]
ORDER BY COALESCE([TreeId], [MeasurementId]), [Id];
GO

-- ### table: known_species ###
-- source: [Trees].[KnownSpecies]
-- columns: Id,AcceptedSymbol,ScientificName,CommonName
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL([AcceptedSymbol], N'NULL') AS [AcceptedSymbol],
    ISNULL([ScientificName], N'NULL') AS [ScientificName],
    ISNULL([CommonName], N'NULL') AS [CommonName]
FROM [Trees].[KnownSpecies]
ORDER BY [Id];
GO

-- ### table: photos ###
-- source: [Photos].[Photos]
-- columns: Id,CreatorUserId,Created,Width,Height,Bytes,Format
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([CreatorUserId] AS varchar(20)), N'NULL') AS [CreatorUserId],
    ISNULL(CONVERT(varchar(33), [Created], 126), N'NULL') AS [Created],
    ISNULL(CAST([Width] AS varchar(20)), N'NULL') AS [Width],
    ISNULL(CAST([Height] AS varchar(20)), N'NULL') AS [Height],
    ISNULL(CAST([Bytes] AS varchar(20)), N'NULL') AS [Bytes],
    ISNULL(CAST([Format] AS varchar(20)), N'NULL') AS [Format]
FROM [Photos].[Photos]
ORDER BY [Id];
GO

-- ### table: photo_references ###
-- source: [Photos].[References]
-- columns: Id,Type,ImportTreeId,TreeId,TreeMeasurementId,PhotoId,ImportSiteId,SiteId,SiteVisitId
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([Type] AS varchar(20)), N'NULL') AS [Type],
    ISNULL(CAST([ImportTreeId] AS varchar(20)), N'NULL') AS [ImportTreeId],
    ISNULL(CAST([TreeId] AS varchar(20)), N'NULL') AS [TreeId],
    ISNULL(CAST([TreeMeasurementId] AS varchar(20)), N'NULL') AS [TreeMeasurementId],
    ISNULL(CAST([PhotoId] AS varchar(20)), N'NULL') AS [PhotoId],
    ISNULL(CAST([ImportSiteId] AS varchar(20)), N'NULL') AS [ImportSiteId],
    ISNULL(CAST([SiteId] AS varchar(20)), N'NULL') AS [SiteId],
    ISNULL(CAST([SiteVisitId] AS varchar(20)), N'NULL') AS [SiteVisitId]
FROM [Photos].[References]
ORDER BY [Id];
GO

-- ### table: import_trips ###
-- source: [Imports].[Trips]
-- columns: Id,CreatorUserId,Created,Imported,Name,Date,Website,PhotosAvailable,MeasurerContactInfo,MakeMeasurerContactInfoPublic,DefaultLaserBrand,DefaultClinometerBrand,DefaultHeightMeasurementMethod,DefaultStateId,DefaultCounty,LastSaved
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([CreatorUserId] AS varchar(20)), N'NULL') AS [CreatorUserId],
    ISNULL(CONVERT(varchar(33), [Created], 126), N'NULL') AS [Created],
    ISNULL(CONVERT(varchar(33), [Imported], 126), N'NULL') AS [Imported],
    ISNULL([Name], N'NULL') AS [Name],
    ISNULL(CONVERT(varchar(33), [Date], 126), N'NULL') AS [Date],
    ISNULL([Website], N'NULL') AS [Website],
    ISNULL(CAST([PhotosAvailable] AS varchar(1)), N'NULL') AS [PhotosAvailable],
    ISNULL([MeasurerContactInfo], N'NULL') AS [MeasurerContactInfo],
    ISNULL(CAST([MakeMeasurerContactInfoPublic] AS varchar(1)), N'NULL') AS [MakeMeasurerContactInfoPublic],
    ISNULL([DefaultLaserBrand], N'NULL') AS [DefaultLaserBrand],
    ISNULL([DefaultClinometerBrand], N'NULL') AS [DefaultClinometerBrand],
    ISNULL(CAST([DefaultHeightMeasurementMethod] AS varchar(20)), N'NULL') AS [DefaultHeightMeasurementMethod],
    ISNULL(CAST([DefaultStateId] AS varchar(20)), N'NULL') AS [DefaultStateId],
    ISNULL([DefaultCounty], N'NULL') AS [DefaultCounty],
    ISNULL(CONVERT(varchar(33), [LastSaved], 126), N'NULL') AS [LastSaved]
FROM [Imports].[Trips]
ORDER BY [Id];
GO

-- ### table: import_trip_measurers ###
-- source: [Imports].[Measurers]
-- columns: Id,TripId,FirstName,LastName
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([TripId] AS varchar(20)), N'NULL') AS [TripId],
    ISNULL([FirstName], N'NULL') AS [FirstName],
    ISNULL([LastName], N'NULL') AS [LastName]
FROM [Imports].[Measurers]
ORDER BY [TripId], [Id];
GO

-- ### table: import_sites ###
-- source: [Imports].[Sites]
-- columns: Id,Created,CreatorUserId,TripId,Name,Latitude,LatitudeInputFormat,Longitude,LongitudeInputFormat,Comments,StateId,County,OwnershipType,OwnershipContactInfo,MakeOwnershipContactInfoPublic
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CONVERT(varchar(33), [Created], 126), N'NULL') AS [Created],
    ISNULL(CAST([CreatorUserId] AS varchar(20)), N'NULL') AS [CreatorUserId],
    ISNULL(CAST([TripId] AS varchar(20)), N'NULL') AS [TripId],
    ISNULL([Name], N'NULL') AS [Name],
    ISNULL(CONVERT(varchar(50), CAST([Latitude] AS float), 3), N'NULL') AS [Latitude],
    ISNULL(CAST([LatitudeInputFormat] AS varchar(20)), N'NULL') AS [LatitudeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Longitude] AS float), 3), N'NULL') AS [Longitude],
    ISNULL(CAST([LongitudeInputFormat] AS varchar(20)), N'NULL') AS [LongitudeInputFormat],
    ISNULL([Comments], N'NULL') AS [Comments],
    ISNULL(CAST([StateId] AS varchar(20)), N'NULL') AS [StateId],
    ISNULL([County], N'NULL') AS [County],
    ISNULL([OwnershipType], N'NULL') AS [OwnershipType],
    ISNULL([OwnershipContactInfo], N'NULL') AS [OwnershipContactInfo],
    ISNULL(CAST([MakeOwnershipContactInfoPublic] AS varchar(1)), N'NULL') AS [MakeOwnershipContactInfoPublic]
FROM [Imports].[Sites]
ORDER BY [Id];
GO

-- ### table: import_trees ###
-- source: [Imports].[Trees]
-- columns: Id,Created,CreatorUserId,Type,TreeName,TreeNumber,CommonName,ScientificName,Status,HealthStatus,AgeClass,AgeType,Age,GeneralComments,Latitude,LatitudeInputFormat,Longitude,LongitudeInputFormat,MakeCoordinatesPublic,Elevation,ElevationInputFormat,Height,HeightInputFormat,HeightMeasurementMethod,HeightMeasurementsDistanceTop,HeightMeasurementsDistanceTopInputFormat,HeightMeasurementsAngleTop,HeightMeasurementsAngleTopInputFormat,HeightMeasurementsDistanceBottom,HeightMeasurementsDistanceBottomInputFormat,HeightMeasurementsAngleBottom,HeightMeasurementsAngleBottomInputFormat,HeightMeasurementsVerticalOffset,HeightMeasurementsVerticalOffsetInputFormat,HeightMeasurementType,LaserBrand,ClinometerBrand,HeightComments,Girth,GirthInputFormat,GirthMeasurementHeight,GirthMeasurementHeightInputFormat,GirthRootCollarHeight,GirthRootCollarHeightInputFormat,GirthComments,CrownSpread,CrownSpreadInputFormat,MaximumLimbLength,MaximumLimbLengthInputFormat,CrownSpreadMeasurementMethod,BaseCrownHeight,BaseCrownHeightInputFormat,CrownVolume,CrownVolumeInputFormat,CrownVolumeCalculationMethod,CrownComments,TrunkVolume,TrunkVolumeInputFormat,TrunkVolumeCalculationMethod,TrunkComments,FormType,NumberOfTrunks,TreeFormComments,TerrainType,TerrainShapeIndex,LandformIndex,TerrainComments,CombinedGirthNumberOfTrunks,SiteId
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CONVERT(varchar(33), [Created], 126), N'NULL') AS [Created],
    ISNULL(CAST([CreatorUserId] AS varchar(20)), N'NULL') AS [CreatorUserId],
    ISNULL(CAST([Type] AS varchar(20)), N'NULL') AS [Type],
    ISNULL([TreeName], N'NULL') AS [TreeName],
    ISNULL(CAST([TreeNumber] AS varchar(20)), N'NULL') AS [TreeNumber],
    ISNULL([CommonName], N'NULL') AS [CommonName],
    ISNULL([ScientificName], N'NULL') AS [ScientificName],
    ISNULL(CAST([Status] AS varchar(20)), N'NULL') AS [Status],
    ISNULL([HealthStatus], N'NULL') AS [HealthStatus],
    ISNULL(CAST([AgeClass] AS varchar(20)), N'NULL') AS [AgeClass],
    ISNULL(CAST([AgeType] AS varchar(20)), N'NULL') AS [AgeType],
    ISNULL(CAST([Age] AS varchar(20)), N'NULL') AS [Age],
    ISNULL([GeneralComments], N'NULL') AS [GeneralComments],
    ISNULL(CONVERT(varchar(50), CAST([Latitude] AS float), 3), N'NULL') AS [Latitude],
    ISNULL(CAST([LatitudeInputFormat] AS varchar(20)), N'NULL') AS [LatitudeInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Longitude] AS float), 3), N'NULL') AS [Longitude],
    ISNULL(CAST([LongitudeInputFormat] AS varchar(20)), N'NULL') AS [LongitudeInputFormat],
    ISNULL(CAST([MakeCoordinatesPublic] AS varchar(1)), N'NULL') AS [MakeCoordinatesPublic],
    ISNULL(CONVERT(varchar(50), CAST([Elevation] AS float), 3), N'NULL') AS [Elevation],
    ISNULL(CAST([ElevationInputFormat] AS varchar(20)), N'NULL') AS [ElevationInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Height] AS float), 3), N'NULL') AS [Height],
    ISNULL(CAST([HeightInputFormat] AS varchar(20)), N'NULL') AS [HeightInputFormat],
    ISNULL(CAST([HeightMeasurementMethod] AS varchar(20)), N'NULL') AS [HeightMeasurementMethod],
    ISNULL(CONVERT(varchar(50), CAST([HeightMeasurementsDistanceTop] AS float), 3), N'NULL') AS [HeightMeasurementsDistanceTop],
    ISNULL(CAST([HeightMeasurementsDistanceTopInputFormat] AS varchar(20)), N'NULL') AS [HeightMeasurementsDistanceTopInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([HeightMeasurementsAngleTop] AS float), 3), N'NULL') AS [HeightMeasurementsAngleTop],
    ISNULL(CAST([HeightMeasurementsAngleTopInputFormat] AS varchar(20)), N'NULL') AS [HeightMeasurementsAngleTopInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([HeightMeasurementsDistanceBottom] AS float), 3), N'NULL') AS [HeightMeasurementsDistanceBottom],
    ISNULL(CAST([HeightMeasurementsDistanceBottomInputFormat] AS varchar(20)), N'NULL') AS [HeightMeasurementsDistanceBottomInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([HeightMeasurementsAngleBottom] AS float), 3), N'NULL') AS [HeightMeasurementsAngleBottom],
    ISNULL(CAST([HeightMeasurementsAngleBottomInputFormat] AS varchar(20)), N'NULL') AS [HeightMeasurementsAngleBottomInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([HeightMeasurementsVerticalOffset] AS float), 3), N'NULL') AS [HeightMeasurementsVerticalOffset],
    ISNULL(CAST([HeightMeasurementsVerticalOffsetInputFormat] AS varchar(20)), N'NULL') AS [HeightMeasurementsVerticalOffsetInputFormat],
    ISNULL([HeightMeasurementType], N'NULL') AS [HeightMeasurementType],
    ISNULL([LaserBrand], N'NULL') AS [LaserBrand],
    ISNULL([ClinometerBrand], N'NULL') AS [ClinometerBrand],
    ISNULL([HeightComments], N'NULL') AS [HeightComments],
    ISNULL(CONVERT(varchar(50), CAST([Girth] AS float), 3), N'NULL') AS [Girth],
    ISNULL(CAST([GirthInputFormat] AS varchar(20)), N'NULL') AS [GirthInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([GirthMeasurementHeight] AS float), 3), N'NULL') AS [GirthMeasurementHeight],
    ISNULL(CAST([GirthMeasurementHeightInputFormat] AS varchar(20)), N'NULL') AS [GirthMeasurementHeightInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([GirthRootCollarHeight] AS float), 3), N'NULL') AS [GirthRootCollarHeight],
    ISNULL(CAST([GirthRootCollarHeightInputFormat] AS varchar(20)), N'NULL') AS [GirthRootCollarHeightInputFormat],
    ISNULL([GirthComments], N'NULL') AS [GirthComments],
    ISNULL(CONVERT(varchar(50), CAST([CrownSpread] AS float), 3), N'NULL') AS [CrownSpread],
    ISNULL(CAST([CrownSpreadInputFormat] AS varchar(20)), N'NULL') AS [CrownSpreadInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([MaximumLimbLength] AS float), 3), N'NULL') AS [MaximumLimbLength],
    ISNULL(CAST([MaximumLimbLengthInputFormat] AS varchar(20)), N'NULL') AS [MaximumLimbLengthInputFormat],
    ISNULL([CrownSpreadMeasurementMethod], N'NULL') AS [CrownSpreadMeasurementMethod],
    ISNULL(CONVERT(varchar(50), CAST([BaseCrownHeight] AS float), 3), N'NULL') AS [BaseCrownHeight],
    ISNULL(CAST([BaseCrownHeightInputFormat] AS varchar(20)), N'NULL') AS [BaseCrownHeightInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([CrownVolume] AS float), 3), N'NULL') AS [CrownVolume],
    ISNULL(CAST([CrownVolumeInputFormat] AS varchar(20)), N'NULL') AS [CrownVolumeInputFormat],
    ISNULL([CrownVolumeCalculationMethod], N'NULL') AS [CrownVolumeCalculationMethod],
    ISNULL([CrownComments], N'NULL') AS [CrownComments],
    ISNULL(CONVERT(varchar(50), CAST([TrunkVolume] AS float), 3), N'NULL') AS [TrunkVolume],
    ISNULL(CAST([TrunkVolumeInputFormat] AS varchar(20)), N'NULL') AS [TrunkVolumeInputFormat],
    ISNULL([TrunkVolumeCalculationMethod], N'NULL') AS [TrunkVolumeCalculationMethod],
    ISNULL([TrunkComments], N'NULL') AS [TrunkComments],
    ISNULL(CAST([FormType] AS varchar(20)), N'NULL') AS [FormType],
    ISNULL(CAST([NumberOfTrunks] AS varchar(20)), N'NULL') AS [NumberOfTrunks],
    ISNULL([TreeFormComments], N'NULL') AS [TreeFormComments],
    ISNULL(CAST([TerrainType] AS varchar(20)), N'NULL') AS [TerrainType],
    ISNULL(CONVERT(varchar(50), CAST([TerrainShapeIndex] AS float), 3), N'NULL') AS [TerrainShapeIndex],
    ISNULL(CONVERT(varchar(50), CAST([LandformIndex] AS float), 3), N'NULL') AS [LandformIndex],
    ISNULL([TerrainComments], N'NULL') AS [TerrainComments],
    ISNULL(CAST([CombinedGirthNumberOfTrunks] AS varchar(20)), N'NULL') AS [CombinedGirthNumberOfTrunks],
    ISNULL(CAST([SiteId] AS varchar(20)), N'NULL') AS [SiteId]
FROM [Imports].[Trees]
ORDER BY [Id];
GO

-- ### table: import_trunks ###
-- source: [Imports].[Trunks]
-- columns: Id,Created,CreatorUserId,TreeId,Girth,GirthInputFormat,GirthMeasurementHeight,GirthMeasurementHeightInputFormat,Height,HeightInputFormat,HeightMeasurementsDistanceTop,HeightMeasurementsDistanceTopInputFormat,HeightMeasurementsAngleTop,HeightMeasurementsAngleTopInputFormat,HeightMeasurementsDistanceBottom,HeightMeasurementsDistanceBottomInputFormat,HeightMeasurementsAngleBottom,HeightMeasurementsAngleBottomInputFormat,HeightMeasurementsVerticalOffset,HeightMeasurementsVerticalOffsetInputFormat,IncludeHeightDistanceAndAngleMeasurements,TrunkComments
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CONVERT(varchar(33), [Created], 126), N'NULL') AS [Created],
    ISNULL(CAST([CreatorUserId] AS varchar(20)), N'NULL') AS [CreatorUserId],
    ISNULL(CAST([TreeId] AS varchar(20)), N'NULL') AS [TreeId],
    ISNULL(CONVERT(varchar(50), CAST([Girth] AS float), 3), N'NULL') AS [Girth],
    ISNULL(CAST([GirthInputFormat] AS varchar(20)), N'NULL') AS [GirthInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([GirthMeasurementHeight] AS float), 3), N'NULL') AS [GirthMeasurementHeight],
    ISNULL(CAST([GirthMeasurementHeightInputFormat] AS varchar(20)), N'NULL') AS [GirthMeasurementHeightInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([Height] AS float), 3), N'NULL') AS [Height],
    ISNULL(CAST([HeightInputFormat] AS varchar(20)), N'NULL') AS [HeightInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([HeightMeasurementsDistanceTop] AS float), 3), N'NULL') AS [HeightMeasurementsDistanceTop],
    ISNULL(CAST([HeightMeasurementsDistanceTopInputFormat] AS varchar(20)), N'NULL') AS [HeightMeasurementsDistanceTopInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([HeightMeasurementsAngleTop] AS float), 3), N'NULL') AS [HeightMeasurementsAngleTop],
    ISNULL(CAST([HeightMeasurementsAngleTopInputFormat] AS varchar(20)), N'NULL') AS [HeightMeasurementsAngleTopInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([HeightMeasurementsDistanceBottom] AS float), 3), N'NULL') AS [HeightMeasurementsDistanceBottom],
    ISNULL(CAST([HeightMeasurementsDistanceBottomInputFormat] AS varchar(20)), N'NULL') AS [HeightMeasurementsDistanceBottomInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([HeightMeasurementsAngleBottom] AS float), 3), N'NULL') AS [HeightMeasurementsAngleBottom],
    ISNULL(CAST([HeightMeasurementsAngleBottomInputFormat] AS varchar(20)), N'NULL') AS [HeightMeasurementsAngleBottomInputFormat],
    ISNULL(CONVERT(varchar(50), CAST([HeightMeasurementsVerticalOffset] AS float), 3), N'NULL') AS [HeightMeasurementsVerticalOffset],
    ISNULL(CAST([HeightMeasurementsVerticalOffsetInputFormat] AS varchar(20)), N'NULL') AS [HeightMeasurementsVerticalOffsetInputFormat],
    ISNULL(CAST([IncludeHeightDistanceAndAngleMeasurements] AS varchar(1)), N'NULL') AS [IncludeHeightDistanceAndAngleMeasurements],
    ISNULL([TrunkComments], N'NULL') AS [TrunkComments]
FROM [Imports].[Trunks]
ORDER BY [TreeId], [Id];
GO

