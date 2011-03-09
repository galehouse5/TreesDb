ALTER TABLE [Imports].[Sites] DROP CONSTRAINT [DF_SiteVisits_Created]
GO
ALTER TABLE [Imports].[Subsites] DROP CONSTRAINT [DF_SubsiteVisits_Created]
GO
ALTER TABLE [Imports].[Subsites] DROP CONSTRAINT [DF_SubsiteVisits_MakeOwnershipContactInfoPublic]
GO
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [DF_TreeMeasurements_Created]
GO
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [DF_TreeMeasurements_Type]
GO
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [DF_TreeMeasurements_MakeCoordinatesPublic]
GO
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [DF_TreeMeasurements_HeightMeasurementMethod]
GO
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [DF_Trips_Created]
GO
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [DF_Trips_MakeMeasurerContactInfoPublic]
GO
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [DF_Trips_DefaultHeightMeasurementMethod]
GO
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [DF_Trips_LastSaved]
GO
ALTER TABLE [Imports].[Trunks] DROP CONSTRAINT [DF_TrunkMeasurements_IncludeHeightDistanceAndAngleMeasurements]
GO
ALTER TABLE [Imports].[Trunks] DROP CONSTRAINT [DF_TrunkMeasurements_TrunkComments]
GO
ALTER TABLE [Locations].[States] DROP CONSTRAINT [DF_States_CountryId]
GO
ALTER TABLE [Locations].[States] DROP CONSTRAINT [DF_States_NELatitude]
GO
ALTER TABLE [Locations].[States] DROP CONSTRAINT [DF_States_NELongitude]
GO
ALTER TABLE [Locations].[States] DROP CONSTRAINT [DF_States_SWLatitude]
GO
ALTER TABLE [Locations].[States] DROP CONSTRAINT [DF_States_SWLongitude]
GO
ALTER TABLE [Sites].[Sites] DROP CONSTRAINT [DF_Sites_SubsiteCount]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_Email]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_Firstname]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_Lastname]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_UserRoles]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordHash]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordNumerics]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordUppercase]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordLowercase]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordSpecials]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordLength]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_Created]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_LastActivity]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_LastLogin]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_EmailVerificationToken]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_RecentlyFailedLoginAttempts]
GO
/****** Object:  ForeignKey [FK_Measurers_Trips]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Measurers] DROP CONSTRAINT [FK_Measurers_Trips]
GO
/****** Object:  ForeignKey [FK_SitesVisits_Trips]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Sites] DROP CONSTRAINT [FK_SitesVisits_Trips]
GO
/****** Object:  ForeignKey [FK_SiteVisits_Users]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Sites] DROP CONSTRAINT [FK_SiteVisits_Users]
GO
/****** Object:  ForeignKey [FK_SubsiteVisits_States]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Subsites] DROP CONSTRAINT [FK_SubsiteVisits_States]
GO
/****** Object:  ForeignKey [FK_TreeMeasurements_SubsiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [FK_TreeMeasurements_SubsiteVisits]
GO
/****** Object:  ForeignKey [FK_TreeMeasurements_Users]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [FK_TreeMeasurements_Users]
GO
/****** Object:  ForeignKey [FK_Trips_States]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [FK_Trips_States]
GO
/****** Object:  ForeignKey [FK_Trips_Users]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [FK_Trips_Users]
GO
/****** Object:  ForeignKey [FK_TrunkMeasurements_TreeMeasurements1]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trunks] DROP CONSTRAINT [FK_TrunkMeasurements_TreeMeasurements1]
GO
/****** Object:  ForeignKey [FK_TrunkMeasurements_Users]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trunks] DROP CONSTRAINT [FK_TrunkMeasurements_Users]
GO
/****** Object:  ForeignKey [FK_Photos_Stores]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[Photos] DROP CONSTRAINT [FK_Photos_Stores]
GO
/****** Object:  ForeignKey [FK_References_Measurements]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Measurements]
GO
/****** Object:  ForeignKey [FK_References_Subsites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Subsites]
GO
/****** Object:  ForeignKey [FK_References_Subsites1]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Subsites1]
GO
/****** Object:  ForeignKey [FK_References_SubsiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_SubsiteVisits]
GO
/****** Object:  ForeignKey [FK_References_Trees]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Trees]
GO
/****** Object:  ForeignKey [FK_References_Trees1]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Trees1]
GO
/****** Object:  ForeignKey [FK_SiteVisits_Sites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[SiteVisits] DROP CONSTRAINT [FK_SiteVisits_Sites]
GO
/****** Object:  ForeignKey [FK_SiteVisits_Trips]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[SiteVisits] DROP CONSTRAINT [FK_SiteVisits_Trips]
GO
/****** Object:  ForeignKey [FK_Subsites_Sites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Subsites] DROP CONSTRAINT [FK_Subsites_Sites]
GO
/****** Object:  ForeignKey [FK_Subsites_States]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Subsites] DROP CONSTRAINT [FK_Subsites_States]
GO
/****** Object:  ForeignKey [FK_SubsiteVisits_States]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[SubsiteVisits] DROP CONSTRAINT [FK_SubsiteVisits_States]
GO
/****** Object:  ForeignKey [FK_SubsiteVisits_Subsites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[SubsiteVisits] DROP CONSTRAINT [FK_SubsiteVisits_Subsites]
GO
/****** Object:  ForeignKey [FK_SubsiteVisits_Trips]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[SubsiteVisits] DROP CONSTRAINT [FK_SubsiteVisits_Trips]
GO
/****** Object:  ForeignKey [FK_Visitors_Sites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Visitors] DROP CONSTRAINT [FK_Visitors_Sites]
GO
/****** Object:  ForeignKey [FK_Visitors_SiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Visitors] DROP CONSTRAINT [FK_Visitors_SiteVisits]
GO
/****** Object:  ForeignKey [FK_Visitors_Subsites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Visitors] DROP CONSTRAINT [FK_Visitors_Subsites]
GO
/****** Object:  ForeignKey [FK_Visitors_SubsiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Visitors] DROP CONSTRAINT [FK_Visitors_SubsiteVisits]
GO
/****** Object:  ForeignKey [FK_TreeMeasurements_Trips]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Trees].[Measurements] DROP CONSTRAINT [FK_TreeMeasurements_Trips]
GO
/****** Object:  ForeignKey [FK_Measurers_Measurements]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Trees].[Measurers] DROP CONSTRAINT [FK_Measurers_Measurements]
GO
/****** Object:  ForeignKey [FK_Measurers_Trees]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Trees].[Measurers] DROP CONSTRAINT [FK_Measurers_Trees]
GO
/****** Object:  ForeignKey [FK_Trees_Subsites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Trees].[Trees] DROP CONSTRAINT [FK_Trees_Subsites]
GO
/****** Object:  View [Trees].[MeasuredSpecies]    Script Date: 03/08/2011 21:51:46 ******/
DROP VIEW [Trees].[MeasuredSpecies]
GO
/****** Object:  View [Trees].[MeasuredSpeciesBySite]    Script Date: 03/08/2011 21:51:46 ******/
DROP VIEW [Trees].[MeasuredSpeciesBySite]
GO
/****** Object:  View [Trees].[MeasuredSpeciesByState]    Script Date: 03/08/2011 21:51:46 ******/
DROP VIEW [Trees].[MeasuredSpeciesByState]
GO
/****** Object:  View [Trees].[MeasuredSpeciesBySubsite]    Script Date: 03/08/2011 21:51:46 ******/
DROP VIEW [Trees].[MeasuredSpeciesBySubsite]
GO
/****** Object:  Table [Photos].[References]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Photos].[References]
GO
/****** Object:  Table [Imports].[Trunks]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Imports].[Trunks]
GO
/****** Object:  Table [Trees].[Measurers]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Trees].[Measurers]
GO
/****** Object:  Table [Sites].[Visitors]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Sites].[Visitors]
GO
/****** Object:  Table [Imports].[Sites]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Imports].[Sites]
GO
/****** Object:  Table [Sites].[SubsiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Sites].[SubsiteVisits]
GO
/****** Object:  Table [Imports].[Trees]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Imports].[Trees]
GO
/****** Object:  Table [Trees].[Trees]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Trees].[Trees]
GO
/****** Object:  Table [Trees].[Measurements]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Trees].[Measurements]
GO
/****** Object:  Table [Imports].[Measurers]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Imports].[Measurers]
GO
/****** Object:  Table [Sites].[SiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Sites].[SiteVisits]
GO
/****** Object:  Table [Imports].[Subsites]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Imports].[Subsites]
GO
/****** Object:  Table [Sites].[Subsites]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Sites].[Subsites]
GO
/****** Object:  Table [Imports].[Trips]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Imports].[Trips]
GO
/****** Object:  Table [Photos].[Photos]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Photos].[Photos]
GO
/****** Object:  Table [Users].[Users]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Users].[Users]
GO
/****** Object:  UserDefinedFunction [Helpers].[ToTitleCase]    Script Date: 03/08/2011 21:51:45 ******/
DROP FUNCTION [Helpers].[ToTitleCase]
GO
/****** Object:  Table [Sites].[Sites]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Sites].[Sites]
GO
/****** Object:  Table [Locations].[States]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Locations].[States]
GO
/****** Object:  Table [Photos].[Stores]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Photos].[Stores]
GO
/****** Object:  Table [Locations].[Countries]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Locations].[Countries]
GO
/****** Object:  UserDefinedFunction [Helpers].[DistanceEuclidean]    Script Date: 03/08/2011 21:51:45 ******/
DROP FUNCTION [Helpers].[DistanceEuclidean]
GO
/****** Object:  View [ValueObjects].[DistanceFormats]    Script Date: 03/08/2011 21:51:46 ******/
DROP VIEW [ValueObjects].[DistanceFormats]
GO
/****** Object:  Table [Trees].[KnownSpecies]    Script Date: 03/08/2011 21:51:43 ******/
DROP TABLE [Trees].[KnownSpecies]
GO
/****** Object:  UserDefinedFunction [Helpers].[Max]    Script Date: 03/08/2011 21:51:45 ******/
DROP FUNCTION [Helpers].[Max]
GO
/****** Object:  Schema [Helpers]    Script Date: 03/08/2011 21:51:41 ******/
DROP SCHEMA [Helpers]
GO
/****** Object:  Schema [Imports]    Script Date: 03/08/2011 21:51:41 ******/
DROP SCHEMA [Imports]
GO
/****** Object:  Schema [Locations]    Script Date: 03/08/2011 21:51:41 ******/
DROP SCHEMA [Locations]
GO
/****** Object:  Schema [Photos]    Script Date: 03/08/2011 21:51:41 ******/
DROP SCHEMA [Photos]
GO
/****** Object:  Schema [Sites]    Script Date: 03/08/2011 21:51:41 ******/
DROP SCHEMA [Sites]
GO
/****** Object:  Schema [Trees]    Script Date: 03/08/2011 21:51:41 ******/
DROP SCHEMA [Trees]
GO
/****** Object:  Schema [Trips]    Script Date: 03/08/2011 21:51:41 ******/
DROP SCHEMA [Trips]
GO
/****** Object:  Schema [Users]    Script Date: 03/08/2011 21:51:41 ******/
DROP SCHEMA [Users]
GO
/****** Object:  Schema [ValueObjects]    Script Date: 03/08/2011 21:51:41 ******/
DROP SCHEMA [ValueObjects]
GO
/****** Object:  Schema [Helpers]    Script Date: 03/08/2011 21:51:41 ******/
CREATE SCHEMA [Helpers] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Imports]    Script Date: 03/08/2011 21:51:41 ******/
CREATE SCHEMA [Imports] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Locations]    Script Date: 03/08/2011 21:51:41 ******/
CREATE SCHEMA [Locations] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Photos]    Script Date: 03/08/2011 21:51:41 ******/
CREATE SCHEMA [Photos] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Sites]    Script Date: 03/08/2011 21:51:41 ******/
CREATE SCHEMA [Sites] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Trees]    Script Date: 03/08/2011 21:51:41 ******/
CREATE SCHEMA [Trees] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Trips]    Script Date: 03/08/2011 21:51:41 ******/
CREATE SCHEMA [Trips] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Users]    Script Date: 03/08/2011 21:51:41 ******/
CREATE SCHEMA [Users] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [ValueObjects]    Script Date: 03/08/2011 21:51:41 ******/
CREATE SCHEMA [ValueObjects] AUTHORIZATION [dbo]
GO
/****** Object:  UserDefinedFunction [Helpers].[Max]    Script Date: 03/08/2011 21:51:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [Helpers].[Max]
(
	-- Add the parameters for the function here
	@f1 float,
	@f2 float
)
RETURNS float
AS
BEGIN
	-- Return the result of the function
	RETURN 0.5 * ((@f1 + @f2) + ABS(@f1 - @f2))

END
GO
/****** Object:  Table [Trees].[KnownSpecies]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trees].[KnownSpecies](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[AcceptedSymbol] [varchar](10) NOT NULL,
	[ScientificName] [varchar](100) NOT NULL,
	[CommonName] [varchar](50) NOT NULL,
 CONSTRAINT [PK_KnownTrees_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO
SET IDENTITY_INSERT [Trees].[KnownSpecies] ON
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1, N'ABAL3', N'Abies alba', N'Silver Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (2, N'ABAM', N'Abies amabilis', N'Pacific Silver Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (3, N'ABBA', N'Abies balsamea', N'Balsam Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (4, N'ABBAB', N'Abies balsamea var. balsamea', N'Balsam Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (5, N'ABBR', N'Abies bracteata', N'Bristlecone Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (6, N'ABCO', N'Abies concolor', N'White Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (7, N'ABCOC', N'Abies concolor var. concolor', N'White Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (8, N'ABCOL', N'Abies concolor var. lowiana', N'White Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (9, N'ABFR', N'Abies fraseri', N'Fraser Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (10, N'ABGR', N'Abies grandis', N'Grand Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (11, N'ABHO', N'Abies homolepis', N'Nikko Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (12, N'ABLA', N'Abies lasiocarpa', N'Subalpine Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (13, N'ABLAA', N'Abies lasiocarpa var. arizonica', N'Corkbark Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (14, N'ABLAL', N'Abies lasiocarpa var. lasiocarpa', N'Subalpine Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (15, N'ABMA', N'Abies magnifica', N'California Red Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (16, N'ABPR', N'Abies procera', N'Noble Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (17, N'ABSH', N'Abies ×shastensis', N'Shasta Red Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (18, N'ACAU', N'Acacia auriculiformis', N'Earleaf Acacia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (19, N'ACBA', N'Acacia baileyana', N'Cootamundra Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (20, N'ACBA3', N'Acer barbatum', N'Southern Sugar Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (21, N'ACBE', N'Acacia berlandieri', N'Guajillo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (22, N'ACCA5', N'Acer campestre', N'Hedge Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (23, N'ACCH', N'Acacia choriophylla', N'Cinnecord')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (24, N'ACCI', N'Acer circinatum', N'Vine Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (25, N'ACCO2', N'Acacia constricta', N'Whitethorn Acacia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (26, N'ACCO5', N'Acacia cornigera', N'Bullhorn Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (27, N'ACCOC', N'Acacia constricta var. constricta', N'Whitethorn Acacia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (28, N'ACCOP9', N'Acacia constricta var. paucispina', N'Whitethorn Acacia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (29, N'ACDE', N'Acacia decurrens', N'Green Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (30, N'ACDE3', N'Acacia dealbata', N'Silver Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (31, N'ACEL', N'Acacia elata', N'Cedar Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (32, N'ACFA', N'Acacia farnesiana', N'Sweet Acacia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (33, N'ACFR', N'Acer ×freemanii', N'Freeman Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (34, N'ACGI', N'Acer ginnala', N'Amur Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (35, N'ACGL', N'Acer glabrum', N'Rocky Mountain Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (36, N'ACGLD3', N'Acer glabrum var. diffusum', N'Rocky Mountain Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (37, N'ACGLD4', N'Acer glabrum var. douglasii', N'Douglas Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (38, N'ACGLG', N'Acer glabrum var. greenei', N'Greene''s Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (39, N'ACGLG2', N'Acer glabrum var. glabrum', N'Rocky Mountain Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (40, N'ACGLN2', N'Acer glabrum var. neomexicanum', N'New Mexico Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (41, N'ACGLT2', N'Acer glabrum var. torreyi', N'Torrey Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (42, N'ACGR', N'Acacia greggii', N'Catclaw Acacia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (43, N'ACGR3', N'Acer grandidentatum', N'Bigtooth Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (44, N'ACGRG', N'Acer grandidentatum var. grandidentatum', N'Bigtooth Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (45, N'ACGRG3', N'Acacia greggii var. greggii', N'Catclaw Acacia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (46, N'ACGRS', N'Acer grandidentatum var. sinuosum', N'Canyon Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (47, N'ACGRW', N'Acacia greggii var. wrightii', N'Catclaw Acacia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (48, N'ACJA2', N'Acer japonicum', N'Amur Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (49, N'ACLE', N'Acer leucoderme', N'Chalk Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (50, N'ACLO', N'Acacia longifolia', N'Sydney Golden Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (51, N'ACMA', N'Acacia macracantha', N'Porknut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (52, N'ACMA3', N'Acer macrophyllum', N'Bigleaf Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (53, N'ACME', N'Acacia melanoxylon', N'Blackwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (54, N'ACME80', N'Acacia mearnsii', N'Black Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (55, N'ACMI', N'Acacia millefolia', N'Milfoil Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (56, N'ACNE2', N'Acer negundo', N'Boxelder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (57, N'ACNEA', N'Acer negundo var. arizonicum', N'Arizona Boxelder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (58, N'ACNEC2', N'Acer negundo var. californicum', N'California Boxelder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (59, N'ACNEI2', N'Acer negundo var. interius', N'Boxelder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (60, N'ACNEN', N'Acer negundo var. negundo', N'Boxelder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (61, N'ACNET', N'Acer negundo var. texanum', N'Boxelder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (62, N'ACNEV', N'Acer negundo var. violaceum', N'Boxelder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (63, N'ACNI5', N'Acer nigrum', N'Black Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (64, N'ACPA2', N'Acer palmatum', N'Japanese Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (65, N'ACPE', N'Acer pensylvanicum', N'Striped Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (66, N'ACPI', N'Acacia pinetorum', N'Pineland Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (67, N'ACPL', N'Acer platanoides', N'Norway Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (68, N'ACPO2', N'Acacia podalyriifolia', N'Pearl Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (69, N'ACPS', N'Acer pseudoplatanus', N'Sycamore Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (70, N'ACPY3', N'Acacia pycnantha', N'Golden Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (71, N'ACRE2', N'Acacia retinodes', N'Water Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (72, N'ACRI', N'Acacia rigidula', N'Blackbrush Acacia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (73, N'ACRO', N'Acacia roemeriana', N'Roundflower Catclaw')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (74, N'ACRU', N'Acer rubrum', N'Red Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (75, N'ACRUD', N'Acer rubrum var. drummondii', N'Drummond''s Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (76, N'ACRUR', N'Acer rubrum var. rubrum', N'Red Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (77, N'ACRUT', N'Acer rubrum var. trilobum', N'Red Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (78, N'ACSA', N'Acacia saligna', N'Orange Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (79, N'ACSA2', N'Acer saccharinum', N'Silver Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (80, N'ACSA3', N'Acer saccharum', N'Sugar Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (81, N'ACSAS', N'Acer saccharum var. saccharum', N'Sugar Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (82, N'ACSAS2', N'Acer saccharum var. schneckii', N'Sugar Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (83, N'ACSP2', N'Acer spicatum', N'Mountain Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (84, N'ACSP4', N'Acacia sphaerocephala', N'Bee Wattle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (85, N'ACTA80', N'Acer tataricum', N'Tatarian Maple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (86, N'ACTO', N'Acacia tortuosa', N'Poponax')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (87, N'ACTO5', N'Acrocomia totai', N'Grugru Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (88, N'ACVE2', N'Acacia verticillata', N'Prickly Moses')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (89, N'ACWR4', N'Acoelorrhaphe wrightii', N'Everglades Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (90, N'ADPA', N'Adenanthera pavonina', N'Red Beadtree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (91, N'ADSP', N'Adenostoma sparsifolium', N'Redshank')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (92, N'AECA', N'Aesculus californica', N'California Buckeye')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (93, N'AECA2', N'Aesculus ×carnea', N'Red Horse-Chestnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (94, N'AEFL', N'Aesculus flava', N'Yellow Buckeye')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (95, N'AEGL', N'Aesculus glabra', N'Ohio Buckeye')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (96, N'AEGLA', N'Aesculus glabra var. arguta', N'Ohio Buckeye')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (97, N'AEGLG', N'Aesculus glabra var. glabra', N'Ohio Buckeye')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (98, N'AEHI', N'Aesculus hippocastanum', N'Horse Chestnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (99, N'AEPA', N'Aesculus pavia', N'Red Buckeye')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (100, N'AEPA2', N'Aesculus parviflora', N'Bottlebrush Buckeye')
GO
print 'Processed 100 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (101, N'AEPAF', N'Aesculus pavia var. flavescens', N'Red Buckeye')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (102, N'AEPAP', N'Aesculus pavia var. pavia', N'Red Buckeye')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (103, N'AESY', N'Aesculus sylvatica', N'Painted Buckeye')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (104, N'AIAL', N'Ailanthus altissima', N'Tree Of Heaven')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (105, N'ALAM3', N'Alvaradoa amorphoides', N'Mexican Alvaradoa')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (106, N'ALAMP2', N'Alvaradoa amorphoides ssp. psilophyllis', N'Mexican Alvaradoa')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (107, N'ALCO13', N'Alnus cordata', N'Italian Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (108, N'ALGL2', N'Alnus glutinosa', N'European Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (109, N'ALIN2', N'Alnus incana', N'Gray Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (110, N'ALINR', N'Alnus incana ssp. rugosa', N'Speckled Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (111, N'ALINT', N'Alnus incana ssp. tenuifolia', N'Thinleaf Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (112, N'ALJU', N'Albizia julibrissin', N'Silktree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (113, N'ALLE', N'Albizia lebbeck', N'Woman''s Tongue')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (114, N'ALLE2', N'Albizia lebbekoides', N'Indian Albizia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (115, N'ALMA16', N'Alstonia macrophylla', N'Deviltree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (116, N'ALMA7', N'Alnus maritima', N'Seaside Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (117, N'ALMO2', N'Aleurites moluccana', N'Indian Walnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (118, N'ALOB2', N'Alnus oblongifolia', N'Arizona Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (119, N'ALPR', N'Albizia procera', N'Tall Albizia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (120, N'ALRH2', N'Alnus rhombifolia', N'White Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (121, N'ALRU2', N'Alnus rubra', N'Red Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (122, N'ALSE2', N'Alnus serrulata', N'Hazel Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (123, N'ALVI5', N'Alnus viridis', N'Green Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (124, N'ALVIC', N'Alnus viridis ssp. crispa', N'Mountain Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (125, N'ALVIF', N'Alnus viridis ssp. fruticosa', N'Siberian Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (126, N'ALVIS', N'Alnus viridis ssp. sinuata', N'Sitka Alder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (127, N'AMAL2', N'Amelanchier alnifolia', N'Saskatoon Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (128, N'AMALA', N'Amelanchier alnifolia var. alnifolia', N'Saskatoon Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (129, N'AMALC', N'Amelanchier alnifolia var. cusickii', N'Cusick''s Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (130, N'AMALH', N'Amelanchier alnifolia var. humptulipensis', N'Saskatoon Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (131, N'AMALS', N'Amelanchier alnifolia var. semiintegrifolia', N'Saskatoon Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (132, N'AMAR3', N'Amelanchier arborea', N'Common Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (133, N'AMARA3', N'Amelanchier arborea var. alabamensis', N'Alabama Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (134, N'AMARA4', N'Amelanchier arborea var. arborea', N'Common Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (135, N'AMARA5', N'Amelanchier arborea var. austromontana', N'Downy Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (136, N'AMBA', N'Amelanchier bartramiana', N'Oblongfruit Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (137, N'AMBA2', N'Amyris balsamifera', N'Balsam Torchwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (138, N'AMCA4', N'Amelanchier canadensis', N'Canadian Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (139, N'AMEL', N'Amyris elemifera', N'Sea Torchwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (140, N'AMIN2', N'Amelanchier interior', N'Pacific Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (141, N'AMJA', N'×Amelasorbus jackii', N'Jack''s Amelasorbus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (142, N'AMLA', N'Amelanchier laevis', N'Allegheny Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (143, N'AMLA4', N'Amphitecna latifolia', N'Black Calabash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (144, N'AMPA2', N'Amelanchier pallida', N'Pale Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (145, N'AMSA', N'Amelanchier sanguinea', N'Roundleaf Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (146, N'AMSAG', N'Amelanchier sanguinea var. gaspensis', N'Gaspé Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (147, N'AMSAS', N'Amelanchier sanguinea var. sanguinea', N'Roundleaf Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (148, N'AMUT', N'Amelanchier utahensis', N'Utah Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (149, N'AMUTC2', N'Amelanchier utahensis var. covillei', N'Coville''s Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (150, N'AMUTU', N'Amelanchier utahensis var. utahensis', N'Utah Serviceberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (151, N'ANGL4', N'Annona glabra', N'Pond Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (152, N'ANIN', N'Andira inermis', N'Cabbagebark Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (153, N'ANMO', N'Annona montana', N'Mountain Soursop')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (154, N'ANSQ', N'Annona squamosa', N'Sugar Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (155, N'ARAR2', N'Arbutus arizonica', N'Arizona Madrone')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (156, N'ARCH12', N'Aralia chinensis', N'Chinese Angelica Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (157, N'ARCH17', N'Aristotelia chilensis', N'Maquei')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (158, N'ARCO3', N'Arctostaphylos columbiana', N'Hairy Manzanita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (159, N'AREL4', N'Ardisia elliptica', N'Shoebutton')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (160, N'AREL8', N'Aralia elata', N'Japanese Angelica Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (161, N'ARES', N'Ardisia escallonoides', N'Island Marlberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (162, N'ARGL4', N'Arctostaphylos glauca', N'Bigberry Manzanita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (163, N'ARME', N'Arbutus menziesii', N'Pacific Madrone')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (164, N'ARNO6', N'Arctostaphylos nortensis', N'Del Norte Manzanita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (165, N'ARPR', N'Arctostaphylos pringlei', N'Pringle Manzanita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (166, N'ARPRD2', N'Arctostaphylos pringlei ssp. drupacea', N'Pinkbracted Manzanita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (167, N'ARPRP', N'Arctostaphylos pringlei ssp. pringlei', N'Pringle Manzanita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (168, N'ARSP2', N'Aralia spinosa', N'Devil''s Walkingstick')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (169, N'ARTR2', N'Artemisia tridentata', N'Big Sagebrush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (170, N'ARTRS2', N'Artemisia tridentata ssp. spiciformis', N'Big Sagebrush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (171, N'ARTRT', N'Artemisia tridentata ssp. tridentata', N'Basin Big Sagebrush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (172, N'ARTRV', N'Artemisia tridentata ssp. vaseyana', N'Mountain Big Sagebrush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (173, N'ARTRW8', N'Artemisia tridentata ssp. wyomingensis', N'Wyoming Big Sagebrush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (174, N'ARTRX', N'Artemisia tridentata ssp. xericensis', N'Big Sagebrush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (175, N'ARVI4', N'Arctostaphylos viscida', N'Sticky Whiteleaf Manzanita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (176, N'ARVIM', N'Arctostaphylos viscida ssp. mariposa', N'Mariposa Manzanita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (177, N'ARVIP2', N'Arctostaphylos viscida ssp. pulchella', N'Sticky Whiteleaf Manzanita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (178, N'ARVIV', N'Arctostaphylos viscida ssp. viscida', N'Sticky Whiteleaf Manzanita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (179, N'ARXA80', N'Arbutus xalapensis', N'Texas Madrone')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (180, N'ASOB6', N'Asimina obovata', N'Bigflower Pawpaw')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (181, N'ASPA18', N'Asimina parviflora', N'Smallflower Pawpaw')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (182, N'ASTR', N'Asimina triloba', N'Pawpaw')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (183, N'AVGE', N'Avicennia germinans', N'Black Mangrove')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (184, N'AVMA3', N'Avicennia marina', N'Gray Mangrove')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (185, N'AVMAR', N'Avicennia marina var. resinifera', N'Gray Mangrove')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (186, N'BAHA', N'Baccharis halimifolia', N'Eastern Baccharis')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (187, N'BALU', N'Bauhinia lunarioides', N'Texasplume')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (188, N'BAMO2', N'Bauhinia monandra', N'Napoleon''s Plume')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (189, N'BAPU', N'Bauhinia purpurea', N'Butterfly Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (190, N'BAVA', N'Bauhinia variegata', N'Mountain Ebony')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (191, N'BAVU2', N'Bambusa vulgaris', N'Common Bamboo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (192, N'BEAL2', N'Betula alleghaniensis', N'Yellow Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (193, N'BEALA', N'Betula alleghaniensis var. alleghaniensis', N'Yellow Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (194, N'BEALM', N'Betula alleghaniensis var. macrolepis', N'Yellow Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (195, N'BEBO', N'Betula borealis', N'Northern Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (196, N'BECA4', N'Betula ×caerulea', N'Blue Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (197, N'BECAC', N'Betula ×caerulea var. caerulea', N'Blue Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (198, N'BECAG', N'Betula ×caerulea var. grandis', N'Big Blue Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (199, N'BELE', N'Betula lenta', N'Sweet Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (200, N'BENE4', N'Betula neoalaskana', N'Resin Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (201, N'BENE5', N'Betula ×neoborealis', N'Northern Birch')
GO
print 'Processed 200 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (202, N'BENI', N'Betula nigra', N'River Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (203, N'BEOC2', N'Betula occidentalis', N'Water Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (204, N'BEPA', N'Betula papyrifera', N'Paper Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (205, N'BEPAC2', N'Betula papyrifera var. cordifolia', N'Mountain Paper Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (206, N'BEPAK', N'Betula papyrifera var. kenaica', N'Kenai Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (207, N'BEPAP', N'Betula papyrifera var. papyrifera', N'Paper Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (208, N'BEPE3', N'Betula pendula', N'European White Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (209, N'BEPL2', N'Betula platyphylla', N'Asian White Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (210, N'BEPLP', N'Betula platyphylla var. platyphylla', N'Asian White Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (211, N'BEPO', N'Betula populifolia', N'Gray Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (212, N'BEPU5', N'Betula pubescens', N'Downy Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (213, N'BEPUP5', N'Betula pubescens ssp. pubescens', N'Downy Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (214, N'BERA', N'Betula ×raymundii', N'Raymund''s Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (215, N'BESZ', N'Betula szechuanica', N'Szechuan White Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (216, N'BEUB', N'Betula uber', N'Virginia Roundleaf Birch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (217, N'BIJA', N'Bischofia javanica', N'Javanese Bishopwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (218, N'BIOR', N'Bixa orellana', N'Lipsticktree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (219, N'BOCA4', N'Bourreria cassinifolia', N'Smooth Strongbark')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (220, N'BODA', N'Bontia daphnoides', N'White Alling')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (221, N'BORA2', N'Bourreria radula', N'Rough Strongbark')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (222, N'BOSU2', N'Bourreria succulenta', N'Bodywood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (223, N'BRAL3', N'Brosimum alicastrum', N'Breadnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (224, N'BRBR6', N'Brasiliopuntia brasiliensis', N'Brazilian Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (225, N'BRPA4', N'Broussonetia papyrifera', N'Paper Mulberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (226, N'BRPO6', N'Brachychiton populneum', N'Whiteflower Kurrajong')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (227, N'BRSU3', N'Brugmansia suaveolens', N'Angel''s-Tears')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (228, N'BUAL', N'Buddleja alternifolia', N'Fountain Butterflybush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (229, N'BUBU', N'Bucida buceras', N'Gregorywood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (230, N'BUCA15', N'Butia capitata', N'South American Jelly Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (231, N'BUFA', N'Bursera fagaroides', N'Fragrant Bursera')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (232, N'BUFAE', N'Bursera fagaroides var. elongata', N'Fragrant Bursera')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (233, N'BUMI', N'Bursera microphylla', N'Elephant Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (234, N'BUMO', N'Bucida molinetii', N'Spiny Bucida')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (235, N'BUSA', N'Buddleja saligna', N'Squarestem Butterflybush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (236, N'BUSE2', N'Buxus sempervirens', N'Common Box')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (237, N'BUSI', N'Bursera simaruba', N'Gumbo Limbo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (238, N'BYLU', N'Byrsonima lucida', N'Long Key Locustberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (239, N'CAAF2', N'Cassia afrofistula', N'Kenyan Shower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (240, N'CAAL27', N'Carya alba', N'Mockernut Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (241, N'CAAN22', N'Calophyllum antillanum', N'Antilles Calophyllum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (242, N'CAAQ2', N'Carya aquatica', N'Water Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (243, N'CAAR18', N'Caragana arborescens', N'Siberian Peashrub')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (244, N'CABE8', N'Carpinus betulus', N'European Hornbeam')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (245, N'CABI8', N'Catalpa bignonioides', N'Southern Catalpa')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (246, N'CACA18', N'Carpinus caroliniana', N'American Hornbeam')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (247, N'CACA38', N'Carya carolinae-septentrionalis', N'Southern Shagbark Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (248, N'CACAC2', N'Carpinus caroliniana ssp. caroliniana', N'American Hornbeam')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (249, N'CACAV', N'Carpinus caroliniana ssp. virginiana', N'American Hornbeam')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (250, N'CACI15', N'Callistemon citrinus', N'Crimson Bottlebrush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (251, N'CACL3', N'Casasia clusiifolia', N'Sevenyear Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (252, N'CACO15', N'Carya cordiformis', N'Bitternut Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (253, N'CACO2', N'Callitris columellaris', N'White Cypress-Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (254, N'CACR27', N'Castanea crenata', N'Japanese Chestnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (255, N'CACU8', N'Casuarina cunninghamiana', N'River Sheoak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (256, N'CACY', N'Capparis cynophallophora', N'Jamaican Caper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (257, N'CADE12', N'Castanea dentata', N'American Chestnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (258, N'CADE27', N'Calocedrus decurrens', N'Incense Cedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (259, N'CAEM4', N'Castela emoryi', N'Crucifixion Thorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (260, N'CAEQ', N'Casuarina equisetifolia', N'Beach Sheoak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (261, N'CAER3', N'Castela erecta', N'Goatbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (262, N'CAERT', N'Castela erecta ssp. texana', N'Texan Goatbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (263, N'CAFI3', N'Cassia fistula', N'Golden Shower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (264, N'CAFL2', N'Capparis flexuosa', N'Falseteeth')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (265, N'CAFL6', N'Carya floridana', N'Scrub Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (266, N'CAGI', N'Caesalpinia gilliesii', N'Bird-Of-Paradise Shrub')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (267, N'CAGI10', N'Carnegiea gigantea', N'Saguaro')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (268, N'CAGL11', N'Casuarina glauca', N'Gray Sheoak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (269, N'CAGL8', N'Carya glabra', N'Pignut Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (270, N'CAGR11', N'Cassia grandis', N'Pink Shower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (271, N'CAHA10', N'Calliandra haematomma', N'Red Powderpuff')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (272, N'CAHO3', N'Canotia holacantha', N'Crucifixion Thorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (273, N'CAIL2', N'Carya illinoinensis', N'Pecan')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (274, N'CAJA3', N'Cassia javanica', N'Apple Blossom')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (275, N'CAJA9', N'Camellia japonica', N'Camellia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (276, N'CAJAI', N'Cassia javanica var. indochinensis', N'Apple Blossom')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (277, N'CALA21', N'Carya laciniosa', N'Shellbark Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (278, N'CAMA37', N'Carissa macrocarpa', N'Amatungulu')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (279, N'CAMA45', N'Callaeum macropterum', N'Hillyhock')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (280, N'CAME', N'Caesalpinia mexicana', N'Mexican Holdback')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (281, N'CAMI36', N'Caryota mitis', N'Burmese Fishtail Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (282, N'CAMO83', N'Castanea mollissima', N'Chinese Chestnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (283, N'CAMY', N'Carya myristiciformis', N'Nutmeg Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (284, N'CANI17', N'Casearia nitida', N'Smooth Honeytree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (285, N'CAOV2', N'Carya ovata', N'Shagbark Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (286, N'CAOV3', N'Carya ovalis', N'Red Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (287, N'CAOV5', N'Catalpa ovata', N'Chinese Catalpa')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (288, N'CAPA23', N'Carica papaya', N'Papaya')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (289, N'CAPA24', N'Carya pallida', N'Sand Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (290, N'CAPA8', N'Calyptranthes pallens', N'Pale Lidflower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (291, N'CAPR', N'Calotropis procera', N'Roostertree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (292, N'CAPU13', N'Caesalpinia pulcherrima', N'Pride-Of-Barbados')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (293, N'CAPU9', N'Castanea pumila', N'Chinkapin')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (294, N'CAPUO', N'Castanea pumila var. ozarkensis', N'Ozark Chinkapin')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (295, N'CAPUP3', N'Castanea pumila var. pumila', N'Chinkapin')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (296, N'CASA26', N'Camellia sasanqua', N'Sasanqua Camellia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (297, N'CASA27', N'Castanea sativa', N'European Chestnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (298, N'CASI16', N'Camellia sinensis', N'Tea')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (299, N'CASP11', N'Caesalpinia spinosa', N'Spiny Holdback')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (300, N'CASP8', N'Catalpa speciosa', N'Northern Catalpa')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (301, N'CATE9', N'Carya texana', N'Black Hickory')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (302, N'CAUR3', N'Caryota urens', N'Jaggery Palm')
GO
print 'Processed 300 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (303, N'CAWI', N'Canella winterana', N'Wild Cinnamon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (304, N'CAZU', N'Calyptranthes zuzygium', N'Myrtle Of The River')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (305, N'CEAD2', N'Cecropia adenopus', N'Ambay Pumpwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (306, N'CEAR', N'Ceanothus arboreus', N'Feltleaf Ceanothus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (307, N'CEAU8', N'Celtis australis', N'European Hackberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (308, N'CECA4', N'Cercis canadensis', N'Eastern Redbud')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (309, N'CECAC', N'Cercis canadensis var. canadensis', N'Eastern Redbud')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (310, N'CECAM', N'Cercis canadensis var. mexicana', N'Mexican Redbud')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (311, N'CECAT', N'Cercis canadensis var. texensis', N'Texas Redbud')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (312, N'CEDE2', N'Cedrus deodara', N'Deodar Cedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (313, N'CEDI6', N'Cestrum diurnum', N'Day Jessamine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (314, N'CEEH', N'Celtis ehrenbergiana', N'Spiny Hackberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (315, N'CEIG', N'Celtis iguanaea', N'Iguana Hackberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (316, N'CEIM', N'Ceanothus impressus', N'Santa Barbara Ceanothus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (317, N'CEIMI', N'Ceanothus impressus var. impressus', N'Santa Barbara Ceanothus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (318, N'CEIMN', N'Ceanothus impressus var. nipomensis', N'Santa Barbara Ceanothus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (319, N'CEJA2', N'Cercidiphyllum japonicum', N'Katsura Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (320, N'CELA', N'Celtis laevigata', N'Sugarberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (321, N'CELAB', N'Celtis laevigata var. brevipes', N'Sugarberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (322, N'CELAL', N'Celtis laevigata var. laevigata', N'Sugarberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (323, N'CELAR', N'Celtis laevigata var. reticulata', N'Netleaf Hackberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (324, N'CELAT8', N'Celtis laevigata var. texana', N'Texan Sugarberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (325, N'CELE3', N'Cercocarpus ledifolius', N'Curl-Leaf Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (326, N'CELEI', N'Cercocarpus ledifolius var. intercedens', N'Curl-Leaf Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (327, N'CELEL', N'Cercocarpus ledifolius var. ledifolius', N'Curl-Leaf Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (328, N'CELI', N'Celtis lindheimeri', N'Lindheimer''s Hackberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (329, N'CEMO2', N'Cercocarpus montanus', N'Alderleaf Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (330, N'CEMOA', N'Cercocarpus montanus var. argenteus', N'Silver Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (331, N'CEMOB', N'Cercocarpus montanus var. blancheae', N'Island Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (332, N'CEMOG', N'Cercocarpus montanus var. glaber', N'Birchleaf Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (333, N'CEMOM', N'Cercocarpus montanus var. minutiflorus', N'Smooth Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (334, N'CEMOM2', N'Cercocarpus montanus var. macrourus', N'Klamath Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (335, N'CEMOM4', N'Cercocarpus montanus var. montanus', N'Alderleaf Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (336, N'CEMOP', N'Cercocarpus montanus var. paucidentatus', N'Hairy Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (337, N'CENO', N'Cestrum nocturnum', N'Night Jessamine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (338, N'CEOC', N'Celtis occidentalis', N'Common Hackberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (339, N'CEOC2', N'Cephalanthus occidentalis', N'Common Buttonbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (340, N'CEOR9', N'Cercis orbiculata', N'California Redbud')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (341, N'CEPA9', N'Cestrum parqui', N'Chilean Jessamine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (342, N'CESA3', N'Cephalanthus salicifolius', N'Mexican Buttonbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (343, N'CESI3', N'Ceratonia siliqua', N'St. John''s Bread')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (344, N'CESP', N'Ceanothus spinosus', N'Redheart')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (345, N'CETE', N'Celtis tenuifolia', N'Dwarf Hackberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (346, N'CETH', N'Ceanothus thyrsiflorus', N'Blueblossom')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (347, N'CETR4', N'Cercocarpus traskiae', N'Catalina Island Mountain Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (348, N'CEVE', N'Ceanothus velutinus', N'Snowbrush Ceanothus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (349, N'CEVEH2', N'Ceanothus velutinus var. hookeri', N'Hooker''s Ceanothus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (350, N'CEVEV4', N'Ceanothus velutinus var. velutinus', N'Snowbrush Ceanothus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (351, N'CHAL8', N'Chiococca alba', N'West Indian Milkberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (352, N'CHCH7', N'Chrysolepis chrysophylla', N'Giant Chinquapin')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (353, N'CHCHC4', N'Chrysolepis chrysophylla var. chrysophylla', N'Giant Chinquapin')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (354, N'CHIC', N'Chrysobalanus icaco', N'Coco Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (355, N'CHLA', N'Chamaecyparis lawsoniana', N'Port Orford Cedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (356, N'CHLI2', N'Chilopsis linearis', N'Desert Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (357, N'CHLIA', N'Chilopsis linearis ssp. arcuata', N'Desert Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (358, N'CHLIL2', N'Chilopsis linearis ssp. linearis', N'Desert Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (359, N'CHOL', N'Chrysophyllum oliviforme', N'Satinleaf')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (360, N'CHSE17', N'Chamaedorea seifrizii', N'Seifriz''s Chamaedorea')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (361, N'CHTH2', N'Chamaecyparis thyoides', N'Atlantic White Cedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (362, N'CHVI3', N'Chionanthus virginicus', N'White Fringetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (363, N'CIAU7', N'Citrus ×aurantiifolia', N'Key Lime')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (364, N'CIAU8', N'Citrus ×aurantium', N'Sour Orange')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (365, N'CIBE', N'Citharexylum berlandieri', N'Berlandier''s Fiddlewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (366, N'CICA', N'Cinnamomum camphora', N'Camphortree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (367, N'CILI3', N'Citrus ×limonia', N'Mandarin Lime')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (368, N'CILI5', N'Citrus ×limon', N'Lemon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (369, N'CIME3', N'Citrus medica', N'Citron')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (370, N'CIPA3', N'Citrus ×paradisi', N'Grapefruit')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (371, N'CIRE3', N'Citrus reticulata', N'Tangerine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (372, N'CISI3', N'Citrus ×sinensis', N'Sweet Orange')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (373, N'CISP3', N'Citharexylum spinosum', N'Spiny Fiddlewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (374, N'CLAC3', N'Clethra acuminata', N'Mountain Sweetpepperbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (375, N'CLBU', N'Clerodendrum bungei', N'Rose Glorybower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (376, N'CLCH4', N'Clerodendrum chinense', N'Stickbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (377, N'CLGL2', N'Clerodendrum glabrum', N'Natal Glorybower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (378, N'CLIN', N'Clerodendrum indicum', N'Turk''s Turbin')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (379, N'CLKA2', N'Clerodendrum kaempferi', N'Kaempfer''s Glorybower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (380, N'CLKE', N'Cladrastis kentukea', N'Kentucky Yellowwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (381, N'CLMO2', N'Cliftonia monophylla', N'Buckwheat Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (382, N'CLRO', N'Clusia rosea', N'Scotch Attorney')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (383, N'CLSP7', N'Clerodendrum speciosissimum', N'Javanese Glorybower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (384, N'CLTR', N'Clerodendrum trichotomum', N'Harlequin Glorybower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (385, N'CLTRF', N'Clerodendrum trichotomum var. ferrugineum', N'Ferruginous Clerodendrum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (386, N'COAC', N'Cornus ×acadiensis', N'Acadia Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (387, N'COAL2', N'Cornus alternifolia', N'Alternateleaf Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (388, N'COAR', N'Coccothrinax argentata', N'Florida Silver Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (389, N'COAR3', N'Colubrina arborescens', N'Greenheart')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (390, N'COAR6', N'Colutea arborescens', N'Bladder Senna')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (391, N'COAS3', N'Colubrina asiatica', N'Asian Nakedwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (392, N'COAU12', N'Cordyline australis', N'Cabbage Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (393, N'COAV80', N'Corylus avellana', N'Common Filbert')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (394, N'COBA4', N'Cordia bahamensis', N'Bahama Manjack')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (395, N'COBO2', N'Cordia boissieri', N'Anacahuita')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (396, N'COCI4', N'Corymbia citriodora', N'Lemonscented Gum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (397, N'COCO10', N'Cotinus coggygria', N'European Smoketree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (398, N'COCO6', N'Corylus cornuta', N'Beaked Hazelnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (399, N'COCOC', N'Corylus cornuta var. californica', N'California Hazelnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (400, N'COCOC2', N'Corylus cornuta var. cornuta', N'Beaked Hazelnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (401, N'COCU', N'Colubrina cubensis', N'Cuban Nakedwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (402, N'COCUF', N'Colubrina cubensis var. floridana', N'Cuban Nakedwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (403, N'CODI18', N'Cordia dichotoma', N'Fragrant Manjack')
GO
print 'Processed 400 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (404, N'CODI3', N'Comarostaphylis diversifolia', N'Summer Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (405, N'CODI8', N'Coccoloba diversifolia', N'Tietongue')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (406, N'CODID2', N'Comarostaphylis diversifolia ssp. diversifolia', N'Summer Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (407, N'CODIP', N'Comarostaphylis diversifolia ssp. planifolia', N'Summer Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (408, N'CODR', N'Cornus drummondii', N'Roughleaf Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (409, N'COEL2', N'Colubrina elliptica', N'Soldierwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (410, N'COER2', N'Conocarpus erectus', N'Button Mangrove')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (411, N'COFL2', N'Cornus florida', N'Flowering Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (412, N'COFO', N'Cornus foemina', N'Stiff Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (413, N'COGL', N'Condalia globosa', N'Bitter Snakewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (414, N'COGL3', N'Cornus glabrata', N'Brown Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (415, N'COGLP', N'Condalia globosa var. pubescens', N'Bitter Snakewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (416, N'COGR24', N'Cornutia grandiflora', N'Mexican-Blue')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (417, N'COGR7', N'Colubrina greggii', N'Sierra Nakedwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (418, N'COHE12', N'Corylus heterophylla', N'Siberian Hazelnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (419, N'COHO', N'Condalia hookeri', N'Brazilian Bluewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (420, N'COHOE', N'Condalia hookeri var. edwardsiana', N'Edwards'' Bluewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (421, N'COHOH', N'Condalia hookeri var. hookeri', N'Brazilian Bluewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (422, N'COKO2', N'Cornus kousa', N'Kousa Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (423, N'COLA20', N'Cocculus laurifolius', N'Laurel-Leaf Snailseed')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (424, N'COMA21', N'Cornus mas', N'Cornelian Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (425, N'COMU9', N'Cotoneaster multiflorus', N'Cotoneaster')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (426, N'COMY', N'Cordia myxa', N'Assyrian Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (427, N'CONU', N'Cocos nucifera', N'Coconut Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (428, N'CONU4', N'Cornus nuttallii', N'Pacific Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (429, N'COOB2', N'Cotinus obovatus', N'American Smoketree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (430, N'CORU', N'Cornus rugosa', N'Roundleaf Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (431, N'COSE16', N'Cornus sericea', N'Redosier Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (432, N'COSE2', N'Cordia sebestena', N'Largeleaf Geigertree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (433, N'COSE3', N'Cornus sessilis', N'Blackfruit Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (434, N'COSEO', N'Cornus sericea ssp. occidentalis', N'Western Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (435, N'COSES', N'Cornus sericea ssp. sericea', N'Redosier Dogwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (436, N'COUV', N'Coccoloba uvifera', N'Seagrape')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (437, N'CRAE', N'Crataegus aestivalis', N'May Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (438, N'CRAE2', N'Crataegus aemula', N'Rome Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (439, N'CRAM4', N'Crataegus ambitiosa', N'Grand Rapids Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (440, N'CRAN', N'Crataegus annosa', N'Phoenix City Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (441, N'CRAN10', N'Crataegus anamesa', N'Fort Bend Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (442, N'CRAN6', N'Crataegus ×anomala', N'Arnold Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (443, N'CRAN9', N'Crataegus ancisa', N'Mississippi Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (444, N'CRAP4', N'Crataegus apiomorpha', N'Fort Sheridan Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (445, N'CRAR6', N'Crataegus arborea', N'Montgomery Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (446, N'CRAR7', N'Crataegus arcana', N'Carolina Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (447, N'CRAR8', N'Crataegus arrogans', N'Dixie Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (448, N'CRAT3', N'Crataegus ater', N'Nashville Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (449, N'CRAU2', N'Crataegus austromontana', N'Valley Head Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (450, N'CRBE2', N'Crataegus berberifolia', N'Barberry Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (451, N'CRBE5', N'Crataegus beadlei', N'Beadle''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (452, N'CRBE6', N'Crataegus beata', N'Dunbar''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (453, N'CRBO3', N'Crataegus bona', N'Berks County Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (454, N'CRBR', N'Crataegus brachyacantha', N'Blueberry Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (455, N'CRBR3', N'Crataegus brainerdii', N'Brainerd''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (456, N'CRBR4', N'Crataegus brazoria', N'Brazos Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (457, N'CRCA', N'Crataegus calpodendron', N'Pear Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (458, N'CRCA22', N'Crataegus carrollensis', N'Eureka Springs Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (459, N'CRCA83', N'Crataegus canadensis', N'Canadian Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (460, N'CRCH', N'Crataegus chrysocarpa', N'Fireberry Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (461, N'CRCHC2', N'Crataegus chrysocarpa var. chrysocarpa', N'Red Haw')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (462, N'CRCHP2', N'Crataegus chrysocarpa var. piperi', N'Piper''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (463, N'CRCO13', N'Crataegus contrita', N'Southern Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (464, N'CRCO2', N'Crataegus coccinioides', N'Kansas Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (465, N'CRCO26', N'Crataegus compacta', N'Clustered Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (466, N'CRCO27', N'Crataegus corusca', N'Shiningbranch Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (467, N'CRCO32', N'Crataegus condigna', N'River Junction Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (468, N'CRCO4', N'Crataegus coleae', N'Cole''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (469, N'CRCO7', N'Crataegus compta', N'Adorned Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (470, N'CRCO8', N'Crataegus consanguinea', N'Tallahassee Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (471, N'CRCR2', N'Crataegus crus-galli', N'Cockspur Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (472, N'CRCU', N'Crescentia cujete', N'Common Calabash Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (473, N'CRDA3', N'Crataegus dallasiana', N'Dallas Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (474, N'CRDE3', N'Crataegus desueta', N'New York Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (475, N'CRDI', N'Crataegus dilatata', N'Broadleaf Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (476, N'CRDI10', N'Crataegus dissona', N'Northern Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (477, N'CRDI11', N'Crataegus distincta', N'Distinct Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (478, N'CRDI3', N'Crataegus dispar', N'Aiken Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (479, N'CRDI4', N'Crataegus disperma', N'Spreading Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (480, N'CRDI9', N'Crataegus dispessa', N'Mink Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (481, N'CRDO2', N'Crataegus douglasii', N'Black Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (482, N'CRDO3', N'Crataegus dodgei', N'Dodge''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (483, N'CREN', N'Crataegus engelmannii', N'Engelmann''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (484, N'CRER', N'Crataegus erythropoda', N'Cerro Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (485, N'CRER3', N'Crataegus erythrocarpa', N'Red Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (486, N'CREX2', N'Crataegus exilis', N'Slender Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (487, N'CREX3', N'Crataegus extraria', N'Marietta Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (488, N'CRFL', N'Crataegus flabellata', N'Fanleaf Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (489, N'CRFL2', N'Crataegus flava', N'Yellowleaf Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (490, N'CRFR3', N'Crataegus fragilis', N'Fragile Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (491, N'CRFU2', N'Crataegus fulleriana', N'Fuller''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (492, N'CRFU3', N'Crataegus furtiva', N'Albany Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (493, N'CRGL4', N'Crataegus glareosa', N'Port Huron Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (494, N'CRGR13', N'Crataegus grandis', N'Grand Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (495, N'CRGR2', N'Crataegus greggiana', N'Gregg''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (496, N'CRHA2', N'Crataegus harbisonii', N'Harbison''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (497, N'CRHA4', N'Crataegus harveyana', N'Harvey''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (498, N'CRHE3', N'Crataegus helvina', N'Clarkton Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (499, N'CRHO5', N'Crataegus holmesiana', N'Holmes'' Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (500, N'CRID', N'Crataegus ideae', N'Concord Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (501, N'CRIG2', N'Crataegus ignave', N'Bedford Springs Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (502, N'CRIM6', N'Crataegus impar', N'Redclay Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (503, N'CRIN16', N'Crataegus indicens', N'Mansfield Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (504, N'CRIN17', N'Crataegus insidiosa', N'Ozark Hawthorn')
GO
print 'Processed 500 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (505, N'CRIN18', N'Crataegus integra', N'Lake Ella Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (506, N'CRIN19', N'Crataegus invicta', N'Fulton Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (507, N'CRIN26', N'Crataegus inanis', N'Oldmaid Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (508, N'CRIN3', N'Crataegus intricata', N'Copenhagen Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (509, N'CRIR', N'Crataegus iracunda', N'Stolonbearing Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (510, N'CRIR2', N'Crataegus irrasa', N'Blanchard''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (511, N'CRJA3', N'Cryptomeria japonica', N'Japanese Cedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (512, N'CRJE', N'Crataegus jesupii', N'Jesup''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (513, N'CRJO3', N'Crataegus jonesiae', N'Miss Jones'' Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (514, N'CRKE2', N'Crataegus kelloggii', N'Kellogg''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (515, N'CRKI', N'Crataegus kingstonensis', N'Kingston''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (516, N'CRKN', N'Crataegus knieskerniana', N'Knieskern''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (517, N'CRLA11', N'Crataegus latebrosa', N'Densewoods Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (518, N'CRLA2', N'Crataegus lacrimata', N'Pensacola Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (519, N'CRLA3', N'Crataegus lanuginosa', N'Woolly Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (520, N'CRLA80', N'Crataegus laevigata', N'Smooth Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (521, N'CRLA9', N'Crataegus lanata', N'Hoary Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (522, N'CRLE8', N'Crataegus lemingtonensis', N'Lemington Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (523, N'CRLI12', N'Crataegus limnophila', N'Waterloving Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (524, N'CRLI6', N'Crataegus limata', N'Warm Springs Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (525, N'CRLU', N'Crataegus lucorum', N'Grove Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (526, N'CRLU3', N'Crataegus lumaria', N'Roundleaf Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (527, N'CRMA3', N'Crataegus macrosperma', N'Bigfruit Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (528, N'CRMA4', N'Crataegus margarettiae', N'Margarett''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (529, N'CRMA5', N'Crataegus marshallii', N'Parsley Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (530, N'CRME', N'Crataegus mendosa', N'Albertville Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (531, N'CRME11', N'Crataegus membranacea', N'Tissueleaf Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (532, N'CRME3', N'Crataegus meridionalis', N'Gallion Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (533, N'CRME6', N'Crataegus menandiana', N'Menand''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (534, N'CRMO2', N'Crataegus mollis', N'Downy Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (535, N'CRMO3', N'Crataegus monogyna', N'Oneseed Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (536, N'CRMU11', N'Crataegus multiflora', N'Inkberry Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (537, N'CRNI', N'Crataegus nitida', N'Glossy Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (538, N'CRNI4', N'Crataegus nitidula', N'Ontario Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (539, N'CRNU4', N'Crataegus nuda', N'Nude Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (540, N'CROK2', N'Crataegus okennonii', N'O''Kennon''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (541, N'CROP', N'Crataegus opaca', N'Riverflat Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (542, N'CROP3', N'Crataegus opulens', N'Rochester Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (543, N'CROV2', N'Crataegus ovata', N'Ovateleaf Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (544, N'CRPA3', N'Crataegus panda', N'Florida Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (545, N'CRPE', N'Crataegus pedicellata', N'Scarlet Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (546, N'CRPE13', N'Crataegus pearsonii', N'Pearson''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (547, N'CRPE2', N'Crataegus penita', N'Great Smoky Mountain Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (548, N'CRPE3', N'Crataegus pennsylvanica', N'Pennsylvania Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (549, N'CRPE6', N'Crataegus persimilis', N'Plumleaf Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (550, N'CRPE7', N'Crataegus perjucunda', N'Pearthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (551, N'CRPH', N'Crataegus phaenopyrum', N'Washington Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (552, N'CRPH2', N'Crataegus phippsii', N'Phipps'' Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (553, N'CRPI3', N'Crataegus pinetorum', N'Pineland Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (554, N'CRPO', N'Crataegus poliophylla', N'Elegant Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (555, N'CRPO11', N'Crataegus porrecta', N'Pittsburgh Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (556, N'CRPR', N'Crataegus pringlei', N'Pringle''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (557, N'CRPR2', N'Crataegus pruinosa', N'Waxyfruit Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (558, N'CRPR4', N'Crataegus pratensis', N'Prairie Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (559, N'CRPR5', N'Crataegus prona', N'Illinois Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (560, N'CRPU', N'Crataegus punctata', N'Dotted Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (561, N'CRPU14', N'Crataegus putata', N'Scranton Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (562, N'CRPU9', N'Crataegus pulcherrima', N'Beautiful Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (563, N'CRRA6', N'Crataegus ravida', N'Jeweled Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (564, N'CRRE11', N'Crataegus resima', N'Gulf Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (565, N'CRRE3', N'Crataegus reverchonii', N'Reverchon''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (566, N'CRRH', N'Crossopetalum rhacoma', N'Maidenberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (567, N'CRRH2', N'Crataegus rhodella', N'Franklin''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (568, N'CRRI', N'Crataegus rivularis', N'River Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (569, N'CRRI5', N'Crataegus rigens', N'Gadsden Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (570, N'CRRU5', N'Crataegus rufula', N'Rusty Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (571, N'CRSA2', N'Crataegus saligna', N'Willow Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (572, N'CRSA3', N'Crataegus sargentii', N'Sargent''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (573, N'CRSC4', N'Crataegus schuettei', N'Schuette''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (574, N'CRSC80', N'Crataegus scabrida', N'Rough Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (575, N'CRSH3', N'Crataegus shaferi', N'Shafer''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (576, N'CRSP', N'Crataegus spathulata', N'Littlehip Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (577, N'CRSP5', N'Crataegus spatiosa', N'New London Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (578, N'CRSP6', N'Crataegus spissa', N'Essex Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (579, N'CRST', N'Crataegus stenosepala', N'Duke Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (580, N'CRSU16', N'Crataegus suksdorfii', N'Suksdorf''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (581, N'CRSU2', N'Crataegus submollis', N'Quebec Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (582, N'CRSU3', N'Crataegus suborbiculata', N'Caughuawaga Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (583, N'CRSU5', N'Crataegus succulenta', N'Fleshy Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (584, N'CRSU6', N'Crataegus sutherlandensis', N'Sutherland Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (585, N'CRTA2', N'Crataegus tanuphylla', N'Keystone Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (586, N'CRTE2', N'Crataegus texana', N'Texas Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (587, N'CRTH4', N'Crataegus thermopegaea', N'Graceful Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (588, N'CRTI2', N'Crataegus tinctoria', N'Dyed Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (589, N'CRTR', N'Crataegus tracyi', N'Tracy''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (590, N'CRTR2', N'Crataegus triflora', N'Threeflower Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (591, N'CRTR4', N'Crataegus tristis', N'Minute Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (592, N'CRTU2', N'Crataegus turnerorum', N'Turner''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (593, N'CRUN', N'Crataegus uniflora', N'Dwarf Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (594, N'CRVA', N'Crataegus vailiae', N'Miss Vail''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (595, N'CRVA3', N'Crataegus valida', N'Rockmart Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (596, N'CRVE11', N'Crataegus versuta', N'Johnny Reb Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (597, N'CRVI', N'Crataegus viburnifolia', N'Sawtooth Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (598, N'CRVI2', N'Crataegus viridis', N'Green Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (599, N'CRVID', N'Crataegus viridis var. desertorum', N'Desert Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (600, N'CRVIV2', N'Crataegus viridis var. viridis', N'Green Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (601, N'CRVU', N'Crataegus vulsa', N'Alabama Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (602, N'CRWA', N'Crataegus warneri', N'Warner''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (603, N'CRWI3', N'Crataegus williamsii', N'Williams'' Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (604, N'CRWO', N'Crataegus wootoniana', N'Wooton''s Hawthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (605, N'CRXA', N'Crataegus xanthophylla', N'Buffalo Hawthorn')
GO
print 'Processed 600 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (606, N'CUAB', N'Cupressus abramsiana', N'Santa Cruz Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (607, N'CUAN4', N'Cupaniopsis anacardioides', N'Carrotwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (608, N'CUAR', N'Cupressus arizonica', N'Arizona Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (609, N'CUARA', N'Cupressus arizonica ssp. arizonica', N'Arizona Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (610, N'CUARN2', N'Cupressus arizonica ssp. nevadensis', N'Paiute Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (611, N'CUARS2', N'Cupressus arizonica ssp. stephensonii', N'Cuyamaca Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (612, N'CUBA', N'Cupressus bakeri', N'Modoc Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (613, N'CUFO2', N'Cupressus forbesii', N'Tecate Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (614, N'CUGL', N'Cupania glabra', N'Florida Toadwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (615, N'CUGO', N'Cupressus goveniana', N'Gowen Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (616, N'CUGOG', N'Cupressus goveniana ssp. goveniana', N'Gowen Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (617, N'CUGOP2', N'Cupressus goveniana ssp. pygmaea', N'Pygmy Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (618, N'CULA', N'Cunninghamia lanceolata', N'Chinese Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (619, N'CUMA', N'Cupressus macnabiana', N'Macnab''s Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (620, N'CUMA2', N'Cupressus macrocarpa', N'Monterey Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (621, N'CUNO', N'Cupressus nootkatensis', N'Alaska Cedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (622, N'CUSA3', N'Cupressus sargentii', N'Sargent''s Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (623, N'CUTR2', N'Cudrania tricuspidata', N'Storehousebush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (624, N'CYFU10', N'Cylindropuntia fulgida', N'Jumping Cholla')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (625, N'CYFUF', N'Cylindropuntia fulgida var. fulgida', N'Jumping Cholla')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (626, N'CYFUM', N'Cylindropuntia fulgida var. mamillata', N'Jumping Cholla')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (627, N'CYIM2', N'Cylindropuntia imbricata', N'Tree Cholla')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (628, N'CYIMA', N'Cylindropuntia imbricata var. argentea', N'Tree Cholla')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (629, N'CYIMI', N'Cylindropuntia imbricata var. imbricata', N'Tree Cholla')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (630, N'CYOB2', N'Cydonia oblonga', N'Quince')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (631, N'CYPA6', N'Cyrilla parvifolia', N'Littleleaf Titi')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (632, N'CYRA', N'Cyrilla racemiflora', N'Swamp Titi')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (633, N'CYRE11', N'Cycas revoluta', N'Sago Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (634, N'DAEC', N'Dalbergia ecastaphyllum', N'Coinvine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (635, N'DALA11', N'Daphne laureola', N'Spurgelaurel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (636, N'DASI', N'Dalbergia sissoo', N'Indian Rosewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (637, N'DEHA3', N'Dendromecon harfordii', N'Harford''s Tree Poppy')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (638, N'DERE', N'Delonix regia', N'Royal Poinciana')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (639, N'DERI', N'Dendromecon rigida', N'Tree Poppy')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (640, N'DERIR', N'Dendromecon rigida ssp. rhamnoides', N'Tree Poppy')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (641, N'DERIR2', N'Dendromecon rigida ssp. rigida', N'Tree Poppy')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (642, N'DICI2', N'Dichrostachys cinerea', N'Aroma')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (643, N'DIDI15', N'Diospyros digyna', N'Black Sapote')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (644, N'DIEB2', N'Diospyros ebenum', N'Ebony')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (645, N'DIMA24', N'Diospyros maritima', N'Malaysian Persimmon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (646, N'DITE3', N'Diospyros texana', N'Texas Persimmon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (647, N'DIVI5', N'Diospyros virginiana', N'Common Persimmon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (648, N'DOVI', N'Dodonaea viscosa', N'Florida Hopbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (649, N'DRDI', N'Drypetes diversifolia', N'Milkbark')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (650, N'DRLA3', N'Drypetes lateriflora', N'Guiana Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (651, N'DUER', N'Duranta erecta', N'Golden Dewdrops')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (652, N'DYLU', N'Dypsis lutescens', N'Yellow Butterfly Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (653, N'EBEB', N'Ebenopsis ebano', N'Texas Ebony')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (654, N'EHAN', N'Ehretia anacua', N'Knockaway')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (655, N'ELAN', N'Elaeagnus angustifolia', N'Russian Olive')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (656, N'ELGU', N'Elaeis guineensis', N'African Oil Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (657, N'ELRA2', N'Elliottia racemosa', N'Georgiaplume')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (658, N'ENCO2', N'Enterolobium contortisiliquum', N'Pacara Earpod Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (659, N'ERCR6', N'Erythrina crista-galli', N'Crybabytree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (660, N'ERFL7', N'Erythrina flabelliformis', N'Coralbean')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (661, N'ERFR4', N'Erithalis fruticosa', N'Blacktorch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (662, N'ERHE4', N'Erythrina herbacea', N'Redcardinal')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (663, N'ERJA3', N'Eriobotrya japonica', N'Loquat')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (664, N'ESBE', N'Esenbeckia berlandieri', N'Berlandier''s Jopoy')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (665, N'EUAP', N'Eugenia apiculata', N'Shortleaf Stopper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (666, N'EUAT5', N'Euonymus atropurpureus', N'Burningbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (667, N'EUATA2', N'Euonymus atropurpureus var. atropurpureus', N'Eastern Wahoo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (668, N'EUATC2', N'Euonymus atropurpureus var. cheatumii', N'Eastern Wahoo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (669, N'EUAX', N'Eugenia axillaris', N'White Stopper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (670, N'EUBU5', N'Euonymus bungeanus', N'Winterberry Euonymus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (671, N'EUCA2', N'Eucalyptus camaldulensis', N'River Redgum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (672, N'EUCL', N'Eucalyptus cladocalyx', N'Sugargum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (673, N'EUCO4', N'Eugenia confusa', N'Redberry Stopper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (674, N'EUEU7', N'Euonymus europaeus', N'European Spindletree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (675, N'EUFO3', N'Eugenia foetida', N'Boxleaf Stopper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (676, N'EUGL', N'Eucalyptus globulus', N'Tasmanian Bluegum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (677, N'EUGLG', N'Eucalyptus globulus ssp. globulus', N'Tasmanian Bluegum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (678, N'EUGR12', N'Eucalyptus grandis', N'Grand Eucalyptus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (679, N'EUHA7', N'Euonymus hamiltonianus', N'Hamilton''s Spindletree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (680, N'EUHAM2', N'Euonymus hamiltonianus ssp. maackii', N'Hamilton''s Spindletree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (681, N'EUHAS2', N'Euonymus hamiltonianus ssp. sieboldianus', N'Hamilton''s Spindletree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (682, N'EUJA8', N'Euonymus japonicus', N'Japanese Spindletree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (683, N'EULA8', N'Euphorbia lactea', N'Mottled Spurge')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (684, N'EUOC8', N'Euonymus occidentalis', N'Western Burning Bush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (685, N'EUOCO', N'Euonymus occidentalis var. occidentalis', N'Western Burning Bush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (686, N'EUOCP2', N'Euonymus occidentalis var. parishii', N'Western Burning Bush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (687, N'EUPO', N'Eucalyptus polyanthemos', N'Redbox')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (688, N'EUPU', N'Eucalyptus pulverulenta', N'Silverleaf Mountain Gum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (689, N'EURH', N'Eugenia rhombea', N'Red Stopper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (690, N'EURO2', N'Eucalyptus robusta', N'Swampmahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (691, N'EUSI2', N'Eucalyptus sideroxylon', N'Red Ironbark')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (692, N'EUTE', N'Eucalyptus tereticornis', N'Forest Redgum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (693, N'EUTI', N'Euphorbia tirucalli', N'Indiantree Spurge')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (694, N'EUTO11', N'Eucalyptus torquata', N'Coral Gum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (695, N'EUUN2', N'Eugenia uniflora', N'Surinam Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (696, N'EUVI', N'Eucalyptus viminalis', N'Manna Gum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (697, N'EXCA', N'Exostema caribaeum', N'Caribbean Princewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (698, N'EXPA', N'Exothea paniculata', N'Butterbough')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (699, N'EYOR', N'Eysenhardtia orthocarpa', N'Tahitian Kidneywood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (700, N'EYTE', N'Eysenhardtia texana', N'Texas Kidneywood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (701, N'FAGR', N'Fagus grandifolia', N'American Beech')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (702, N'FASY', N'Fagus sylvatica', N'European Beech')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (703, N'FEWI', N'Ferocactus wislizeni', N'Candy Barrelcactus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (704, N'FIAL4', N'Ficus altissima', N'Council Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (705, N'FIAM', N'Ficus americana', N'Jamaican Cherry Fig')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (706, N'FIAU', N'Ficus aurea', N'Florida Strangler Fig')
GO
print 'Processed 700 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (707, N'FIBE', N'Ficus benjamina', N'Weeping Fig')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (708, N'FIBE2', N'Ficus benghalensis', N'Indian Banyan')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (709, N'FICA', N'Ficus carica', N'Edible Fig')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (710, N'FICI', N'Ficus citrifolia', N'Wild Banyantree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (711, N'FIEL', N'Ficus elastica', N'Indian Rubberplant')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (712, N'FIMI2', N'Ficus microcarpa', N'Chinese Banyan')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (713, N'FIPA2', N'Ficus palmata', N'Punjab Fig')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (714, N'FIRE3', N'Ficus religiosa', N'Peepul Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (715, N'FIRU4', N'Ficus rubiginosa', N'Port Jackson Fig')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (716, N'FISI2', N'Firmiana simplex', N'Chinese Parasoltree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (717, N'FLAC', N'Flueggea acidoton', N'Simpleleaf Bushweed')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (718, N'FLIN', N'Flacourtia indica', N'Governor''s Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (719, N'FOAC', N'Forestiera acuminata', N'Eastern Swampprivet')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (720, N'FOAN', N'Forestiera angustifolia', N'Texas Swampprivet')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (721, N'FOJA', N'Fortunella japonica', N'Round Kumquat')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (722, N'FOSE', N'Forestiera segregata', N'Florida Swampprivet')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (723, N'FOSEP', N'Forestiera segregata var. pinetorum', N'Florida Swampprivet')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (724, N'FOSES', N'Forestiera segregata var. segregata', N'Florida Swampprivet')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (725, N'FOSH', N'Forestiera shrevei', N'Desert Olive')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (726, N'FRAL', N'Franklinia alatamaha', N'Franklin Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (727, N'FRAL4', N'Frangula alnus', N'Glossy Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (728, N'FRAM2', N'Fraxinus americana', N'White Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (729, N'FRAN2', N'Fraxinus anomala', N'Singleleaf Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (730, N'FRANA', N'Fraxinus anomala var. anomala', N'Singleleaf Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (731, N'FRANL', N'Fraxinus anomala var. lowellii', N'Singleleaf Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (732, N'FRBE', N'Fraxinus berlandieriana', N'Mexican Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (733, N'FRBE2', N'Frangula betulifolia', N'Beechleaf Frangula')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (734, N'FRBEB', N'Frangula betulifolia ssp. betulifolia', N'Beechleaf Frangula')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (735, N'FRBEO', N'Frangula betulifolia ssp. obovata', N'Obovate Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (736, N'FRCA12', N'Frangula californica', N'California Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (737, N'FRCA13', N'Frangula caroliniana', N'Carolina Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (738, N'FRCA3', N'Fraxinus caroliniana', N'Carolina Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (739, N'FRCA6', N'Fremontodendron californicum', N'California Flannelbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (740, N'FRCAC5', N'Frangula californica ssp. californica', N'California Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (741, N'FRCAC6', N'Frangula californica ssp. crassifolia', N'California Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (742, N'FRCAC7', N'Frangula californica ssp. cuspidata', N'California Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (743, N'FRCAO4', N'Frangula californica ssp. occidentalis', N'California Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (744, N'FRCAT2', N'Frangula californica ssp. tomentella', N'California Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (745, N'FRCAU', N'Frangula californica ssp. ursina', N'California Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (746, N'FRCU', N'Fraxinus cuspidata', N'Fragrant Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (747, N'FRDI2', N'Fraxinus dipetala', N'California Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (748, N'FREX80', N'Fraxinus excelsior', N'European Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (749, N'FRGO', N'Fraxinus gooddingii', N'Goodding''s Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (750, N'FRGR2', N'Fraxinus greggii', N'Gregg''s Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (751, N'FRLA', N'Fraxinus latifolia', N'Oregon Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (752, N'FRME2', N'Fremontodendron mexicanum', N'Mexican Flannelbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (753, N'FRNI', N'Fraxinus nigra', N'Black Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (754, N'FRPA4', N'Fraxinus papillosa', N'Chihuahuan Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (755, N'FRPE', N'Fraxinus pennsylvanica', N'Green Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (756, N'FRPR', N'Fraxinus profunda', N'Pumpkin Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (757, N'FRPU7', N'Frangula purshiana', N'Cascara Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (758, N'FRQU', N'Fraxinus quadrangulata', N'Blue Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (759, N'FRTE', N'Fraxinus texensis', N'Texas Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (760, N'FRUH', N'Fraxinus uhdei', N'Shamel Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (761, N'FRVE2', N'Fraxinus velutina', N'Velvet Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (762, N'FUBO', N'Fuchsia boliviana', N'Bolivian Fuchsia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (763, N'FUPA2', N'Fuchsia paniculata', N'Shrubby Fuchsia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (764, N'FUSE', N'Furcraea selloa', N'Wild Sisal')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (765, N'GACO9', N'Garrya congdonii', N'Chaparral Silktassel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (766, N'GAEL', N'Garrya elliptica', N'Wavyleaf Silktassel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (767, N'GAFL2', N'Garrya flavescens', N'Ashy Silktassel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (768, N'GAFR', N'Garrya fremontii', N'Bearbrush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (769, N'GAOV', N'Garrya ovata', N'Eggleaf Silktassel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (770, N'GAOVG', N'Garrya ovata ssp. goldmanii', N'Goldman''s Silktassel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (771, N'GAOVL', N'Garrya ovata ssp. lindheimeri', N'Lindheimer''s Silktassel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (772, N'GAVE2', N'Garrya veatchii', N'Canyon Silktassel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (773, N'GAWR3', N'Garrya wrightii', N'Wright''s Silktassel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (774, N'GECA16', N'Genista canariensis', N'Canary Broom')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (775, N'GIBI2', N'Ginkgo biloba', N'Maidenhair Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (776, N'GLAQ', N'Gleditsia aquatica', N'Water Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (777, N'GLPA4', N'Glycosmis parviflora', N'Flower Axistree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (778, N'GLSE2', N'Gliricidia sepium', N'Quickstick')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (779, N'GLTR', N'Gleditsia triacanthos', N'Honeylocust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (780, N'GOHI', N'Gossypium hirsutum', N'Upland Cotton')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (781, N'GOHIH2', N'Gossypium hirsutum var. hirsutum', N'Upland Cotton')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (782, N'GOLA', N'Gordonia lasianthus', N'Loblolly Bay')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (783, N'GOTH', N'Gossypium thurberi', N'Thurber''s Cotton')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (784, N'GRRO', N'Grevillea robusta', N'Silkoak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (785, N'GUAN', N'Guaiacum angustifolium', N'Texas Lignum-Vitae')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (786, N'GUDI', N'Guapira discolor', N'Beeftree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (787, N'GUEL', N'Guettarda elliptica', N'Hammock Velvetseed')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (788, N'GUGL2', N'Guapira globosa', N'Roundleaf Blolly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (789, N'GUOB', N'Guapira obtusata', N'Corcho Prieto')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (790, N'GUOF', N'Guaiacum officinale', N'Lignum-Vitae')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (791, N'GUSA', N'Guaiacum sanctum', N'Holywood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (792, N'GUSC', N'Guettarda scabra', N'Wild Guave')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (793, N'GYDI', N'Gymnocladus dioicus', N'Kentucky Coffeetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (794, N'GYLA', N'Gyminda latifolia', N'West Indian False Box')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (795, N'GYLU', N'Gymnanthes lucida', N'Oysterwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (796, N'HAAR4', N'Harpullia arborea', N'Tulip-Wood Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (797, N'HACA3', N'Halesia carolina', N'Carolina Silverbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (798, N'HADI3', N'Halesia diptera', N'Two-Wing Silverbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (799, N'HAPA10', N'Havardia pallens', N'Haujillo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (800, N'HAPA3', N'Hamelia patens', N'Scarletbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (801, N'HATE3', N'Halesia tetraptera', N'Mountain Silverbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (802, N'HATEM', N'Halesia tetraptera var. monticola', N'Mountain Silverbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (803, N'HATET', N'Halesia tetraptera var. tetraptera', N'Mountain Silverbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (804, N'HAVE2', N'Hamamelis vernalis', N'Ozark Witchhazel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (805, N'HAVI4', N'Hamamelis virginiana', N'American Witchhazel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (806, N'HEAR5', N'Heteromeles arbutifolia', N'Toyon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (807, N'HEARA2', N'Heteromeles arbutifolia var. arbutifolia', N'Toyon')
GO
print 'Processed 800 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (808, N'HEARC2', N'Heteromeles arbutifolia var. cerina', N'Toyon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (809, N'HEARM', N'Heteromeles arbutifolia var. macrocarpa', N'Toyon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (810, N'HEPA3', N'Helietta parvifolia', N'Barreta')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (811, N'HIMA2', N'Hippomane mancinella', N'Manchineel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (812, N'HIMU3', N'Hibiscus mutabilis', N'Dixie Rosemallow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (813, N'HIRH80', N'Hippophae rhamnoides', N'Seaberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (814, N'HIRO3', N'Hibiscus rosa-sinensis', N'Shoeblackplant')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (815, N'HISY', N'Hibiscus syriacus', N'Rose Of Sharon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (816, N'HITI', N'Hibiscus tiliaceus', N'Sea Hibiscus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (817, N'HODU2', N'Hovenia dulcis', N'Japanese Raisintree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (818, N'HOPO5', N'Hoheria populnea', N'Lacebark')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (819, N'HUCR', N'Hura crepitans', N'Sandbox Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (820, N'HYCA11', N'Hypericum canariense', N'Canary Island St. Johnswort')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (821, N'HYCH2', N'Hypericum chapmanii', N'Apalachicola St. Johnswort')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (822, N'HYTR', N'Hypelate trifoliata', N'Inkwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (823, N'HYUN3', N'Hylocereus undatus', N'Nightblooming Cactus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (824, N'ILAM', N'Ilex ambigua', N'Carolina Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (825, N'ILAM2', N'Ilex amelanchier', N'Sarvis Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (826, N'ILAQ80', N'Ilex aquifolium', N'English Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (827, N'ILAT', N'Ilex ×attenuata', N'Topal Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (828, N'ILCA', N'Ilex cassine', N'Dahoon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (829, N'ILCAC', N'Ilex cassine var. cassine', N'Dahoon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (830, N'ILCAL', N'Ilex cassine var. latifolia', N'Dahoon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (831, N'ILCO', N'Ilex coriacea', N'Large Gallberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (832, N'ILCO2', N'Ilex collina', N'Longstalk Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (833, N'ILCO80', N'Ilex cornuta', N'Chinese Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (834, N'ILCR2', N'Ilex crenata', N'Japanese Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (835, N'ILCU3', N'Ilex cuthbertii', N'Cuthbert''s Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (836, N'ILDE', N'Ilex decidua', N'Possumhaw')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (837, N'ILFL', N'Illicium floridanum', N'Florida Anisetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (838, N'ILKR', N'Ilex krugiana', N'Tawnyberry Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (839, N'ILLA', N'Ilex laevigata', N'Smooth Winterberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (840, N'ILLO', N'Ilex longipes', N'Georgia Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (841, N'ILMO', N'Ilex montana', N'Mountain Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (842, N'ILMU', N'Ilex mucronata', N'Catberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (843, N'ILMY', N'Ilex myrtifolia', N'Myrtle Dahoon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (844, N'ILOP', N'Ilex opaca', N'American Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (845, N'ILOPA', N'Ilex opaca var. arenicola', N'American Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (846, N'ILOPO', N'Ilex opaca var. opaca', N'American Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (847, N'ILPA', N'Illicium parviflorum', N'Yellow Anisetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (848, N'ILRO2', N'Ilex rotunda', N'Kurogane Holly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (849, N'ILVE', N'Ilex verticillata', N'Common Winterberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (850, N'ILVO', N'Ilex vomitoria', N'Yaupon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (851, N'IXPA', N'Ixora pavetta', N'Torch Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (852, N'JAAR2', N'Jacquinia armillaris', N'Braceletwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (853, N'JACU2', N'Jatropha curcas', N'Barbados Nut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (854, N'JAIN', N'Jatropha integerrima', N'Peregrina')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (855, N'JAINI', N'Jatropha integerrima var. integerrima', N'Peregrina')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (856, N'JAKE', N'Jacquinia keyensis', N'Joewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (857, N'JAMI', N'Jacaranda mimosifolia', N'Black Poui')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (858, N'JAMU', N'Jatropha multifida', N'Coralbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (859, N'JUAI2', N'Juglans ailantifolia', N'Japanese Walnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (860, N'JUAS', N'Juniperus ashei', N'Ashe''s Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (861, N'JUCA', N'Juglans californica', N'Southern California Walnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (862, N'JUCA7', N'Juniperus californica', N'California Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (863, N'JUCI', N'Juglans cinerea', N'Butternut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (864, N'JUCO11', N'Juniperus coahuilensis', N'Redberry Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (865, N'JUCO6', N'Juniperus communis', N'Common Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (866, N'JUCOA2', N'Juniperus coahuilensis var. arizonica', N'Redberry Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (867, N'JUCOC2', N'Juniperus coahuilensis var. coahuilensis', N'Redberry Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (868, N'JUCOD', N'Juniperus communis var. depressa', N'Common Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (869, N'JUCOM', N'Juniperus communis var. megistocarpa', N'Common Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (870, N'JUCOS2', N'Juniperus communis var. saxatilis', N'Common Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (871, N'JUDE2', N'Juniperus deppeana', N'Alligator Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (872, N'JUFA2', N'Juniperus ×fassettii', N'Fassett''s Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (873, N'JUFL', N'Juniperus flaccida', N'Drooping Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (874, N'JUHI', N'Juglans hindsii', N'Northern California Walnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (875, N'JUMA', N'Juglans major', N'Arizona Walnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (876, N'JUMI', N'Juglans microcarpa', N'Little Walnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (877, N'JUMIM', N'Juglans microcarpa var. microcarpa', N'Little Walnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (878, N'JUMIS', N'Juglans microcarpa var. stewartii', N'Stewart''s Little Walnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (879, N'JUMO', N'Juniperus monosperma', N'Oneseed Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (880, N'JUNI', N'Juglans nigra', N'Black Walnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (881, N'JUOC', N'Juniperus occidentalis', N'Western Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (882, N'JUOCA', N'Juniperus occidentalis var. australis', N'Western Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (883, N'JUOCO', N'Juniperus occidentalis var. occidentalis', N'Western Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (884, N'JUOS', N'Juniperus osteosperma', N'Utah Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (885, N'JUPI', N'Juniperus pinchotii', N'Pinchot''s Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (886, N'JURE80', N'Juglans regia', N'English Walnut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (887, N'JUSA5', N'Juniperus sabina', N'Savin')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (888, N'JUSC2', N'Juniperus scopulorum', N'Rocky Mountain Juniper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (889, N'JUVI', N'Juniperus virginiana', N'Eastern Redcedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (890, N'JUVIS', N'Juniperus virginiana var. silicicola', N'Southern Redcedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (891, N'JUVIV', N'Juniperus virginiana var. virginiana', N'Eastern Redcedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (892, N'KAHU', N'Karwinskia humboldtiana', N'Coyotillo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (893, N'KALA', N'Kalmia latifolia', N'Mountain Laurel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (894, N'KASE', N'Kalopanax septemlobus', N'Castor Aralia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (895, N'KHSE2', N'Khaya senegalensis', N'Senegal Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (896, N'KOEL', N'Koelreuteria elegans', N'Flamegold')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (897, N'KOELF', N'Koelreuteria elegans ssp. formosana', N'Flamegold')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (898, N'KOPA', N'Koelreuteria paniculata', N'Goldenrain Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (899, N'KOSP', N'Koeberlinia spinosa', N'Crown Of Thorns')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (900, N'KOSPS', N'Koeberlinia spinosa var. spinosa', N'Crown Of Thorns')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (901, N'KOSPT', N'Koeberlinia spinosa var. tenuispina', N'Crown Of Thorns')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (902, N'KRFE', N'Krugiodendron ferreum', N'Leadwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (903, N'LAAN2', N'Laburnum anagyroides', N'Golden Chain Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (904, N'LADE2', N'Larix decidua', N'European Larch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (905, N'LAIN', N'Lagerstroemia indica', N'Crapemyrtle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (906, N'LAIN2', N'Lantana involucrata', N'Buttonsage')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (907, N'LAINI', N'Lantana involucrata var. involucrata', N'Buttonsage')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (908, N'LAINO', N'Lantana involucrata var. odorata', N'Fragrant Buttonsage')
GO
print 'Processed 900 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (909, N'LAKA2', N'Larix kaempferi', N'Japanese Larch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (910, N'LALA', N'Larix laricina', N'Tamarack')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (911, N'LALY', N'Larix lyallii', N'Subalpine Larch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (912, N'LANO80', N'Laurus nobilis', N'Sweet Bay')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (913, N'LAOC', N'Larix occidentalis', N'Western Larch')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (914, N'LARA2', N'Laguncularia racemosa', N'White Mangrove')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (915, N'LEES2', N'Leucaena esculenta', N'Guaje')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (916, N'LEFL', N'Leitneria floridana', N'Corkwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (917, N'LELA29', N'Leptospermum laevigatum', N'Australian Teatree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (918, N'LELE10', N'Leucaena leucocephala', N'White Leadtree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (919, N'LELEL2', N'Leucaena leucocephala ssp. leucocephala', N'White Leadtree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (920, N'LEPU3', N'Leucaena pulverulenta', N'Great Leadtree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (921, N'LERE5', N'Leucaena retusa', N'Littleleaf Leadtree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (922, N'LESQ', N'Lepidospartum squamatum', N'California Broomsage')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (923, N'LIAR10', N'Limonium arborescens', N'Tree Limonium')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (924, N'LIBE3', N'Lindera benzoin', N'Northern Spicebush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (925, N'LIBEB', N'Lindera benzoin var. benzoin', N'Northern Spicebush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (926, N'LIBEP', N'Lindera benzoin var. pubescens', N'Northern Spicebush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (927, N'LICH3', N'Livistona chinensis', N'Fountain Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (928, N'LIDE3', N'Lithocarpus densiflorus', N'Tanoak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (929, N'LIDED2', N'Lithocarpus densiflorus var. densiflorus', N'Tanoak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (930, N'LIDEE', N'Lithocarpus densiflorus var. echinoides', N'Tanoak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (931, N'LIJA', N'Ligustrum japonicum', N'Japanese Privet')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (932, N'LILU2', N'Ligustrum lucidum', N'Glossy Privet')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (933, N'LIME7', N'Lindera melissifolia', N'Southern Spicebush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (934, N'LIMO4', N'Lithrea molleoides', N'Aroeira Blanca')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (935, N'LIOV', N'Ligustrum ovalifolium', N'California Privet')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (936, N'LIRO5', N'Livistona rotundifolia', N'Round-Leaf Fountain Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (937, N'LISI', N'Ligustrum sinense', N'Chinese Privet')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (938, N'LIST2', N'Liquidambar styraciflua', N'Sweetgum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (939, N'LISU8', N'Lindera subcoriacea', N'Bog Spicebush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (940, N'LITR', N'Licaria triandra', N'Pepperleaf Sweetwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (941, N'LITU', N'Liriodendron tulipifera', N'Tuliptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (942, N'LOPU4', N'Lonchocarpus punctatus', N'Dotted Lancepod')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (943, N'LYFE', N'Lyonia ferruginea', N'Rusty Staggerbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (944, N'LYFL2', N'Lyonothamnus floribundus', N'Catalina Ironwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (945, N'LYFLA', N'Lyonothamnus floribundus ssp. aspleniifolius', N'Fern-Leaf Catalina Ironwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (946, N'LYFLF', N'Lyonothamnus floribundus ssp. floribundus', N'Catalina Ironwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (947, N'LYLA3', N'Lysiloma latisiliquum', N'False Tamarind')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (948, N'LYSA5', N'Lysiloma sabicu', N'Horseflesh Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (949, N'LYWA', N'Lysiloma watsonii', N'Littleleaf False Tamarind')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (950, N'MAAC', N'Magnolia acuminata', N'Cucumber-Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (951, N'MAAN3', N'Malus angustifolia', N'Southern Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (952, N'MAANA', N'Malus angustifolia var. angustifolia', N'Southern Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (953, N'MAANP', N'Malus angustifolia var. puberula', N'Southern Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (954, N'MAAS', N'Magnolia ashei', N'Ashe''s Magnolia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (955, N'MABA', N'Malus baccata', N'Siberian Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (956, N'MABO8', N'Maytenus boaria', N'Mayten')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (957, N'MACO5', N'Malus coronaria', N'Sweet Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (958, N'MAEM', N'Malpighia emarginata', N'Barbados Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (959, N'MAES', N'Manihot esculenta', N'Cassava')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (960, N'MAFL80', N'Malus floribunda', N'Japanese Flowering Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (961, N'MAFR', N'Magnolia fraseri', N'Mountain Magnolia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (962, N'MAFU', N'Malus fusca', N'Oregon Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (963, N'MAGL6', N'Malpighia glabra', N'Wild Crapemyrtle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (964, N'MAGR4', N'Magnolia grandiflora', N'Southern Magnolia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (965, N'MAGR8', N'Manihot grahamii', N'Graham''s Manihot')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (966, N'MAHA7', N'Malus halliana', N'Hall Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (967, N'MAIN3', N'Mangifera indica', N'Mango')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (968, N'MAIO', N'Malus ioensis', N'Prairie Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (969, N'MAIOI', N'Malus ioensis var. ioensis', N'Prairie Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (970, N'MAIOT8', N'Malus ioensis var. texana', N'Texas Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (971, N'MAJA2', N'Manilkara jaimiqui', N'Wild Dilly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (972, N'MAJAE', N'Manilkara jaimiqui ssp. emarginata', N'Wild Dilly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (973, N'MAKO', N'Magnolia kobus', N'Kobus Magnolia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (974, N'MALA6', N'Malosma laurina', N'Laurel Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (975, N'MAMA2', N'Magnolia macrophylla', N'Bigleaf Magnolia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (976, N'MAPH', N'Maytenus phyllanthoides', N'Florida Mayten')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (977, N'MAPL', N'Malus ×platycarpa', N'Bigfruit Crab')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (978, N'MAPO', N'Maclura pomifera', N'Osage Orange')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (979, N'MAPR', N'Malus prunifolia', N'Plumleaf Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (980, N'MAPU', N'Malus pumila', N'Paradise Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (981, N'MAPY', N'Magnolia pyramidata', N'Pyramid Magnolia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (982, N'MASO3', N'Malus ×soulardii', N'Soulard Crab')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (983, N'MASO9', N'Magnolia ×soulangiana', N'Chinese Magnolia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (984, N'MASP9', N'Malus spectabilis', N'Asiatic Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (985, N'MAST6', N'Magnolia stellata', N'Star Magnolia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (986, N'MASY2', N'Malus sylvestris', N'European Crab Apple')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (987, N'MATR', N'Magnolia tripetala', N'Umbrella-Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (988, N'MAVI2', N'Magnolia virginiana', N'Sweetbay')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (989, N'MAZA', N'Manilkara zapota', N'Sapodilla')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (990, N'MEAZ', N'Melia azedarach', N'Chinaberrytree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (991, N'MEBI', N'Melicoccus bijugatus', N'Spanish Lime')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (992, N'MELI7', N'Melaleuca linariifolia', N'Cajeput Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (993, N'MEQU', N'Melaleuca quinquenervia', N'Punktree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (994, N'METO3', N'Metopium toxiferum', N'Florida Poisontree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (995, N'MIAC3', N'Mimosa aculeaticarpa', N'Catclaw Mimosa')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (996, N'MIACB', N'Mimosa aculeaticarpa var. biuncifera', N'Catclaw Mimosa')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (997, N'MIPI9', N'Millettia pinnata', N'Pongame Oiltree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (998, N'MOAL', N'Morus alba', N'White Mulberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (999, N'MOCA6', N'Morella californica', N'California Wax Myrtle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1000, N'MOCA7', N'Morella caroliniensis', N'Southern Bayberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1001, N'MOCE2', N'Morella cerifera', N'Wax Myrtle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1002, N'MOCI3', N'Morinda citrifolia', N'Indian Mulberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1003, N'MOIN', N'Morella inodora', N'Scentless Bayberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1004, N'MOMI', N'Morus microphylla', N'Texas Mulberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1005, N'MONI', N'Morus nigra', N'Black Mulberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1006, N'MOOL', N'Moringa oleifera', N'Horseradishtree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1007, N'MOPE6', N'Morella pensylvanica', N'Northern Bayberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1008, N'MORU2', N'Morus rubra', N'Red Mulberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1009, N'MORU3', N'Morella rubra', N'Red Bayberry')
GO
print 'Processed 1000 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1010, N'MORUR', N'Morus rubra var. rubra', N'Red Mulberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1011, N'MORUT', N'Morus rubra var. tomentosa', N'Red Mulberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1012, N'MUAC', N'Musa acuminata', N'Edible Banana')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1013, N'MUCA4', N'Muntingia calabura', N'Strawberrytree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1014, N'MUEX2', N'Murraya exotica', N'Chinese Box')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1015, N'MUPA3', N'Musa ×paradisiaca', N'French Plantain')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1016, N'MYCU2', N'Myrsine cubana', N'Guianese Colicwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1017, N'MYFR', N'Myrcianthes fragrans', N'Twinberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1018, N'MYLA5', N'Myoporum laetum', N'Ngaio Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1019, N'NECO', N'Nectandra coriacea', N'Lancewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1020, N'NEOL', N'Nerium oleander', N'Oleander')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1021, N'NIGL', N'Nicotiana glauca', N'Tree Tobacco')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1022, N'NOBI', N'Nolina bigelovii', N'Bigelow''s Nolina')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1023, N'NOEM', N'Noronhia emarginata', N'Madagascar Olive')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1024, N'NOPA', N'Nolina parryi', N'Parry''s Beargrass')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1025, N'NYAQ2', N'Nyssa aquatica', N'Water Tupelo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1026, N'NYBI', N'Nyssa biflora', N'Swamp Tupelo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1027, N'NYOG', N'Nyssa ogeche', N'Ogeechee Tupelo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1028, N'NYSY', N'Nyssa sylvatica', N'Blackgum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1029, N'NYUR2', N'Nyssa ursina', N'Bear Tupelo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1030, N'OCEL', N'Ochrosia elliptica', N'Elliptic Yellowwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1031, N'OECE', N'Oemleria cerasiformis', N'Indian Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1032, N'OLEU', N'Olea europaea', N'Olive')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1033, N'OLEUC', N'Olea europaea ssp. cuspidata', N'African Olive')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1034, N'OLEUE', N'Olea europaea ssp. europaea', N'European Olive')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1035, N'OLTE', N'Olneya tesota', N'Desert Ironwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1036, N'OPAU2', N'Opuntia aurea', N'Golden Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1037, N'OPBA2', N'Opuntia basilaris', N'Beavertail Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1038, N'OPBAB', N'Opuntia basilaris var. brachyclada', N'Beavertail Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1039, N'OPBAB2', N'Opuntia basilaris var. basilaris', N'Beavertail Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1040, N'OPBAL', N'Opuntia basilaris var. longiareolata', N'Beavertail Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1041, N'OPBAT', N'Opuntia basilaris var. treleasei', N'Trelease''s Beavertail Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1042, N'OPCO4', N'Opuntia cochenillifera', N'Cochineal Nopal Cactus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1043, N'OPFI', N'Opuntia ficus-indica', N'Barbary Fig')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1044, N'OPGO', N'Opuntia gosseliniana', N'Violet Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1045, N'OPMA8', N'Opuntia macrocentra', N'Purple Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1046, N'OPMAM', N'Opuntia macrocentra var. macrocentra', N'Purple Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1047, N'OPMAM2', N'Opuntia macrocentra var. minor', N'Purple Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1048, N'OPMO5', N'Opuntia monacantha', N'Common Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1049, N'OPPI3', N'Opuntia pinkavae', N'Pinkava''s Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1050, N'OPSA', N'Opuntia santa-rita', N'Santa Rita Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1051, N'OPTO2', N'Opuntia tomentosa', N'Woollyjoint Pricklypear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1052, N'OSAM', N'Osmanthus americanus', N'Devilwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1053, N'OSAMA', N'Osmanthus americanus var. americanus', N'Devilwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1054, N'OSAMM', N'Osmanthus americanus var. megacarpus', N'Devilwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1055, N'OSKN', N'Ostrya knowltonii', N'Knowlton''s Hophornbeam')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1056, N'OSVI', N'Ostrya virginiana', N'Hophornbeam')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1057, N'OSVIC', N'Ostrya virginiana var. chisosensis', N'Chisos Hophornbeam')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1058, N'OSVIV', N'Ostrya virginiana var. virginiana', N'Hophornbeam')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1059, N'OXAR', N'Oxydendrum arboreum', N'Sourwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1060, N'PAAC3', N'Parkinsonia aculeata', N'Jerusalem Thorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1061, N'PAFL6', N'Parkinsonia florida', N'Blue Paloverde')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1062, N'PALO8', N'Paraserianthes lophantha', N'Plume Albizia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1063, N'PAMI5', N'Parkinsonia microphylla', N'Yellow Paloverde')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1064, N'PASC14', N'Pachycereus schottii', N'Senita Cactus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1065, N'PASP16', N'Paliurus spina-christi', N'Jeruselem Thorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1066, N'PATE10', N'Parkinsonia texana', N'Texas Paloverde')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1067, N'PATEM', N'Parkinsonia texana var. macra', N'Texas Paloverde')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1068, N'PATET2', N'Parkinsonia texana var. texana', N'Texas Paloverde')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1069, N'PATO2', N'Paulownia tomentosa', N'Princesstree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1070, N'PEAC2', N'Pereskia aculeata', N'Barbados Shrub')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1071, N'PEAM3', N'Persea americana', N'Avocado')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1072, N'PEBO', N'Persea borbonia', N'Redbay')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1073, N'PEDO', N'Petitia domingensis', N'Bastard Stopper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1074, N'PEDU3', N'Peltophorum dubia', N'Horsebush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1075, N'PEGR14', N'Pereskia grandifolia', N'Rose Cactus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1076, N'PEHU2', N'Persea humilis', N'Silk Bay')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1077, N'PEPA37', N'Persea palustris', N'Swamp Bay')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1078, N'PEPT3', N'Peltophorum pterocarpum', N'Peltophorum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1079, N'PESC4', N'Peucephyllum schottii', N'Schott''s Pygmycedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1080, N'PHAC3', N'Phyllanthus acidus', N'Tahitian Gooseberry Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1081, N'PHAM2', N'Phellodendron amurense', N'Amur Corktree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1082, N'PHBO9', N'Phytolacca bogotensis', N'Southern Pokeweed')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1083, N'PHCA13', N'Phoenix canariensis', N'Canary Island Date Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1084, N'PHDA4', N'Phoenix dactylifera', N'Date Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1085, N'PHDA5', N'Photinia davidiana', N'Chinese Photinia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1086, N'PHJA', N'Phellodendron japonicum', N'Japanese Corktree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1087, N'PHLA26', N'Phellodendron lavallei', N'Lavalle Corktree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1088, N'PHRE', N'Phoenix reclinata', N'Senegal Date Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1089, N'PHSA80', N'Phellodendron sachalinense', N'Sakhalin Corktree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1090, N'PHSE17', N'Photinia serratifolia', N'Taiwanese Photinia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1091, N'PHVI81', N'Photinia villosa', N'Oriental Photinia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1092, N'PIAB', N'Picea abies', N'Norway Spruce')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1093, N'PIAC2', N'Pisonia aculeata', N'Pullback')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1094, N'PIAD', N'Piper aduncum', N'Higuillo De Hoja Menuda')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1095, N'PIAL', N'Pinus albicaulis', N'Whitebark Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1096, N'PIAR', N'Pinus aristata', N'Bristlecone Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1097, N'PIAR5', N'Pinus arizonica', N'Arizona Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1098, N'PIARA', N'Pinus arizonica var. arizonica', N'Arizona Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1099, N'PIARS2', N'Pinus arizonica var. stormiae', N'Arizona Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1100, N'PIAT', N'Pinus attenuata', N'Knobcone Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1101, N'PIAT4', N'Pistacia atlantica', N'Mt. Atlas Mastic Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1102, N'PIAU', N'Piper auritum', N'Vera Cruz Pepper')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1103, N'PIBA', N'Pinus balfouriana', N'Foxtail Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1104, N'PIBA2', N'Pinus banksiana', N'Jack Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1105, N'PIBAA', N'Pinus balfouriana ssp. austrina', N'Foxtail Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1106, N'PIBAB', N'Pinus balfouriana ssp. balfouriana', N'Foxtail Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1107, N'PIBR', N'Picea breweriana', N'Brewer Spruce')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1108, N'PIBR6', N'Pinckneya bracteata', N'Fevertree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1109, N'PICA14', N'Pisonia capitata', N'Mexican Devil''s-Claws')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1110, N'PICE', N'Pinus cembroides', N'Mexican Pinyon')
GO
print 'Processed 1100 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1111, N'PICH4', N'Pistacia chinensis', N'Chinese Pistache')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1112, N'PICL', N'Pinus clausa', N'Sand Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1113, N'PICO', N'Pinus contorta', N'Lodgepole Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1114, N'PICO3', N'Pinus coulteri', N'Coulter Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1115, N'PICOB', N'Pinus contorta var. bolanderi', N'Bolander Beach Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1116, N'PICOC', N'Pinus contorta var. contorta', N'Beach Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1117, N'PICOL', N'Pinus contorta var. latifolia', N'Lodgepole Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1118, N'PICOM', N'Pinus contorta var. murrayana', N'Sierra Lodgepole Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1119, N'PICR', N'Pittosporum crassifolium', N'Stiffleaf Cheesewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1120, N'PIDI3', N'Pinus discolor', N'Border Pinyon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1121, N'PIDU', N'Pithecellobium dulce', N'Monkeypod')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1122, N'PIEC2', N'Pinus echinata', N'Shortleaf Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1123, N'PIED', N'Pinus edulis', N'Twoneedle Pinyon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1124, N'PIEL', N'Pinus elliottii', N'Slash Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1125, N'PIELD', N'Pinus elliottii var. densa', N'Florida Slash Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1126, N'PIELE2', N'Pinus elliottii var. elliottii', N'Honduras Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1127, N'PIEN', N'Picea engelmannii', N'Engelmann Spruce')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1128, N'PIEN2', N'Pinus engelmannii', N'Apache Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1129, N'PIENE', N'Picea engelmannii var. engelmannii', N'Engelmann Spruce')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1130, N'PIFL2', N'Pinus flexilis', N'Limber Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1131, N'PIFL6', N'Pisonia floridana', N'Rock Key Devil''s-Claws')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1132, N'PIGL', N'Picea glauca', N'White Spruce')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1133, N'PIGL2', N'Pinus glabra', N'Spruce Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1134, N'PIHA7', N'Pinus halepensis', N'Aleppo Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1135, N'PIJE', N'Pinus jeffreyi', N'Jeffrey Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1136, N'PIKE', N'Pithecellobium keyense', N'Florida Keys Blackbead')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1137, N'PILA', N'Pinus lambertiana', N'Sugar Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1138, N'PILE', N'Pinus leiophylla', N'Chihuahuan Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1139, N'PILEC', N'Pinus leiophylla var. chihuahuana', N'Chihuahuan Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1140, N'PILO', N'Pinus longaeva', N'Great Basin Bristlecone Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1141, N'PIMA', N'Picea mariana', N'Black Spruce')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1142, N'PIMAM4', N'Picea mariana var. mariana', N'Black Spruce')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1143, N'PIME4', N'Pistacia mexicana', N'American Pistachio')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1144, N'PIMO', N'Pinus monophylla', N'Singleleaf Pinyon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1145, N'PIMO3', N'Pinus monticola', N'Western White Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1146, N'PIMOC', N'Pinus monophylla var. californiarum', N'California Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1147, N'PIMOF', N'Pinus monophylla var. fallax', N'Singleleaf Pinyon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1148, N'PIMOM2', N'Pinus monophylla var. monophylla', N'Singleleaf Pinyon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1149, N'PIMU', N'Pinus muricata', N'Bishop Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1150, N'PIMU80', N'Pinus mugo', N'Mugo Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1151, N'PINI', N'Pinus nigra', N'Austrian Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1152, N'PIPA2', N'Pinus palustris', N'Longleaf Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1153, N'PIPE', N'Picramnia pentandra', N'Florida Bitterbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1154, N'PIPE8', N'Pittosporum pentandrum', N'Taiwanese Cheesewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1155, N'PIPI3', N'Piscidia piscipula', N'Florida Fishpoison Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1156, N'PIPI6', N'Pinus pinaster', N'Maritime Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1157, N'PIPI7', N'Pinus pinea', N'Italian Stone Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1158, N'PIPO', N'Pinus ponderosa', N'Ponderosa Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1159, N'PIPO4', N'Pilosocereus polygonus', N'Deering''s Tree Cactus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1160, N'PIPOP', N'Pinus ponderosa var. ponderosa', N'Ponderosa Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1161, N'PIPOS', N'Pinus ponderosa var. scopulorum', N'Ponderosa Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1162, N'PIPU', N'Picea pungens', N'Blue Spruce')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1163, N'PIPU5', N'Pinus pungens', N'Table Mountain Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1164, N'PIQU', N'Pinus quadrifolia', N'Parry Pinyon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1165, N'PIRA2', N'Pinus radiata', N'Monterey Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1166, N'PIRE', N'Pinus resinosa', N'Red Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1167, N'PIRE5', N'Pinus remota', N'Papershell Pinyon')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1168, N'PIRI', N'Pinus rigida', N'Pitch Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1169, N'PIRO3', N'Pisonia rotundata', N'Smooth Devil''s-Claws')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1170, N'PIRU', N'Picea rubens', N'Red Spruce')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1171, N'PISA2', N'Pinus sabiniana', N'California Foothill Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1172, N'PISE', N'Pinus serotina', N'Pond Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1173, N'PISI', N'Picea sitchensis', N'Sitka Spruce')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1174, N'PIST', N'Pinus strobus', N'Eastern White Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1175, N'PIST3', N'Pinus strobiformis', N'Southwestern White Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1176, N'PISY', N'Pinus sylvestris', N'Scots Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1177, N'PITA', N'Pinus taeda', N'Loblolly Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1178, N'PITE11', N'Pittosporum tenuifolium', N'Tawhiwhi')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1179, N'PITH2', N'Pinus thunbergii', N'Japanese Black Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1180, N'PITO', N'Pinus torreyana', N'Torrey Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1181, N'PITO2', N'Pittosporum tobira', N'Japanese Cheesewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1182, N'PITOI2', N'Pinus torreyana var. insularis', N'Santa Cruz Island Torrey Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1183, N'PITOT2', N'Pinus torreyana var. torreyana', N'Torrey Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1184, N'PIUN', N'Pithecellobium unguis-cati', N'Catclaw Blackbead')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1185, N'PIUN2', N'Pittosporum undulatum', N'Australian Cheesewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1186, N'PIVI2', N'Pinus virginiana', N'Virginia Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1187, N'PIWA', N'Pinus washoensis', N'Washoe Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1188, N'PIWA3', N'Pinus wallichiana', N'Bhutan Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1189, N'PLAQ', N'Planera aquatica', N'Planertree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1190, N'PLHY3', N'Platanus hybrida', N'London Planetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1191, N'PLOB2', N'Plumeria obtusa', N'Singapore Graveyard Flower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1192, N'PLOBS', N'Plumeria obtusa var. sericifolia', N'Singapore Graveyard Flower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1193, N'PLOC', N'Platanus occidentalis', N'American Sycamore')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1194, N'PLOR80', N'Platycladus orientalis', N'Oriental Arborvitae')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1195, N'PLRA', N'Platanus racemosa', N'California Sycamore')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1196, N'PLWR2', N'Platanus wrightii', N'Arizona Sycamore')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1197, N'POAC5', N'Populus ×acuminata', N'Lanceleaf Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1198, N'POAL7', N'Populus alba', N'White Poplar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1199, N'POAN3', N'Populus angustifolia', N'Narrowleaf Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1200, N'POBA2', N'Populus balsamifera', N'Balsam Poplar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1201, N'POBAB2', N'Populus balsamifera ssp. balsamifera', N'Balsam Poplar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1202, N'POBAT', N'Populus balsamifera ssp. trichocarpa', N'Black Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1203, N'POBR7', N'Populus ×brayshawii', N'Hybrid Balsam Poplar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1204, N'POCA14', N'Populus ×canescens', N'Gray Poplar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1205, N'POCA19', N'Populus ×canadensis', N'Carolina Poplar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1206, N'POCA23', N'Pouteria campechiana', N'Canistel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1207, N'PODE3', N'Populus deltoides', N'Eastern Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1208, N'PODED', N'Populus deltoides ssp. deltoides', N'Eastern Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1209, N'PODEM', N'Populus deltoides ssp. monilifera', N'Plains Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1210, N'PODEW', N'Populus deltoides ssp. wislizeni', N'Rio Grande Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1211, N'PODO5', N'Pouteria dominigensis', N'Jacana')
GO
print 'Processed 1200 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1212, N'POFR2', N'Populus fremontii', N'Fremont Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1213, N'POFRF3', N'Populus fremontii ssp. fremontii', N'Fremont Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1214, N'POFRM', N'Populus fremontii ssp. mesetae', N'Fremont Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1215, N'POGR4', N'Populus grandidentata', N'Bigtooth Aspen')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1216, N'POGU', N'Polyscias guilfoylei', N'Geranium Aralia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1217, N'POHE4', N'Populus heterophylla', N'Swamp Cottonwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1218, N'POJA2', N'Populus ×jackii', N'Balm-Of-Gilead')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1219, N'POMA32', N'Podocarpus macrophyllus', N'Yew Plum Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1220, N'POMAM', N'Podocarpus macrophyllus var. maki', N'Yew Plum Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1221, N'PONI', N'Populus nigra', N'Lombardy Poplar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1222, N'POTO7', N'Populus tomentosa', N'Chinese White Poplar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1223, N'POTR10', N'Populus tremula', N'European Aspen')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1224, N'POTR4', N'Poncirus trifoliata', N'Hardy Orange')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1225, N'POTR5', N'Populus tremuloides', N'Quaking Aspen')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1226, N'PRAL5', N'Prunus alleghaniensis', N'Allegheny Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1227, N'PRAL7', N'Prunus alabamensis', N'Alabama Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1228, N'PRALA', N'Prunus alleghaniensis var. alleghaniensis', N'Allegheny Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1229, N'PRALD', N'Prunus alleghaniensis var. davisii', N'Davis'' Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1230, N'PRAM', N'Prunus americana', N'American Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1231, N'PRAN3', N'Prunus angustifolia', N'Chickasaw Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1232, N'PRANA', N'Prunus angustifolia var. angustifolia', N'Chickasaw Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1233, N'PRANW', N'Prunus angustifolia var. watsonii', N'Watson''s Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1234, N'PRAR3', N'Prunus armeniaca', N'Apricot')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1235, N'PRAV', N'Prunus avium', N'Sweet Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1236, N'PRCA', N'Prunus caroliniana', N'Carolina Laurelcherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1237, N'PRCE', N'Prunus cerasus', N'Sour Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1238, N'PRCE2', N'Prunus cerasifera', N'Cherry Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1239, N'PRDO', N'Prunus domestica', N'European Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1240, N'PRDOD', N'Prunus domestica var. domestica', N'European Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1241, N'PRDOI', N'Prunus domestica var. insititia', N'European Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1242, N'PRDU', N'Prunus dulcis', N'Sweet Almond')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1243, N'PREM', N'Prunus emarginata', N'Bitter Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1244, N'PREME', N'Prunus emarginata var. emarginata', N'Bitter Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1245, N'PREMM', N'Prunus emarginata var. mollis', N'Bitter Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1246, N'PRFA2', N'Prosopis farcta', N'Syrian Mesquite')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1247, N'PRFR', N'Prunus fremontii', N'Desert Apricot')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1248, N'PRGL2', N'Prosopis glandulosa', N'Honey Mesquite')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1249, N'PRGLG', N'Prosopis glandulosa var. glandulosa', N'Honey Mesquite')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1250, N'PRGLP', N'Prosopis glandulosa var. prostrata', N'Honey Mesquite')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1251, N'PRGLT', N'Prosopis glandulosa var. torreyana', N'Western Honey Mesquite')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1252, N'PRHO', N'Prunus hortulana', N'Hortulan Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1253, N'PRIL', N'Prunus ilicifolia', N'Hollyleaf Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1254, N'PRILI', N'Prunus ilicifolia ssp. ilicifolia', N'Hollyleaf Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1255, N'PRILL', N'Prunus ilicifolia ssp. lyonii', N'Hollyleaf Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1256, N'PRLA5', N'Prunus laurocerasus', N'Cherry Laurel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1257, N'PRLA6', N'Prosopis laevigata', N'Smooth Mesquite')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1258, N'PRLU', N'Prunus lusitanica', N'Portugal Laurel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1259, N'PRMA', N'Prunus mahaleb', N'Mahaleb Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1260, N'PRME', N'Prunus mexicana', N'Mexican Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1261, N'PRMU', N'Prunus munsoniana', N'Wild Goose Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1262, N'PRMY', N'Prunus myrtifolia', N'West Indian Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1263, N'PRNI', N'Prunus nigra', N'Canadian Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1264, N'PROD', N'Premna odorata', N'Fragrant Premna')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1265, N'PRPA5', N'Prunus padus', N'European Bird Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1266, N'PRPE2', N'Prunus pensylvanica', N'Pin Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1267, N'PRPE3', N'Prunus persica', N'Peach')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1268, N'PRPEP', N'Prunus pensylvanica var. pensylvanica', N'Pin Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1269, N'PRPES', N'Prunus pensylvanica var. saximontana', N'Pin Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1270, N'PRPU', N'Prosopis pubescens', N'Screwbean Mesquite')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1271, N'PRSE2', N'Prunus serotina', N'Black Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1272, N'PRSE3', N'Prunus serrulata', N'Japanese Flowering Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1273, N'PRSEE', N'Prunus serotina var. eximia', N'Black Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1274, N'PRSER2', N'Prunus serotina var. rufula', N'Black Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1275, N'PRSES', N'Prunus serotina var. serotina', N'Black Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1276, N'PRSEV', N'Prunus serotina var. virens', N'Black Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1277, N'PRSP', N'Prunus spinosa', N'Blackthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1278, N'PRSU2', N'Prunus subcordata', N'Klamath Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1279, N'PRSU4', N'Prunus subhirtella', N'Winter-Flowering Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1280, N'PRSUK', N'Prunus subcordata var. kelloggii', N'Kellogg''s Klamath Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1281, N'PRSUO', N'Prunus subcordata var. oregana', N'Oregon Klamath Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1282, N'PRSUR', N'Prunus subcordata var. rubicunda', N'Klamath Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1283, N'PRSUS', N'Prunus subcordata var. subcordata', N'Klamath Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1284, N'PRTO80', N'Prunus tomentosa', N'Nanking Cherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1285, N'PRTR3', N'Prunus triloba', N'Flowering Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1286, N'PRUM', N'Prunus umbellata', N'Hog Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1287, N'PRUMI', N'Prunus umbellata var. injuncunda', N'Hog Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1288, N'PRUMU', N'Prunus umbellata var. umbellata', N'Hog Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1289, N'PRVE', N'Prosopis velutina', N'Velvet Mesquite')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1290, N'PRVI', N'Prunus virginiana', N'Chokecherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1291, N'PRVID', N'Prunus virginiana var. demissa', N'Western Chokecherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1292, N'PRVIM', N'Prunus virginiana var. melanocarpa', N'Black Chokecherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1293, N'PRVIV', N'Prunus virginiana var. virginiana', N'Chokecherry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1294, N'PSCA', N'Psidium cattleianum', N'Strawberry Guava')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1295, N'PSGU', N'Psidium guajava', N'Guava')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1296, N'PSLI2', N'Psychotria ligustrifolia', N'Bahama Wild Coffee')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1297, N'PSLO2', N'Psidium longipes', N'Mangroveberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1298, N'PSLOL', N'Psidium longipes var. longipes', N'Mangroveberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1299, N'PSMA', N'Pseudotsuga macrocarpa', N'Bigcone Douglas-Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1300, N'PSME', N'Pseudotsuga menziesii', N'Douglas-Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1301, N'PSMEG', N'Pseudotsuga menziesii var. glauca', N'Rocky Mountain Douglas-Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1302, N'PSMEM', N'Pseudotsuga menziesii var. menziesii', N'Douglas-Fir')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1303, N'PSNE', N'Psychotria nervosa', N'Seminole Balsamo')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1304, N'PSPU2', N'Psychotria punctata', N'Dotted Wild Coffee')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1305, N'PSSA', N'Pseudophoenix sargentii', N'Florida Cherry Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1306, N'PSSAS3', N'Pseudophoenix sargentii ssp. sargentii', N'Florida Cherry Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1307, N'PSSI4', N'Pseudocydonia sinensis', N'Chinese-Quince')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1308, N'PSSP3', N'Psorothamnus spinosus', N'Smoketree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1309, N'PTCR3', N'Ptelea crenulata', N'California Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1310, N'PTEL', N'Ptychosperma elegans', N'Alexander Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1311, N'PTMA8', N'Ptychosperma macarthuri', N'Macarthur Feather Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1312, N'PTST80', N'Pterocarya stenoptera', N'Chinese Wingnut')
GO
print 'Processed 1300 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1313, N'PTTR', N'Ptelea trifoliata', N'Common Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1314, N'PTTRA', N'Ptelea trifoliata ssp. angustifolia', N'Common Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1315, N'PTTRA2', N'Ptelea trifoliata ssp. angustifolia var. angustifolia', N'Common Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1316, N'PTTRC', N'Ptelea trifoliata ssp. pallida var. cognata', N'Pallid Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1317, N'PTTRC2', N'Ptelea trifoliata ssp. pallida var. confinis', N'Pallid Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1318, N'PTTRL', N'Ptelea trifoliata ssp. pallida var. lutescens', N'Pallid Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1319, N'PTTRM', N'Ptelea trifoliata ssp. trifoliata var. mollis', N'Common Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1320, N'PTTRP', N'Ptelea trifoliata ssp. pallida', N'Pallid Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1321, N'PTTRP2', N'Ptelea trifoliata ssp. polyadenia', N'Pallid Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1322, N'PTTRP3', N'Ptelea trifoliata ssp. angustifolia var. persicifolia', N'Common Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1323, N'PTTRP4', N'Ptelea trifoliata ssp. pallida var. pallida', N'Pallid Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1324, N'PTTRT', N'Ptelea trifoliata ssp. trifoliata', N'Common Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1325, N'PTTRT2', N'Ptelea trifoliata ssp. trifoliata var. trifoliata', N'Common Hoptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1326, N'PUGR2', N'Punica granatum', N'Pomegranate')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1327, N'PUME', N'Purshia mexicana', N'Mexican Cliffrose')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1328, N'PUST', N'Purshia stansburiana', N'Stansbury Cliffrose')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1329, N'PYCA80', N'Pyrus calleryana', N'Callery Pear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1330, N'PYCO', N'Pyrus communis', N'Common Pear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1331, N'PYPY2', N'Pyrus pyrifolia', N'Chinese Pear')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1332, N'QUAC2', N'Quercus acerifolia', N'Mapleleaf Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1333, N'QUAC80', N'Quercus acutissima', N'Sawtooth Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1334, N'QUAG', N'Quercus agrifolia', N'California Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1335, N'QUAGA', N'Quercus agrifolia var. agrifolia', N'California Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1336, N'QUAGO', N'Quercus agrifolia var. oxyadenia', N'Coastal Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1337, N'QUAJ', N'Quercus ajoensis', N'Ajo Mountain Scrub Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1338, N'QUAL', N'Quercus alba', N'White Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1339, N'QUAL2', N'Quercus ×alvordiana', N'Alvord Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1340, N'QUAR', N'Quercus arizonica', N'Arizona White Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1341, N'QUAR2', N'Quercus arkansana', N'Arkansas Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1342, N'QUAU', N'Quercus austrina', N'Bastard White Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1343, N'QUBE5', N'Quercus berberidifolia', N'Scrub Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1344, N'QUBI', N'Quercus bicolor', N'Swamp White Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1345, N'QUBO2', N'Quercus boyntonii', N'Boynton Sand Post Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1346, N'QUBU2', N'Quercus buckleyi', N'Buckley Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1347, N'QUCA7', N'Quercus carmenensis', N'Mexican Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1348, N'QUCE', N'Quercus cerris', N'European Turkey Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1349, N'QUCE2', N'Quercus cedrosensis', N'Cedros Island Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1350, N'QUCH', N'Quercus chapmanii', N'Chapman Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1351, N'QUCH2', N'Quercus chrysolepis', N'Canyon Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1352, N'QUCH4', N'Quercus chihuahuensis', N'Chihuahuan Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1353, N'QUCHC', N'Quercus chrysolepis var. chrysolepis', N'Canyon Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1354, N'QUCHN', N'Quercus chrysolepis var. nana', N'Canyon Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1355, N'QUCO2', N'Quercus coccinea', N'Scarlet Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1356, N'QUCO7', N'Quercus cornelius-mulleri', N'Muller Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1357, N'QUCOC', N'Quercus coccinea var. coccinea', N'Scarlet Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1358, N'QUCOT', N'Quercus coccinea var. tuberculata', N'Scarlet Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1359, N'QUDE3', N'Quercus depressipes', N'Davis Mountain Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1360, N'QUDO', N'Quercus douglasii', N'Blue Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1361, N'QUDU', N'Quercus dumosa', N'Coastal Sage Scrub Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1362, N'QUDU4', N'Quercus durata', N'Leather Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1363, N'QUDUD', N'Quercus dumosa var. dumosa', N'Coastal Sage Scrub Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1364, N'QUDUD2', N'Quercus durata var. durata', N'Leather Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1365, N'QUDUE', N'Quercus dumosa var. elegantula', N'Coastal Sage Scrub Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1366, N'QUDUG', N'Quercus durata var. gabrielensis', N'Leather Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1367, N'QUEL', N'Quercus ellipsoidalis', N'Northern Pin Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1368, N'QUEM', N'Quercus emoryi', N'Emory Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1369, N'QUEN', N'Quercus engelmannii', N'Engelmann Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1370, N'QUFA', N'Quercus falcata', N'Southern Red Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1371, N'QUFU', N'Quercus fusiformis', N'Texas Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1372, N'QUGA', N'Quercus gambelii', N'Gambel Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1373, N'QUGA4', N'Quercus garryana', N'Oregon White Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1374, N'QUGAB2', N'Quercus gambelii var. bonina', N'Gambel Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1375, N'QUGAG', N'Quercus gambelii var. gambelii', N'Gambel Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1376, N'QUGAG2', N'Quercus garryana var. garryana', N'Oregon White Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1377, N'QUGAS', N'Quercus garryana var. semota', N'Oregon White Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1378, N'QUGE', N'Quercus georgiana', N'Georgia Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1379, N'QUGE2', N'Quercus geminata', N'Sand Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1380, N'QUGR', N'Quercus graciliformis', N'Chisos Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1381, N'QUGR2', N'Quercus gravesii', N'Chisos Red Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1382, N'QUGR3', N'Quercus grisea', N'Gray Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1383, N'QUHA3', N'Quercus havardii', N'Havard Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1384, N'QUHAH', N'Quercus havardii var. havardii', N'Havard Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1385, N'QUHAT', N'Quercus havardii var. tuckeri', N'Havard Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1386, N'QUHE2', N'Quercus hemisphaerica', N'Darlington Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1387, N'QUHEH', N'Quercus hemisphaerica var. hemisphaerica', N'Darlington Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1388, N'QUHEM', N'Quercus hemisphaerica var. maritima', N'Darlington Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1389, N'QUHY', N'Quercus hypoleucoides', N'Silverleaf Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1390, N'QUIL', N'Quercus ilicifolia', N'Bear Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1391, N'QUIL2', N'Quercus ilex', N'Holly Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1392, N'QUIM', N'Quercus imbricaria', N'Shingle Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1393, N'QUIN', N'Quercus incana', N'Bluejack Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1394, N'QUJO3', N'Quercus john-tuckeri', N'Tucker Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1395, N'QUKE', N'Quercus kelloggii', N'California Black Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1396, N'QULA', N'Quercus laceyi', N'Lacey Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1397, N'QULA2', N'Quercus laevis', N'Turkey Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1398, N'QULA3', N'Quercus laurifolia', N'Laurel Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1399, N'QULO', N'Quercus lobata', N'Valley Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1400, N'QULY', N'Quercus lyrata', N'Overcup Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1401, N'QUMA2', N'Quercus macrocarpa', N'Bur Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1402, N'QUMA3', N'Quercus marilandica', N'Blackjack Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1403, N'QUMA4', N'Quercus ×macdonaldii', N'Macdonald Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1404, N'QUMA6', N'Quercus margarettae', N'Runner Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1405, N'QUMAA2', N'Quercus marilandica var. ashei', N'Blackjack Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1406, N'QUMAD', N'Quercus macrocarpa var. depressa', N'Bur Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1407, N'QUMAM', N'Quercus macrocarpa var. macrocarpa', N'Bur Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1408, N'QUMAM2', N'Quercus marilandica var. marilandica', N'Blackjack Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1409, N'QUMI', N'Quercus michauxii', N'Swamp Chestnut Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1410, N'QUMO', N'Quercus mohriana', N'Mohr Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1411, N'QUMO2', N'Quercus ×moreha', N'Oracle Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1412, N'QUMU', N'Quercus muehlenbergii', N'Chinkapin Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1413, N'QUMY', N'Quercus myrtifolia', N'Myrtle Oak')
GO
print 'Processed 1400 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1414, N'QUNI', N'Quercus nigra', N'Water Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1415, N'QUOB', N'Quercus oblongifolia', N'Mexican Blue Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1416, N'QUOG', N'Quercus oglethorpensis', N'Oglethorpe Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1417, N'QUPA10', N'Quercus palmeri', N'Palmer Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1418, N'QUPA2', N'Quercus palustris', N'Pin Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1419, N'QUPA5', N'Quercus pagoda', N'Cherrybark Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1420, N'QUPA6', N'Quercus pacifica', N'Channel Island Scrub Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1421, N'QUPA8', N'Quercus parvula', N'Coast Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1422, N'QUPAS2', N'Quercus parvula var. shrevei', N'Shreve Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1423, N'QUPH', N'Quercus phellos', N'Willow Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1424, N'QUPO2', N'Quercus polymorpha', N'Netleaf White Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1425, N'QUPR', N'Quercus prinoides', N'Dwarf Chinkapin Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1426, N'QUPR2', N'Quercus prinus', N'Chestnut Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1427, N'QUPS', N'Quercus ×pseudomargaretta', N'False Sand Post Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1428, N'QUPU', N'Quercus pungens', N'Pungent Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1429, N'QURO2', N'Quercus robur', N'English Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1430, N'QURO3', N'Quercus robusta', N'Robust Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1431, N'QURU', N'Quercus rubra', N'Northern Red Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1432, N'QURU4', N'Quercus rugosa', N'Netleaf Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1433, N'QURUA', N'Quercus rubra var. ambigua', N'Northern Red Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1434, N'QURUR', N'Quercus rubra var. rubra', N'Northern Red Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1435, N'QUSH', N'Quercus shumardii', N'Shumard''s Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1436, N'QUSHS', N'Quercus shumardii var. schneckii', N'Schneck Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1437, N'QUSHS2', N'Quercus shumardii var. shumardii', N'Shumard Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1438, N'QUSHS3', N'Quercus shumardii var. stenocarpa', N'Shumard Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1439, N'QUSI', N'Quercus sinuata', N'Bastard Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1440, N'QUSI2', N'Quercus similis', N'Bottomland Post Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1441, N'QUSIB', N'Quercus sinuata var. breviloba', N'Bastard Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1442, N'QUSIS', N'Quercus sinuata var. sinuata', N'Bastard Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1443, N'QUST', N'Quercus stellata', N'Post Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1444, N'QUSU5', N'Quercus suber', N'Cork Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1445, N'QUTA', N'Quercus tardifolia', N'Lateleaf Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1446, N'QUTE', N'Quercus texana', N'Texas Red Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1447, N'QUTO', N'Quercus tomentella', N'Island Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1448, N'QUTO2', N'Quercus toumeyi', N'Toumey Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1449, N'QUTU2', N'Quercus turbinella', N'Sonoran Scrub Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1450, N'QUVA5', N'Quercus vaseyana', N'Sandpaper Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1451, N'QUVE', N'Quercus velutina', N'Black Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1452, N'QUVI', N'Quercus virginiana', N'Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1453, N'QUVI2', N'Quercus viminea', N'Sonoran Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1454, N'QUWI2', N'Quercus wislizeni', N'Interior Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1455, N'QUWIF', N'Quercus wislizeni var. frutescens', N'Interior Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1456, N'QUWIW', N'Quercus wislizeni var. wislizeni', N'Interior Live Oak')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1457, N'RAAC', N'Randia aculeata', N'White Indigoberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1458, N'RESE', N'Reynosia septentrionalis', N'Darlingplum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1459, N'RHAR6', N'Rhamnus arguta', N'Sharp-Tooth Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1460, N'RHCA3', N'Rhamnus cathartica', N'Common Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1461, N'RHCA8', N'Rhododendron catawbiense', N'Catawba Rosebay')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1462, N'RHCO', N'Rhus copallinum', N'Winged Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1463, N'RHCOC', N'Rhus copallinum var. copallinum', N'Winged Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1464, N'RHCOL', N'Rhus copallinum var. leucantha', N'Winged Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1465, N'RHCOL2', N'Rhus copallinum var. latifolia', N'Winged Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1466, N'RHCR', N'Rhamnus crocea', N'Redberry Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1467, N'RHCRC', N'Rhamnus crocea ssp. crocea', N'Redberry Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1468, N'RHCRP2', N'Rhamnus crocea ssp. pilosa', N'Hollyleaf Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1469, N'RHDA', N'Rhamnus davurica', N'Dahurian Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1470, N'RHDAD2', N'Rhamnus davurica ssp. davurica', N'Dahurian Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1471, N'RHDAN2', N'Rhamnus davurica ssp. nipponica', N'Dahurian Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1472, N'RHEA2', N'Rhododendron eastmanii', N'Santee Azalea')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1473, N'RHGL', N'Rhus glabra', N'Smooth Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1474, N'RHIL', N'Rhamnus ilicifolia', N'Hollyleaf Redberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1475, N'RHIN2', N'Rhus integrifolia', N'Lemonade Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1476, N'RHJA8', N'Rhamnus japonica', N'Japanese Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1477, N'RHKE', N'Rhus kearneyi', N'Kearney''s Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1478, N'RHLA', N'Rhamnus lanceolata', N'Lanceleaf Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1479, N'RHLA11', N'Rhus lancea', N'African Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1480, N'RHLA3', N'Rhus lanceolata', N'Prairie Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1481, N'RHLAG2', N'Rhamnus lanceolata ssp. glabrata', N'Lanceleaf Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1482, N'RHLAL3', N'Rhamnus lanceolata ssp. lanceolata', N'Lanceleaf Buckthorn')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1483, N'RHMA2', N'Rhizophora mangle', N'Red Mangrove')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1484, N'RHMA3', N'Rhododendron macrophyllum', N'Pacific Rhododendron')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1485, N'RHMA4', N'Rhododendron maximum', N'Great Laurel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1486, N'RHMI3', N'Rhus microphylla', N'Littleleaf Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1487, N'RHOV', N'Rhus ovata', N'Sugar Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1488, N'RHPI', N'Rhamnus pirifolia', N'Island Redberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1489, N'RHPU12', N'Rhus pulvinata', N'Northern Smooth Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1490, N'RHTO10', N'Rhodomyrtus tomentosa', N'Rose Myrtle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1491, N'RHTY', N'Rhus typhina', N'Staghorn Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1492, N'RHVI3', N'Rhus virens', N'Evergreen Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1493, N'RHVIC', N'Rhus virens var. choriophylla', N'Evergreen Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1494, N'RHVIV', N'Rhus virens var. virens', N'Evergreen Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1495, N'RICO3', N'Ricinus communis', N'Castorbean')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1496, N'ROEL', N'Roystonea elata', N'Florida Royal Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1497, N'ROHI', N'Robinia hispida', N'Bristly Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1498, N'ROHIF8', N'Robinia hispida var. fertilis', N'Bristly Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1499, N'ROHIH', N'Robinia hispida var. hispida', N'Bristly Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1500, N'ROHIK', N'Robinia hispida var. kelseyi', N'Kelsey''s Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1501, N'ROHIN', N'Robinia hispida var. nana', N'Bristly Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1502, N'ROHIR', N'Robinia hispida var. rosea', N'Bristly Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1503, N'RONE', N'Robinia neomexicana', N'New Mexico Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1504, N'RONEN', N'Robinia neomexicana var. neomexicana', N'New Mexico Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1505, N'RONER', N'Robinia neomexicana var. rusbyi', N'Rusby''s Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1506, N'ROPS', N'Robinia pseudoacacia', N'Black Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1507, N'ROVI', N'Robinia viscosa', N'Clammy Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1508, N'ROVIH2', N'Robinia viscosa var. hartwegii', N'Hartweg''s Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1509, N'ROVIV', N'Robinia viscosa var. viscosa', N'Clammy Locust')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1510, N'SAAL', N'Salix alaxensis', N'Feltleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1511, N'SAAL2', N'Salix alba', N'White Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1512, N'SAAL5', N'Sassafras albidum', N'Sassafras')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1513, N'SAALA', N'Salix alaxensis var. alaxensis', N'Feltleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1514, N'SAALL', N'Salix alaxensis var. longistylis', N'Feltleaf Willow')
GO
print 'Processed 1500 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1515, N'SAAM2', N'Salix amygdaloides', N'Peachleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1516, N'SAAR3', N'Salix arbusculoides', N'Littletree Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1517, N'SAAT2', N'Salix atrocinerea', N'Large Gray Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1518, N'SABA3', N'Salix barclayi', N'Barclay''s Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1519, N'SABA6', N'Savia bahamensis', N'Bahama Maidenbush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1520, N'SABE2', N'Salix bebbiana', N'Bebb Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1521, N'SABO', N'Salix bonplandiana', N'Bonpland Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1522, N'SABR2', N'Salix breweri', N'Brewer''s Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1523, N'SACA5', N'Salix caroliniana', N'Coastal Plain Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1524, N'SACI', N'Salix cinerea', N'Large Gray Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1525, N'SADI', N'Salix discolor', N'Pussy Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1526, N'SAEL', N'Salix elaeagnos', N'Elaeagnus Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1527, N'SAER', N'Salix eriocephala', N'Missouri River Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1528, N'SAET', N'Sabal etonia', N'Scrub Palmetto')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1529, N'SAEX', N'Salix exigua', N'Narrowleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1530, N'SAFL', N'Salix floridana', N'Florida Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1531, N'SAFR', N'Salix fragilis', N'Crack Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1532, N'SAGE2', N'Salix geyeriana', N'Geyer Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1533, N'SAGL', N'Salix glauca', N'Grayleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1534, N'SAGL5', N'Sapium glandulosum', N'Gumtree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1535, N'SAGLA', N'Salix glauca ssp. glauca var. acutifolia', N'Grayleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1536, N'SAGLC', N'Salix glauca ssp. callicarpaea', N'Grayleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1537, N'SAGLG', N'Salix glauca ssp. glauca', N'Grayleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1538, N'SAGLG2', N'Salix glauca ssp. glauca var. glauca', N'Grayleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1539, N'SAGLV', N'Salix glauca ssp. glauca var. villosa', N'Grayleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1540, N'SAGO', N'Salix gooddingii', N'Goodding''s Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1541, N'SAHO', N'Salix hookeriana', N'Dune Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1542, N'SAIN3', N'Salix interior', N'Sandbar Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1543, N'SAJA7', N'Salix ×jamesensis', N'James'' Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1544, N'SALA10', N'Salix ×laurentiana', N'Laurent''s Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1545, N'SALA6', N'Salix lasiolepis', N'Arroyo Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1546, N'SALAB', N'Salix lasiolepis var. bigelovii', N'Bigelow''s Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1547, N'SALAL2', N'Salix lasiolepis var. lasiolepis', N'Arroyo Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1548, N'SALI', N'Salix ligulifolia', N'Strapleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1549, N'SALU', N'Salix lucida', N'Shining Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1550, N'SALU2', N'Salix lutea', N'Yellow Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1551, N'SALUC', N'Salix lucida ssp. caudata', N'Greenleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1552, N'SALUL', N'Salix lucida ssp. lasiandra', N'Pacific Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1553, N'SALUL2', N'Salix lucida ssp. lucida', N'Shining Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1554, N'SAMA12', N'Salix maccalliana', N'Mccalla''s Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1555, N'SAME2', N'Salix melanopsis', N'Dusky Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1556, N'SAME8', N'Sabal mexicana', N'Rio Grande Palmetto')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1557, N'SAMI8', N'Sabal minor', N'Dwarf Palmetto')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1558, N'SAMO2', N'Salix monticola', N'Park Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1559, N'SAMU6', N'Sapindus mukorossi', N'Chinese Soapberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1560, N'SAMY', N'Salix myrtillifolia', N'Blueberry Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1561, N'SAMY2', N'Salix myricoides', N'Bayberry Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1562, N'SAMYA', N'Salix myricoides var. albovestita', N'Bayberry Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1563, N'SAMYM', N'Salix myricoides var. myricoides', N'Bayberry Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1564, N'SANI', N'Salix nigra', N'Black Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1565, N'SANI4', N'Sambucus nigra', N'Black Elderberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1566, N'SANIC4', N'Sambucus nigra ssp. canadensis', N'American Black Elderberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1567, N'SANIC5', N'Sambucus nigra ssp. cerulea', N'Blue Elderberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1568, N'SANIN2', N'Sambucus nigra ssp. nigra', N'European Black Elderberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1569, N'SAOB', N'Salix ×obtusata', N'Obtuse Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1570, N'SAPA', N'Sabal palmetto', N'Cabbage Palmetto')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1571, N'SAPE12', N'Salix ×pendulina', N'Wisconsin Weeping Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1572, N'SAPE3', N'Salix pellita', N'Satiny Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1573, N'SAPE4', N'Salix pentandra', N'Laurel Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1574, N'SAPE5', N'Salix petiolaris', N'Meadow Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1575, N'SAPL2', N'Salix planifolia', N'Diamondleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1576, N'SAPLP4', N'Salix planifolia ssp. planifolia', N'Diamondleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1577, N'SAPR3', N'Salix prolixa', N'Mackenzie''s Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1578, N'SAPS8', N'Salix pseudomyrsinites', N'Firmleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1579, N'SAPU15', N'Salix pulchra', N'Tealeaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1580, N'SAPU2', N'Salix purpurea', N'Purpleosier Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1581, N'SAPY', N'Salix pyrifolia', N'Balsam Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1582, N'SARA2', N'Sambucus racemosa', N'Red Elderberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1583, N'SARAM4', N'Sambucus racemosa var. melanocarpa', N'Rocky Mountain Elder')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1584, N'SARAR3', N'Sambucus racemosa var. racemosa', N'Red Elderberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1585, N'SARI4', N'Salix richardsonii', N'Richardson''s Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1586, N'SARU3', N'Salix ×rubens', N'Hybrid Crack Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1587, N'SASA10', N'Samanea saman', N'Raintree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1588, N'SASA4', N'Sapindus saponaria', N'Wingleaf Soapberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1589, N'SASAD', N'Sapindus saponaria var. drummondii', N'Western Soapberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1590, N'SASAS', N'Sapindus saponaria var. saponaria', N'Wingleaf Soapberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1591, N'SASC', N'Salix scouleriana', N'Scouler''s Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1592, N'SASE', N'Salix sericea', N'Silky Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1593, N'SASE10', N'Salix ×sepulcralis', N'Weeping Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1594, N'SASE2', N'Salix serissima', N'Autumn Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1595, N'SASE3', N'Salix sessilifolia', N'Northwest Sandbar Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1596, N'SASI2', N'Salix sitchensis', N'Sitka Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1597, N'SATA', N'Salix taxifolia', N'Yewleaf Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1598, N'SATR', N'Salix tracyi', N'Tracy''s Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1599, N'SAVI2', N'Salix viminalis', N'Basket Willow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1600, N'SCAC2', N'Schefflera actinophylla', N'Octopus Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1601, N'SCFR', N'Schaefferia frutescens', N'Florida Boxwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1602, N'SCLO2', N'Schinus longifolius', N'Longleaf Peppertree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1603, N'SCMO', N'Schinus molle', N'Peruvian Peppertree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1604, N'SCPO7', N'Schinus polygamus', N'Hardee Peppertree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1605, N'SCSC3', N'Schoepfia schreberi', N'Gulf Graytwig')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1606, N'SCTE', N'Schinus terebinthifolius', N'Brazilian Peppertree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1607, N'SCTER2', N'Schinus terebinthifolius var. raddianus', N'Brazilian Peppertree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1608, N'SEAL4', N'Senna alata', N'Emperor''s Candlesticks')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1609, N'SEBI9', N'Sebastiania bilocularis', N'Arrow Poision Plant')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1610, N'SECO9', N'Senna corymbosa', N'Argentine Senna')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1611, N'SEGI2', N'Sequoiadendron giganteum', N'Giant Sequoia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1612, N'SEGR5', N'Sesbania grandiflora', N'Vegetable Hummingbird')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1613, N'SEHI2', N'Senna hirsuta', N'Woolly Senna')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1614, N'SEME4', N'Senna mexicana', N'Mexican Senna')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1615, N'SEMEC', N'Senna mexicana var. chapmanii', N'Chapman''s Senna')
GO
print 'Processed 1600 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1616, N'SEMO6', N'Severinia monophylla', N'Chinese Boxorange')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1617, N'SEMU14', N'Senna multiglandulosa', N'Glandular Senna')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1618, N'SEPE4', N'Senna pendula', N'Valamuerto')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1619, N'SEPEG', N'Senna pendula var. glabrata', N'Valamuerto')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1620, N'SERE2', N'Serenoa repens', N'Saw Palmetto')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1621, N'SESE3', N'Sequoia sempervirens', N'Redwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1622, N'SESP9', N'Senna spectabilis', N'Casia Amarilla')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1623, N'SESU4', N'Senna surattensis', N'Glossy Shower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1624, N'SHAR', N'Shepherdia argentea', N'Silver Buffaloberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1625, N'SIAL13', N'Sideroxylon alachuense', N'Alachua Bully')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1626, N'SICE2', N'Sideroxylon celastrinum', N'Saffron Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1627, N'SIFO', N'Sideroxylon foetidissimum', N'False Mastic')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1628, N'SIGL3', N'Simarouba glauca', N'Paradisetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1629, N'SIGLL', N'Simarouba glauca var. latifolia', N'Paradisetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1630, N'SILA20', N'Sideroxylon lanuginosum', N'Gum Bully')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1631, N'SILAA4', N'Sideroxylon lanuginosum ssp. albicans', N'Gum Bully')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1632, N'SILAL3', N'Sideroxylon lanuginosum ssp. lanuginosum', N'Gum Bully')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1633, N'SILAO', N'Sideroxylon lanuginosum ssp. oblongifolium', N'Gum Bully')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1634, N'SILAR2', N'Sideroxylon lanuginosum ssp. rigidum', N'Gum Bully')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1635, N'SILY', N'Sideroxylon lycioides', N'Buckthorn Bully')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1636, N'SISA6', N'Sideroxylon salicifolium', N'White Bully')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1637, N'SITE2', N'Sideroxylon tenax', N'Tough Bully')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1638, N'SOAI', N'Sorbus airia', N'Winterbeam')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1639, N'SOAM3', N'Sorbus americana', N'American Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1640, N'SOAU', N'Sorbus aucuparia', N'European Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1641, N'SOBA', N'Solanum bahamense', N'Bahama Nightshade')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1642, N'SOBAB', N'Solanum bahamense var. bahamense', N'Bahama Nightshade')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1643, N'SODE3', N'Sorbus decora', N'Northern Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1644, N'SODO3', N'Solanum donianum', N'Mullein Nightshade')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1645, N'SOER2', N'Solanum erianthum', N'Potatotree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1646, N'SOGR2', N'Sorbus groenlandica', N'Greenland Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1647, N'SOHY3', N'Sorbus hybrida', N'Oakleaf Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1648, N'SOLE3', N'Sophora leachiana', N'Western Necklacepod')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1649, N'SOMA3', N'Solanum mauritianum', N'Earleaf Nightshade')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1650, N'SOSC2', N'Sorbus scopulina', N'Greene''s Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1651, N'SOSCC', N'Sorbus scopulina var. cascadensis', N'Cascade Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1652, N'SOSCS', N'Sorbus scopulina var. scopulina', N'Greene''s Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1653, N'SOSE3', N'Sophora secundiflora', N'Mescal Bean')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1654, N'SOSI2', N'Sorbus sitchensis', N'Western Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1655, N'SOSIG', N'Sorbus sitchensis var. grayi', N'Western Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1656, N'SOSIS2', N'Sorbus sitchensis var. sitchensis', N'Sitka Mountain Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1657, N'SOTA3', N'Solanum tampicense', N'Scrambling Nightshade')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1658, N'SOTO3', N'Sophora tomentosa', N'Yellow Necklacepod')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1659, N'SOTO4', N'Solanum torvum', N'Turkey Berry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1660, N'SOTOO', N'Sophora tomentosa var. occidentalis', N'Yellow Necklacepod')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1661, N'SOTOT', N'Sophora tomentosa var. truncata', N'Yellow Necklacepod')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1662, N'SPCA2', N'Spathodea campanulata', N'African Tuliptree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1663, N'SPPU', N'Spondias purpurea', N'Purple Mombin')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1664, N'STAF4', N'Styphnolobium affine', N'Eve''s Necklacepod')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1665, N'STAM4', N'Styrax americanus', N'American Snowbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1666, N'STBO', N'Staphylea bolanderi', N'Sierra Bladdernut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1667, N'STGR4', N'Styrax grandifolius', N'Bigleaf Snowbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1668, N'STJA5', N'Styrax japonicus', N'Japanese Snowbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1669, N'STJA9', N'Styphnolobium japonicum', N'Japanese Pagoda Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1670, N'STMA', N'Stewartia malacodendron', N'Silky Camellia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1671, N'STMA4', N'Strumpfia maritima', N'Pride Of Big Pine')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1672, N'STOV', N'Stewartia ovata', N'Mountain Camellia')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1673, N'STPL3', N'Styrax platanifolius', N'Sycamoreleaf Snowbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1674, N'STPLP2', N'Styrax platanifolius ssp. platanifolius', N'Sycamoreleaf Snowbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1675, N'STPLS2', N'Styrax platanifolius ssp. stellatus', N'Sycamoreleaf Snowbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1676, N'STRE4', N'Styrax redivivus', N'Drug Snowbell')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1677, N'STTH3', N'Stenocereus thurberi', N'Organpipe Cactus')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1678, N'STTR', N'Staphylea trifolia', N'American Bladdernut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1679, N'SUMA2', N'Suriana maritima', N'Bay Cedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1680, N'SWMA2', N'Swietenia mahagoni', N'West Indian Mahogany')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1681, N'SYCU', N'Syzygium cumini', N'Java Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1682, N'SYJA', N'Syzygium jambos', N'Malabar Plum')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1683, N'SYPA12', N'Symplocos paniculata', N'Sapphire-Berry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1684, N'SYPE4', N'Syringa pekinensis', N'Peking Tree Lilac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1685, N'SYRE2', N'Syringa reticulata', N'Japanese Tree Lilac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1686, N'SYREA', N'Syringa reticulata ssp. amurensis', N'Amur Lilac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1687, N'SYRER2', N'Syringa reticulata ssp. reticulata', N'Japanese Tree Lilac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1688, N'SYRO4', N'Syagrus romanzoffiana', N'Queen Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1689, N'SYTI', N'Symplocos tinctoria', N'Common Sweetleaf')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1690, N'TAAF', N'Tamarix africana', N'African Tamarisk')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1691, N'TAAL4', N'Tabernaemontana alba', N'White Milkwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1692, N'TAAP', N'Tamarix aphylla', N'Athel Tamarisk')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1693, N'TAAR6', N'Tamarix aralensis', N'Russian Tamarisk')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1694, N'TAAS', N'Taxodium ascendens', N'Pond Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1695, N'TAAU2', N'Tabebuia aurea', N'Caribbean Trumpet-Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1696, N'TABA80', N'Taxus baccata', N'English Yew')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1697, N'TABR2', N'Taxus brevifolia', N'Pacific Yew')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1698, N'TACA9', N'Tamarix canariensis', N'Canary Island Tamarisk')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1699, N'TACH2', N'Tamarix chinensis', N'Five-Stamen Tamarisk')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1700, N'TACU', N'Taxus cuspidata', N'Japanese Yew')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1701, N'TADI2', N'Taxodium distichum', N'Bald Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1702, N'TADI5', N'Tabernaemontana divaricata', N'Pinwheelflower')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1703, N'TAFL', N'Taxus floridana', N'Florida Yew')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1704, N'TAGA', N'Tamarix gallica', N'French Tamarisk')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1705, N'TAHE', N'Tabebuia heterophylla', N'White Cedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1706, N'TAIN2', N'Tamarindus indica', N'Tamarind')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1707, N'TAMU', N'Taxodium mucronatum', N'Montezuma Bald Cypress')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1708, N'TAPA4', N'Tamarix parviflora', N'Smallflower Tamarisk')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1709, N'TARA', N'Tamarix ramosissima', N'Saltcedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1710, N'TATE7', N'Tamarix tetragyna', N'Four-Stamen Tamarisk')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1711, N'TEBI', N'Tetrazygia bicolor', N'Florida Clover Ash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1712, N'TECA', N'Terminalia catappa', N'Tropical Almond')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1713, N'TEDA', N'Tetradium daniellii', N'Bee-Bee Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1714, N'TEMU2', N'Terminalia muelleri', N'Australian Almond')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1715, N'TEPA3', N'Tetrapanax papyrifer', N'Rice-Paper Plant')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1716, N'TEST', N'Tecoma stans', N'Yellow Trumpetbush')
GO
print 'Processed 1700 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1717, N'THMO4', N'Thrinax morrisii', N'Key Thatch Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1718, N'THOC2', N'Thuja occidentalis', N'Arborvitae')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1719, N'THPE3', N'Thevetia peruviana', N'Luckynut')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1720, N'THPL', N'Thuja plicata', N'Western Redcedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1721, N'THPO3', N'Thespesia populnea', N'Portia Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1722, N'THRA2', N'Thrinax radiata', N'Florida Thatch Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1723, N'TIAM', N'Tilia americana', N'American Basswood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1724, N'TIAMA', N'Tilia americana var. americana', N'American Basswood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1725, N'TIAMC', N'Tilia americana var. caroliniana', N'Carolina Basswood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1726, N'TIAMH', N'Tilia americana var. heterophylla', N'American Basswood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1727, N'TICO2', N'Tilia cordata', N'Littleleaf Linden')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1728, N'TIEU3', N'Tilia ×euchlora', N'Caucasian Lime')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1729, N'TIEU4', N'Tilia ×europaea', N'Common Linden')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1730, N'TIPE', N'Tilia petiolaris', N'Pendent Silver Linden')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1731, N'TIPL', N'Tilia platyphyllos', N'Largeleaf Linden')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1732, N'TOCA', N'Torreya californica', N'California Nutmeg')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1733, N'TOCI', N'Toona ciliata', N'Australian Redcedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1734, N'TOCIA', N'Toona ciliata ssp. ciliata var. australis', N'Australian Redcedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1735, N'TOCIC', N'Toona ciliata ssp. ciliata', N'Australian Redcedar')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1736, N'TOTA', N'Torreya taxifolia', N'Florida Nutmeg')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1737, N'TOVE', N'Toxicodendron vernix', N'Poison Sumac')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1738, N'TRLA2', N'Trema lamarckiana', N'Lamarck''s Trema')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1739, N'TRMI2', N'Trema micrantha', N'Jamaican Nettletree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1740, N'TRSE6', N'Triadica sebifera', N'Chinese Tallow')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1741, N'TRTR7', N'Triphasia trifolia', N'Limeberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1742, N'TSCA', N'Tsuga canadensis', N'Eastern Hemlock')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1743, N'TSCA2', N'Tsuga caroliniana', N'Carolina Hemlock')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1744, N'TSHE', N'Tsuga heterophylla', N'Western Hemlock')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1745, N'TSME', N'Tsuga mertensiana', N'Mountain Hemlock')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1746, N'ULAL', N'Ulmus alata', N'Winged Elm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1747, N'ULAM', N'Ulmus americana', N'American Elm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1748, N'ULCR', N'Ulmus crassifolia', N'Cedar Elm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1749, N'ULGL', N'Ulmus glabra', N'Wych Elm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1750, N'ULPA', N'Ulmus parvifolia', N'Chinese Elm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1751, N'ULPR', N'Ulmus procera', N'English Elm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1752, N'ULPU', N'Ulmus pumila', N'Siberian Elm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1753, N'ULRU', N'Ulmus rubra', N'Slippery Elm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1754, N'ULSE', N'Ulmus serotina', N'September Elm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1755, N'ULTH', N'Ulmus thomasii', N'Rock Elm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1756, N'UMCA', N'Umbellularia californica', N'California Laurel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1757, N'UMCAC', N'Umbellularia californica var. californica', N'California Laurel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1758, N'UMCAF', N'Umbellularia californica var. fresnensis', N'California Laurel')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1759, N'UNSP', N'Ungnadia speciosa', N'Mexican Buckeye')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1760, N'VAAN3', N'Vallesia antillana', N'Tearshrub')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1761, N'VAAR', N'Vaccinium arboreum', N'Farkleberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1762, N'VACA5', N'Vauquelinia californica', N'Arizona Rosewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1763, N'VACAC', N'Vauquelinia californica ssp. californica', N'Arizona Rosewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1764, N'VACAP', N'Vauquelinia californica ssp. pauciflora', N'Arizona Rosewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1765, N'VACAS', N'Vauquelinia californica ssp. sonorensis', N'Sonora Rosewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1766, N'VACO4', N'Vauquelinia corymbosa', N'Slimleaf Rosewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1767, N'VACOA', N'Vauquelinia corymbosa ssp. angustifolia', N'Slimleaf Rosewood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1768, N'VEFO', N'Vernicia fordii', N'Tungoil Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1769, N'VIAG', N'Vitex agnus-castus', N'Lilac Chastetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1770, N'VIAGA', N'Vitex agnus-castus var. agnus-castus', N'Lilac Chastetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1771, N'VIAGC', N'Vitex agnus-castus var. caerulea', N'Lilac Chastetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1772, N'VIDE', N'Viburnum dentatum', N'Southern Arrowwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1773, N'VIDED4', N'Viburnum dentatum var. dentatum', N'Southern Arrowwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1774, N'VIDEV', N'Viburnum dentatum var. venosum', N'Southern Arrowwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1775, N'VILA', N'Viburnum lantana', N'Wayfaringtree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1776, N'VILE', N'Viburnum lentago', N'Nannyberry')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1777, N'VINE2', N'Vitex negundo', N'Chinese Chastetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1778, N'VINEH', N'Vitex negundo var. heterophylla', N'Chinese Chastetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1779, N'VINEI', N'Vitex negundo var. intermedia', N'Chinese Chastetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1780, N'VINEN', N'Vitex negundo var. negundo', N'Chinese Chastetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1781, N'VINU', N'Viburnum nudum', N'Possumhaw')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1782, N'VINUC', N'Viburnum nudum var. cassinoides', N'Withe-Rod')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1783, N'VINUN', N'Viburnum nudum var. nudum', N'Possumhaw')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1784, N'VIOB', N'Viburnum obovatum', N'Small-Leaf Arrowwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1785, N'VIOP', N'Viburnum opulus', N'European Cranberrybush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1786, N'VIOPA2', N'Viburnum opulus var. americanum', N'American Cranberrybush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1787, N'VIOPO', N'Viburnum opulus var. opulus', N'European Cranberrybush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1788, N'VIPR', N'Viburnum prunifolium', N'Blackhaw')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1789, N'VIRE7', N'Viburnum recognitum', N'Southern Arrowwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1790, N'VIRU', N'Viburnum rufidulum', N'Rusty Blackhaw')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1791, N'VISI', N'Viburnum sieboldii', N'Siebold''s Arrowwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1792, N'VITR7', N'Vitex trifolia', N'Simpleleaf Chastetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1793, N'VITRS', N'Vitex trifolia var. subtrisecta', N'Simpleleaf Chastetree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1794, N'WAFI', N'Washingtonia filifera', N'California Fan Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1795, N'WARO', N'Washingtonia robusta', N'Washington Fan Palm')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1796, N'XIAM', N'Ximenia americana', N'Tallow Wood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1797, N'XYCO7', N'Xylosma congestum', N'Dense Logwood')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1798, N'XYFL3', N'Xylosma flexuosa', N'Brushholly')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1799, N'YUAL', N'Yucca aloifolia', N'Aloe Yucca')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1800, N'YUBR', N'Yucca brevifolia', N'Joshua Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1801, N'YUBRB', N'Yucca brevifolia var. brevifolia', N'Joshua Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1802, N'YUBRJ', N'Yucca brevifolia var. jaegeriana', N'Jaeger''s Joshua Tree')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1803, N'YUEL', N'Yucca elata', N'Soaptree Yucca')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1804, N'YUFA', N'Yucca faxoniana', N'Eve''s Needle')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1805, N'YUGL2', N'Yucca gloriosa', N'Moundlily Yucca')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1806, N'YUSC', N'Yucca ×schottii', N'Schott''s Yucca')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1807, N'YUSC2', N'Yucca schidigera', N'Mojave Yucca')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1808, N'YUTH', N'Yucca thompsoniana', N'Thompson''s Yucca')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1809, N'YUTO', N'Yucca torreyi', N'Torrey''s Yucca')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1810, N'YUTR', N'Yucca treculeana', N'Don Quixote''s Lace')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1811, N'YUTRS', N'Yucca treculeana var. succulenta', N'Don Quixote''s Lace')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1812, N'YUTRT', N'Yucca treculeana var. treculeana', N'Don Quixote''s Lace')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1813, N'ZAAM', N'Zanthoxylum americanum', N'Common Pricklyash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1814, N'ZACL', N'Zanthoxylum clava-herculis', N'Hercules'' Club')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1815, N'ZACO', N'Zanthoxylum coriaceum', N'Biscayne Pricklyash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1816, N'ZAFA', N'Zanthoxylum fagara', N'Lime Pricklyash')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1817, N'ZAFL', N'Zanthoxylum flavum', N'West Indian Satinwood')
GO
print 'Processed 1800 total records'
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1818, N'ZAHI2', N'Zanthoxylum hirsutum', N'Texas Hercules'' Club')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1819, N'ZESE80', N'Zelkova serrata', N'Japanese Zelkova')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1820, N'ZIMA', N'Ziziphus mauritiana', N'Indian Jujube')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1821, N'ZIOB', N'Ziziphus obtusifolia', N'Lotebush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1822, N'ZIOBC', N'Ziziphus obtusifolia var. canescens', N'Lotebush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1823, N'ZIOBO', N'Ziziphus obtusifolia var. obtusifolia', N'Lotebush')
INSERT [Trees].[KnownSpecies] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1824, N'ZIZI', N'Ziziphus zizyphus', N'Common Jujube')
SET IDENTITY_INSERT [Trees].[KnownSpecies] OFF
/****** Object:  View [ValueObjects].[DistanceFormats]    Script Date: 03/08/2011 21:51:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
create VIEW [ValueObjects].[DistanceFormats]
AS

select 0 as Id, 'Invalid' Format
union
select 1 as Id, 'Unspecified' Format
union
select 2 as Id, 'Default' Format
union
select 3 as Id, 'FeetDecimalInches' Format
union
select 4 as Id, 'DecimalFeet' Format
union
select 5 as Id, 'DecimalInches' Format
union
select 6 as Id, 'DecimalMeters' Format
union
select 7 as Id, 'DecimalYards' Format
GO
/****** Object:  UserDefinedFunction [Helpers].[DistanceEuclidean]    Script Date: 03/08/2011 21:51:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
create FUNCTION [Helpers].[DistanceEuclidean]
(
	-- Add the parameters for the function here
	@x1 real,
	@y1 real,
	@x2 real,
	@y2 real
)
RETURNS real
AS
BEGIN
	-- Declare the return variable here
	return sqrt(
		square(@x1 - @x2) 
		+ square(@y1 - @y2)
	)

END
GO
/****** Object:  Table [Locations].[Countries]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Locations].[Countries](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[DoubleLetterCode] [char](2) NOT NULL,
	[TripleLetterCode] [char](3) NOT NULL,
	[Name] [varchar](50) NOT NULL,
	[NELatitude] [real] NOT NULL,
	[NELongitude] [real] NOT NULL,
	[SWLatitude] [real] NOT NULL,
	[SWLongitude] [real] NOT NULL,
 CONSTRAINT [PK_Countries] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO
SET IDENTITY_INSERT [Locations].[Countries] ON
INSERT [Locations].[Countries] ([Id], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (1, N'US', N'USA', N'United States', 49.3833351, -66.88333, 24.5, -124.76667)
INSERT [Locations].[Countries] ([Id], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (2, N'CA', N'CAN', N'Canada', 0, 0, 0, 0)
INSERT [Locations].[Countries] ([Id], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (3, N'MX', N'MEX', N'Mexico', 0, 0, 0, 0)
SET IDENTITY_INSERT [Locations].[Countries] OFF
/****** Object:  Table [Photos].[Stores]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Photos].[Stores](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Type] [int] NOT NULL,
	[IsActive] [bit] NOT NULL,
	[RootPath] [varchar](50) NULL,
 CONSTRAINT [PK_Stores] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO
SET IDENTITY_INSERT [Photos].[Stores] ON
INSERT [Photos].[Stores] ([Id], [Type], [IsActive], [RootPath]) VALUES (3, 2, 1, N'\\Server1\PhotoStore\rev179')
SET IDENTITY_INSERT [Photos].[Stores] OFF
/****** Object:  Table [Locations].[States]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Locations].[States](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CountryId] [int] NOT NULL,
	[DoubleLetterCode] [char](2) NOT NULL,
	[TripleLetterCode] [char](3) NOT NULL,
	[Name] [varchar](50) NOT NULL,
	[NELatitude] [real] NOT NULL,
	[NELongitude] [real] NOT NULL,
	[SWLatitude] [real] NOT NULL,
	[SWLongitude] [real] NOT NULL,
 CONSTRAINT [PK_States] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO
SET IDENTITY_INSERT [Locations].[States] ON
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (1, 1, N'AL', N'   ', N'Alabama', 35, -84.86667, 30.25, -88.5)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (2, 1, N'AR', N'   ', N'Arkansas', 36.5, -89.61667, 33, -94.61667)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (3, 1, N'AZ', N'   ', N'Arizona', 37, -109, 31.333334, -114.866669)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (4, 1, N'CA', N'   ', N'California', 42, -114.116669, 32.5333328, -124.416664)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (5, 1, N'CO', N'   ', N'Colorado', 41, -102, 37, -109.116669)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (6, 1, N'CT', N'   ', N'Connecticut', 42.05, -71.75, 41, -73.75)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (7, 1, N'DE', N'   ', N'Delaware', 39.85, -75, 38.45, -75.8)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (8, 1, N'FL', N'   ', N'Florida', 31, -80, 24.5, -87.61667)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (9, 1, N'GA', N'   ', N'Georgia', 35, -80.75, 30.35, -85.61667)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (10, 1, N'IA', N'   ', N'Iowa', 43.5, -90.11667, 40.3666649, -96.61667)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (11, 1, N'ID', N'   ', N'Idaho', 49, -111, 42, -117.25)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (12, 1, N'IL', N'   ', N'Illinois', 42.5, -87.5, 37, -91.5)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (13, 1, N'IN', N'   ', N'Indiana', 41.75, -84.75, 37.8666649, -88.11667)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (14, 1, N'KS', N'   ', N'Kansas', 40, -94.5833359, 37, -102.5)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (15, 1, N'KY', N'   ', N'Kentucky', 39.15, -81.95, 36.6166649, -89.5833359)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (16, 1, N'LA', N'   ', N'Louisiana', 33.0166664, -88.8166656, 28.916666, -94.05)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (17, 1, N'MA', N'   ', N'Massachusetts', 42.8666649, -69.9166641, 41.2166672, -73.51667)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (18, 1, N'MD', N'   ', N'Maryland', 39.75, -75, 37.8666649, -79.5)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (19, 1, N'ME', N'   ', N'Maine', 47.4666672, -66.88333, 42.9666672, -71.13333)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (20, 1, N'MI', N'   ', N'Michigan', 48.2833328, -82.36667, 41.7, -90.5)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (21, 1, N'MN', N'   ', N'Minnesota', 49.3833351, -89.5, 43.5, -97.25)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (22, 1, N'MO', N'   ', N'Missouri', 40.6166649, -89.1, 36, -95.78333)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (23, 1, N'MS', N'   ', N'Mississippi', 35, -88.11667, 30, -91.63333)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (24, 1, N'MT', N'   ', N'Montana', 49, -104.033333, 44.3666649, -116.05)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (25, 1, N'NC', N'   ', N'North Carolina', 36.6, -75.4166641, 33.85, -84.3333359)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (26, 1, N'ND', N'   ', N'North Dakota', 49, -96.55, 45.9333344, -104.05)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (27, 1, N'NE', N'   ', N'Nebraska', 43, -95.3166656, 40, -104.05)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (28, 1, N'NH', N'   ', N'New Hampshire', 45.35, -70.5833359, 42.7, -72.5666656)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (29, 1, N'NJ', N'   ', N'New Jersey', 41.3666649, -73.86667, 38.9166679, -75.55)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (30, 1, N'NM', N'   ', N'New Mexico', 37, -103, 31.333334, -109.05)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (31, 1, N'NV', N'   ', N'Nevada', 42, -114.05, 35, -120)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (32, 1, N'NY', N'   ', N'New York', 45.0166664, -71.86667, 40.5, -79.76667)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (33, 1, N'OH', N'   ', N'Ohio', 42, -80.51667, 38.4, -84.8166656)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (34, 1, N'OK', N'   ', N'Oklahoma', 37, -94.4333344, 33.6166649, -103)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (35, 1, N'OR', N'   ', N'Oregon', 46.2666664, -116.45, 42, -124.583336)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (36, 1, N'PA', N'   ', N'Pennsylvania', 42.2666664, -74.6833344, 39.7166672, -80.51667)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (37, 1, N'RI', N'   ', N'Rhode Island', 42.0166664, -71.11667, 41.1333351, -71.9166641)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (38, 1, N'SC', N'   ', N'South Carolina', 35.2166672, -78.51667, 32, -83.36667)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (39, 1, N'SD', N'   ', N'South Dakota', 45.9333344, -96.4333344, 42.4833336, -104.05)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (40, 1, N'TN', N'   ', N'Tennessee', 36.6833344, -81.63333, 34.9666672, -90.3166656)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (41, 1, N'TX', N'   ', N'Texas', 36.5, -93.5, 25.833334, -105.65)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (42, 1, N'UT', N'   ', N'Utah', 42, -109, 37, -114.05)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (43, 1, N'VA', N'   ', N'Virginia', 39.4666672, -75.25, 36.5333328, -83.6833344)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (44, 1, N'VT', N'   ', N'Vermont', 45, -71.46667, 42.7166672, -73.6)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (45, 1, N'WA', N'   ', N'Washington', 49, -116.916664, 45.5333328, -124.76667)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (46, 1, N'WI', N'   ', N'Wisconsin', 47.1166649, -86.75, 42.5, -92.9)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (47, 1, N'WV', N'   ', N'West Virginia', 40.6333351, -77.73333, 37.2, -82.65)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (48, 1, N'WY', N'   ', N'Wyoming', 45, -104, 41, -111.1)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (49, 2, N'AB', N'   ', N'Alberta', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (50, 2, N'BC', N'   ', N'British Columbia', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (51, 2, N'MB', N'   ', N'Manitoba', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (52, 2, N'NB', N'   ', N'New Brunswick', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (53, 2, N'NL', N'   ', N'Newfoundland and Labrador', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (54, 2, N'NT', N'   ', N'Northwest Territories', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (55, 2, N'NS', N'   ', N'Nova Scotia', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (56, 2, N'NU', N'   ', N'Nunavut', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (57, 2, N'ON', N'   ', N'Ontario', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (58, 2, N'PE', N'   ', N'Prince Edward Island', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (59, 2, N'QC', N'   ', N'Quebec', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (60, 2, N'SK', N'   ', N'Saskatchewan', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (61, 2, N'YT', N'   ', N'Yukon', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (62, 1, N'AK', N'   ', N'Alaska', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (63, 1, N'HI', N'   ', N'Hawaii', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (64, 1, N'DC', N'   ', N'District of Columbia', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (65, 1, N'AS', N'   ', N'American Samoa', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (66, 1, N'GU', N'   ', N'Guam', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (67, 1, N'MP', N'   ', N'Northern Mariana Islands', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (68, 1, N'PR', N'   ', N'Puerto Rico', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (69, 1, N'UM', N'   ', N'Minor Outlying Islands', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (70, 1, N'VI', N'   ', N'Virgin Islands', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (71, 3, N'  ', N'DIF', N'Distrito Federal', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (72, 3, N'  ', N'AGU', N'Aguascalientes', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (73, 3, N'  ', N'BCN', N'Baja California', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (74, 3, N'  ', N'BCS', N'Baja California Sur', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (75, 3, N'  ', N'CAM', N'Campeche', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (76, 3, N'  ', N'COA', N'Coahuila', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (77, 3, N'  ', N'COL', N'Colima', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (78, 3, N'  ', N'CHP', N'Chiapas', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (79, 3, N'  ', N'CHH', N'Chihuahua', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (80, 3, N'  ', N'DUR', N'Durango', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (81, 3, N'  ', N'GUA', N'Guanajuato', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (82, 3, N'  ', N'GRO', N'Guerrero', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (83, 3, N'  ', N'HID', N'Hidalgo', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (84, 3, N'  ', N'JAL', N'Jalisco', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (85, 3, N'  ', N'MEX', N'Mexico', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (86, 3, N'  ', N'MIC', N'Michoacan', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (87, 3, N'  ', N'MOR', N'Morelos', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (88, 3, N'  ', N'NAY', N'Nayarit', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (89, 3, N'  ', N'NLE', N'Nuevo Leon', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (90, 3, N'  ', N'OAX', N'Oaxaca', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (91, 3, N'  ', N'PUE', N'Puebla', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (92, 3, N'  ', N'QUE', N'Queretaro', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (93, 3, N'  ', N'ROO', N'Quintana Roo', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (94, 3, N'  ', N'SLP', N'San Luis Potosi', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (95, 3, N'  ', N'SIN', N'Sinaloa', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (96, 3, N'  ', N'SON', N'Sonora', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (97, 3, N'  ', N'TAB', N'Tabasco', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (98, 3, N'  ', N'TAM', N'Tamaulipas', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (99, 3, N'  ', N'TLA', N'Tlaxcala', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (100, 3, N'  ', N'VER', N'Veracruz', 0, 0, 0, 0)
GO
print 'Processed 100 total records'
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (101, 3, N'  ', N'YUC', N'Yucatan', 0, 0, 0, 0)
INSERT [Locations].[States] ([Id], [CountryId], [DoubleLetterCode], [TripleLetterCode], [Name], [NELatitude], [NELongitude], [SWLatitude], [SWLongitude]) VALUES (102, 3, N'  ', N'ZAC', N'Zacatecas', 0, 0, 0, 0)
SET IDENTITY_INSERT [Locations].[States] OFF
/****** Object:  Table [Sites].[Sites]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Sites].[Sites](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[LastVisited] [date] NOT NULL,
	[Name] [varchar](100) NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[CalculatedLatitude] [real] NOT NULL,
	[CalculatedLongitude] [real] NOT NULL,
	[RHI5] [real] NULL,
	[RHI10] [real] NULL,
	[RHI20] [real] NULL,
	[RGI5] [real] NULL,
	[RGI10] [real] NULL,
	[RGI20] [real] NULL,
	[TreesWithSpecifiedCoordinatesCount] [int] NOT NULL,
	[VisitCount] [int] NOT NULL,
	[SubsiteCount] [int] NOT NULL,
 CONSTRAINT [PK_Sites_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  UserDefinedFunction [Helpers].[ToTitleCase]    Script Date: 03/08/2011 21:51:45 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [Helpers].[ToTitleCase] (@input VARCHAR(4000) )
	RETURNS VARCHAR(4000)
AS
BEGIN
	DECLARE @index INT
	DECLARE @currentChar CHAR(1)
	DECLARE @output VARCHAR(255)
	
	SET @output = LOWER(@input)
	SET @index = 2
	SET @output = STUFF(@output, 1, 1,UPPER(SUBSTRING(@input,1,1)))
	
	WHILE @index <= LEN(@input)
	BEGIN
	
		SET @currentChar = SUBSTRING(@input, @index, 1)
		IF @currentChar IN (' ', ';', ':', '!', '?', ',', '.', '_', '-', '/', '&','''','(')
			IF @index + 1 <= LEN(@input)
				IF @currentChar != '''' OR UPPER(SUBSTRING(@input, @index + 1, 1)) != 'S'
					SET @output = STUFF(@output, @index + 1, 1,UPPER(SUBSTRING(@input, @index + 1, 1)))
		SET @index = @index + 1
		
	END
	
	RETURN ISNULL(@output,'')
END
GO
/****** Object:  Table [Users].[Users]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Users].[Users](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Email] [varchar](100) NOT NULL,
	[Firstname] [varchar](50) NOT NULL,
	[Lastname] [varchar](50) NOT NULL,
	[Roles] [tinyint] NOT NULL,
	[PasswordHash] [binary](32) NOT NULL,
	[PasswordNumerics] [int] NOT NULL,
	[PasswordUppercase] [int] NOT NULL,
	[PasswordLowercase] [int] NOT NULL,
	[PasswordSpecials] [int] NOT NULL,
	[PasswordLength] [int] NOT NULL,
	[Created] [datetime] NOT NULL,
	[LastActivity] [datetime] NOT NULL,
	[LastLogin] [datetime] NOT NULL,
	[EmailVerificationToken] [binary](32) NOT NULL,
	[RecentlyFailedLoginAttempts] [int] NOT NULL,
	[EmailVerified] [datetime] NULL,
	[LastFailedLoginAttempt] [datetime] NULL,
	[ForgottenPasswordAssistanceToken] [binary](32) NULL,
	[ForgottenPasswordAssistanceTokenIssued] [datetime] NULL,
	[ForgottenPasswordAssistanceTokenUsed] [datetime] NULL,
 CONSTRAINT [PK_Users] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO
CREATE UNIQUE NONCLUSTERED INDEX [IX_Users_Email] ON [Users].[Users] 
(
	[Email] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
GO
/****** Object:  Table [Photos].[Photos]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Photos].[Photos](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[StoreId] [int] NULL,
	[CreatorUserId] [int] NULL,
	[Created] [datetime] NOT NULL,
	[Width] [int] NOT NULL,
	[Height] [int] NOT NULL,
	[Bytes] [int] NOT NULL,
	[Format] [tinyint] NOT NULL,
 CONSTRAINT [PK_Photos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Imports].[Trips]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Imports].[Trips](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CreatorUserId] [int] NULL,
	[Created] [datetime] NOT NULL,
	[Imported] [datetime] NULL,
	[Name] [varchar](100) NOT NULL,
	[Date] [date] NULL,
	[Website] [varchar](100) NOT NULL,
	[PhotosAvailable] [bit] NOT NULL,
	[MeasurerContactInfo] [varchar](200) NOT NULL,
	[MakeMeasurerContactInfoPublic] [bit] NOT NULL,
	[DefaultLaserBrand] [varchar](100) NULL,
	[DefaultClinometerBrand] [varchar](100) NULL,
	[DefaultHeightMeasurementMethod] [tinyint] NOT NULL,
	[DefaultStateId] [int] NULL,
	[DefaultCounty] [varchar](100) NULL,
	[LastSaved] [datetime] NOT NULL,
 CONSTRAINT [PK_Trips] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Sites].[Subsites]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Sites].[Subsites](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SiteId] [int] NULL,
	[LastVisited] [date] NOT NULL,
	[Name] [varchar](100) NOT NULL,
	[StateId] [int] NOT NULL,
	[County] [varchar](100) NOT NULL,
	[OwnershipType] [varchar](100) NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[CalculatedLatitude] [real] NOT NULL,
	[CalculatedLongitude] [real] NOT NULL,
	[OwnershipContactInfo] [varchar](200) NOT NULL,
	[MakeOwnershipContactInfoPublic] [bit] NOT NULL,
	[RHI5] [real] NULL,
	[RHI10] [real] NULL,
	[RHI20] [real] NULL,
	[RGI5] [real] NULL,
	[RGI10] [real] NULL,
	[RGI20] [real] NULL,
	[TreesWithSpecifiedCoordinatesCount] [int] NOT NULL,
	[VisitCount] [int] NOT NULL,
 CONSTRAINT [PK_Subsites_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Imports].[Subsites]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Imports].[Subsites](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatorUserId] [int] NULL,
	[SiteId] [int] NOT NULL,
	[Name] [varchar](100) NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[StateId] [int] NULL,
	[County] [varchar](100) NOT NULL,
	[OwnershipType] [varchar](100) NOT NULL,
	[OwnershipContactInfo] [varchar](200) NOT NULL,
	[MakeOwnershipContactInfoPublic] [bit] NOT NULL,
	[Comments] [varchar](300) NOT NULL,
 CONSTRAINT [PK_Subsites_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Sites].[SiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Sites].[SiteVisits](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SiteId] [int] NULL,
	[ImportingTripId] [int] NULL,
	[Visited] [date] NOT NULL,
	[Name] [varchar](100) NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[CalculatedLatitude] [real] NOT NULL,
	[CalculatedLongitude] [real] NOT NULL,
	[Comments] [varchar](300) NOT NULL,
 CONSTRAINT [PK_SiteVisits] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Imports].[Measurers]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Imports].[Measurers](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TripId] [int] NULL,
	[FirstName] [varchar](50) NOT NULL,
	[LastName] [varchar](50) NOT NULL,
 CONSTRAINT [PK_Measurers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Trees].[Measurements]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trees].[Measurements](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TreeId] [int] NULL,
	[ImportingTripId] [int] NULL,
	[ComputedMeasuredSpeciesId]  AS (abs(CONVERT([int],hashbytes('MD5',lower(ltrim(rtrim([ScientificName])))),(0)))),
	[Measured] [date] NOT NULL,
	[CommonName] [varchar](100) NOT NULL,
	[ScientificName] [varchar](100) NOT NULL,
	[Height] [real] NOT NULL,
	[HeightInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementMethod] [tinyint] NOT NULL,
	[Girth] [real] NOT NULL,
	[GirthInputFormat] [tinyint] NOT NULL,
	[CrownSpread] [real] NOT NULL,
	[CrownSpreadInputFormat] [tinyint] NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[CalculatedLatitude] [real] NOT NULL,
	[CalculatedLongitude] [real] NOT NULL,
	[Elevation] [real] NOT NULL,
	[ElevationInputFormat] [tinyint] NOT NULL,
	[GeneralComments] [varchar](300) NOT NULL,
	[Diameter] [real] NOT NULL,
	[DiameterInputFormat] [tinyint] NOT NULL,
	[ENTSPTS] [real] NULL,
	[ConicalVolume] [real] NOT NULL,
	[ConicalVolumeInputFormat] [tinyint] NOT NULL,
	[ENTSPTS2] [real] NULL,
	[ChampionPoints] [real] NULL,
	[AbbreviatedChampionPoints] [real] NULL,
 CONSTRAINT [PK_TreeMeasurementss] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Trees].[Trees]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trees].[Trees](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SubsiteId] [int] NULL,
	[ComputedMeasuredSpeciesId]  AS (abs(CONVERT([int],hashbytes('MD5',lower(ltrim(rtrim([ScientificName])))),(0)))),
	[LastMeasured] [date] NOT NULL,
	[CommonName] [varchar](100) NOT NULL,
	[ScientificName] [varchar](100) NOT NULL,
	[Height] [real] NOT NULL,
	[HeightInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementMethod] [tinyint] NOT NULL,
	[Girth] [real] NOT NULL,
	[GirthInputFormat] [tinyint] NOT NULL,
	[CrownSpread] [real] NOT NULL,
	[CrownSpreadInputFormat] [tinyint] NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[CalculatedLatitude] [real] NOT NULL,
	[CalculatedLongitude] [real] NOT NULL,
	[Elevation] [real] NOT NULL,
	[ElevationInputFormat] [tinyint] NOT NULL,
	[Diameter] [real] NOT NULL,
	[DiameterInputFormat] [tinyint] NOT NULL,
	[ENTSPTS] [real] NULL,
	[ConicalVolume] [real] NOT NULL,
	[ConicalVolumeInputFormat] [tinyint] NOT NULL,
	[ENTSPTS2] [real] NULL,
	[ChampionPoints] [real] NULL,
	[AbbreviatedChampionPoints] [real] NULL,
 CONSTRAINT [PK_Trees] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Imports].[Trees]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Imports].[Trees](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatorUserId] [int] NULL,
	[SubsiteId] [int] NOT NULL,
	[Type] [tinyint] NOT NULL,
	[TreeName] [varchar](100) NOT NULL,
	[TreeNumber] [int] NULL,
	[CommonName] [varchar](100) NOT NULL,
	[ScientificName] [varchar](100) NOT NULL,
	[Status] [tinyint] NOT NULL,
	[HealthStatus] [varchar](100) NOT NULL,
	[AgeClass] [tinyint] NOT NULL,
	[AgeType] [tinyint] NOT NULL,
	[Age] [int] NULL,
	[GeneralComments] [varchar](300) NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[MakeCoordinatesPublic] [bit] NOT NULL,
	[Elevation] [real] NOT NULL,
	[ElevationInputFormat] [tinyint] NOT NULL,
	[Height] [real] NOT NULL,
	[HeightInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementMethod] [tinyint] NOT NULL,
	[HeightMeasurementsDistanceTop] [real] NOT NULL,
	[HeightMeasurementsDistanceTopInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementsAngleTop] [real] NOT NULL,
	[HeightMeasurementsAngleTopInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementsDistanceBottom] [real] NOT NULL,
	[HeightMeasurementsDistanceBottomInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementsAngleBottom] [real] NOT NULL,
	[HeightMeasurementsAngleBottomInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementsVerticalOffset] [real] NOT NULL,
	[HeightMeasurementsVerticalOffsetInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementType] [varchar](100) NOT NULL,
	[LaserBrand] [varchar](100) NOT NULL,
	[ClinometerBrand] [varchar](100) NOT NULL,
	[HeightComments] [varchar](300) NOT NULL,
	[Girth] [real] NOT NULL,
	[GirthInputFormat] [tinyint] NOT NULL,
	[GirthMeasurementHeight] [real] NOT NULL,
	[GirthMeasurementHeightInputFormat] [tinyint] NOT NULL,
	[GirthRootCollarHeight] [real] NOT NULL,
	[GirthRootCollarHeightInputFormat] [tinyint] NOT NULL,
	[GirthComments] [varchar](300) NOT NULL,
	[CrownSpread] [real] NOT NULL,
	[CrownSpreadInputFormat] [tinyint] NOT NULL,
	[MaximumLimbLength] [real] NOT NULL,
	[MaximumLimbLengthInputFormat] [tinyint] NOT NULL,
	[CrownSpreadMeasurementMethod] [varchar](100) NOT NULL,
	[BaseCrownHeight] [real] NOT NULL,
	[BaseCrownHeightInputFormat] [tinyint] NOT NULL,
	[CrownVolume] [real] NOT NULL,
	[CrownVolumeInputFormat] [tinyint] NOT NULL,
	[CrownVolumeCalculationMethod] [varchar](100) NOT NULL,
	[CrownComments] [varchar](300) NOT NULL,
	[TrunkVolume] [real] NOT NULL,
	[TrunkVolumeInputFormat] [tinyint] NOT NULL,
	[TrunkVolumeCalculationMethod] [varchar](100) NOT NULL,
	[TrunkComments] [varchar](300) NOT NULL,
	[FormType] [tinyint] NOT NULL,
	[NumberOfTrunks] [int] NULL,
	[TreeFormComments] [varchar](300) NOT NULL,
	[TerrainType] [tinyint] NOT NULL,
	[TerrainShapeIndex] [real] NULL,
	[LandformIndex] [real] NULL,
	[TerrainComments] [varchar](300) NOT NULL,
	[CombinedGirthNumberOfTrunks] [int] NULL,
 CONSTRAINT [PK_Measurements] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Sites].[SubsiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Sites].[SubsiteVisits](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SubsiteId] [int] NULL,
	[ImportingTripId] [int] NULL,
	[Visited] [date] NOT NULL,
	[Name] [varchar](100) NOT NULL,
	[StateId] [int] NOT NULL,
	[County] [varchar](100) NOT NULL,
	[OwnershipType] [varchar](100) NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[CalculatedLatitude] [real] NOT NULL,
	[CalculatedLongitude] [real] NOT NULL,
	[OwnershipContactInfo] [varchar](200) NOT NULL,
	[MakeOwnershipContactInfoPublic] [bit] NOT NULL,
	[Comments] [varchar](300) NOT NULL,
 CONSTRAINT [PK_SubsiteVisits] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Imports].[Sites]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Imports].[Sites](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatorUserId] [int] NULL,
	[TripId] [int] NOT NULL,
	[Name] [varchar](100) NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[Comments] [varchar](300) NOT NULL,
 CONSTRAINT [PK_Sites] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Sites].[Visitors]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Sites].[Visitors](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SiteId] [int] NULL,
	[SiteVisitId] [int] NULL,
	[SubsiteId] [int] NULL,
	[SubsiteVisitId] [int] NULL,
	[FirstName] [varchar](50) NOT NULL,
	[LastName] [varchar](50) NOT NULL,
 CONSTRAINT [PK_Visitors] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Trees].[Measurers]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trees].[Measurers](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TreeId] [int] NULL,
	[MeasurementId] [int] NULL,
	[FirstName] [varchar](50) NOT NULL,
	[LastName] [varchar](50) NOT NULL,
 CONSTRAINT [PK_Measurers_1] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Imports].[Trunks]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Imports].[Trunks](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatorUserId] [int] NULL,
	[TreeId] [int] NOT NULL,
	[Girth] [real] NOT NULL,
	[GirthInputFormat] [tinyint] NOT NULL,
	[GirthMeasurementHeight] [real] NOT NULL,
	[GirthMeasurementHeightInputFormat] [tinyint] NOT NULL,
	[Height] [real] NOT NULL,
	[HeightInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementsDistanceTop] [real] NOT NULL,
	[HeightMeasurementsDistanceTopInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementsAngleTop] [real] NOT NULL,
	[HeightMeasurementsAngleTopInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementsDistanceBottom] [real] NOT NULL,
	[HeightMeasurementsDistanceBottomInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementsAngleBottom] [real] NOT NULL,
	[HeightMeasurementsAngleBottomInputFormat] [tinyint] NOT NULL,
	[HeightMeasurementsVerticalOffset] [real] NOT NULL,
	[HeightMeasurementsVerticalOffsetInputFormat] [tinyint] NOT NULL,
	[IncludeHeightDistanceAndAngleMeasurements] [bit] NOT NULL,
	[TrunkComments] [varchar](300) NOT NULL,
 CONSTRAINT [PK_TrunkMeasurements] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Photos].[References]    Script Date: 03/08/2011 21:51:43 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Photos].[References](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Type] [tinyint] NOT NULL,
	[ImportSubsiteId] [int] NULL,
	[ImportTreeId] [int] NULL,
	[SubsiteId] [int] NULL,
	[SubsiteVisitId] [int] NULL,
	[TreeId] [int] NULL,
	[TreeMeasurementId] [int] NULL,
	[PhotoId] [int] NOT NULL,
 CONSTRAINT [PK_References] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [Trees].[MeasuredSpeciesBySubsite]    Script Date: 03/08/2011 21:51:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [Trees].[MeasuredSpeciesBySubsite]
AS

select ABS(
		CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(ScientificName)))) as int)
		^ CAST(HASHBYTES('MD5', CAST(SubsiteId as varchar)) as int)
		) Id,
	SubsiteId,
	ScientificName, CommonName,
	MaxHeight, MaxHeightInputFormat, MaxHeightTreeId,
	MaxGirth, MaxGirthInputFormat, MaxGirthTreeId,
	MaxCrownSpread, MaxCrownSpreadInputFormat, MaxCrownSpreadTreeId,
	Number
from 
(
	select 
		t.ScientificName,
		t.SubsiteId,
		MAX(t.CommonName) CommonName,
		MAX(t.Height) MaxHeight,
		case MAX(t.Height)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxHeightInputFormat,
		case MAX(t.Height)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.Height = MAX(t.Height)
			)
		end MaxHeightTreeId,
		MAX(t.Girth) MaxGirth,
		case MAX(t.Girth)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxGirthInputFormat,
		case MAX(t.Girth)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.Girth = MAX(t.Girth)
			)
		end MaxGirthTreeId,
		MAX(t.CrownSpread) MaxCrownSpread,
		case MAX(t.CrownSpread)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxCrownSpreadInputFormat,
		case MAX(t.CrownSpread)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.CrownSpread = MAX(t.CrownSpread)
			)
		end MaxCrownSpreadTreeId,
		COUNT(*) Number
	from Trees.Trees t		
	group by t.ScientificName, t.SubsiteId
) mt
GO
/****** Object:  View [Trees].[MeasuredSpeciesByState]    Script Date: 03/08/2011 21:51:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [Trees].[MeasuredSpeciesByState]
AS

select ABS(
		CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(ScientificName)))) as int)
		^ CAST(HASHBYTES('MD5', CAST(StateId as varchar)) as int)
		) Id,
	StateId,
	ScientificName, CommonName,
	MaxHeight, MaxHeightInputFormat, MaxHeightTreeId,
	MaxGirth, MaxGirthInputFormat, MaxGirthTreeId,
	MaxCrownSpread, MaxCrownSpreadInputFormat, MaxCrownSpreadTreeId,
	Number
from 
(
	select 
		t.ScientificName,
		ss.StateId,
		MAX(t.CommonName) CommonName,
		MAX(t.Height) MaxHeight,
		case MAX(t.Height)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxHeightInputFormat,
		case MAX(t.Height)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.Height = MAX(t.Height)
			)
		end MaxHeightTreeId,
		MAX(t.Girth) MaxGirth,
		case MAX(t.Girth)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxGirthInputFormat,
		case MAX(t.Girth)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.Girth = MAX(t.Girth)
			)
		end MaxGirthTreeId,
		MAX(t.CrownSpread) MaxCrownSpread,
		case MAX(t.CrownSpread)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxCrownSpreadInputFormat,
		case MAX(t.CrownSpread)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.CrownSpread = MAX(t.CrownSpread)
			)
		end MaxCrownSpreadTreeId,
		COUNT(*) Number
	from Trees.Trees t
	join Sites.Subsites ss
		on ss.Id = t.SubsiteId
	group by t.ScientificName, ss.StateId
) mt
GO
/****** Object:  View [Trees].[MeasuredSpeciesBySite]    Script Date: 03/08/2011 21:51:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [Trees].[MeasuredSpeciesBySite]
AS

select ABS(
		CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(ScientificName)))) as int)
		^ CAST(HASHBYTES('MD5', CAST(SiteId as varchar)) as int)
		) Id,
	SiteId,
	ScientificName, CommonName,
	MaxHeight, MaxHeightInputFormat, MaxHeightTreeId,
	MaxGirth, MaxGirthInputFormat, MaxGirthTreeId,
	MaxCrownSpread, MaxCrownSpreadInputFormat, MaxCrownSpreadTreeId,
	Number
from 
(
	select 
		t.ScientificName,
		ss.SiteId,
		MAX(t.CommonName) CommonName,
		MAX(t.Height) MaxHeight,
		case MAX(t.Height)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxHeightInputFormat,
		case MAX(t.Height)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.Height = MAX(t.Height)
			)
		end MaxHeightTreeId,
		MAX(t.Girth) MaxGirth,
		case MAX(t.Girth)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxGirthInputFormat,
		case MAX(t.Girth)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.Girth = MAX(t.Girth)
			)
		end MaxGirthTreeId,
		MAX(t.CrownSpread) MaxCrownSpread,
		case MAX(t.CrownSpread)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxCrownSpreadInputFormat,
		case MAX(t.CrownSpread)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.CrownSpread = MAX(t.CrownSpread)
			)
		end MaxCrownSpreadTreeId,
		COUNT(*) Number
	from Trees.Trees t		
	join Sites.Subsites ss
		on ss.Id = t.SubsiteId
	group by t.ScientificName, ss.SiteId
) mt
GO
/****** Object:  View [Trees].[MeasuredSpecies]    Script Date: 03/08/2011 21:51:46 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE VIEW [Trees].[MeasuredSpecies]
AS

select ABS(CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(ScientificName)))) as int)) Id,
	ScientificName, CommonName,
	MaxHeight, MaxHeightInputFormat, MaxHeightTreeId,
	MaxGirth, MaxGirthInputFormat, MaxGirthTreeId,
	MaxCrownSpread, MaxCrownSpreadInputFormat, MaxCrownSpreadTreeId,
	Number
from 
(
	select 
		t.ScientificName,
		MAX(t.CommonName) CommonName,
		MAX(t.Height) MaxHeight,
		case MAX(t.Height)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxHeightInputFormat,
		case MAX(t.Height)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.Height = MAX(t.Height)
			)
		end MaxHeightTreeId,
		MAX(t.Girth) MaxGirth,
		case MAX(t.Girth)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxGirthInputFormat,
		case MAX(t.Girth)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.Girth = MAX(t.Girth)
			)
		end MaxGirthTreeId,
		MAX(t.CrownSpread) MaxCrownSpread,
		case MAX(t.CrownSpread)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxCrownSpreadInputFormat,
		case MAX(t.CrownSpread)
			when 0 then null
			else 
			(
				select top 1 Id 
				from Trees.Trees t2
				where t2.ScientificName = t.ScientificName
					and t2.CrownSpread = MAX(t.CrownSpread)
			)
		end MaxCrownSpreadTreeId,
		COUNT(*) Number
	from Trees.Trees t
	group by t.ScientificName
) mt
GO
/****** Object:  Default [DF_SiteVisits_Created]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Sites] ADD  CONSTRAINT [DF_SiteVisits_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_SubsiteVisits_Created]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Subsites] ADD  CONSTRAINT [DF_SubsiteVisits_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_SubsiteVisits_MakeOwnershipContactInfoPublic]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Subsites] ADD  CONSTRAINT [DF_SubsiteVisits_MakeOwnershipContactInfoPublic]  DEFAULT ((0)) FOR [MakeOwnershipContactInfoPublic]
GO
/****** Object:  Default [DF_TreeMeasurements_Created]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trees] ADD  CONSTRAINT [DF_TreeMeasurements_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_TreeMeasurements_Type]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trees] ADD  CONSTRAINT [DF_TreeMeasurements_Type]  DEFAULT ((1)) FOR [Type]
GO
/****** Object:  Default [DF_TreeMeasurements_MakeCoordinatesPublic]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trees] ADD  CONSTRAINT [DF_TreeMeasurements_MakeCoordinatesPublic]  DEFAULT ((0)) FOR [MakeCoordinatesPublic]
GO
/****** Object:  Default [DF_TreeMeasurements_HeightMeasurementMethod]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trees] ADD  CONSTRAINT [DF_TreeMeasurements_HeightMeasurementMethod]  DEFAULT ((0)) FOR [HeightMeasurementMethod]
GO
/****** Object:  Default [DF_Trips_Created]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trips] ADD  CONSTRAINT [DF_Trips_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_Trips_MakeMeasurerContactInfoPublic]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trips] ADD  CONSTRAINT [DF_Trips_MakeMeasurerContactInfoPublic]  DEFAULT ((0)) FOR [MakeMeasurerContactInfoPublic]
GO
/****** Object:  Default [DF_Trips_DefaultHeightMeasurementMethod]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trips] ADD  CONSTRAINT [DF_Trips_DefaultHeightMeasurementMethod]  DEFAULT ((0)) FOR [DefaultHeightMeasurementMethod]
GO
/****** Object:  Default [DF_Trips_LastSaved]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trips] ADD  CONSTRAINT [DF_Trips_LastSaved]  DEFAULT (getdate()) FOR [LastSaved]
GO
/****** Object:  Default [DF_TrunkMeasurements_IncludeHeightDistanceAndAngleMeasurements]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trunks] ADD  CONSTRAINT [DF_TrunkMeasurements_IncludeHeightDistanceAndAngleMeasurements]  DEFAULT ((0)) FOR [IncludeHeightDistanceAndAngleMeasurements]
GO
/****** Object:  Default [DF_TrunkMeasurements_TrunkComments]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trunks] ADD  CONSTRAINT [DF_TrunkMeasurements_TrunkComments]  DEFAULT ('') FOR [TrunkComments]
GO
/****** Object:  Default [DF_States_CountryId]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_CountryId]  DEFAULT ((1)) FOR [CountryId]
GO
/****** Object:  Default [DF_States_NELatitude]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_NELatitude]  DEFAULT ((0)) FOR [NELatitude]
GO
/****** Object:  Default [DF_States_NELongitude]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_NELongitude]  DEFAULT ((0)) FOR [NELongitude]
GO
/****** Object:  Default [DF_States_SWLatitude]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_SWLatitude]  DEFAULT ((0)) FOR [SWLatitude]
GO
/****** Object:  Default [DF_States_SWLongitude]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_SWLongitude]  DEFAULT ((0)) FOR [SWLongitude]
GO
/****** Object:  Default [DF_Sites_SubsiteCount]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Sites] ADD  CONSTRAINT [DF_Sites_SubsiteCount]  DEFAULT ((1)) FOR [SubsiteCount]
GO
/****** Object:  Default [DF_Users_Email]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Email]  DEFAULT ('Anonymous') FOR [Email]
GO
/****** Object:  Default [DF_Users_Firstname]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Firstname]  DEFAULT ('') FOR [Firstname]
GO
/****** Object:  Default [DF_Users_Lastname]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Lastname]  DEFAULT ('') FOR [Lastname]
GO
/****** Object:  Default [DF_Users_UserRoles]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_UserRoles]  DEFAULT ((0)) FOR [Roles]
GO
/****** Object:  Default [DF_Users_PasswordHash]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordHash]  DEFAULT (0x00) FOR [PasswordHash]
GO
/****** Object:  Default [DF_Users_PasswordNumerics]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordNumerics]  DEFAULT ((0)) FOR [PasswordNumerics]
GO
/****** Object:  Default [DF_Users_PasswordUppercase]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordUppercase]  DEFAULT ((0)) FOR [PasswordUppercase]
GO
/****** Object:  Default [DF_Users_PasswordLowercase]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordLowercase]  DEFAULT ((0)) FOR [PasswordLowercase]
GO
/****** Object:  Default [DF_Users_PasswordSpecials]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordSpecials]  DEFAULT ((0)) FOR [PasswordSpecials]
GO
/****** Object:  Default [DF_Users_PasswordLength]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordLength]  DEFAULT ((0)) FOR [PasswordLength]
GO
/****** Object:  Default [DF_Users_Created]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_Users_LastActivity]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_LastActivity]  DEFAULT (getdate()) FOR [LastActivity]
GO
/****** Object:  Default [DF_Users_LastLogin]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_LastLogin]  DEFAULT (getdate()) FOR [LastLogin]
GO
/****** Object:  Default [DF_Users_EmailVerificationToken]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_EmailVerificationToken]  DEFAULT (0x00) FOR [EmailVerificationToken]
GO
/****** Object:  Default [DF_Users_RecentlyFailedLoginAttempts]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_RecentlyFailedLoginAttempts]  DEFAULT ((0)) FOR [RecentlyFailedLoginAttempts]
GO
/****** Object:  ForeignKey [FK_Measurers_Trips]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Measurers]  WITH CHECK ADD  CONSTRAINT [FK_Measurers_Trips] FOREIGN KEY([TripId])
REFERENCES [Imports].[Trips] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Imports].[Measurers] CHECK CONSTRAINT [FK_Measurers_Trips]
GO
/****** Object:  ForeignKey [FK_SitesVisits_Trips]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Sites]  WITH CHECK ADD  CONSTRAINT [FK_SitesVisits_Trips] FOREIGN KEY([TripId])
REFERENCES [Imports].[Trips] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Imports].[Sites] CHECK CONSTRAINT [FK_SitesVisits_Trips]
GO
/****** Object:  ForeignKey [FK_SiteVisits_Users]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Sites]  WITH CHECK ADD  CONSTRAINT [FK_SiteVisits_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Imports].[Sites] CHECK CONSTRAINT [FK_SiteVisits_Users]
GO
/****** Object:  ForeignKey [FK_SubsiteVisits_States]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Subsites]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_States] FOREIGN KEY([StateId])
REFERENCES [Locations].[States] ([Id])
GO
ALTER TABLE [Imports].[Subsites] CHECK CONSTRAINT [FK_SubsiteVisits_States]
GO
/****** Object:  ForeignKey [FK_TreeMeasurements_SubsiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trees]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurements_SubsiteVisits] FOREIGN KEY([SubsiteId])
REFERENCES [Imports].[Subsites] ([Id])
GO
ALTER TABLE [Imports].[Trees] CHECK CONSTRAINT [FK_TreeMeasurements_SubsiteVisits]
GO
/****** Object:  ForeignKey [FK_TreeMeasurements_Users]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trees]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurements_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Imports].[Trees] CHECK CONSTRAINT [FK_TreeMeasurements_Users]
GO
/****** Object:  ForeignKey [FK_Trips_States]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trips]  WITH CHECK ADD  CONSTRAINT [FK_Trips_States] FOREIGN KEY([DefaultStateId])
REFERENCES [Locations].[States] ([Id])
GO
ALTER TABLE [Imports].[Trips] CHECK CONSTRAINT [FK_Trips_States]
GO
/****** Object:  ForeignKey [FK_Trips_Users]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trips]  WITH CHECK ADD  CONSTRAINT [FK_Trips_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Imports].[Trips] CHECK CONSTRAINT [FK_Trips_Users]
GO
/****** Object:  ForeignKey [FK_TrunkMeasurements_TreeMeasurements1]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trunks]  WITH CHECK ADD  CONSTRAINT [FK_TrunkMeasurements_TreeMeasurements1] FOREIGN KEY([TreeId])
REFERENCES [Imports].[Trees] ([Id])
GO
ALTER TABLE [Imports].[Trunks] CHECK CONSTRAINT [FK_TrunkMeasurements_TreeMeasurements1]
GO
/****** Object:  ForeignKey [FK_TrunkMeasurements_Users]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Imports].[Trunks]  WITH CHECK ADD  CONSTRAINT [FK_TrunkMeasurements_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Imports].[Trunks] CHECK CONSTRAINT [FK_TrunkMeasurements_Users]
GO
/****** Object:  ForeignKey [FK_Photos_Stores]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[Photos]  WITH CHECK ADD  CONSTRAINT [FK_Photos_Stores] FOREIGN KEY([StoreId])
REFERENCES [Photos].[Stores] ([Id])
GO
ALTER TABLE [Photos].[Photos] CHECK CONSTRAINT [FK_Photos_Stores]
GO
/****** Object:  ForeignKey [FK_References_Measurements]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Measurements] FOREIGN KEY([TreeMeasurementId])
REFERENCES [Trees].[Measurements] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Measurements]
GO
/****** Object:  ForeignKey [FK_References_Subsites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Subsites] FOREIGN KEY([ImportSubsiteId])
REFERENCES [Imports].[Subsites] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Subsites]
GO
/****** Object:  ForeignKey [FK_References_Subsites1]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Subsites1] FOREIGN KEY([SubsiteId])
REFERENCES [Sites].[Subsites] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Subsites1]
GO
/****** Object:  ForeignKey [FK_References_SubsiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_SubsiteVisits] FOREIGN KEY([SubsiteVisitId])
REFERENCES [Sites].[SubsiteVisits] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_SubsiteVisits]
GO
/****** Object:  ForeignKey [FK_References_Trees]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Trees] FOREIGN KEY([ImportTreeId])
REFERENCES [Imports].[Trees] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Trees]
GO
/****** Object:  ForeignKey [FK_References_Trees1]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Trees1] FOREIGN KEY([TreeId])
REFERENCES [Trees].[Trees] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Trees1]
GO
/****** Object:  ForeignKey [FK_SiteVisits_Sites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[SiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SiteVisits_Sites] FOREIGN KEY([SiteId])
REFERENCES [Sites].[Sites] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Sites].[SiteVisits] CHECK CONSTRAINT [FK_SiteVisits_Sites]
GO
/****** Object:  ForeignKey [FK_SiteVisits_Trips]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[SiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SiteVisits_Trips] FOREIGN KEY([ImportingTripId])
REFERENCES [Imports].[Trips] ([Id])
GO
ALTER TABLE [Sites].[SiteVisits] CHECK CONSTRAINT [FK_SiteVisits_Trips]
GO
/****** Object:  ForeignKey [FK_Subsites_Sites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Subsites]  WITH CHECK ADD  CONSTRAINT [FK_Subsites_Sites] FOREIGN KEY([SiteId])
REFERENCES [Sites].[Sites] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Sites].[Subsites] CHECK CONSTRAINT [FK_Subsites_Sites]
GO
/****** Object:  ForeignKey [FK_Subsites_States]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Subsites]  WITH CHECK ADD  CONSTRAINT [FK_Subsites_States] FOREIGN KEY([StateId])
REFERENCES [Locations].[States] ([Id])
GO
ALTER TABLE [Sites].[Subsites] CHECK CONSTRAINT [FK_Subsites_States]
GO
/****** Object:  ForeignKey [FK_SubsiteVisits_States]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[SubsiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_States] FOREIGN KEY([StateId])
REFERENCES [Locations].[States] ([Id])
GO
ALTER TABLE [Sites].[SubsiteVisits] CHECK CONSTRAINT [FK_SubsiteVisits_States]
GO
/****** Object:  ForeignKey [FK_SubsiteVisits_Subsites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[SubsiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_Subsites] FOREIGN KEY([SubsiteId])
REFERENCES [Sites].[Subsites] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Sites].[SubsiteVisits] CHECK CONSTRAINT [FK_SubsiteVisits_Subsites]
GO
/****** Object:  ForeignKey [FK_SubsiteVisits_Trips]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[SubsiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_Trips] FOREIGN KEY([ImportingTripId])
REFERENCES [Imports].[Trips] ([Id])
GO
ALTER TABLE [Sites].[SubsiteVisits] CHECK CONSTRAINT [FK_SubsiteVisits_Trips]
GO
/****** Object:  ForeignKey [FK_Visitors_Sites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Visitors]  WITH CHECK ADD  CONSTRAINT [FK_Visitors_Sites] FOREIGN KEY([SiteId])
REFERENCES [Sites].[Sites] ([Id])
GO
ALTER TABLE [Sites].[Visitors] CHECK CONSTRAINT [FK_Visitors_Sites]
GO
/****** Object:  ForeignKey [FK_Visitors_SiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Visitors]  WITH CHECK ADD  CONSTRAINT [FK_Visitors_SiteVisits] FOREIGN KEY([SiteVisitId])
REFERENCES [Sites].[SiteVisits] ([Id])
GO
ALTER TABLE [Sites].[Visitors] CHECK CONSTRAINT [FK_Visitors_SiteVisits]
GO
/****** Object:  ForeignKey [FK_Visitors_Subsites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Visitors]  WITH CHECK ADD  CONSTRAINT [FK_Visitors_Subsites] FOREIGN KEY([SubsiteId])
REFERENCES [Sites].[Subsites] ([Id])
GO
ALTER TABLE [Sites].[Visitors] CHECK CONSTRAINT [FK_Visitors_Subsites]
GO
/****** Object:  ForeignKey [FK_Visitors_SubsiteVisits]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Sites].[Visitors]  WITH CHECK ADD  CONSTRAINT [FK_Visitors_SubsiteVisits] FOREIGN KEY([SubsiteVisitId])
REFERENCES [Sites].[SubsiteVisits] ([Id])
GO
ALTER TABLE [Sites].[Visitors] CHECK CONSTRAINT [FK_Visitors_SubsiteVisits]
GO
/****** Object:  ForeignKey [FK_TreeMeasurements_Trips]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Trees].[Measurements]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurements_Trips] FOREIGN KEY([ImportingTripId])
REFERENCES [Imports].[Trips] ([Id])
GO
ALTER TABLE [Trees].[Measurements] CHECK CONSTRAINT [FK_TreeMeasurements_Trips]
GO
/****** Object:  ForeignKey [FK_Measurers_Measurements]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Trees].[Measurers]  WITH CHECK ADD  CONSTRAINT [FK_Measurers_Measurements] FOREIGN KEY([MeasurementId])
REFERENCES [Trees].[Measurements] ([Id])
GO
ALTER TABLE [Trees].[Measurers] CHECK CONSTRAINT [FK_Measurers_Measurements]
GO
/****** Object:  ForeignKey [FK_Measurers_Trees]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Trees].[Measurers]  WITH CHECK ADD  CONSTRAINT [FK_Measurers_Trees] FOREIGN KEY([TreeId])
REFERENCES [Trees].[Trees] ([Id])
GO
ALTER TABLE [Trees].[Measurers] CHECK CONSTRAINT [FK_Measurers_Trees]
GO
/****** Object:  ForeignKey [FK_Trees_Subsites]    Script Date: 03/08/2011 21:51:43 ******/
ALTER TABLE [Trees].[Trees]  WITH CHECK ADD  CONSTRAINT [FK_Trees_Subsites] FOREIGN KEY([SubsiteId])
REFERENCES [Sites].[Subsites] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Trees].[Trees] CHECK CONSTRAINT [FK_Trees_Subsites]
GO
