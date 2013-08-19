ALTER TABLE [Trees].[Trees] DROP CONSTRAINT [FK_Trees_Subsites]
GO
ALTER TABLE [Trees].[Measurers] DROP CONSTRAINT [FK_Measurers_Trees]
GO
ALTER TABLE [Trees].[Measurers] DROP CONSTRAINT [FK_Measurers_Measurements]
GO
ALTER TABLE [Trees].[Measurements] DROP CONSTRAINT [FK_TreeMeasurements_Trips]
GO
ALTER TABLE [Sites].[Visitors] DROP CONSTRAINT [FK_Visitors_SubsiteVisits]
GO
ALTER TABLE [Sites].[Visitors] DROP CONSTRAINT [FK_Visitors_Subsites]
GO
ALTER TABLE [Sites].[Visitors] DROP CONSTRAINT [FK_Visitors_SiteVisits]
GO
ALTER TABLE [Sites].[Visitors] DROP CONSTRAINT [FK_Visitors_Sites]
GO
ALTER TABLE [Sites].[SubsiteVisits] DROP CONSTRAINT [FK_SubsiteVisits_Trips]
GO
ALTER TABLE [Sites].[SubsiteVisits] DROP CONSTRAINT [FK_SubsiteVisits_Subsites]
GO
ALTER TABLE [Sites].[SubsiteVisits] DROP CONSTRAINT [FK_SubsiteVisits_States]
GO
ALTER TABLE [Sites].[Subsites] DROP CONSTRAINT [FK_Subsites_States]
GO
ALTER TABLE [Sites].[Subsites] DROP CONSTRAINT [FK_Subsites_Sites]
GO
ALTER TABLE [Sites].[SiteVisits] DROP CONSTRAINT [FK_SiteVisits_Trips]
GO
ALTER TABLE [Sites].[SiteVisits] DROP CONSTRAINT [FK_SiteVisits_Sites]
GO
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Trees1]
GO
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Trees]
GO
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_SubsiteVisits]
GO
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Subsites1]
GO
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Subsites]
GO
ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Measurements]
GO
ALTER TABLE [Photos].[Photos] DROP CONSTRAINT [FK_Photos_Stores]
GO
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
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_RecentlyFailedLoginAttempts]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_EmailVerificationToken]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_LastLogin]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_LastActivity]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_Created]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordLength]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordSpecials]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordLowercase]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordUppercase]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordNumerics]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_PasswordHash]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_UserRoles]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_Lastname]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_Firstname]
GO
ALTER TABLE [Users].[Users] DROP CONSTRAINT [DF_Users_Email]
GO
ALTER TABLE [Sites].[SiteVisits] DROP CONSTRAINT [DF_SiteVisits_TripReportUrl]
GO
ALTER TABLE [Sites].[Sites] DROP CONSTRAINT [DF_Sites_SubsiteCount]
GO
ALTER TABLE [Locations].[States] DROP CONSTRAINT [DF_States_SWLongitude]
GO
ALTER TABLE [Locations].[States] DROP CONSTRAINT [DF_States_SWLatitude]
GO
ALTER TABLE [Locations].[States] DROP CONSTRAINT [DF_States_NELongitude]
GO
ALTER TABLE [Locations].[States] DROP CONSTRAINT [DF_States_NELatitude]
GO
ALTER TABLE [Locations].[States] DROP CONSTRAINT [DF_States_CountryId]
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
/****** Object:  Index [IX_Users_Email]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP INDEX [IX_Users_Email] ON [Users].[Users]
GO
/****** Object:  View [Locations].[VisitedStates]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP VIEW [Locations].[VisitedStates]
GO
/****** Object:  View [Trees].[MeasuredSpeciesBySite]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP VIEW [Trees].[MeasuredSpeciesBySite]
GO
/****** Object:  View [Trees].[MeasuredSpeciesBySubsite]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP VIEW [Trees].[MeasuredSpeciesBySubsite]
GO
/****** Object:  View [Trees].[MeasuredSpeciesByState]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP VIEW [Trees].[MeasuredSpeciesByState]
GO
/****** Object:  View [Trees].[MeasuredSpecies]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP VIEW [Trees].[MeasuredSpecies]
GO
/****** Object:  View [ValueObjects].[DistanceFormats]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP VIEW [ValueObjects].[DistanceFormats]
GO
/****** Object:  Table [Users].[Users]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Users].[Users]
GO
/****** Object:  Table [Trees].[Trees]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Trees].[Trees]
GO
/****** Object:  Table [Trees].[Measurers]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Trees].[Measurers]
GO
/****** Object:  Table [Trees].[Measurements]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Trees].[Measurements]
GO
/****** Object:  Table [Trees].[KnownSpecies]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Trees].[KnownSpecies]
GO
/****** Object:  Table [Sites].[Visitors]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Sites].[Visitors]
GO
/****** Object:  Table [Sites].[SubsiteVisits]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Sites].[SubsiteVisits]
GO
/****** Object:  Table [Sites].[Subsites]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Sites].[Subsites]
GO
/****** Object:  Table [Sites].[SiteVisits]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Sites].[SiteVisits]
GO
/****** Object:  Table [Sites].[Sites]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Sites].[Sites]
GO
/****** Object:  Table [Photos].[Stores]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Photos].[Stores]
GO
/****** Object:  Table [Photos].[References]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Photos].[References]
GO
/****** Object:  Table [Photos].[Photos]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Photos].[Photos]
GO
/****** Object:  Table [Logging].[Errors]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Logging].[Errors]
GO
/****** Object:  Table [Locations].[States]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Locations].[States]
GO
/****** Object:  Table [Locations].[Countries]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Locations].[Countries]
GO
/****** Object:  Table [Imports].[Trunks]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Imports].[Trunks]
GO
/****** Object:  Table [Imports].[Trips]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Imports].[Trips]
GO
/****** Object:  Table [Imports].[Trees]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Imports].[Trees]
GO
/****** Object:  Table [Imports].[Subsites]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Imports].[Subsites]
GO
/****** Object:  Table [Imports].[Sites]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Imports].[Sites]
GO
/****** Object:  Table [Imports].[Measurers]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP TABLE [Imports].[Measurers]
GO
/****** Object:  UserDefinedFunction [Helpers].[ToTitleCase]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP FUNCTION [Helpers].[ToTitleCase]
GO
/****** Object:  UserDefinedFunction [Helpers].[Max]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP FUNCTION [Helpers].[Max]
GO
/****** Object:  UserDefinedFunction [Helpers].[DistanceEuclidean]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP FUNCTION [Helpers].[DistanceEuclidean]
GO
/****** Object:  Schema [ValueObjects]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP SCHEMA [ValueObjects]
GO
/****** Object:  Schema [Users]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP SCHEMA [Users]
GO
/****** Object:  Schema [Trips]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP SCHEMA [Trips]
GO
/****** Object:  Schema [Trees]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP SCHEMA [Trees]
GO
/****** Object:  Schema [Sites]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP SCHEMA [Sites]
GO
/****** Object:  Schema [Photos]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP SCHEMA [Photos]
GO
/****** Object:  Schema [Logging]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP SCHEMA [Logging]
GO
/****** Object:  Schema [Locations]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP SCHEMA [Locations]
GO
/****** Object:  Schema [Imports]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP SCHEMA [Imports]
GO
/****** Object:  Schema [Helpers]    Script Date: 8/19/2013 5:09:38 PM ******/
DROP SCHEMA [Helpers]
GO