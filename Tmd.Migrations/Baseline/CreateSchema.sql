/****** Object:  Schema [Helpers]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE SCHEMA [Helpers]
GO
/****** Object:  Schema [Imports]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE SCHEMA [Imports]
GO
/****** Object:  Schema [Locations]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE SCHEMA [Locations]
GO
/****** Object:  Schema [Logging]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE SCHEMA [Logging]
GO
/****** Object:  Schema [Photos]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE SCHEMA [Photos]
GO
/****** Object:  Schema [Sites]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE SCHEMA [Sites]
GO
/****** Object:  Schema [Trees]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE SCHEMA [Trees]
GO
/****** Object:  Schema [Trips]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE SCHEMA [Trips]
GO
/****** Object:  Schema [Users]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE SCHEMA [Users]
GO
/****** Object:  Schema [ValueObjects]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE SCHEMA [ValueObjects]
GO
/****** Object:  UserDefinedFunction [Helpers].[DistanceEuclidean]    Script Date: 12/5/2013 11:56:43 PM ******/
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
/****** Object:  UserDefinedFunction [Helpers].[Max]    Script Date: 12/5/2013 11:56:43 PM ******/
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
/****** Object:  UserDefinedFunction [Helpers].[ToTitleCase]    Script Date: 12/5/2013 11:56:43 PM ******/
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
/****** Object:  Table [Imports].[Measurers]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Imports].[Sites]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Imports].[Subsites]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Imports].[Trees]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Imports].[Trips]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Imports].[Trunks]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Locations].[Countries]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Locations].[States]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Logging].[Errors]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Logging].[Errors](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Timestamp] [datetime] NOT NULL,
	[ApplicationMachine] [varchar](300) NOT NULL,
	[ApplicationPath] [varchar](300) NOT NULL,
	[RequestUrl] [varchar](1000) NOT NULL,
	[RequestUserHostAddress] [varchar](50) NOT NULL,
	[RequestUrlReferrer] [varchar](1000) NOT NULL,
	[RequestIsAuthenticated] [bit] NOT NULL,
	[RequestUser] [varchar](100) NOT NULL,
	[Class] [varchar](1000) NOT NULL,
	[Message] [varchar](8000) NOT NULL,
	[StackTrace] [varchar](8000) NOT NULL,
 CONSTRAINT [PK_Errors] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Photos].[Photos]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Photos].[Photos](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CreatorUserId] [int] NULL,
	[Created] [datetime] NOT NULL,
	[Width] [int] NOT NULL,
	[Height] [int] NOT NULL,
	[Bytes] [int] NOT NULL,
	[Format] [tinyint] NOT NULL,
 CONSTRAINT [PK_Photos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [Photos].[References]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
/****** Object:  Table [Sites].[Sites]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Sites].[SiteVisits]    Script Date: 12/5/2013 11:56:43 PM ******/
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
	[TripReportUrl] [varchar](100) NOT NULL,
 CONSTRAINT [PK_SiteVisits] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Sites].[Subsites]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Sites].[SubsiteVisits]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Sites].[Visitors]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Trees].[KnownSpecies]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Trees].[Measurements]    Script Date: 12/5/2013 11:56:43 PM ******/
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
	[ComputedMeasuredSpeciesId]  AS (abs(CONVERT([int],hashbytes('MD5',lower(ltrim(rtrim([ScientificName])))),(0))^CONVERT([int],hashbytes('MD5',lower(ltrim(rtrim([CommonName])))),(0)))),
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Trees].[Measurers]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Trees].[Trees]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trees].[Trees](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SubsiteId] [int] NULL,
	[ComputedMeasuredSpeciesId]  AS (abs(CONVERT([int],hashbytes('MD5',lower(ltrim(rtrim([ScientificName])))),(0))^CONVERT([int],hashbytes('MD5',lower(ltrim(rtrim([CommonName])))),(0)))),
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Users].[Users]    Script Date: 12/5/2013 11:56:43 PM ******/
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
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
) ON [PRIMARY]

GO
SET ANSI_PADDING OFF
GO
/****** Object:  View [ValueObjects].[DistanceFormats]    Script Date: 12/5/2013 11:56:43 PM ******/
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
/****** Object:  View [Trees].[MeasuredSpecies]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [Trees].[MeasuredSpecies]
AS

select ABS(
		CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(ScientificName)))) as int)
		^ CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(CommonName)))) as int)
	)Id,
	ScientificName, CommonName,
	MaxHeight, MaxHeightInputFormat, MaxHeightTreeId,
	MaxGirth, MaxGirthInputFormat, MaxGirthTreeId,
	MaxCrownSpread, MaxCrownSpreadInputFormat, MaxCrownSpreadTreeId,
	Number
from 
(
	select 
		t.ScientificName,
		t.CommonName,
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
					and t2.CommonName = t.CommonName
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
					and t2.CommonName = t.CommonName
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
					and t2.CommonName = t.CommonName
					and t2.CrownSpread = MAX(t.CrownSpread)
			)
		end MaxCrownSpreadTreeId,
		COUNT(*) Number
	from Trees.Trees t
	group by t.ScientificName, t.CommonName
) mt



GO
/****** Object:  UserDefinedFunction [dbo].[SearchMeasuredSpecies]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE FUNCTION [dbo].[SearchMeasuredSpecies]
(	
	@expression nvarchar(100)
)
RETURNS TABLE 
AS
RETURN 
(
	select Id, 
		(case when ScientificName like @expression + '%' then 1 else 0 end)
		+ (case when ScientificName like '%' + @expression then 1 else 0 end)
		+ (case when ScientificName like '%' + @expression + '%' then 1 else 0 end)
		+ (case when CommonName like @expression + '%' then 1 else 0 end)
		+ (case when CommonName like '%' + @expression then 1 else 0 end)
		+ (case when CommonName like '%' + @expression + '%' then 1 else 0 end) [Rank]
	from Trees.MeasuredSpecies 
	where ScientificName like '%' + @expression + '%'
		or CommonName like '%' + @expression + '%'
)


GO
/****** Object:  View [Locations].[VisitedStates]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


CREATE VIEW [Locations].[VisitedStates]
AS

select Id, CountryId, DoubleLetterCode, TripleLetterCode, Name, NELatitude, NELongitude, SWLatitude, SWLongitude,
(
	select 
		case when COUNT(*) >= 5
			then SUM(MaxHeight) / 5
			else NULL
		end RHI
	from
	(
		select top 5 ScientificName, MaxHeight 
		from
		(
			select t.ScientificName, MAX(t.Height) MaxHeight
			from Sites.Subsites ss
			join Trees.Trees t
				on t.SubsiteId = ss.Id
			where ss.StateId = s.Id
			group by t.ScientificName
		) SpeciesMaxHeights
		order by MaxHeight desc
	) TopSpeciesMaxHeights
) RHI5,
(
	select 
		case when COUNT(*) >= 10
			then SUM(MaxHeight) / 10
			else NULL
		end RHI
	from
	(
		select top 10 ScientificName, MaxHeight 
		from
		(
			select t.ScientificName, MAX(t.Height) MaxHeight
			from Sites.Subsites ss
			join Trees.Trees t
				on t.SubsiteId = ss.Id
			where ss.StateId = s.Id
			group by t.ScientificName
		) SpeciesMaxHeights
		order by MaxHeight desc
	) TopSpeciesMaxHeights
) RHI10,
(
	select 
		case when COUNT(*) >= 20
			then SUM(MaxHeight) / 20
			else NULL
		end RHI
	from
	(
		select top 20 ScientificName, MaxHeight 
		from
		(
			select t.ScientificName, MAX(t.Height) MaxHeight
			from Sites.Subsites ss
			join Trees.Trees t
				on t.SubsiteId = ss.Id
			where ss.StateId = s.Id
			group by t.ScientificName
		) SpeciesMaxHeights
		order by MaxHeight desc
	) TopSpeciesMaxHeights
) RHI20,
(
	select 
		case when COUNT(*) >= 5
			then SUM(MaxGirth) / 5
			else NULL
		end RHI
	from
	(
		select top 5 ScientificName, MaxGirth 
		from
		(
			select t.ScientificName, MAX(t.Girth) MaxGirth
			from Sites.Subsites ss
			join Trees.Trees t
				on t.SubsiteId = ss.Id
			where ss.StateId = s.Id
			group by t.ScientificName
		) SpeciesMaxGirths
		order by MaxGirth desc
	) TopSpeciesMaxGirths
) RGI5,
(
	select 
		case when COUNT(*) >= 10
			then SUM(MaxGirth) / 10
			else NULL
		end RHI
	from
	(
		select top 10 ScientificName, MaxGirth
		from
		(
			select t.ScientificName, MAX(t.Girth) MaxGirth
			from Sites.Subsites ss
			join Trees.Trees t
				on t.SubsiteId = ss.Id
			where ss.StateId = s.Id
			group by t.ScientificName
		) SpeciesMaxGirth
		order by MaxGirth desc
	) TopSpeciesMaxGirth
) RGI10,
(
	select 
		case when COUNT(*) >= 20
			then SUM(MaxGirth) / 20
			else NULL
		end RHI
	from
	(
		select top 20 ScientificName, MaxGirth
		from
		(
			select t.ScientificName, MAX(t.Girth) MaxGirth
			from Sites.Subsites ss
			join Trees.Trees t
				on t.SubsiteId = ss.Id
			where ss.StateId = s.Id
			group by t.ScientificName
		) SpeciesMaxGirths
		order by MaxGirth desc
	) TopSpeciesMaxGirths
) RGI20
from Locations.States s
where exists
(
	select *
	from Sites.Subsites ss
	where ss.StateId = s.Id
)



GO
/****** Object:  UserDefinedFunction [dbo].[SearchVisitedStates]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[SearchVisitedStates]
(	
	@expression nvarchar(100)
)
RETURNS TABLE 
AS
RETURN 
(
	select Id,
		+ (case when Name like @expression + '%' then 1 else 0 end)
		+ (case when Name like '%' + @expression then 1 else 0 end)
		+ (case when Name like '%' + @expression + '%' then 1 else 0 end)
		+ (case DoubleLetterCode when @expression then 2 else 0 end)
		+ (case TripleLetterCode when @expression then 2 else 0 end) [Rank]
	from Locations.VisitedStates
	where Name like '%' + @expression + '%'
		or DoubleLetterCode = @expression 
		or TripleLetterCode = @expression
)


GO
/****** Object:  View [Trees].[MeasuredSpeciesByState]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [Trees].[MeasuredSpeciesByState]
AS

select ABS(
		CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(ScientificName)))) as int)
		^ CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(CommonName)))) as int)
		^ CAST(HASHBYTES('MD5', CAST(StateId as varchar)) as int)
		^ CAST(HASHBYTES('MD5', 'State') as int)
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
		t.CommonName,
		ss.StateId,
		MAX(t.Height) MaxHeight,
		case MAX(t.Height)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxHeightInputFormat,
		case MAX(t.Height)
			when 0 then null
			else 
			(
				select top 1 t2.Id 
				from Trees.Trees t2
				join Sites.Subsites ss2
					on ss2.Id = t2.SubsiteId
				where t2.ScientificName = t.ScientificName
					and t2.CommonName = t.CommonName
					and ss2.StateId = ss.StateId
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
				select top 1 t2.Id 
				from Trees.Trees t2
				join Sites.Subsites ss2
					on ss2.Id = t2.SubsiteId
				where t2.ScientificName = t.ScientificName
					and t2.CommonName = t.CommonName
					and ss2.StateId = ss.StateId
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
				select top 1 t2.Id 
				from Trees.Trees t2
				join Sites.Subsites ss2
					on ss2.Id = t2.SubsiteId
				where t2.ScientificName = t.ScientificName
					and t2.CommonName = t.CommonName
					and ss2.StateId = ss.StateId
					and t2.CrownSpread = MAX(t.CrownSpread)
			)
		end MaxCrownSpreadTreeId,
		COUNT(*) Number
	from Trees.Trees t
	join Sites.Subsites ss
		on ss.Id = t.SubsiteId
	group by t.ScientificName, t.CommonName, ss.StateId
) mt



GO
/****** Object:  View [Trees].[MeasuredSpeciesBySubsite]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [Trees].[MeasuredSpeciesBySubsite]
AS

select ABS(
		CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(ScientificName)))) as int)
		^ CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(CommonName)))) as int)
		^ CAST(HASHBYTES('MD5', CAST(SubsiteId as varchar)) as int)
		^ CAST(HASHBYTES('MD5', 'Subsite') as int)
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
		t.CommonName,
		t.SubsiteId,
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
					and t2.CommonName = t.CommonName
					and t2.SubsiteId = t.SubsiteId
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
					and t2.CommonName = t.CommonName
					and t2.SubsiteId = t.SubsiteId
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
					and t2.CommonName = t.CommonName
					and t2.SubsiteId = t.SubsiteId
					and t2.CrownSpread = MAX(t.CrownSpread)
			)
		end MaxCrownSpreadTreeId,
		COUNT(*) Number
	from Trees.Trees t		
	group by t.ScientificName, t.CommonName, t.SubsiteId
) mt



GO
/****** Object:  View [Trees].[MeasuredSpeciesBySite]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE VIEW [Trees].[MeasuredSpeciesBySite]
AS

select ABS(
		CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(ScientificName)))) as int)
		^ CAST(HASHBYTES('MD5', LOWER(LTRIM(RTRIM(CommonName)))) as int)
		^ CAST(HASHBYTES('MD5', CAST(SiteId as varchar)) as int)
		^ CAST(HASHBYTES('MD5', 'Site') as int)
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
		t.CommonName,
		ss.SiteId,
		MAX(t.Height) MaxHeight,
		case MAX(t.Height)
			when 0 then (select Id from ValueObjects.DistanceFormats where Format = 'Invalid')
			else (select Id from ValueObjects.DistanceFormats where Format = 'Default')
		end MaxHeightInputFormat,
		case MAX(t.Height)
			when 0 then null
			else 
			(
				select top 1 t2.Id 
				from Trees.Trees t2
				join Sites.Subsites ss2
					on ss2.Id = t2.SubsiteId
				where t2.ScientificName = t.ScientificName
					and t2.CommonName = t.CommonName
					and ss2.SiteId = ss.SiteId
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
				select top 1 t2.Id 
				from Trees.Trees t2
				join Sites.Subsites ss2
					on ss2.Id = t2.SubsiteId
				where t2.ScientificName = t.ScientificName
					and t2.CommonName = t.CommonName
					and ss2.SiteId = ss.SiteId
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
				select top 1 t2.Id 
				from Trees.Trees t2
				join Sites.Subsites ss2
					on ss2.Id = t2.SubsiteId
				where t2.ScientificName = t.ScientificName
					and t2.CommonName = t.CommonName
					and ss2.SiteId = ss.SiteId
					and t2.CrownSpread = MAX(t.CrownSpread)
			)
		end MaxCrownSpreadTreeId,
		COUNT(*) Number
	from Trees.Trees t		
	join Sites.Subsites ss
		on ss.Id = t.SubsiteId
	group by t.ScientificName, t.CommonName, ss.SiteId
) mt



GO
/****** Object:  UserDefinedFunction [dbo].[SearchSubsites]    Script Date: 12/5/2013 11:56:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[SearchSubsites]
(	
	@expression nvarchar(100)
)
RETURNS TABLE 
AS
RETURN 
(
	select Id, 
		(case when Name like @expression + '%' then 1 else 0 end)
		+ (case when Name like '%' + @expression then 1 else 0 end)
		+ (case when Name like '%' + @expression + '%' then 1 else 0 end)
		+ (case when County like @expression + '%' then 1 else 0 end)
		+ (case when County like '%' + @expression then 1 else 0 end)
		+ (case when County like '%' + @expression + '%' then 1 else 0 end) [Rank]
	from Sites.Subsites 
	where Name like '%' + @expression + '%'
		or County like '%' + @expression + '%'
)
GO
SET ANSI_PADDING ON

GO
/****** Object:  Index [IX_Users_Email]    Script Date: 12/5/2013 11:56:43 PM ******/
CREATE UNIQUE NONCLUSTERED INDEX [IX_Users_Email] ON [Users].[Users]
(
	[Email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, DROP_EXISTING = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
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
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_CountryId]  DEFAULT ((1)) FOR [CountryId]
GO
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_NELatitude]  DEFAULT ((0)) FOR [NELatitude]
GO
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_NELongitude]  DEFAULT ((0)) FOR [NELongitude]
GO
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_SWLatitude]  DEFAULT ((0)) FOR [SWLatitude]
GO
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_SWLongitude]  DEFAULT ((0)) FOR [SWLongitude]
GO
ALTER TABLE [Sites].[Sites] ADD  CONSTRAINT [DF_Sites_SubsiteCount]  DEFAULT ((1)) FOR [SubsiteCount]
GO
ALTER TABLE [Sites].[SiteVisits] ADD  CONSTRAINT [DF_SiteVisits_TripReportUrl]  DEFAULT ('') FOR [TripReportUrl]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Email]  DEFAULT ('Anonymous') FOR [Email]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Firstname]  DEFAULT ('') FOR [Firstname]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Lastname]  DEFAULT ('') FOR [Lastname]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_UserRoles]  DEFAULT ((0)) FOR [Roles]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordHash]  DEFAULT (0x00) FOR [PasswordHash]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordNumerics]  DEFAULT ((0)) FOR [PasswordNumerics]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordUppercase]  DEFAULT ((0)) FOR [PasswordUppercase]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordLowercase]  DEFAULT ((0)) FOR [PasswordLowercase]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordSpecials]  DEFAULT ((0)) FOR [PasswordSpecials]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordLength]  DEFAULT ((0)) FOR [PasswordLength]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Created]  DEFAULT (getdate()) FOR [Created]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_LastActivity]  DEFAULT (getdate()) FOR [LastActivity]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_LastLogin]  DEFAULT (getdate()) FOR [LastLogin]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_EmailVerificationToken]  DEFAULT (0x00) FOR [EmailVerificationToken]
GO
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_RecentlyFailedLoginAttempts]  DEFAULT ((0)) FOR [RecentlyFailedLoginAttempts]
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
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Measurements] FOREIGN KEY([TreeMeasurementId])
REFERENCES [Trees].[Measurements] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Measurements]
GO
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Subsites] FOREIGN KEY([ImportSubsiteId])
REFERENCES [Imports].[Subsites] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Subsites]
GO
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Subsites1] FOREIGN KEY([SubsiteId])
REFERENCES [Sites].[Subsites] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Subsites1]
GO
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_SubsiteVisits] FOREIGN KEY([SubsiteVisitId])
REFERENCES [Sites].[SubsiteVisits] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_SubsiteVisits]
GO
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Trees] FOREIGN KEY([ImportTreeId])
REFERENCES [Imports].[Trees] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Trees]
GO
ALTER TABLE [Photos].[References]  WITH CHECK ADD  CONSTRAINT [FK_References_Trees1] FOREIGN KEY([TreeId])
REFERENCES [Trees].[Trees] ([Id])
GO
ALTER TABLE [Photos].[References] CHECK CONSTRAINT [FK_References_Trees1]
GO
ALTER TABLE [Sites].[SiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SiteVisits_Sites] FOREIGN KEY([SiteId])
REFERENCES [Sites].[Sites] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Sites].[SiteVisits] CHECK CONSTRAINT [FK_SiteVisits_Sites]
GO
ALTER TABLE [Sites].[SiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SiteVisits_Trips] FOREIGN KEY([ImportingTripId])
REFERENCES [Imports].[Trips] ([Id])
GO
ALTER TABLE [Sites].[SiteVisits] CHECK CONSTRAINT [FK_SiteVisits_Trips]
GO
ALTER TABLE [Sites].[Subsites]  WITH CHECK ADD  CONSTRAINT [FK_Subsites_Sites] FOREIGN KEY([SiteId])
REFERENCES [Sites].[Sites] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Sites].[Subsites] CHECK CONSTRAINT [FK_Subsites_Sites]
GO
ALTER TABLE [Sites].[Subsites]  WITH CHECK ADD  CONSTRAINT [FK_Subsites_States] FOREIGN KEY([StateId])
REFERENCES [Locations].[States] ([Id])
GO
ALTER TABLE [Sites].[Subsites] CHECK CONSTRAINT [FK_Subsites_States]
GO
ALTER TABLE [Sites].[SubsiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_States] FOREIGN KEY([StateId])
REFERENCES [Locations].[States] ([Id])
GO
ALTER TABLE [Sites].[SubsiteVisits] CHECK CONSTRAINT [FK_SubsiteVisits_States]
GO
ALTER TABLE [Sites].[SubsiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_Subsites] FOREIGN KEY([SubsiteId])
REFERENCES [Sites].[Subsites] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Sites].[SubsiteVisits] CHECK CONSTRAINT [FK_SubsiteVisits_Subsites]
GO
ALTER TABLE [Sites].[SubsiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_Trips] FOREIGN KEY([ImportingTripId])
REFERENCES [Imports].[Trips] ([Id])
GO
ALTER TABLE [Sites].[SubsiteVisits] CHECK CONSTRAINT [FK_SubsiteVisits_Trips]
GO
ALTER TABLE [Sites].[Visitors]  WITH CHECK ADD  CONSTRAINT [FK_Visitors_Sites] FOREIGN KEY([SiteId])
REFERENCES [Sites].[Sites] ([Id])
GO
ALTER TABLE [Sites].[Visitors] CHECK CONSTRAINT [FK_Visitors_Sites]
GO
ALTER TABLE [Sites].[Visitors]  WITH CHECK ADD  CONSTRAINT [FK_Visitors_SiteVisits] FOREIGN KEY([SiteVisitId])
REFERENCES [Sites].[SiteVisits] ([Id])
GO
ALTER TABLE [Sites].[Visitors] CHECK CONSTRAINT [FK_Visitors_SiteVisits]
GO
ALTER TABLE [Sites].[Visitors]  WITH CHECK ADD  CONSTRAINT [FK_Visitors_Subsites] FOREIGN KEY([SubsiteId])
REFERENCES [Sites].[Subsites] ([Id])
GO
ALTER TABLE [Sites].[Visitors] CHECK CONSTRAINT [FK_Visitors_Subsites]
GO
ALTER TABLE [Sites].[Visitors]  WITH CHECK ADD  CONSTRAINT [FK_Visitors_SubsiteVisits] FOREIGN KEY([SubsiteVisitId])
REFERENCES [Sites].[SubsiteVisits] ([Id])
GO
ALTER TABLE [Sites].[Visitors] CHECK CONSTRAINT [FK_Visitors_SubsiteVisits]
GO
ALTER TABLE [Trees].[Measurements]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurements_Trips] FOREIGN KEY([ImportingTripId])
REFERENCES [Imports].[Trips] ([Id])
GO
ALTER TABLE [Trees].[Measurements] CHECK CONSTRAINT [FK_TreeMeasurements_Trips]
GO
ALTER TABLE [Trees].[Measurers]  WITH CHECK ADD  CONSTRAINT [FK_Measurers_Measurements] FOREIGN KEY([MeasurementId])
REFERENCES [Trees].[Measurements] ([Id])
GO
ALTER TABLE [Trees].[Measurers] CHECK CONSTRAINT [FK_Measurers_Measurements]
GO
ALTER TABLE [Trees].[Measurers]  WITH CHECK ADD  CONSTRAINT [FK_Measurers_Trees] FOREIGN KEY([TreeId])
REFERENCES [Trees].[Trees] ([Id])
GO
ALTER TABLE [Trees].[Measurers] CHECK CONSTRAINT [FK_Measurers_Trees]
GO
ALTER TABLE [Trees].[Trees]  WITH CHECK ADD  CONSTRAINT [FK_Trees_Subsites] FOREIGN KEY([SubsiteId])
REFERENCES [Sites].[Subsites] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Trees].[Trees] CHECK CONSTRAINT [FK_Trees_Subsites]
GO
