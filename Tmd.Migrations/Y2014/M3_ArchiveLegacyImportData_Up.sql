select * into LegacyImport_Trips from Imports.Trips
select * into LegacyImport_Measurers from Imports.Measurers
select * into LegacyImport_Sites from Imports.Sites
select * into LegacyImport_Subsites from Imports.Subsites
select * into LegacyImport_Trees from Imports.Trees
select * into LegacyImport_Trunks from Imports.Trunks

ALTER TABLE [Imports].[Trunks] DROP CONSTRAINT [FK_TrunkMeasurements_Users]
GO
ALTER TABLE [Imports].[Trunks] DROP CONSTRAINT [FK_TrunkMeasurements_TreeMeasurements1]
GO
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [FK_Trips_Users]
GO
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [FK_Trips_States]
GO
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [FK_TreeMeasurements_Users]
GO
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [FK_TreeMeasurements_SubsiteVisits]
GO
ALTER TABLE [Imports].[Subsites] DROP CONSTRAINT [FK_SubsiteVisits_States]
GO
ALTER TABLE [Imports].[Sites] DROP CONSTRAINT [FK_SiteVisits_Users]
GO
ALTER TABLE [Imports].[Sites] DROP CONSTRAINT [FK_SitesVisits_Trips]
GO
ALTER TABLE [Imports].[Measurers] DROP CONSTRAINT [FK_Measurers_Trips]
GO
ALTER TABLE [Imports].[Trunks] DROP CONSTRAINT [DF_TrunkMeasurements_TrunkComments]
GO
ALTER TABLE [Imports].[Trunks] DROP CONSTRAINT [DF_TrunkMeasurements_IncludeHeightDistanceAndAngleMeasurements]
GO
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [DF_Trips_LastSaved]
GO
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [DF_Trips_DefaultHeightMeasurementMethod]
GO
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [DF_Trips_MakeMeasurerContactInfoPublic]
GO
ALTER TABLE [Imports].[Trips] DROP CONSTRAINT [DF_Trips_Created]
GO
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [DF_TreeMeasurements_HeightMeasurementMethod]
GO
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [DF_TreeMeasurements_MakeCoordinatesPublic]
GO
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [DF_TreeMeasurements_Type]
GO
ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [DF_TreeMeasurements_Created]
GO
ALTER TABLE [Imports].[Subsites] DROP CONSTRAINT [DF_SubsiteVisits_MakeOwnershipContactInfoPublic]
GO
ALTER TABLE [Imports].[Subsites] DROP CONSTRAINT [DF_SubsiteVisits_Created]
GO
ALTER TABLE [Imports].[Sites] DROP CONSTRAINT [DF_SiteVisits_Created]
GO
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Trees]
GO
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Subsites]
GO
ALTER TABLE [Trees].[Measurements] DROP CONSTRAINT [FK_TreeMeasurements_Trips]
GO
ALTER TABLE [Sites].[SubsiteVisits] DROP CONSTRAINT [FK_SubsiteVisits_Trips]
GO
ALTER TABLE [Sites].[SiteVisits] DROP CONSTRAINT [FK_SiteVisits_Trips]
GO
/****** Object:  Table [Imports].[Trunks]    Script Date: 2/4/2014 9:40:46 PM ******/
DROP TABLE [Imports].[Trunks]
GO
/****** Object:  Table [Imports].[Trees]    Script Date: 2/4/2014 9:40:46 PM ******/
DROP TABLE [Imports].[Trees]
GO
/****** Object:  Table [Imports].[Subsites]    Script Date: 2/4/2014 9:40:46 PM ******/
DROP TABLE [Imports].[Subsites]
GO
/****** Object:  Table [Imports].[Sites]    Script Date: 2/4/2014 9:40:46 PM ******/
DROP TABLE [Imports].[Sites]
GO
/****** Object:  Table [Imports].[Measurers]    Script Date: 2/4/2014 9:40:46 PM ******/
DROP TABLE [Imports].[Measurers]
GO
/****** Object:  Table [Imports].[Trips]    Script Date: 2/4/2014 9:40:46 PM ******/
DROP TABLE [Imports].[Trips]
GO