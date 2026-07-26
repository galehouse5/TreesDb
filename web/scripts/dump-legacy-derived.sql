-- =============================================================================
-- dump-legacy-derived.sql -- TreesDb P0-03 derived-object dumps (PUBLIC DATA)
-- =============================================================================
-- WHAT: dumps of the 6 derived SQL objects named in doc 07 section 7.2
--   (Trees.MeasuredSpecies, Trees.MeasuredSpeciesBySite,
--   Trees.MeasuredSpeciesByState, dbo.SiteMetrics, dbo.StateMetrics,
--   dbo.MeasurerActivity) plus evaluations of the 3 search table-valued
--   functions (dbo.SearchMeasuredSpecies, dbo.SearchSites, dbo.SearchStates)
--   over a corpus of search terms. Source of truth for all of these object
--   definitions is Tmd.Migrations/Scripts/CreateObjectsAndTypes.sql (NOT the
--   baseline -- maintenance migrations drop/recreate these on every run).
--
-- This data is PUBLIC (no PII: species names, site/state aggregate metrics,
--   search rankings) -- unlike dump-legacy.sql's table dumps, these CSVs are
--   COMMITTED to web/parity/snapshots/derived/ per doc 02 P0-03.
--
-- HOW TO RUN: via web/scripts/dump-legacy.ps1 (same marker-parsing wrapper
--   as dump-legacy.sql, output routed to -DerivedOutDir instead of -OutDir).
--   The `-- ### derived: <name> ###` blocks run once each; the
--   `-- ### search: <name> ###` blocks run once per -SearchTerms entry, with
--   __SEARCH_TERM__ substituted (single quotes doubled) before execution --
--   producing one CSV per (function, term) pair, e.g. search_sites__oak.csv.
--
-- EXPECTED DURATION: seconds -- 6 view queries + (3 functions x term count)
--   TVF evaluations, all over small production data.
--
-- FORMATTING RULES: identical convention to dump-legacy.sql -- real/float
--   via CONVERT(varchar(50), CAST(col AS float), 3); date/datetime via
--   CONVERT(varchar(33), col, 126); every expression ISNULL-wrapped to the
--   literal token NULL, emitted unquoted by the PS1 wrapper (see that file's
--   header for the full NULL-vs-empty-string CSV convention). No binary
--   columns appear in these objects. dbo.SiteMetrics/StateMetrics's
--   ContainsEntityWithCoordinates is a CASE-derived int (1/0) in the source
--   view, not a bit column -- dumped as int, not as a bit toggle.
--
-- SEARCH TERM CORPUS (TODO: sync with the real parity corpus once
--   web/parity/corpus.ts exists -- doc 07 section 3 calls for 30 terms
--   covering exact state codes, name fragments, a zero-hit term, a >25-hit
--   term, and terms with %/_ wildcard metacharacters). Until then,
--   dump-legacy.ps1's -SearchTerms default is a small placeholder list:
--     oak, OH, USA, park, white, %, _, quercus, zzznone, e
--   -- chosen to exercise: a common species-name fragment (oak), a real
--   2-letter state code (OH), a non-matching "3-letter code shaped" string
--   (USA is not a legacy TripleLetterCode -- included specifically as a
--   near-miss case), a common site-name fragment (park), a common
--   color/species fragment (white), the two SQL LIKE metacharacters as
--   literal search terms (% and _ -- legacy does NOT escape these, doc 01
--   section 4 / D-010, so this is a deliberate parity trap), a botanical
--   fragment (quercus), a guaranteed zero-hit term (zzznone), and a
--   single-character term (e) expected to hit a large number of rows.
--   Legacy LIKE is case-insensitive under the default collation (doc 01
--   section 4) so casing of these terms should not matter, but OH/USA are
--   kept upper-case to match how real state codes are stored.
--
-- Requires: SQL Server 2016+ compatible T-SQL. Run against the production
--   Azure SQL DB with SELECT on Trees/dbo/Sites/Locations schemas.
-- =============================================================================

-- ### derived: measured_species ###
-- source: [Trees].[MeasuredSpecies]
-- columns: Id,ScientificName,CommonName,MaxHeight,MaxHeightInputFormat,MaxHeightTreeId,MaxGirth,MaxGirthInputFormat,MaxGirthTreeId,MaxCrownSpread,MaxCrownSpreadInputFormat,MaxCrownSpreadTreeId,Number
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL([ScientificName], N'NULL') AS [ScientificName],
    ISNULL([CommonName], N'NULL') AS [CommonName],
    ISNULL(CONVERT(varchar(50), CAST([MaxHeight] AS float), 3), N'NULL') AS [MaxHeight],
    ISNULL(CAST([MaxHeightInputFormat] AS varchar(20)), N'NULL') AS [MaxHeightInputFormat],
    ISNULL(CAST([MaxHeightTreeId] AS varchar(20)), N'NULL') AS [MaxHeightTreeId],
    ISNULL(CONVERT(varchar(50), CAST([MaxGirth] AS float), 3), N'NULL') AS [MaxGirth],
    ISNULL(CAST([MaxGirthInputFormat] AS varchar(20)), N'NULL') AS [MaxGirthInputFormat],
    ISNULL(CAST([MaxGirthTreeId] AS varchar(20)), N'NULL') AS [MaxGirthTreeId],
    ISNULL(CONVERT(varchar(50), CAST([MaxCrownSpread] AS float), 3), N'NULL') AS [MaxCrownSpread],
    ISNULL(CAST([MaxCrownSpreadInputFormat] AS varchar(20)), N'NULL') AS [MaxCrownSpreadInputFormat],
    ISNULL(CAST([MaxCrownSpreadTreeId] AS varchar(20)), N'NULL') AS [MaxCrownSpreadTreeId],
    ISNULL(CAST([Number] AS varchar(20)), N'NULL') AS [Number]
FROM [Trees].[MeasuredSpecies]
ORDER BY [Id];
GO

-- ### derived: measured_species_by_site ###
-- source: [Trees].[MeasuredSpeciesBySite]
-- columns: Id,SiteId,ScientificName,CommonName,MaxHeight,MaxHeightInputFormat,MaxHeightTreeId,MaxGirth,MaxGirthInputFormat,MaxGirthTreeId,MaxCrownSpread,MaxCrownSpreadInputFormat,MaxCrownSpreadTreeId,Number
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([SiteId] AS varchar(20)), N'NULL') AS [SiteId],
    ISNULL([ScientificName], N'NULL') AS [ScientificName],
    ISNULL([CommonName], N'NULL') AS [CommonName],
    ISNULL(CONVERT(varchar(50), CAST([MaxHeight] AS float), 3), N'NULL') AS [MaxHeight],
    ISNULL(CAST([MaxHeightInputFormat] AS varchar(20)), N'NULL') AS [MaxHeightInputFormat],
    ISNULL(CAST([MaxHeightTreeId] AS varchar(20)), N'NULL') AS [MaxHeightTreeId],
    ISNULL(CONVERT(varchar(50), CAST([MaxGirth] AS float), 3), N'NULL') AS [MaxGirth],
    ISNULL(CAST([MaxGirthInputFormat] AS varchar(20)), N'NULL') AS [MaxGirthInputFormat],
    ISNULL(CAST([MaxGirthTreeId] AS varchar(20)), N'NULL') AS [MaxGirthTreeId],
    ISNULL(CONVERT(varchar(50), CAST([MaxCrownSpread] AS float), 3), N'NULL') AS [MaxCrownSpread],
    ISNULL(CAST([MaxCrownSpreadInputFormat] AS varchar(20)), N'NULL') AS [MaxCrownSpreadInputFormat],
    ISNULL(CAST([MaxCrownSpreadTreeId] AS varchar(20)), N'NULL') AS [MaxCrownSpreadTreeId],
    ISNULL(CAST([Number] AS varchar(20)), N'NULL') AS [Number]
FROM [Trees].[MeasuredSpeciesBySite]
ORDER BY [Id];
GO

-- ### derived: measured_species_by_state ###
-- source: [Trees].[MeasuredSpeciesByState]
-- columns: Id,StateId,ScientificName,CommonName,MaxHeight,MaxHeightInputFormat,MaxHeightTreeId,MaxGirth,MaxGirthInputFormat,MaxGirthTreeId,MaxCrownSpread,MaxCrownSpreadInputFormat,MaxCrownSpreadTreeId,Number
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([StateId] AS varchar(20)), N'NULL') AS [StateId],
    ISNULL([ScientificName], N'NULL') AS [ScientificName],
    ISNULL([CommonName], N'NULL') AS [CommonName],
    ISNULL(CONVERT(varchar(50), CAST([MaxHeight] AS float), 3), N'NULL') AS [MaxHeight],
    ISNULL(CAST([MaxHeightInputFormat] AS varchar(20)), N'NULL') AS [MaxHeightInputFormat],
    ISNULL(CAST([MaxHeightTreeId] AS varchar(20)), N'NULL') AS [MaxHeightTreeId],
    ISNULL(CONVERT(varchar(50), CAST([MaxGirth] AS float), 3), N'NULL') AS [MaxGirth],
    ISNULL(CAST([MaxGirthInputFormat] AS varchar(20)), N'NULL') AS [MaxGirthInputFormat],
    ISNULL(CAST([MaxGirthTreeId] AS varchar(20)), N'NULL') AS [MaxGirthTreeId],
    ISNULL(CONVERT(varchar(50), CAST([MaxCrownSpread] AS float), 3), N'NULL') AS [MaxCrownSpread],
    ISNULL(CAST([MaxCrownSpreadInputFormat] AS varchar(20)), N'NULL') AS [MaxCrownSpreadInputFormat],
    ISNULL(CAST([MaxCrownSpreadTreeId] AS varchar(20)), N'NULL') AS [MaxCrownSpreadTreeId],
    ISNULL(CAST([Number] AS varchar(20)), N'NULL') AS [Number]
FROM [Trees].[MeasuredSpeciesByState]
ORDER BY [Id];
GO

-- ### derived: site_metrics ###
-- source: [dbo].[SiteMetrics]
-- columns: SiteId,RHI5,RHI10,RHI20,RGI5,RGI10,RGI20,TreesMeasuredCount,LastMeasurementDate,ContainsEntityWithCoordinates
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([SiteId] AS varchar(20)), N'NULL') AS [SiteId],
    ISNULL(CONVERT(varchar(50), CAST([RHI5] AS float), 3), N'NULL') AS [RHI5],
    ISNULL(CONVERT(varchar(50), CAST([RHI10] AS float), 3), N'NULL') AS [RHI10],
    ISNULL(CONVERT(varchar(50), CAST([RHI20] AS float), 3), N'NULL') AS [RHI20],
    ISNULL(CONVERT(varchar(50), CAST([RGI5] AS float), 3), N'NULL') AS [RGI5],
    ISNULL(CONVERT(varchar(50), CAST([RGI10] AS float), 3), N'NULL') AS [RGI10],
    ISNULL(CONVERT(varchar(50), CAST([RGI20] AS float), 3), N'NULL') AS [RGI20],
    ISNULL(CAST([TreesMeasuredCount] AS varchar(20)), N'NULL') AS [TreesMeasuredCount],
    ISNULL(CONVERT(varchar(33), [LastMeasurementDate], 126), N'NULL') AS [LastMeasurementDate],
    ISNULL(CAST([ContainsEntityWithCoordinates] AS varchar(20)), N'NULL') AS [ContainsEntityWithCoordinates]
FROM [dbo].[SiteMetrics]
ORDER BY [SiteId];
GO

-- ### derived: state_metrics ###
-- source: [dbo].[StateMetrics]
-- columns: StateId,RHI5,RHI10,RHI20,RGI5,RGI10,RGI20,TreesMeasuredCount,LastMeasurementDate,ContainsEntityWithCoordinates
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([StateId] AS varchar(20)), N'NULL') AS [StateId],
    ISNULL(CONVERT(varchar(50), CAST([RHI5] AS float), 3), N'NULL') AS [RHI5],
    ISNULL(CONVERT(varchar(50), CAST([RHI10] AS float), 3), N'NULL') AS [RHI10],
    ISNULL(CONVERT(varchar(50), CAST([RHI20] AS float), 3), N'NULL') AS [RHI20],
    ISNULL(CONVERT(varchar(50), CAST([RGI5] AS float), 3), N'NULL') AS [RGI5],
    ISNULL(CONVERT(varchar(50), CAST([RGI10] AS float), 3), N'NULL') AS [RGI10],
    ISNULL(CONVERT(varchar(50), CAST([RGI20] AS float), 3), N'NULL') AS [RGI20],
    ISNULL(CAST([TreesMeasuredCount] AS varchar(20)), N'NULL') AS [TreesMeasuredCount],
    ISNULL(CONVERT(varchar(33), [LastMeasurementDate], 126), N'NULL') AS [LastMeasurementDate],
    ISNULL(CAST([ContainsEntityWithCoordinates] AS varchar(20)), N'NULL') AS [ContainsEntityWithCoordinates]
FROM [dbo].[StateMetrics]
ORDER BY [StateId];
GO

-- ### derived: measurer_activity ###
-- source: [dbo].[MeasurerActivity]
-- columns: Id,LastName,FirstName,TreesMeasuredCount,SitesVisitedCount,LastMeasurementDate
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL([LastName], N'NULL') AS [LastName],
    ISNULL([FirstName], N'NULL') AS [FirstName],
    ISNULL(CAST([TreesMeasuredCount] AS varchar(20)), N'NULL') AS [TreesMeasuredCount],
    ISNULL(CAST([SitesVisitedCount] AS varchar(20)), N'NULL') AS [SitesVisitedCount],
    ISNULL(CONVERT(varchar(33), [LastMeasurementDate], 126), N'NULL') AS [LastMeasurementDate]
FROM [dbo].[MeasurerActivity]
ORDER BY [Id];
GO

-- ### search: search_measured_species ###
-- source: [dbo].[SearchMeasuredSpecies]
-- columns: Id,Rank
-- rank: sum of 6 prefix/suffix/contains +1 flags over ScientificName + CommonName
-- term placeholder: __SEARCH_TERM__ (substituted by dump-legacy.ps1 per -SearchTerms entry)
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([Rank] AS varchar(20)), N'NULL') AS [Rank]
FROM [dbo].[SearchMeasuredSpecies](N'__SEARCH_TERM__')
ORDER BY [Id];
GO

-- ### search: search_sites ###
-- source: [dbo].[SearchSites]
-- columns: Id,Rank
-- rank: sum of 6 prefix/suffix/contains +1 flags over Name + County
-- term placeholder: __SEARCH_TERM__ (substituted by dump-legacy.ps1 per -SearchTerms entry)
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([Rank] AS varchar(20)), N'NULL') AS [Rank]
FROM [dbo].[SearchSites](N'__SEARCH_TERM__')
ORDER BY [Id];
GO

-- ### search: search_states ###
-- source: [dbo].[SearchStates]
-- columns: Id,Rank
-- rank: 3 flags over Name (prefix/suffix/contains) + 2 each for exact DoubleLetterCode/TripleLetterCode match
-- term placeholder: __SEARCH_TERM__ (substituted by dump-legacy.ps1 per -SearchTerms entry)
SET NOCOUNT ON;
SELECT
    ISNULL(CAST([Id] AS varchar(20)), N'NULL') AS [Id],
    ISNULL(CAST([Rank] AS varchar(20)), N'NULL') AS [Rank]
FROM [dbo].[SearchStates](N'__SEARCH_TERM__')
ORDER BY [Id];
GO

