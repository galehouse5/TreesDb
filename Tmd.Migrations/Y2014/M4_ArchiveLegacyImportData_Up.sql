CREATE TABLE [dbo].[LegacyImport_Trips](
	[Id] [int] NOT NULL,
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
	CONSTRAINT [PK_LegacyImport_Trips] PRIMARY KEY CLUSTERED ([Id] ASC)
)
GO

CREATE TABLE [dbo].[LegacyImport_Measurers](
	[Id] [int] NOT NULL,
	[TripId] [int] NULL,
	[FirstName] [varchar](50) NOT NULL,
	[LastName] [varchar](50) NOT NULL,
	CONSTRAINT [PK_LegacyImport_Measurers] PRIMARY KEY CLUSTERED ([Id] ASC)
)
GO

CREATE TABLE [dbo].[LegacyImport_Sites](
	[Id] [int] NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatorUserId] [int] NULL,
	[TripId] [int] NOT NULL,
	[Name] [varchar](100) NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[Comments] [varchar](300) NOT NULL,
	CONSTRAINT [PK_LegacyImport_Sites] PRIMARY KEY CLUSTERED ([Id] ASC)
)
GO

CREATE TABLE [dbo].[LegacyImport_Subsites](
	[Id] [int] NOT NULL,
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
	CONSTRAINT [PK_LegacyImport_Subsites] PRIMARY KEY CLUSTERED ([Id] ASC)
)
GO

CREATE TABLE [dbo].[LegacyImport_Trees](
	[Id] [int] NOT NULL,
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
	CONSTRAINT [PK_LegacyImport_Trees] PRIMARY KEY CLUSTERED ([Id] ASC)
)
GO

CREATE TABLE [dbo].[LegacyImport_Trunks](
	[Id] [int] NOT NULL,
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
	CONSTRAINT [PK_LegacyImport_Trunks] PRIMARY KEY CLUSTERED ([Id] ASC)
)
GO

CREATE TABLE [dbo].[LegacyImport_PhotoReferences](
	[Id] [int] NOT NULL,
	[Type] [tinyint] NOT NULL,
	[ImportSubsiteId] [int] NULL,
	[ImportTreeId] [int] NULL,
	[SubsiteId] [int] NULL,
	[SubsiteVisitId] [int] NULL,
	[TreeId] [int] NULL,
	[MeasurementId] [int] NULL,
	[PhotoFileId] [int] NOT NULL,
	CONSTRAINT [PK_LegacyImport_PhotoReferences] PRIMARY KEY CLUSTERED ([Id] ASC)
)
GO

CREATE TABLE [dbo].[LegacyImport_ExcelPhotos](
	[ID] [int] NOT NULL,
	[CreatorUserID] [int] NOT NULL,
	[Created] [datetime] NOT NULL,
	[SubsiteID] [int] NULL,
	[SubsiteName] [nvarchar](100) NULL,
	[TreeID] [int] NULL,
	[TreeName] [nvarchar](100) NULL,
	[Photographer] [nvarchar](100) NOT NULL,
	[Filename] [nvarchar](500) NOT NULL,
	CONSTRAINT [PK_LegacyImport_ExcelPhotos] PRIMARY KEY CLUSTERED ([ID] ASC)
)
GO

insert into dbo.LegacyImport_Trips select * from Imports.Trips
insert into dbo.LegacyImport_Measurers select * from Imports.Measurers
insert into dbo.LegacyImport_Sites select * from Imports.Sites
insert into dbo.LegacyImport_Subsites select * from Imports.Subsites
insert into dbo.LegacyImport_Trees select * from Imports.Trees
insert into dbo.LegacyImport_Trunks select * from Imports.Trunks
insert into dbo.LegacyImport_PhotoReferences select * from [dbo].[PhotoReferences] where [Type] in (2, 3)
insert into dbo.LegacyImport_ExcelPhotos select * from Imports.ExcelPhotos

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
ALTER TABLE [dbo].[PhotoReferences] DROP CONSTRAINT [FK_References_Trees]
GO
ALTER TABLE [dbo].[PhotoReferences] DROP CONSTRAINT [FK_References_Subsites]
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
DROP TABLE Imports.ExcelPhotos
GO

delete from [dbo].[PhotoReferences] where [Type] in (2, 3)

alter table [dbo].[PhotoReferences] drop column [ImportSubsiteId]
go
alter table [dbo].[PhotoReferences] drop column [ImportTreeId]
go