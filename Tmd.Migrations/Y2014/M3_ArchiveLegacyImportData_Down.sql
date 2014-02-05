/****** Object:  Table [Imports].[Measurers]    Script Date: 2/4/2014 10:06:46 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Imports].[Sites]    Script Date: 2/4/2014 10:06:47 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Imports].[Subsites]    Script Date: 2/4/2014 10:06:47 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Imports].[Trees]    Script Date: 2/4/2014 10:06:47 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Imports].[Trips]    Script Date: 2/4/2014 10:06:47 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Imports].[Trunks]    Script Date: 2/4/2014 10:06:47 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO
SET ANSI_PADDING OFF
GO
ALTER TABLE [Imports].[Sites] ADD  CONSTRAINT [DF_SiteVisits_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [Imports].[Subsites] ADD  CONSTRAINT [DF_SubsiteVisits_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [Imports].[Subsites] ADD  CONSTRAINT [DF_SubsiteVisits_MakeOwnershipContactInfoPublic]  DEFAULT ((0)) FOR [MakeOwnershipContactInfoPublic]
GO
ALTER TABLE [Imports].[Trees] ADD  CONSTRAINT [DF_TreeMeasurements_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [Imports].[Trees] ADD  CONSTRAINT [DF_TreeMeasurements_Type]  DEFAULT ((1)) FOR [Type]
GO
ALTER TABLE [Imports].[Trees] ADD  CONSTRAINT [DF_TreeMeasurements_MakeCoordinatesPublic]  DEFAULT ((0)) FOR [MakeCoordinatesPublic]
GO
ALTER TABLE [Imports].[Trees] ADD  CONSTRAINT [DF_TreeMeasurements_HeightMeasurementMethod]  DEFAULT ((0)) FOR [HeightMeasurementMethod]
GO
ALTER TABLE [Imports].[Trips] ADD  CONSTRAINT [DF_Trips_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [Imports].[Trips] ADD  CONSTRAINT [DF_Trips_MakeMeasurerContactInfoPublic]  DEFAULT ((0)) FOR [MakeMeasurerContactInfoPublic]
GO
ALTER TABLE [Imports].[Trips] ADD  CONSTRAINT [DF_Trips_DefaultHeightMeasurementMethod]  DEFAULT ((0)) FOR [DefaultHeightMeasurementMethod]
GO
ALTER TABLE [Imports].[Trips] ADD  CONSTRAINT [DF_Trips_LastSaved]  DEFAULT (getdate()) FOR [LastSaved]
GO
ALTER TABLE [Imports].[Trunks] ADD  CONSTRAINT [DF_TrunkMeasurements_IncludeHeightDistanceAndAngleMeasurements]  DEFAULT ((0)) FOR [IncludeHeightDistanceAndAngleMeasurements]
GO
ALTER TABLE [Imports].[Trunks] ADD  CONSTRAINT [DF_TrunkMeasurements_TrunkComments]  DEFAULT ('') FOR [TrunkComments]
GO
ALTER TABLE [Imports].[Measurers]  WITH CHECK ADD  CONSTRAINT [FK_Measurers_Trips] FOREIGN KEY([TripId])
REFERENCES [Imports].[Trips] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Imports].[Measurers] CHECK CONSTRAINT [FK_Measurers_Trips]
GO
ALTER TABLE [Imports].[Sites]  WITH CHECK ADD  CONSTRAINT [FK_SitesVisits_Trips] FOREIGN KEY([TripId])
REFERENCES [Imports].[Trips] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Imports].[Sites] CHECK CONSTRAINT [FK_SitesVisits_Trips]
GO
ALTER TABLE [Imports].[Sites]  WITH CHECK ADD  CONSTRAINT [FK_SiteVisits_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Imports].[Sites] CHECK CONSTRAINT [FK_SiteVisits_Users]
GO
ALTER TABLE [Imports].[Subsites]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_States] FOREIGN KEY([StateId])
REFERENCES [Locations].[States] ([Id])
GO
ALTER TABLE [Imports].[Subsites] CHECK CONSTRAINT [FK_SubsiteVisits_States]
GO
ALTER TABLE [Imports].[Trees]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurements_SubsiteVisits] FOREIGN KEY([SubsiteId])
REFERENCES [Imports].[Subsites] ([Id])
GO
ALTER TABLE [Imports].[Trees] CHECK CONSTRAINT [FK_TreeMeasurements_SubsiteVisits]
GO
ALTER TABLE [Imports].[Trees]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurements_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Imports].[Trees] CHECK CONSTRAINT [FK_TreeMeasurements_Users]
GO
ALTER TABLE [Imports].[Trips]  WITH CHECK ADD  CONSTRAINT [FK_Trips_States] FOREIGN KEY([DefaultStateId])
REFERENCES [Locations].[States] ([Id])
GO
ALTER TABLE [Imports].[Trips] CHECK CONSTRAINT [FK_Trips_States]
GO
ALTER TABLE [Imports].[Trips]  WITH CHECK ADD  CONSTRAINT [FK_Trips_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Imports].[Trips] CHECK CONSTRAINT [FK_Trips_Users]
GO
ALTER TABLE [Imports].[Trunks]  WITH CHECK ADD  CONSTRAINT [FK_TrunkMeasurements_TreeMeasurements1] FOREIGN KEY([TreeId])
REFERENCES [Imports].[Trees] ([Id])
GO
ALTER TABLE [Imports].[Trunks] CHECK CONSTRAINT [FK_TrunkMeasurements_TreeMeasurements1]
GO
ALTER TABLE [Imports].[Trunks]  WITH CHECK ADD  CONSTRAINT [FK_TrunkMeasurements_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Imports].[Trunks] CHECK CONSTRAINT [FK_TrunkMeasurements_Users]
GO

set identity_insert Imports.Trips on
insert into Imports.Trips ([Id], [CreatorUserId],[Created], [Imported], [Name], [Date], [Website], [PhotosAvailable], [MeasurerContactInfo], [MakeMeasurerContactInfoPublic], [DefaultLaserBrand], [DefaultClinometerBrand], [DefaultHeightMeasurementMethod], [DefaultStateId], [DefaultCounty], [LastSaved])
select [Id], [CreatorUserId], [Created], [Imported], [Name], [Date], [Website], [PhotosAvailable], [MeasurerContactInfo], [MakeMeasurerContactInfoPublic], [DefaultLaserBrand], [DefaultClinometerBrand], [DefaultHeightMeasurementMethod], [DefaultStateId], [DefaultCounty], [LastSaved]
from LegacyImport_Trips
set identity_insert Imports.Trips off

set identity_insert Imports.Measurers on
insert into Imports.Measurers ([Id], [TripId], [FirstName], [LastName])
select [Id], [TripId], [FirstName], [LastName]
from LegacyImport_Measurers
set identity_insert Imports.Measurers off

set identity_insert Imports.Sites on
insert into Imports.Sites ([Id], [Created], [CreatorUserId], [TripId], [Name], [Latitude], [LatitudeInputFormat], [Longitude], [LongitudeInputFormat], [Comments])
select [Id], [Created], [CreatorUserId], [TripId], [Name], [Latitude], [LatitudeInputFormat], [Longitude], [LongitudeInputFormat], [Comments]
from LegacyImport_Sites
set identity_insert Imports.Sites off

set identity_insert Imports.Subsites on
insert into Imports.Subsites ([Id], [Created], [CreatorUserId], [SiteId], [Name], [Latitude], [LatitudeInputFormat], [Longitude], [LongitudeInputFormat], [StateId], [County], [OwnershipType], [OwnershipContactInfo], [MakeOwnershipContactInfoPublic], [Comments])
select [Id], [Created], [CreatorUserId], [SiteId], [Name], [Latitude], [LatitudeInputFormat], [Longitude], [LongitudeInputFormat], [StateId], [County], [OwnershipType], [OwnershipContactInfo], [MakeOwnershipContactInfoPublic], [Comments]
from LegacyImport_Subsites
set identity_insert Imports.Subsites off

set identity_insert Imports.Trees on
insert into Imports.Trees ([Id], [Created], [CreatorUserId], [SubsiteId], [Type], [TreeName], [TreeNumber], [CommonName], [ScientificName], [Status], [HealthStatus], [AgeClass], [AgeType], [Age], [GeneralComments], [Latitude], [LatitudeInputFormat], [Longitude], [LongitudeInputFormat], [MakeCoordinatesPublic], [Elevation], [ElevationInputFormat], [Height], [HeightInputFormat], [HeightMeasurementMethod], [HeightMeasurementsDistanceTop], [HeightMeasurementsDistanceTopInputFormat], [HeightMeasurementsAngleTop], [HeightMeasurementsAngleTopInputFormat], [HeightMeasurementsDistanceBottom], [HeightMeasurementsDistanceBottomInputFormat], [HeightMeasurementsAngleBottom], [HeightMeasurementsAngleBottomInputFormat], [HeightMeasurementsVerticalOffset], [HeightMeasurementsVerticalOffsetInputFormat], [HeightMeasurementType], [LaserBrand], [ClinometerBrand], [HeightComments], [Girth], [GirthInputFormat], [GirthMeasurementHeight], [GirthMeasurementHeightInputFormat], [GirthRootCollarHeight], [GirthRootCollarHeightInputFormat], [GirthComments], [CrownSpread], [CrownSpreadInputFormat], [MaximumLimbLength], [MaximumLimbLengthInputFormat], [CrownSpreadMeasurementMethod], [BaseCrownHeight], [BaseCrownHeightInputFormat], [CrownVolume], [CrownVolumeInputFormat], [CrownVolumeCalculationMethod], [CrownComments], [TrunkVolume], [TrunkVolumeInputFormat], [TrunkVolumeCalculationMethod], [TrunkComments], [FormType], [NumberOfTrunks], [TreeFormComments], [TerrainType], [TerrainShapeIndex], [LandformIndex], [TerrainComments], [CombinedGirthNumberOfTrunks])
select [Id], [Created], [CreatorUserId], [SubsiteId], [Type], [TreeName], [TreeNumber], [CommonName], [ScientificName], [Status], [HealthStatus], [AgeClass], [AgeType], [Age], [GeneralComments], [Latitude], [LatitudeInputFormat], [Longitude], [LongitudeInputFormat], [MakeCoordinatesPublic], [Elevation], [ElevationInputFormat], [Height], [HeightInputFormat], [HeightMeasurementMethod], [HeightMeasurementsDistanceTop], [HeightMeasurementsDistanceTopInputFormat], [HeightMeasurementsAngleTop], [HeightMeasurementsAngleTopInputFormat], [HeightMeasurementsDistanceBottom], [HeightMeasurementsDistanceBottomInputFormat], [HeightMeasurementsAngleBottom], [HeightMeasurementsAngleBottomInputFormat], [HeightMeasurementsVerticalOffset], [HeightMeasurementsVerticalOffsetInputFormat], [HeightMeasurementType], [LaserBrand], [ClinometerBrand], [HeightComments], [Girth], [GirthInputFormat], [GirthMeasurementHeight], [GirthMeasurementHeightInputFormat], [GirthRootCollarHeight], [GirthRootCollarHeightInputFormat], [GirthComments], [CrownSpread], [CrownSpreadInputFormat], [MaximumLimbLength], [MaximumLimbLengthInputFormat], [CrownSpreadMeasurementMethod], [BaseCrownHeight], [BaseCrownHeightInputFormat], [CrownVolume], [CrownVolumeInputFormat], [CrownVolumeCalculationMethod], [CrownComments], [TrunkVolume], [TrunkVolumeInputFormat], [TrunkVolumeCalculationMethod], [TrunkComments], [FormType], [NumberOfTrunks], [TreeFormComments], [TerrainType], [TerrainShapeIndex], [LandformIndex], [TerrainComments], [CombinedGirthNumberOfTrunks]
from LegacyImport_Trees
set identity_insert Imports.Trees off

set identity_insert Imports.Trunks on
insert into Imports.Trunks ([Id], [Created], [CreatorUserId], [TreeId], [Girth], [GirthInputFormat], [GirthMeasurementHeight], [GirthMeasurementHeightInputFormat], [Height], [HeightInputFormat], [HeightMeasurementsDistanceTop], [HeightMeasurementsDistanceTopInputFormat], [HeightMeasurementsAngleTop], [HeightMeasurementsAngleTopInputFormat], [HeightMeasurementsDistanceBottom], [HeightMeasurementsDistanceBottomInputFormat], [HeightMeasurementsAngleBottom], [HeightMeasurementsAngleBottomInputFormat], [HeightMeasurementsVerticalOffset], [HeightMeasurementsVerticalOffsetInputFormat], [IncludeHeightDistanceAndAngleMeasurements], [TrunkComments])
select [Id], [Created], [CreatorUserId], [TreeId], [Girth], [GirthInputFormat], [GirthMeasurementHeight], [GirthMeasurementHeightInputFormat], [Height], [HeightInputFormat], [HeightMeasurementsDistanceTop], [HeightMeasurementsDistanceTopInputFormat], [HeightMeasurementsAngleTop], [HeightMeasurementsAngleTopInputFormat], [HeightMeasurementsDistanceBottom], [HeightMeasurementsDistanceBottomInputFormat], [HeightMeasurementsAngleBottom], [HeightMeasurementsAngleBottomInputFormat], [HeightMeasurementsVerticalOffset], [HeightMeasurementsVerticalOffsetInputFormat], [IncludeHeightDistanceAndAngleMeasurements], [TrunkComments]
from LegacyImport_Trunks
set identity_insert Imports.Trunks off

ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Subsites] FOREIGN KEY([ImportSubsiteId])
REFERENCES [Imports].[Subsites] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Subsites]
GO
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Trees] FOREIGN KEY([ImportTreeId])
REFERENCES [Imports].[Trees] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Trees]
GO
ALTER TABLE [Trees].[Measurements]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurements_Trips] FOREIGN KEY([ImportingTripId])
REFERENCES [Imports].[Trips] ([Id])
GO
ALTER TABLE [Trees].[Measurements] CHECK CONSTRAINT [FK_TreeMeasurements_Trips]
GO
ALTER TABLE [Sites].[SubsiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_Trips] FOREIGN KEY([ImportingTripId])
REFERENCES [Imports].[Trips] ([Id])
GO
ALTER TABLE [Sites].[SubsiteVisits] CHECK CONSTRAINT [FK_SubsiteVisits_Trips]
GO
ALTER TABLE [Sites].[SiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SiteVisits_Trips] FOREIGN KEY([ImportingTripId])
REFERENCES [Imports].[Trips] ([Id])
GO
ALTER TABLE [Sites].[SiteVisits] CHECK CONSTRAINT [FK_SiteVisits_Trips]
GO

drop table LegacyImport_Trips
go
drop table LegacyImport_Measurers
go
drop table LegacyImport_Sites
go
drop table LegacyImport_Subsites
go
drop table LegacyImport_Trees
go
drop table LegacyImport_Trunks
go