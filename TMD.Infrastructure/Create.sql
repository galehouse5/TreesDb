/****** Object:  User [TMD]    Script Date: 12/26/2010 22:04:52 ******/
CREATE USER [TMD] FOR LOGIN [TMD] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  Schema [Locations]    Script Date: 12/26/2010 22:04:48 ******/
CREATE SCHEMA [Locations] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Photos]    Script Date: 12/26/2010 22:04:48 ******/
CREATE SCHEMA [Photos] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Trees]    Script Date: 12/26/2010 22:04:48 ******/
CREATE SCHEMA [Trees] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Trips]    Script Date: 12/26/2010 22:04:48 ******/
CREATE SCHEMA [Trips] AUTHORIZATION [dbo]
GO
/****** Object:  Schema [Users]    Script Date: 12/26/2010 22:04:48 ******/
CREATE SCHEMA [Users] AUTHORIZATION [dbo]
GO
/****** Object:  UserDefinedFunction [dbo].[Max]    Script Date: 12/26/2010 22:04:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[Max]
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
/****** Object:  Table [Photos].[Links]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Photos].[Links](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Type] [int] NOT NULL,
	[TripId] [int] NULL,
 CONSTRAINT [PK_Links] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Trees].[KnownTrees]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trees].[KnownTrees](
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
SET IDENTITY_INSERT [Trees].[KnownTrees] ON
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1, N'ABAL3', N'Abies alba', N'silver fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (2, N'ABAM', N'Abies amabilis', N'Pacific silver fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (3, N'ABBA', N'Abies balsamea', N'balsam fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (4, N'ABBAB', N'Abies balsamea var. balsamea', N'balsam fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (5, N'ABBR', N'Abies bracteata', N'bristlecone fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (6, N'ABCO', N'Abies concolor', N'white fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (7, N'ABCOC', N'Abies concolor var. concolor', N'white fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (8, N'ABCOL', N'Abies concolor var. lowiana', N'white fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (9, N'ABFR', N'Abies fraseri', N'Fraser fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (10, N'ABGR', N'Abies grandis', N'grand fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (11, N'ABHO', N'Abies homolepis', N'Nikko fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (12, N'ABLA', N'Abies lasiocarpa', N'subalpine fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (13, N'ABLAA', N'Abies lasiocarpa var. arizonica', N'corkbark fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (14, N'ABLAL', N'Abies lasiocarpa var. lasiocarpa', N'subalpine fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (15, N'ABMA', N'Abies magnifica', N'California red fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (16, N'ABPR', N'Abies procera', N'noble fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (17, N'ABSH', N'Abies ×shastensis', N'Shasta red fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (18, N'ACAU', N'Acacia auriculiformis', N'earleaf acacia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (19, N'ACBA', N'Acacia baileyana', N'cootamundra wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (20, N'ACBA3', N'Acer barbatum', N'southern sugar maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (21, N'ACBE', N'Acacia berlandieri', N'guajillo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (22, N'ACCA5', N'Acer campestre', N'hedge maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (23, N'ACCH', N'Acacia choriophylla', N'cinnecord')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (24, N'ACCI', N'Acer circinatum', N'vine maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (25, N'ACCO2', N'Acacia constricta', N'whitethorn acacia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (26, N'ACCO5', N'Acacia cornigera', N'bullhorn wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (27, N'ACCOC', N'Acacia constricta var. constricta', N'whitethorn acacia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (28, N'ACCOP9', N'Acacia constricta var. paucispina', N'whitethorn acacia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (29, N'ACDE', N'Acacia decurrens', N'green wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (30, N'ACDE3', N'Acacia dealbata', N'silver wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (31, N'ACEL', N'Acacia elata', N'cedar wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (32, N'ACFA', N'Acacia farnesiana', N'sweet acacia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (33, N'ACFR', N'Acer ×freemanii', N'Freeman maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (34, N'ACGI', N'Acer ginnala', N'Amur maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (35, N'ACGL', N'Acer glabrum', N'Rocky Mountain maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (36, N'ACGLD3', N'Acer glabrum var. diffusum', N'Rocky Mountain maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (37, N'ACGLD4', N'Acer glabrum var. douglasii', N'Douglas maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (38, N'ACGLG', N'Acer glabrum var. greenei', N'Greene''s maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (39, N'ACGLG2', N'Acer glabrum var. glabrum', N'Rocky Mountain maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (40, N'ACGLN2', N'Acer glabrum var. neomexicanum', N'New Mexico maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (41, N'ACGLT2', N'Acer glabrum var. torreyi', N'Torrey maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (42, N'ACGR', N'Acacia greggii', N'catclaw acacia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (43, N'ACGR3', N'Acer grandidentatum', N'bigtooth maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (44, N'ACGRG', N'Acer grandidentatum var. grandidentatum', N'bigtooth maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (45, N'ACGRG3', N'Acacia greggii var. greggii', N'catclaw acacia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (46, N'ACGRS', N'Acer grandidentatum var. sinuosum', N'canyon maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (47, N'ACGRW', N'Acacia greggii var. wrightii', N'catclaw acacia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (48, N'ACJA2', N'Acer japonicum', N'Amur maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (49, N'ACLE', N'Acer leucoderme', N'chalk maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (50, N'ACLO', N'Acacia longifolia', N'Sydney golden wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (51, N'ACMA', N'Acacia macracantha', N'porknut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (52, N'ACMA3', N'Acer macrophyllum', N'bigleaf maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (53, N'ACME', N'Acacia melanoxylon', N'blackwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (54, N'ACME80', N'Acacia mearnsii', N'black wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (55, N'ACMI', N'Acacia millefolia', N'milfoil wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (56, N'ACNE2', N'Acer negundo', N'boxelder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (57, N'ACNEA', N'Acer negundo var. arizonicum', N'Arizona boxelder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (58, N'ACNEC2', N'Acer negundo var. californicum', N'California boxelder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (59, N'ACNEI2', N'Acer negundo var. interius', N'boxelder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (60, N'ACNEN', N'Acer negundo var. negundo', N'boxelder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (61, N'ACNET', N'Acer negundo var. texanum', N'boxelder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (62, N'ACNEV', N'Acer negundo var. violaceum', N'boxelder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (63, N'ACNI5', N'Acer nigrum', N'black maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (64, N'ACPA2', N'Acer palmatum', N'Japanese maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (65, N'ACPE', N'Acer pensylvanicum', N'striped maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (66, N'ACPI', N'Acacia pinetorum', N'pineland wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (67, N'ACPL', N'Acer platanoides', N'Norway maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (68, N'ACPO2', N'Acacia podalyriifolia', N'pearl wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (69, N'ACPS', N'Acer pseudoplatanus', N'sycamore maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (70, N'ACPY3', N'Acacia pycnantha', N'golden wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (71, N'ACRE2', N'Acacia retinodes', N'water wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (72, N'ACRI', N'Acacia rigidula', N'blackbrush acacia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (73, N'ACRO', N'Acacia roemeriana', N'roundflower catclaw')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (74, N'ACRU', N'Acer rubrum', N'red maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (75, N'ACRUD', N'Acer rubrum var. drummondii', N'Drummond''s maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (76, N'ACRUR', N'Acer rubrum var. rubrum', N'red maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (77, N'ACRUT', N'Acer rubrum var. trilobum', N'red maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (78, N'ACSA', N'Acacia saligna', N'orange wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (79, N'ACSA2', N'Acer saccharinum', N'silver maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (80, N'ACSA3', N'Acer saccharum', N'sugar maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (81, N'ACSAS', N'Acer saccharum var. saccharum', N'sugar maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (82, N'ACSAS2', N'Acer saccharum var. schneckii', N'sugar maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (83, N'ACSP2', N'Acer spicatum', N'mountain maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (84, N'ACSP4', N'Acacia sphaerocephala', N'bee wattle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (85, N'ACTA80', N'Acer tataricum', N'tatarian maple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (86, N'ACTO', N'Acacia tortuosa', N'poponax')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (87, N'ACTO5', N'Acrocomia totai', N'grugru palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (88, N'ACVE2', N'Acacia verticillata', N'prickly Moses')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (89, N'ACWR4', N'Acoelorrhaphe wrightii', N'Everglades palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (90, N'ADPA', N'Adenanthera pavonina', N'red beadtree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (91, N'ADSP', N'Adenostoma sparsifolium', N'redshank')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (92, N'AECA', N'Aesculus californica', N'California buckeye')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (93, N'AECA2', N'Aesculus ×carnea', N'red horse-chestnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (94, N'AEFL', N'Aesculus flava', N'yellow buckeye')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (95, N'AEGL', N'Aesculus glabra', N'Ohio buckeye')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (96, N'AEGLA', N'Aesculus glabra var. arguta', N'Ohio buckeye')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (97, N'AEGLG', N'Aesculus glabra var. glabra', N'Ohio buckeye')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (98, N'AEHI', N'Aesculus hippocastanum', N'horse chestnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (99, N'AEPA', N'Aesculus pavia', N'red buckeye')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (100, N'AEPA2', N'Aesculus parviflora', N'bottlebrush buckeye')
GO
print 'Processed 100 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (101, N'AEPAF', N'Aesculus pavia var. flavescens', N'red buckeye')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (102, N'AEPAP', N'Aesculus pavia var. pavia', N'red buckeye')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (103, N'AESY', N'Aesculus sylvatica', N'painted buckeye')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (104, N'AIAL', N'Ailanthus altissima', N'tree of heaven')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (105, N'ALAM3', N'Alvaradoa amorphoides', N'Mexican alvaradoa')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (106, N'ALAMP2', N'Alvaradoa amorphoides ssp. psilophyllis', N'Mexican alvaradoa')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (107, N'ALCO13', N'Alnus cordata', N'Italian alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (108, N'ALGL2', N'Alnus glutinosa', N'European alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (109, N'ALIN2', N'Alnus incana', N'gray alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (110, N'ALINR', N'Alnus incana ssp. rugosa', N'speckled alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (111, N'ALINT', N'Alnus incana ssp. tenuifolia', N'thinleaf alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (112, N'ALJU', N'Albizia julibrissin', N'silktree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (113, N'ALLE', N'Albizia lebbeck', N'woman''s tongue')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (114, N'ALLE2', N'Albizia lebbekoides', N'Indian albizia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (115, N'ALMA16', N'Alstonia macrophylla', N'deviltree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (116, N'ALMA7', N'Alnus maritima', N'seaside alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (117, N'ALMO2', N'Aleurites moluccana', N'Indian walnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (118, N'ALOB2', N'Alnus oblongifolia', N'Arizona alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (119, N'ALPR', N'Albizia procera', N'tall albizia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (120, N'ALRH2', N'Alnus rhombifolia', N'white alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (121, N'ALRU2', N'Alnus rubra', N'red alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (122, N'ALSE2', N'Alnus serrulata', N'hazel alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (123, N'ALVI5', N'Alnus viridis', N'green alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (124, N'ALVIC', N'Alnus viridis ssp. crispa', N'mountain alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (125, N'ALVIF', N'Alnus viridis ssp. fruticosa', N'Siberian alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (126, N'ALVIS', N'Alnus viridis ssp. sinuata', N'Sitka alder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (127, N'AMAL2', N'Amelanchier alnifolia', N'Saskatoon serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (128, N'AMALA', N'Amelanchier alnifolia var. alnifolia', N'Saskatoon serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (129, N'AMALC', N'Amelanchier alnifolia var. cusickii', N'Cusick''s serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (130, N'AMALH', N'Amelanchier alnifolia var. humptulipensis', N'Saskatoon serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (131, N'AMALS', N'Amelanchier alnifolia var. semiintegrifolia', N'Saskatoon serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (132, N'AMAR3', N'Amelanchier arborea', N'common serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (133, N'AMARA3', N'Amelanchier arborea var. alabamensis', N'Alabama serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (134, N'AMARA4', N'Amelanchier arborea var. arborea', N'common serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (135, N'AMARA5', N'Amelanchier arborea var. austromontana', N'downy serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (136, N'AMBA', N'Amelanchier bartramiana', N'oblongfruit serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (137, N'AMBA2', N'Amyris balsamifera', N'balsam torchwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (138, N'AMCA4', N'Amelanchier canadensis', N'Canadian serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (139, N'AMEL', N'Amyris elemifera', N'sea torchwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (140, N'AMIN2', N'Amelanchier interior', N'Pacific serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (141, N'AMJA', N'×Amelasorbus jackii', N'Jack''s amelasorbus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (142, N'AMLA', N'Amelanchier laevis', N'Allegheny serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (143, N'AMLA4', N'Amphitecna latifolia', N'black calabash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (144, N'AMPA2', N'Amelanchier pallida', N'pale serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (145, N'AMSA', N'Amelanchier sanguinea', N'roundleaf serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (146, N'AMSAG', N'Amelanchier sanguinea var. gaspensis', N'Gaspé serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (147, N'AMSAS', N'Amelanchier sanguinea var. sanguinea', N'roundleaf serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (148, N'AMUT', N'Amelanchier utahensis', N'Utah serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (149, N'AMUTC2', N'Amelanchier utahensis var. covillei', N'Coville''s serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (150, N'AMUTU', N'Amelanchier utahensis var. utahensis', N'Utah serviceberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (151, N'ANGL4', N'Annona glabra', N'pond apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (152, N'ANIN', N'Andira inermis', N'cabbagebark tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (153, N'ANMO', N'Annona montana', N'mountain soursop')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (154, N'ANSQ', N'Annona squamosa', N'sugar apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (155, N'ARAR2', N'Arbutus arizonica', N'Arizona madrone')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (156, N'ARCH12', N'Aralia chinensis', N'Chinese angelica tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (157, N'ARCH17', N'Aristotelia chilensis', N'maquei')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (158, N'ARCO3', N'Arctostaphylos columbiana', N'hairy manzanita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (159, N'AREL4', N'Ardisia elliptica', N'shoebutton')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (160, N'AREL8', N'Aralia elata', N'Japanese angelica tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (161, N'ARES', N'Ardisia escallonoides', N'island marlberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (162, N'ARGL4', N'Arctostaphylos glauca', N'bigberry manzanita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (163, N'ARME', N'Arbutus menziesii', N'Pacific madrone')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (164, N'ARNO6', N'Arctostaphylos nortensis', N'Del Norte manzanita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (165, N'ARPR', N'Arctostaphylos pringlei', N'Pringle manzanita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (166, N'ARPRD2', N'Arctostaphylos pringlei ssp. drupacea', N'pinkbracted manzanita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (167, N'ARPRP', N'Arctostaphylos pringlei ssp. pringlei', N'Pringle manzanita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (168, N'ARSP2', N'Aralia spinosa', N'devil''s walkingstick')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (169, N'ARTR2', N'Artemisia tridentata', N'big sagebrush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (170, N'ARTRS2', N'Artemisia tridentata ssp. spiciformis', N'big sagebrush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (171, N'ARTRT', N'Artemisia tridentata ssp. tridentata', N'basin big sagebrush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (172, N'ARTRV', N'Artemisia tridentata ssp. vaseyana', N'mountain big sagebrush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (173, N'ARTRW8', N'Artemisia tridentata ssp. wyomingensis', N'Wyoming big sagebrush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (174, N'ARTRX', N'Artemisia tridentata ssp. xericensis', N'big sagebrush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (175, N'ARVI4', N'Arctostaphylos viscida', N'sticky whiteleaf manzanita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (176, N'ARVIM', N'Arctostaphylos viscida ssp. mariposa', N'Mariposa manzanita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (177, N'ARVIP2', N'Arctostaphylos viscida ssp. pulchella', N'sticky whiteleaf manzanita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (178, N'ARVIV', N'Arctostaphylos viscida ssp. viscida', N'sticky whiteleaf manzanita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (179, N'ARXA80', N'Arbutus xalapensis', N'Texas madrone')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (180, N'ASOB6', N'Asimina obovata', N'bigflower pawpaw')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (181, N'ASPA18', N'Asimina parviflora', N'smallflower pawpaw')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (182, N'ASTR', N'Asimina triloba', N'pawpaw')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (183, N'AVGE', N'Avicennia germinans', N'black mangrove')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (184, N'AVMA3', N'Avicennia marina', N'gray mangrove')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (185, N'AVMAR', N'Avicennia marina var. resinifera', N'gray mangrove')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (186, N'BAHA', N'Baccharis halimifolia', N'eastern baccharis')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (187, N'BALU', N'Bauhinia lunarioides', N'Texasplume')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (188, N'BAMO2', N'Bauhinia monandra', N'Napoleon''s plume')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (189, N'BAPU', N'Bauhinia purpurea', N'butterfly tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (190, N'BAVA', N'Bauhinia variegata', N'mountain ebony')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (191, N'BAVU2', N'Bambusa vulgaris', N'common bamboo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (192, N'BEAL2', N'Betula alleghaniensis', N'yellow birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (193, N'BEALA', N'Betula alleghaniensis var. alleghaniensis', N'yellow birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (194, N'BEALM', N'Betula alleghaniensis var. macrolepis', N'yellow birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (195, N'BEBO', N'Betula borealis', N'northern birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (196, N'BECA4', N'Betula ×caerulea', N'blue birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (197, N'BECAC', N'Betula ×caerulea var. caerulea', N'blue birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (198, N'BECAG', N'Betula ×caerulea var. grandis', N'big blue birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (199, N'BELE', N'Betula lenta', N'sweet birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (200, N'BENE4', N'Betula neoalaskana', N'resin birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (201, N'BENE5', N'Betula ×neoborealis', N'northern birch')
GO
print 'Processed 200 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (202, N'BENI', N'Betula nigra', N'river birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (203, N'BEOC2', N'Betula occidentalis', N'water birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (204, N'BEPA', N'Betula papyrifera', N'paper birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (205, N'BEPAC2', N'Betula papyrifera var. cordifolia', N'mountain paper birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (206, N'BEPAK', N'Betula papyrifera var. kenaica', N'Kenai birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (207, N'BEPAP', N'Betula papyrifera var. papyrifera', N'paper birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (208, N'BEPE3', N'Betula pendula', N'European white birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (209, N'BEPL2', N'Betula platyphylla', N'Asian white birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (210, N'BEPLP', N'Betula platyphylla var. platyphylla', N'Asian white birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (211, N'BEPO', N'Betula populifolia', N'gray birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (212, N'BEPU5', N'Betula pubescens', N'downy birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (213, N'BEPUP5', N'Betula pubescens ssp. pubescens', N'downy birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (214, N'BERA', N'Betula ×raymundii', N'Raymund''s birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (215, N'BESZ', N'Betula szechuanica', N'Szechuan white birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (216, N'BEUB', N'Betula uber', N'Virginia roundleaf birch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (217, N'BIJA', N'Bischofia javanica', N'Javanese bishopwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (218, N'BIOR', N'Bixa orellana', N'lipsticktree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (219, N'BOCA4', N'Bourreria cassinifolia', N'smooth strongbark')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (220, N'BODA', N'Bontia daphnoides', N'white alling')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (221, N'BORA2', N'Bourreria radula', N'rough strongbark')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (222, N'BOSU2', N'Bourreria succulenta', N'bodywood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (223, N'BRAL3', N'Brosimum alicastrum', N'breadnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (224, N'BRBR6', N'Brasiliopuntia brasiliensis', N'Brazilian pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (225, N'BRPA4', N'Broussonetia papyrifera', N'paper mulberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (226, N'BRPO6', N'Brachychiton populneum', N'whiteflower kurrajong')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (227, N'BRSU3', N'Brugmansia suaveolens', N'angel''s-tears')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (228, N'BUAL', N'Buddleja alternifolia', N'fountain butterflybush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (229, N'BUBU', N'Bucida buceras', N'gregorywood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (230, N'BUCA15', N'Butia capitata', N'South American jelly palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (231, N'BUFA', N'Bursera fagaroides', N'fragrant bursera')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (232, N'BUFAE', N'Bursera fagaroides var. elongata', N'fragrant bursera')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (233, N'BUMI', N'Bursera microphylla', N'elephant tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (234, N'BUMO', N'Bucida molinetii', N'spiny bucida')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (235, N'BUSA', N'Buddleja saligna', N'squarestem butterflybush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (236, N'BUSE2', N'Buxus sempervirens', N'common box')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (237, N'BUSI', N'Bursera simaruba', N'gumbo limbo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (238, N'BYLU', N'Byrsonima lucida', N'Long Key locustberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (239, N'CAAF2', N'Cassia afrofistula', N'Kenyan shower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (240, N'CAAL27', N'Carya alba', N'mockernut hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (241, N'CAAN22', N'Calophyllum antillanum', N'Antilles calophyllum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (242, N'CAAQ2', N'Carya aquatica', N'water hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (243, N'CAAR18', N'Caragana arborescens', N'Siberian peashrub')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (244, N'CABE8', N'Carpinus betulus', N'European hornbeam')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (245, N'CABI8', N'Catalpa bignonioides', N'southern catalpa')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (246, N'CACA18', N'Carpinus caroliniana', N'American hornbeam')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (247, N'CACA38', N'Carya carolinae-septentrionalis', N'southern shagbark hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (248, N'CACAC2', N'Carpinus caroliniana ssp. caroliniana', N'American hornbeam')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (249, N'CACAV', N'Carpinus caroliniana ssp. virginiana', N'American hornbeam')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (250, N'CACI15', N'Callistemon citrinus', N'crimson bottlebrush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (251, N'CACL3', N'Casasia clusiifolia', N'sevenyear apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (252, N'CACO15', N'Carya cordiformis', N'bitternut hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (253, N'CACO2', N'Callitris columellaris', N'white cypress-pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (254, N'CACR27', N'Castanea crenata', N'Japanese chestnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (255, N'CACU8', N'Casuarina cunninghamiana', N'river sheoak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (256, N'CACY', N'Capparis cynophallophora', N'Jamaican caper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (257, N'CADE12', N'Castanea dentata', N'American chestnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (258, N'CADE27', N'Calocedrus decurrens', N'incense cedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (259, N'CAEM4', N'Castela emoryi', N'crucifixion thorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (260, N'CAEQ', N'Casuarina equisetifolia', N'beach sheoak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (261, N'CAER3', N'Castela erecta', N'goatbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (262, N'CAERT', N'Castela erecta ssp. texana', N'Texan goatbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (263, N'CAFI3', N'Cassia fistula', N'golden shower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (264, N'CAFL2', N'Capparis flexuosa', N'falseteeth')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (265, N'CAFL6', N'Carya floridana', N'scrub hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (266, N'CAGI', N'Caesalpinia gilliesii', N'bird-of-paradise shrub')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (267, N'CAGI10', N'Carnegiea gigantea', N'saguaro')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (268, N'CAGL11', N'Casuarina glauca', N'gray sheoak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (269, N'CAGL8', N'Carya glabra', N'pignut hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (270, N'CAGR11', N'Cassia grandis', N'pink shower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (271, N'CAHA10', N'Calliandra haematomma', N'red powderpuff')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (272, N'CAHO3', N'Canotia holacantha', N'crucifixion thorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (273, N'CAIL2', N'Carya illinoinensis', N'pecan')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (274, N'CAJA3', N'Cassia javanica', N'apple blossom')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (275, N'CAJA9', N'Camellia japonica', N'camellia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (276, N'CAJAI', N'Cassia javanica var. indochinensis', N'apple blossom')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (277, N'CALA21', N'Carya laciniosa', N'shellbark hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (278, N'CAMA37', N'Carissa macrocarpa', N'amatungulu')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (279, N'CAMA45', N'Callaeum macropterum', N'hillyhock')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (280, N'CAME', N'Caesalpinia mexicana', N'Mexican holdback')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (281, N'CAMI36', N'Caryota mitis', N'Burmese fishtail palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (282, N'CAMO83', N'Castanea mollissima', N'Chinese chestnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (283, N'CAMY', N'Carya myristiciformis', N'nutmeg hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (284, N'CANI17', N'Casearia nitida', N'smooth honeytree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (285, N'CAOV2', N'Carya ovata', N'shagbark hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (286, N'CAOV3', N'Carya ovalis', N'red hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (287, N'CAOV5', N'Catalpa ovata', N'Chinese catalpa')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (288, N'CAPA23', N'Carica papaya', N'papaya')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (289, N'CAPA24', N'Carya pallida', N'sand hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (290, N'CAPA8', N'Calyptranthes pallens', N'pale lidflower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (291, N'CAPR', N'Calotropis procera', N'roostertree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (292, N'CAPU13', N'Caesalpinia pulcherrima', N'pride-of-Barbados')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (293, N'CAPU9', N'Castanea pumila', N'chinkapin')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (294, N'CAPUO', N'Castanea pumila var. ozarkensis', N'Ozark chinkapin')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (295, N'CAPUP3', N'Castanea pumila var. pumila', N'chinkapin')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (296, N'CASA26', N'Camellia sasanqua', N'Sasanqua camellia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (297, N'CASA27', N'Castanea sativa', N'European chestnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (298, N'CASI16', N'Camellia sinensis', N'tea')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (299, N'CASP11', N'Caesalpinia spinosa', N'spiny holdback')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (300, N'CASP8', N'Catalpa speciosa', N'northern catalpa')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (301, N'CATE9', N'Carya texana', N'black hickory')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (302, N'CAUR3', N'Caryota urens', N'jaggery palm')
GO
print 'Processed 300 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (303, N'CAWI', N'Canella winterana', N'wild cinnamon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (304, N'CAZU', N'Calyptranthes zuzygium', N'myrtle of the river')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (305, N'CEAD2', N'Cecropia adenopus', N'Ambay pumpwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (306, N'CEAR', N'Ceanothus arboreus', N'feltleaf ceanothus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (307, N'CEAU8', N'Celtis australis', N'European hackberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (308, N'CECA4', N'Cercis canadensis', N'eastern redbud')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (309, N'CECAC', N'Cercis canadensis var. canadensis', N'eastern redbud')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (310, N'CECAM', N'Cercis canadensis var. mexicana', N'Mexican redbud')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (311, N'CECAT', N'Cercis canadensis var. texensis', N'Texas redbud')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (312, N'CEDE2', N'Cedrus deodara', N'Deodar cedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (313, N'CEDI6', N'Cestrum diurnum', N'day jessamine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (314, N'CEEH', N'Celtis ehrenbergiana', N'spiny hackberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (315, N'CEIG', N'Celtis iguanaea', N'iguana hackberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (316, N'CEIM', N'Ceanothus impressus', N'Santa Barbara ceanothus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (317, N'CEIMI', N'Ceanothus impressus var. impressus', N'Santa Barbara ceanothus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (318, N'CEIMN', N'Ceanothus impressus var. nipomensis', N'Santa Barbara ceanothus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (319, N'CEJA2', N'Cercidiphyllum japonicum', N'katsura tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (320, N'CELA', N'Celtis laevigata', N'sugarberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (321, N'CELAB', N'Celtis laevigata var. brevipes', N'sugarberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (322, N'CELAL', N'Celtis laevigata var. laevigata', N'sugarberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (323, N'CELAR', N'Celtis laevigata var. reticulata', N'netleaf hackberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (324, N'CELAT8', N'Celtis laevigata var. texana', N'Texan sugarberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (325, N'CELE3', N'Cercocarpus ledifolius', N'curl-leaf mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (326, N'CELEI', N'Cercocarpus ledifolius var. intercedens', N'curl-leaf mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (327, N'CELEL', N'Cercocarpus ledifolius var. ledifolius', N'curl-leaf mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (328, N'CELI', N'Celtis lindheimeri', N'Lindheimer''s hackberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (329, N'CEMO2', N'Cercocarpus montanus', N'alderleaf mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (330, N'CEMOA', N'Cercocarpus montanus var. argenteus', N'silver mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (331, N'CEMOB', N'Cercocarpus montanus var. blancheae', N'island mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (332, N'CEMOG', N'Cercocarpus montanus var. glaber', N'birchleaf mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (333, N'CEMOM', N'Cercocarpus montanus var. minutiflorus', N'smooth mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (334, N'CEMOM2', N'Cercocarpus montanus var. macrourus', N'Klamath mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (335, N'CEMOM4', N'Cercocarpus montanus var. montanus', N'alderleaf mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (336, N'CEMOP', N'Cercocarpus montanus var. paucidentatus', N'hairy mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (337, N'CENO', N'Cestrum nocturnum', N'night jessamine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (338, N'CEOC', N'Celtis occidentalis', N'common hackberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (339, N'CEOC2', N'Cephalanthus occidentalis', N'common buttonbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (340, N'CEOR9', N'Cercis orbiculata', N'California redbud')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (341, N'CEPA9', N'Cestrum parqui', N'Chilean jessamine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (342, N'CESA3', N'Cephalanthus salicifolius', N'Mexican buttonbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (343, N'CESI3', N'Ceratonia siliqua', N'St. John''s bread')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (344, N'CESP', N'Ceanothus spinosus', N'redheart')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (345, N'CETE', N'Celtis tenuifolia', N'dwarf hackberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (346, N'CETH', N'Ceanothus thyrsiflorus', N'blueblossom')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (347, N'CETR4', N'Cercocarpus traskiae', N'Catalina Island mountain mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (348, N'CEVE', N'Ceanothus velutinus', N'snowbrush ceanothus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (349, N'CEVEH2', N'Ceanothus velutinus var. hookeri', N'Hooker''s ceanothus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (350, N'CEVEV4', N'Ceanothus velutinus var. velutinus', N'snowbrush ceanothus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (351, N'CHAL8', N'Chiococca alba', N'West Indian milkberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (352, N'CHCH7', N'Chrysolepis chrysophylla', N'giant chinquapin')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (353, N'CHCHC4', N'Chrysolepis chrysophylla var. chrysophylla', N'giant chinquapin')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (354, N'CHIC', N'Chrysobalanus icaco', N'coco plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (355, N'CHLA', N'Chamaecyparis lawsoniana', N'Port Orford cedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (356, N'CHLI2', N'Chilopsis linearis', N'desert willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (357, N'CHLIA', N'Chilopsis linearis ssp. arcuata', N'desert willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (358, N'CHLIL2', N'Chilopsis linearis ssp. linearis', N'desert willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (359, N'CHOL', N'Chrysophyllum oliviforme', N'satinleaf')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (360, N'CHSE17', N'Chamaedorea seifrizii', N'Seifriz''s chamaedorea')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (361, N'CHTH2', N'Chamaecyparis thyoides', N'Atlantic white cedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (362, N'CHVI3', N'Chionanthus virginicus', N'white fringetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (363, N'CIAU7', N'Citrus ×aurantiifolia', N'key lime')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (364, N'CIAU8', N'Citrus ×aurantium', N'sour orange')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (365, N'CIBE', N'Citharexylum berlandieri', N'Berlandier''s fiddlewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (366, N'CICA', N'Cinnamomum camphora', N'camphortree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (367, N'CILI3', N'Citrus ×limonia', N'Mandarin lime')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (368, N'CILI5', N'Citrus ×limon', N'lemon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (369, N'CIME3', N'Citrus medica', N'citron')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (370, N'CIPA3', N'Citrus ×paradisi', N'grapefruit')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (371, N'CIRE3', N'Citrus reticulata', N'tangerine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (372, N'CISI3', N'Citrus ×sinensis', N'sweet orange')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (373, N'CISP3', N'Citharexylum spinosum', N'spiny fiddlewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (374, N'CLAC3', N'Clethra acuminata', N'mountain sweetpepperbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (375, N'CLBU', N'Clerodendrum bungei', N'rose glorybower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (376, N'CLCH4', N'Clerodendrum chinense', N'stickbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (377, N'CLGL2', N'Clerodendrum glabrum', N'Natal glorybower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (378, N'CLIN', N'Clerodendrum indicum', N'turk''s turbin')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (379, N'CLKA2', N'Clerodendrum kaempferi', N'Kaempfer''s glorybower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (380, N'CLKE', N'Cladrastis kentukea', N'Kentucky yellowwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (381, N'CLMO2', N'Cliftonia monophylla', N'buckwheat tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (382, N'CLRO', N'Clusia rosea', N'Scotch attorney')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (383, N'CLSP7', N'Clerodendrum speciosissimum', N'Javanese glorybower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (384, N'CLTR', N'Clerodendrum trichotomum', N'harlequin glorybower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (385, N'CLTRF', N'Clerodendrum trichotomum var. ferrugineum', N'ferruginous clerodendrum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (386, N'COAC', N'Cornus ×acadiensis', N'Acadia dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (387, N'COAL2', N'Cornus alternifolia', N'alternateleaf dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (388, N'COAR', N'Coccothrinax argentata', N'Florida silver palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (389, N'COAR3', N'Colubrina arborescens', N'greenheart')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (390, N'COAR6', N'Colutea arborescens', N'bladder senna')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (391, N'COAS3', N'Colubrina asiatica', N'Asian nakedwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (392, N'COAU12', N'Cordyline australis', N'cabbage tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (393, N'COAV80', N'Corylus avellana', N'common filbert')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (394, N'COBA4', N'Cordia bahamensis', N'Bahama manjack')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (395, N'COBO2', N'Cordia boissieri', N'anacahuita')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (396, N'COCI4', N'Corymbia citriodora', N'lemonscented gum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (397, N'COCO10', N'Cotinus coggygria', N'European smoketree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (398, N'COCO6', N'Corylus cornuta', N'beaked hazelnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (399, N'COCOC', N'Corylus cornuta var. californica', N'California hazelnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (400, N'COCOC2', N'Corylus cornuta var. cornuta', N'beaked hazelnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (401, N'COCU', N'Colubrina cubensis', N'Cuban nakedwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (402, N'COCUF', N'Colubrina cubensis var. floridana', N'Cuban nakedwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (403, N'CODI18', N'Cordia dichotoma', N'fragrant manjack')
GO
print 'Processed 400 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (404, N'CODI3', N'Comarostaphylis diversifolia', N'summer holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (405, N'CODI8', N'Coccoloba diversifolia', N'tietongue')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (406, N'CODID2', N'Comarostaphylis diversifolia ssp. diversifolia', N'summer holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (407, N'CODIP', N'Comarostaphylis diversifolia ssp. planifolia', N'summer holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (408, N'CODR', N'Cornus drummondii', N'roughleaf dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (409, N'COEL2', N'Colubrina elliptica', N'soldierwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (410, N'COER2', N'Conocarpus erectus', N'button mangrove')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (411, N'COFL2', N'Cornus florida', N'flowering dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (412, N'COFO', N'Cornus foemina', N'stiff dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (413, N'COGL', N'Condalia globosa', N'bitter snakewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (414, N'COGL3', N'Cornus glabrata', N'brown dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (415, N'COGLP', N'Condalia globosa var. pubescens', N'bitter snakewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (416, N'COGR24', N'Cornutia grandiflora', N'Mexican-blue')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (417, N'COGR7', N'Colubrina greggii', N'Sierra nakedwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (418, N'COHE12', N'Corylus heterophylla', N'Siberian hazelnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (419, N'COHO', N'Condalia hookeri', N'Brazilian bluewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (420, N'COHOE', N'Condalia hookeri var. edwardsiana', N'Edwards'' bluewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (421, N'COHOH', N'Condalia hookeri var. hookeri', N'Brazilian bluewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (422, N'COKO2', N'Cornus kousa', N'kousa dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (423, N'COLA20', N'Cocculus laurifolius', N'laurel-leaf snailseed')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (424, N'COMA21', N'Cornus mas', N'Cornelian cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (425, N'COMU9', N'Cotoneaster multiflorus', N'cotoneaster')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (426, N'COMY', N'Cordia myxa', N'Assyrian plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (427, N'CONU', N'Cocos nucifera', N'coconut palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (428, N'CONU4', N'Cornus nuttallii', N'Pacific dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (429, N'COOB2', N'Cotinus obovatus', N'American smoketree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (430, N'CORU', N'Cornus rugosa', N'roundleaf dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (431, N'COSE16', N'Cornus sericea', N'redosier dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (432, N'COSE2', N'Cordia sebestena', N'largeleaf geigertree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (433, N'COSE3', N'Cornus sessilis', N'blackfruit dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (434, N'COSEO', N'Cornus sericea ssp. occidentalis', N'western dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (435, N'COSES', N'Cornus sericea ssp. sericea', N'redosier dogwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (436, N'COUV', N'Coccoloba uvifera', N'seagrape')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (437, N'CRAE', N'Crataegus aestivalis', N'may hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (438, N'CRAE2', N'Crataegus aemula', N'Rome hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (439, N'CRAM4', N'Crataegus ambitiosa', N'Grand Rapids hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (440, N'CRAN', N'Crataegus annosa', N'Phoenix City hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (441, N'CRAN10', N'Crataegus anamesa', N'Fort Bend hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (442, N'CRAN6', N'Crataegus ×anomala', N'Arnold hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (443, N'CRAN9', N'Crataegus ancisa', N'Mississippi hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (444, N'CRAP4', N'Crataegus apiomorpha', N'Fort Sheridan hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (445, N'CRAR6', N'Crataegus arborea', N'Montgomery hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (446, N'CRAR7', N'Crataegus arcana', N'Carolina hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (447, N'CRAR8', N'Crataegus arrogans', N'dixie hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (448, N'CRAT3', N'Crataegus ater', N'Nashville hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (449, N'CRAU2', N'Crataegus austromontana', N'valley head hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (450, N'CRBE2', N'Crataegus berberifolia', N'barberry hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (451, N'CRBE5', N'Crataegus beadlei', N'Beadle''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (452, N'CRBE6', N'Crataegus beata', N'Dunbar''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (453, N'CRBO3', N'Crataegus bona', N'Berks County hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (454, N'CRBR', N'Crataegus brachyacantha', N'blueberry hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (455, N'CRBR3', N'Crataegus brainerdii', N'Brainerd''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (456, N'CRBR4', N'Crataegus brazoria', N'Brazos hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (457, N'CRCA', N'Crataegus calpodendron', N'pear hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (458, N'CRCA22', N'Crataegus carrollensis', N'Eureka Springs hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (459, N'CRCA83', N'Crataegus canadensis', N'Canadian hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (460, N'CRCH', N'Crataegus chrysocarpa', N'fireberry hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (461, N'CRCHC2', N'Crataegus chrysocarpa var. chrysocarpa', N'red haw')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (462, N'CRCHP2', N'Crataegus chrysocarpa var. piperi', N'Piper''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (463, N'CRCO13', N'Crataegus contrita', N'southern hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (464, N'CRCO2', N'Crataegus coccinioides', N'Kansas hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (465, N'CRCO26', N'Crataegus compacta', N'clustered hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (466, N'CRCO27', N'Crataegus corusca', N'shiningbranch hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (467, N'CRCO32', N'Crataegus condigna', N'river junction hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (468, N'CRCO4', N'Crataegus coleae', N'Cole''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (469, N'CRCO7', N'Crataegus compta', N'adorned hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (470, N'CRCO8', N'Crataegus consanguinea', N'Tallahassee hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (471, N'CRCR2', N'Crataegus crus-galli', N'cockspur hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (472, N'CRCU', N'Crescentia cujete', N'common calabash tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (473, N'CRDA3', N'Crataegus dallasiana', N'Dallas hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (474, N'CRDE3', N'Crataegus desueta', N'New York hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (475, N'CRDI', N'Crataegus dilatata', N'broadleaf hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (476, N'CRDI10', N'Crataegus dissona', N'northern hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (477, N'CRDI11', N'Crataegus distincta', N'distinct hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (478, N'CRDI3', N'Crataegus dispar', N'Aiken hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (479, N'CRDI4', N'Crataegus disperma', N'spreading hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (480, N'CRDI9', N'Crataegus dispessa', N'mink hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (481, N'CRDO2', N'Crataegus douglasii', N'black hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (482, N'CRDO3', N'Crataegus dodgei', N'Dodge''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (483, N'CREN', N'Crataegus engelmannii', N'Engelmann''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (484, N'CRER', N'Crataegus erythropoda', N'cerro hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (485, N'CRER3', N'Crataegus erythrocarpa', N'red hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (486, N'CREX2', N'Crataegus exilis', N'slender hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (487, N'CREX3', N'Crataegus extraria', N'Marietta hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (488, N'CRFL', N'Crataegus flabellata', N'fanleaf hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (489, N'CRFL2', N'Crataegus flava', N'yellowleaf hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (490, N'CRFR3', N'Crataegus fragilis', N'fragile hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (491, N'CRFU2', N'Crataegus fulleriana', N'Fuller''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (492, N'CRFU3', N'Crataegus furtiva', N'Albany hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (493, N'CRGL4', N'Crataegus glareosa', N'Port Huron hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (494, N'CRGR13', N'Crataegus grandis', N'grand hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (495, N'CRGR2', N'Crataegus greggiana', N'Gregg''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (496, N'CRHA2', N'Crataegus harbisonii', N'Harbison''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (497, N'CRHA4', N'Crataegus harveyana', N'Harvey''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (498, N'CRHE3', N'Crataegus helvina', N'Clarkton hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (499, N'CRHO5', N'Crataegus holmesiana', N'Holmes'' hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (500, N'CRID', N'Crataegus ideae', N'Concord hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (501, N'CRIG2', N'Crataegus ignave', N'Bedford Springs hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (502, N'CRIM6', N'Crataegus impar', N'redclay hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (503, N'CRIN16', N'Crataegus indicens', N'Mansfield hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (504, N'CRIN17', N'Crataegus insidiosa', N'Ozark hawthorn')
GO
print 'Processed 500 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (505, N'CRIN18', N'Crataegus integra', N'Lake Ella hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (506, N'CRIN19', N'Crataegus invicta', N'Fulton hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (507, N'CRIN26', N'Crataegus inanis', N'oldmaid hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (508, N'CRIN3', N'Crataegus intricata', N'Copenhagen hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (509, N'CRIR', N'Crataegus iracunda', N'stolonbearing hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (510, N'CRIR2', N'Crataegus irrasa', N'Blanchard''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (511, N'CRJA3', N'Cryptomeria japonica', N'Japanese cedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (512, N'CRJE', N'Crataegus jesupii', N'Jesup''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (513, N'CRJO3', N'Crataegus jonesiae', N'Miss Jones'' hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (514, N'CRKE2', N'Crataegus kelloggii', N'Kellogg''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (515, N'CRKI', N'Crataegus kingstonensis', N'Kingston''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (516, N'CRKN', N'Crataegus knieskerniana', N'Knieskern''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (517, N'CRLA11', N'Crataegus latebrosa', N'densewoods hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (518, N'CRLA2', N'Crataegus lacrimata', N'Pensacola hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (519, N'CRLA3', N'Crataegus lanuginosa', N'woolly hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (520, N'CRLA80', N'Crataegus laevigata', N'smooth hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (521, N'CRLA9', N'Crataegus lanata', N'hoary hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (522, N'CRLE8', N'Crataegus lemingtonensis', N'Lemington hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (523, N'CRLI12', N'Crataegus limnophila', N'waterloving hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (524, N'CRLI6', N'Crataegus limata', N'Warm Springs hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (525, N'CRLU', N'Crataegus lucorum', N'grove hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (526, N'CRLU3', N'Crataegus lumaria', N'roundleaf hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (527, N'CRMA3', N'Crataegus macrosperma', N'bigfruit hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (528, N'CRMA4', N'Crataegus margarettiae', N'Margarett''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (529, N'CRMA5', N'Crataegus marshallii', N'parsley hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (530, N'CRME', N'Crataegus mendosa', N'Albertville hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (531, N'CRME11', N'Crataegus membranacea', N'tissueleaf hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (532, N'CRME3', N'Crataegus meridionalis', N'gallion hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (533, N'CRME6', N'Crataegus menandiana', N'Menand''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (534, N'CRMO2', N'Crataegus mollis', N'downy hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (535, N'CRMO3', N'Crataegus monogyna', N'oneseed hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (536, N'CRMU11', N'Crataegus multiflora', N'inkberry hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (537, N'CRNI', N'Crataegus nitida', N'glossy hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (538, N'CRNI4', N'Crataegus nitidula', N'Ontario hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (539, N'CRNU4', N'Crataegus nuda', N'nude hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (540, N'CROK2', N'Crataegus okennonii', N'O''kennon''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (541, N'CROP', N'Crataegus opaca', N'riverflat hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (542, N'CROP3', N'Crataegus opulens', N'Rochester hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (543, N'CROV2', N'Crataegus ovata', N'ovateleaf hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (544, N'CRPA3', N'Crataegus panda', N'Florida hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (545, N'CRPE', N'Crataegus pedicellata', N'scarlet hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (546, N'CRPE13', N'Crataegus pearsonii', N'Pearson''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (547, N'CRPE2', N'Crataegus penita', N'Great Smoky Mountain hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (548, N'CRPE3', N'Crataegus pennsylvanica', N'Pennsylvania hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (549, N'CRPE6', N'Crataegus persimilis', N'plumleaf hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (550, N'CRPE7', N'Crataegus perjucunda', N'pearthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (551, N'CRPH', N'Crataegus phaenopyrum', N'Washington hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (552, N'CRPH2', N'Crataegus phippsii', N'Phipps'' hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (553, N'CRPI3', N'Crataegus pinetorum', N'pineland hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (554, N'CRPO', N'Crataegus poliophylla', N'elegant hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (555, N'CRPO11', N'Crataegus porrecta', N'Pittsburgh hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (556, N'CRPR', N'Crataegus pringlei', N'Pringle''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (557, N'CRPR2', N'Crataegus pruinosa', N'waxyfruit hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (558, N'CRPR4', N'Crataegus pratensis', N'prairie hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (559, N'CRPR5', N'Crataegus prona', N'Illinois hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (560, N'CRPU', N'Crataegus punctata', N'dotted hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (561, N'CRPU14', N'Crataegus putata', N'Scranton hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (562, N'CRPU9', N'Crataegus pulcherrima', N'beautiful hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (563, N'CRRA6', N'Crataegus ravida', N'jeweled hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (564, N'CRRE11', N'Crataegus resima', N'gulf hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (565, N'CRRE3', N'Crataegus reverchonii', N'Reverchon''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (566, N'CRRH', N'Crossopetalum rhacoma', N'maidenberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (567, N'CRRH2', N'Crataegus rhodella', N'Franklin''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (568, N'CRRI', N'Crataegus rivularis', N'river hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (569, N'CRRI5', N'Crataegus rigens', N'Gadsden hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (570, N'CRRU5', N'Crataegus rufula', N'rusty hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (571, N'CRSA2', N'Crataegus saligna', N'willow hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (572, N'CRSA3', N'Crataegus sargentii', N'Sargent''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (573, N'CRSC4', N'Crataegus schuettei', N'Schuette''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (574, N'CRSC80', N'Crataegus scabrida', N'rough hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (575, N'CRSH3', N'Crataegus shaferi', N'Shafer''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (576, N'CRSP', N'Crataegus spathulata', N'littlehip hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (577, N'CRSP5', N'Crataegus spatiosa', N'New London hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (578, N'CRSP6', N'Crataegus spissa', N'Essex hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (579, N'CRST', N'Crataegus stenosepala', N'duke hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (580, N'CRSU16', N'Crataegus suksdorfii', N'Suksdorf''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (581, N'CRSU2', N'Crataegus submollis', N'Quebec hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (582, N'CRSU3', N'Crataegus suborbiculata', N'Caughuawaga hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (583, N'CRSU5', N'Crataegus succulenta', N'fleshy hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (584, N'CRSU6', N'Crataegus sutherlandensis', N'Sutherland hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (585, N'CRTA2', N'Crataegus tanuphylla', N'keystone hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (586, N'CRTE2', N'Crataegus texana', N'Texas hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (587, N'CRTH4', N'Crataegus thermopegaea', N'graceful hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (588, N'CRTI2', N'Crataegus tinctoria', N'dyed hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (589, N'CRTR', N'Crataegus tracyi', N'Tracy''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (590, N'CRTR2', N'Crataegus triflora', N'threeflower hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (591, N'CRTR4', N'Crataegus tristis', N'minute hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (592, N'CRTU2', N'Crataegus turnerorum', N'Turner''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (593, N'CRUN', N'Crataegus uniflora', N'dwarf hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (594, N'CRVA', N'Crataegus vailiae', N'Miss Vail''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (595, N'CRVA3', N'Crataegus valida', N'Rockmart hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (596, N'CRVE11', N'Crataegus versuta', N'Johnny Reb hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (597, N'CRVI', N'Crataegus viburnifolia', N'sawtooth hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (598, N'CRVI2', N'Crataegus viridis', N'green hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (599, N'CRVID', N'Crataegus viridis var. desertorum', N'desert hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (600, N'CRVIV2', N'Crataegus viridis var. viridis', N'green hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (601, N'CRVU', N'Crataegus vulsa', N'Alabama hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (602, N'CRWA', N'Crataegus warneri', N'Warner''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (603, N'CRWI3', N'Crataegus williamsii', N'Williams'' hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (604, N'CRWO', N'Crataegus wootoniana', N'Wooton''s hawthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (605, N'CRXA', N'Crataegus xanthophylla', N'buffalo hawthorn')
GO
print 'Processed 600 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (606, N'CUAB', N'Cupressus abramsiana', N'Santa Cruz cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (607, N'CUAN4', N'Cupaniopsis anacardioides', N'carrotwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (608, N'CUAR', N'Cupressus arizonica', N'Arizona cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (609, N'CUARA', N'Cupressus arizonica ssp. arizonica', N'Arizona cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (610, N'CUARN2', N'Cupressus arizonica ssp. nevadensis', N'Paiute cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (611, N'CUARS2', N'Cupressus arizonica ssp. stephensonii', N'Cuyamaca cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (612, N'CUBA', N'Cupressus bakeri', N'Modoc cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (613, N'CUFO2', N'Cupressus forbesii', N'tecate cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (614, N'CUGL', N'Cupania glabra', N'Florida toadwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (615, N'CUGO', N'Cupressus goveniana', N'Gowen cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (616, N'CUGOG', N'Cupressus goveniana ssp. goveniana', N'Gowen cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (617, N'CUGOP2', N'Cupressus goveniana ssp. pygmaea', N'pygmy cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (618, N'CULA', N'Cunninghamia lanceolata', N'Chinese fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (619, N'CUMA', N'Cupressus macnabiana', N'MacNab''s cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (620, N'CUMA2', N'Cupressus macrocarpa', N'Monterey cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (621, N'CUNO', N'Cupressus nootkatensis', N'Alaska cedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (622, N'CUSA3', N'Cupressus sargentii', N'Sargent''s cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (623, N'CUTR2', N'Cudrania tricuspidata', N'storehousebush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (624, N'CYFU10', N'Cylindropuntia fulgida', N'jumping cholla')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (625, N'CYFUF', N'Cylindropuntia fulgida var. fulgida', N'jumping cholla')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (626, N'CYFUM', N'Cylindropuntia fulgida var. mamillata', N'jumping cholla')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (627, N'CYIM2', N'Cylindropuntia imbricata', N'tree cholla')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (628, N'CYIMA', N'Cylindropuntia imbricata var. argentea', N'tree cholla')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (629, N'CYIMI', N'Cylindropuntia imbricata var. imbricata', N'tree cholla')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (630, N'CYOB2', N'Cydonia oblonga', N'quince')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (631, N'CYPA6', N'Cyrilla parvifolia', N'littleleaf titi')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (632, N'CYRA', N'Cyrilla racemiflora', N'swamp titi')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (633, N'CYRE11', N'Cycas revoluta', N'sago palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (634, N'DAEC', N'Dalbergia ecastaphyllum', N'coinvine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (635, N'DALA11', N'Daphne laureola', N'spurgelaurel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (636, N'DASI', N'Dalbergia sissoo', N'Indian rosewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (637, N'DEHA3', N'Dendromecon harfordii', N'Harford''s tree poppy')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (638, N'DERE', N'Delonix regia', N'royal poinciana')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (639, N'DERI', N'Dendromecon rigida', N'tree poppy')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (640, N'DERIR', N'Dendromecon rigida ssp. rhamnoides', N'tree poppy')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (641, N'DERIR2', N'Dendromecon rigida ssp. rigida', N'tree poppy')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (642, N'DICI2', N'Dichrostachys cinerea', N'aroma')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (643, N'DIDI15', N'Diospyros digyna', N'black sapote')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (644, N'DIEB2', N'Diospyros ebenum', N'ebony')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (645, N'DIMA24', N'Diospyros maritima', N'Malaysian persimmon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (646, N'DITE3', N'Diospyros texana', N'Texas persimmon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (647, N'DIVI5', N'Diospyros virginiana', N'common persimmon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (648, N'DOVI', N'Dodonaea viscosa', N'Florida hopbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (649, N'DRDI', N'Drypetes diversifolia', N'milkbark')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (650, N'DRLA3', N'Drypetes lateriflora', N'guiana plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (651, N'DUER', N'Duranta erecta', N'golden dewdrops')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (652, N'DYLU', N'Dypsis lutescens', N'yellow butterfly palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (653, N'EBEB', N'Ebenopsis ebano', N'Texas ebony')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (654, N'EHAN', N'Ehretia anacua', N'knockaway')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (655, N'ELAN', N'Elaeagnus angustifolia', N'Russian olive')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (656, N'ELGU', N'Elaeis guineensis', N'African oil palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (657, N'ELRA2', N'Elliottia racemosa', N'georgiaplume')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (658, N'ENCO2', N'Enterolobium contortisiliquum', N'pacara earpod tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (659, N'ERCR6', N'Erythrina crista-galli', N'crybabytree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (660, N'ERFL7', N'Erythrina flabelliformis', N'coralbean')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (661, N'ERFR4', N'Erithalis fruticosa', N'blacktorch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (662, N'ERHE4', N'Erythrina herbacea', N'redcardinal')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (663, N'ERJA3', N'Eriobotrya japonica', N'loquat')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (664, N'ESBE', N'Esenbeckia berlandieri', N'Berlandier''s jopoy')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (665, N'EUAP', N'Eugenia apiculata', N'shortleaf stopper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (666, N'EUAT5', N'Euonymus atropurpureus', N'burningbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (667, N'EUATA2', N'Euonymus atropurpureus var. atropurpureus', N'eastern wahoo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (668, N'EUATC2', N'Euonymus atropurpureus var. cheatumii', N'eastern wahoo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (669, N'EUAX', N'Eugenia axillaris', N'white stopper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (670, N'EUBU5', N'Euonymus bungeanus', N'winterberry euonymus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (671, N'EUCA2', N'Eucalyptus camaldulensis', N'river redgum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (672, N'EUCL', N'Eucalyptus cladocalyx', N'sugargum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (673, N'EUCO4', N'Eugenia confusa', N'redberry stopper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (674, N'EUEU7', N'Euonymus europaeus', N'European spindletree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (675, N'EUFO3', N'Eugenia foetida', N'boxleaf stopper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (676, N'EUGL', N'Eucalyptus globulus', N'Tasmanian bluegum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (677, N'EUGLG', N'Eucalyptus globulus ssp. globulus', N'Tasmanian bluegum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (678, N'EUGR12', N'Eucalyptus grandis', N'grand eucalyptus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (679, N'EUHA7', N'Euonymus hamiltonianus', N'Hamilton''s spindletree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (680, N'EUHAM2', N'Euonymus hamiltonianus ssp. maackii', N'Hamilton''s spindletree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (681, N'EUHAS2', N'Euonymus hamiltonianus ssp. sieboldianus', N'Hamilton''s spindletree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (682, N'EUJA8', N'Euonymus japonicus', N'Japanese spindletree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (683, N'EULA8', N'Euphorbia lactea', N'mottled spurge')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (684, N'EUOC8', N'Euonymus occidentalis', N'western burning bush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (685, N'EUOCO', N'Euonymus occidentalis var. occidentalis', N'western burning bush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (686, N'EUOCP2', N'Euonymus occidentalis var. parishii', N'western burning bush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (687, N'EUPO', N'Eucalyptus polyanthemos', N'redbox')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (688, N'EUPU', N'Eucalyptus pulverulenta', N'silverleaf mountain gum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (689, N'EURH', N'Eugenia rhombea', N'red stopper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (690, N'EURO2', N'Eucalyptus robusta', N'swampmahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (691, N'EUSI2', N'Eucalyptus sideroxylon', N'red ironbark')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (692, N'EUTE', N'Eucalyptus tereticornis', N'forest redgum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (693, N'EUTI', N'Euphorbia tirucalli', N'Indiantree spurge')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (694, N'EUTO11', N'Eucalyptus torquata', N'coral gum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (695, N'EUUN2', N'Eugenia uniflora', N'Surinam cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (696, N'EUVI', N'Eucalyptus viminalis', N'manna gum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (697, N'EXCA', N'Exostema caribaeum', N'Caribbean princewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (698, N'EXPA', N'Exothea paniculata', N'butterbough')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (699, N'EYOR', N'Eysenhardtia orthocarpa', N'Tahitian kidneywood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (700, N'EYTE', N'Eysenhardtia texana', N'Texas kidneywood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (701, N'FAGR', N'Fagus grandifolia', N'American beech')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (702, N'FASY', N'Fagus sylvatica', N'European beech')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (703, N'FEWI', N'Ferocactus wislizeni', N'candy barrelcactus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (704, N'FIAL4', N'Ficus altissima', N'council tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (705, N'FIAM', N'Ficus americana', N'Jamaican cherry fig')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (706, N'FIAU', N'Ficus aurea', N'Florida strangler fig')
GO
print 'Processed 700 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (707, N'FIBE', N'Ficus benjamina', N'weeping fig')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (708, N'FIBE2', N'Ficus benghalensis', N'Indian banyan')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (709, N'FICA', N'Ficus carica', N'edible fig')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (710, N'FICI', N'Ficus citrifolia', N'wild banyantree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (711, N'FIEL', N'Ficus elastica', N'Indian rubberplant')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (712, N'FIMI2', N'Ficus microcarpa', N'Chinese banyan')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (713, N'FIPA2', N'Ficus palmata', N'Punjab fig')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (714, N'FIRE3', N'Ficus religiosa', N'peepul tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (715, N'FIRU4', N'Ficus rubiginosa', N'Port Jackson fig')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (716, N'FISI2', N'Firmiana simplex', N'Chinese parasoltree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (717, N'FLAC', N'Flueggea acidoton', N'simpleleaf bushweed')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (718, N'FLIN', N'Flacourtia indica', N'governor''s plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (719, N'FOAC', N'Forestiera acuminata', N'eastern swampprivet')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (720, N'FOAN', N'Forestiera angustifolia', N'Texas swampprivet')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (721, N'FOJA', N'Fortunella japonica', N'round kumquat')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (722, N'FOSE', N'Forestiera segregata', N'Florida swampprivet')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (723, N'FOSEP', N'Forestiera segregata var. pinetorum', N'Florida swampprivet')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (724, N'FOSES', N'Forestiera segregata var. segregata', N'Florida swampprivet')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (725, N'FOSH', N'Forestiera shrevei', N'desert olive')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (726, N'FRAL', N'Franklinia alatamaha', N'Franklin tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (727, N'FRAL4', N'Frangula alnus', N'glossy buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (728, N'FRAM2', N'Fraxinus americana', N'white ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (729, N'FRAN2', N'Fraxinus anomala', N'singleleaf ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (730, N'FRANA', N'Fraxinus anomala var. anomala', N'singleleaf ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (731, N'FRANL', N'Fraxinus anomala var. lowellii', N'singleleaf ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (732, N'FRBE', N'Fraxinus berlandieriana', N'Mexican ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (733, N'FRBE2', N'Frangula betulifolia', N'beechleaf frangula')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (734, N'FRBEB', N'Frangula betulifolia ssp. betulifolia', N'beechleaf frangula')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (735, N'FRBEO', N'Frangula betulifolia ssp. obovata', N'obovate buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (736, N'FRCA12', N'Frangula californica', N'California buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (737, N'FRCA13', N'Frangula caroliniana', N'Carolina buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (738, N'FRCA3', N'Fraxinus caroliniana', N'Carolina ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (739, N'FRCA6', N'Fremontodendron californicum', N'California flannelbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (740, N'FRCAC5', N'Frangula californica ssp. californica', N'California buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (741, N'FRCAC6', N'Frangula californica ssp. crassifolia', N'California buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (742, N'FRCAC7', N'Frangula californica ssp. cuspidata', N'California buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (743, N'FRCAO4', N'Frangula californica ssp. occidentalis', N'California buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (744, N'FRCAT2', N'Frangula californica ssp. tomentella', N'California buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (745, N'FRCAU', N'Frangula californica ssp. ursina', N'California buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (746, N'FRCU', N'Fraxinus cuspidata', N'fragrant ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (747, N'FRDI2', N'Fraxinus dipetala', N'California ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (748, N'FREX80', N'Fraxinus excelsior', N'European ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (749, N'FRGO', N'Fraxinus gooddingii', N'Goodding''s ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (750, N'FRGR2', N'Fraxinus greggii', N'Gregg''s ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (751, N'FRLA', N'Fraxinus latifolia', N'Oregon ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (752, N'FRME2', N'Fremontodendron mexicanum', N'Mexican flannelbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (753, N'FRNI', N'Fraxinus nigra', N'black ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (754, N'FRPA4', N'Fraxinus papillosa', N'Chihuahuan ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (755, N'FRPE', N'Fraxinus pennsylvanica', N'green ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (756, N'FRPR', N'Fraxinus profunda', N'pumpkin ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (757, N'FRPU7', N'Frangula purshiana', N'Cascara buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (758, N'FRQU', N'Fraxinus quadrangulata', N'blue ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (759, N'FRTE', N'Fraxinus texensis', N'Texas ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (760, N'FRUH', N'Fraxinus uhdei', N'shamel ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (761, N'FRVE2', N'Fraxinus velutina', N'velvet ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (762, N'FUBO', N'Fuchsia boliviana', N'Bolivian fuchsia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (763, N'FUPA2', N'Fuchsia paniculata', N'shrubby fuchsia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (764, N'FUSE', N'Furcraea selloa', N'wild sisal')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (765, N'GACO9', N'Garrya congdonii', N'chaparral silktassel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (766, N'GAEL', N'Garrya elliptica', N'wavyleaf silktassel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (767, N'GAFL2', N'Garrya flavescens', N'ashy silktassel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (768, N'GAFR', N'Garrya fremontii', N'bearbrush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (769, N'GAOV', N'Garrya ovata', N'eggleaf silktassel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (770, N'GAOVG', N'Garrya ovata ssp. goldmanii', N'Goldman''s silktassel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (771, N'GAOVL', N'Garrya ovata ssp. lindheimeri', N'Lindheimer''s silktassel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (772, N'GAVE2', N'Garrya veatchii', N'canyon silktassel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (773, N'GAWR3', N'Garrya wrightii', N'Wright''s silktassel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (774, N'GECA16', N'Genista canariensis', N'Canary broom')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (775, N'GIBI2', N'Ginkgo biloba', N'maidenhair tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (776, N'GLAQ', N'Gleditsia aquatica', N'water locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (777, N'GLPA4', N'Glycosmis parviflora', N'flower axistree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (778, N'GLSE2', N'Gliricidia sepium', N'quickstick')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (779, N'GLTR', N'Gleditsia triacanthos', N'honeylocust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (780, N'GOHI', N'Gossypium hirsutum', N'upland cotton')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (781, N'GOHIH2', N'Gossypium hirsutum var. hirsutum', N'upland cotton')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (782, N'GOLA', N'Gordonia lasianthus', N'loblolly bay')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (783, N'GOTH', N'Gossypium thurberi', N'Thurber''s cotton')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (784, N'GRRO', N'Grevillea robusta', N'silkoak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (785, N'GUAN', N'Guaiacum angustifolium', N'Texas lignum-vitae')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (786, N'GUDI', N'Guapira discolor', N'beeftree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (787, N'GUEL', N'Guettarda elliptica', N'hammock velvetseed')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (788, N'GUGL2', N'Guapira globosa', N'roundleaf blolly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (789, N'GUOB', N'Guapira obtusata', N'corcho prieto')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (790, N'GUOF', N'Guaiacum officinale', N'lignum-vitae')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (791, N'GUSA', N'Guaiacum sanctum', N'holywood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (792, N'GUSC', N'Guettarda scabra', N'wild guave')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (793, N'GYDI', N'Gymnocladus dioicus', N'Kentucky coffeetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (794, N'GYLA', N'Gyminda latifolia', N'West Indian false box')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (795, N'GYLU', N'Gymnanthes lucida', N'oysterwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (796, N'HAAR4', N'Harpullia arborea', N'tulip-wood tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (797, N'HACA3', N'Halesia carolina', N'Carolina silverbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (798, N'HADI3', N'Halesia diptera', N'two-wing silverbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (799, N'HAPA10', N'Havardia pallens', N'haujillo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (800, N'HAPA3', N'Hamelia patens', N'scarletbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (801, N'HATE3', N'Halesia tetraptera', N'mountain silverbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (802, N'HATEM', N'Halesia tetraptera var. monticola', N'mountain silverbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (803, N'HATET', N'Halesia tetraptera var. tetraptera', N'mountain silverbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (804, N'HAVE2', N'Hamamelis vernalis', N'Ozark witchhazel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (805, N'HAVI4', N'Hamamelis virginiana', N'American witchhazel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (806, N'HEAR5', N'Heteromeles arbutifolia', N'toyon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (807, N'HEARA2', N'Heteromeles arbutifolia var. arbutifolia', N'toyon')
GO
print 'Processed 800 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (808, N'HEARC2', N'Heteromeles arbutifolia var. cerina', N'toyon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (809, N'HEARM', N'Heteromeles arbutifolia var. macrocarpa', N'toyon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (810, N'HEPA3', N'Helietta parvifolia', N'barreta')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (811, N'HIMA2', N'Hippomane mancinella', N'manchineel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (812, N'HIMU3', N'Hibiscus mutabilis', N'Dixie rosemallow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (813, N'HIRH80', N'Hippophae rhamnoides', N'seaberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (814, N'HIRO3', N'Hibiscus rosa-sinensis', N'shoeblackplant')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (815, N'HISY', N'Hibiscus syriacus', N'rose of Sharon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (816, N'HITI', N'Hibiscus tiliaceus', N'sea hibiscus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (817, N'HODU2', N'Hovenia dulcis', N'Japanese raisintree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (818, N'HOPO5', N'Hoheria populnea', N'lacebark')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (819, N'HUCR', N'Hura crepitans', N'sandbox tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (820, N'HYCA11', N'Hypericum canariense', N'Canary Island St. Johnswort')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (821, N'HYCH2', N'Hypericum chapmanii', N'Apalachicola St. Johnswort')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (822, N'HYTR', N'Hypelate trifoliata', N'inkwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (823, N'HYUN3', N'Hylocereus undatus', N'nightblooming cactus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (824, N'ILAM', N'Ilex ambigua', N'Carolina holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (825, N'ILAM2', N'Ilex amelanchier', N'sarvis holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (826, N'ILAQ80', N'Ilex aquifolium', N'English holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (827, N'ILAT', N'Ilex ×attenuata', N'topal holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (828, N'ILCA', N'Ilex cassine', N'dahoon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (829, N'ILCAC', N'Ilex cassine var. cassine', N'dahoon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (830, N'ILCAL', N'Ilex cassine var. latifolia', N'dahoon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (831, N'ILCO', N'Ilex coriacea', N'large gallberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (832, N'ILCO2', N'Ilex collina', N'longstalk holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (833, N'ILCO80', N'Ilex cornuta', N'Chinese holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (834, N'ILCR2', N'Ilex crenata', N'Japanese holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (835, N'ILCU3', N'Ilex cuthbertii', N'Cuthbert''s holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (836, N'ILDE', N'Ilex decidua', N'possumhaw')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (837, N'ILFL', N'Illicium floridanum', N'Florida anisetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (838, N'ILKR', N'Ilex krugiana', N'tawnyberry holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (839, N'ILLA', N'Ilex laevigata', N'smooth winterberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (840, N'ILLO', N'Ilex longipes', N'Georgia holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (841, N'ILMO', N'Ilex montana', N'mountain holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (842, N'ILMU', N'Ilex mucronata', N'catberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (843, N'ILMY', N'Ilex myrtifolia', N'myrtle dahoon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (844, N'ILOP', N'Ilex opaca', N'American holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (845, N'ILOPA', N'Ilex opaca var. arenicola', N'American holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (846, N'ILOPO', N'Ilex opaca var. opaca', N'American holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (847, N'ILPA', N'Illicium parviflorum', N'yellow anisetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (848, N'ILRO2', N'Ilex rotunda', N'Kurogane holly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (849, N'ILVE', N'Ilex verticillata', N'common winterberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (850, N'ILVO', N'Ilex vomitoria', N'yaupon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (851, N'IXPA', N'Ixora pavetta', N'torch tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (852, N'JAAR2', N'Jacquinia armillaris', N'braceletwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (853, N'JACU2', N'Jatropha curcas', N'Barbados nut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (854, N'JAIN', N'Jatropha integerrima', N'peregrina')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (855, N'JAINI', N'Jatropha integerrima var. integerrima', N'peregrina')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (856, N'JAKE', N'Jacquinia keyensis', N'joewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (857, N'JAMI', N'Jacaranda mimosifolia', N'black poui')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (858, N'JAMU', N'Jatropha multifida', N'coralbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (859, N'JUAI2', N'Juglans ailantifolia', N'Japanese walnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (860, N'JUAS', N'Juniperus ashei', N'Ashe''s juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (861, N'JUCA', N'Juglans californica', N'Southern California walnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (862, N'JUCA7', N'Juniperus californica', N'California juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (863, N'JUCI', N'Juglans cinerea', N'butternut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (864, N'JUCO11', N'Juniperus coahuilensis', N'redberry juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (865, N'JUCO6', N'Juniperus communis', N'common juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (866, N'JUCOA2', N'Juniperus coahuilensis var. arizonica', N'redberry juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (867, N'JUCOC2', N'Juniperus coahuilensis var. coahuilensis', N'redberry juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (868, N'JUCOD', N'Juniperus communis var. depressa', N'common juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (869, N'JUCOM', N'Juniperus communis var. megistocarpa', N'common juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (870, N'JUCOS2', N'Juniperus communis var. saxatilis', N'common juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (871, N'JUDE2', N'Juniperus deppeana', N'alligator juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (872, N'JUFA2', N'Juniperus ×fassettii', N'Fassett''s juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (873, N'JUFL', N'Juniperus flaccida', N'drooping juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (874, N'JUHI', N'Juglans hindsii', N'Northern California walnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (875, N'JUMA', N'Juglans major', N'Arizona walnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (876, N'JUMI', N'Juglans microcarpa', N'little walnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (877, N'JUMIM', N'Juglans microcarpa var. microcarpa', N'little walnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (878, N'JUMIS', N'Juglans microcarpa var. stewartii', N'Stewart''s little walnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (879, N'JUMO', N'Juniperus monosperma', N'oneseed juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (880, N'JUNI', N'Juglans nigra', N'black walnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (881, N'JUOC', N'Juniperus occidentalis', N'western juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (882, N'JUOCA', N'Juniperus occidentalis var. australis', N'western juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (883, N'JUOCO', N'Juniperus occidentalis var. occidentalis', N'western juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (884, N'JUOS', N'Juniperus osteosperma', N'Utah juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (885, N'JUPI', N'Juniperus pinchotii', N'Pinchot''s juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (886, N'JURE80', N'Juglans regia', N'English walnut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (887, N'JUSA5', N'Juniperus sabina', N'savin')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (888, N'JUSC2', N'Juniperus scopulorum', N'Rocky Mountain juniper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (889, N'JUVI', N'Juniperus virginiana', N'eastern redcedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (890, N'JUVIS', N'Juniperus virginiana var. silicicola', N'southern redcedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (891, N'JUVIV', N'Juniperus virginiana var. virginiana', N'eastern redcedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (892, N'KAHU', N'Karwinskia humboldtiana', N'coyotillo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (893, N'KALA', N'Kalmia latifolia', N'mountain laurel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (894, N'KASE', N'Kalopanax septemlobus', N'castor aralia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (895, N'KHSE2', N'Khaya senegalensis', N'Senegal mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (896, N'KOEL', N'Koelreuteria elegans', N'flamegold')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (897, N'KOELF', N'Koelreuteria elegans ssp. formosana', N'flamegold')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (898, N'KOPA', N'Koelreuteria paniculata', N'goldenrain tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (899, N'KOSP', N'Koeberlinia spinosa', N'crown of thorns')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (900, N'KOSPS', N'Koeberlinia spinosa var. spinosa', N'crown of thorns')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (901, N'KOSPT', N'Koeberlinia spinosa var. tenuispina', N'crown of thorns')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (902, N'KRFE', N'Krugiodendron ferreum', N'leadwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (903, N'LAAN2', N'Laburnum anagyroides', N'golden chain tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (904, N'LADE2', N'Larix decidua', N'European larch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (905, N'LAIN', N'Lagerstroemia indica', N'crapemyrtle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (906, N'LAIN2', N'Lantana involucrata', N'buttonsage')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (907, N'LAINI', N'Lantana involucrata var. involucrata', N'buttonsage')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (908, N'LAINO', N'Lantana involucrata var. odorata', N'fragrant buttonsage')
GO
print 'Processed 900 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (909, N'LAKA2', N'Larix kaempferi', N'Japanese larch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (910, N'LALA', N'Larix laricina', N'tamarack')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (911, N'LALY', N'Larix lyallii', N'subalpine larch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (912, N'LANO80', N'Laurus nobilis', N'sweet bay')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (913, N'LAOC', N'Larix occidentalis', N'western larch')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (914, N'LARA2', N'Laguncularia racemosa', N'white mangrove')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (915, N'LEES2', N'Leucaena esculenta', N'guaje')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (916, N'LEFL', N'Leitneria floridana', N'corkwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (917, N'LELA29', N'Leptospermum laevigatum', N'Australian teatree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (918, N'LELE10', N'Leucaena leucocephala', N'white leadtree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (919, N'LELEL2', N'Leucaena leucocephala ssp. leucocephala', N'white leadtree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (920, N'LEPU3', N'Leucaena pulverulenta', N'great leadtree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (921, N'LERE5', N'Leucaena retusa', N'littleleaf leadtree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (922, N'LESQ', N'Lepidospartum squamatum', N'California broomsage')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (923, N'LIAR10', N'Limonium arborescens', N'tree limonium')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (924, N'LIBE3', N'Lindera benzoin', N'northern spicebush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (925, N'LIBEB', N'Lindera benzoin var. benzoin', N'northern spicebush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (926, N'LIBEP', N'Lindera benzoin var. pubescens', N'northern spicebush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (927, N'LICH3', N'Livistona chinensis', N'fountain palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (928, N'LIDE3', N'Lithocarpus densiflorus', N'tanoak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (929, N'LIDED2', N'Lithocarpus densiflorus var. densiflorus', N'tanoak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (930, N'LIDEE', N'Lithocarpus densiflorus var. echinoides', N'tanoak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (931, N'LIJA', N'Ligustrum japonicum', N'Japanese privet')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (932, N'LILU2', N'Ligustrum lucidum', N'glossy privet')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (933, N'LIME7', N'Lindera melissifolia', N'southern spicebush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (934, N'LIMO4', N'Lithrea molleoides', N'aroeira blanca')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (935, N'LIOV', N'Ligustrum ovalifolium', N'California privet')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (936, N'LIRO5', N'Livistona rotundifolia', N'round-leaf fountain palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (937, N'LISI', N'Ligustrum sinense', N'Chinese privet')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (938, N'LIST2', N'Liquidambar styraciflua', N'sweetgum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (939, N'LISU8', N'Lindera subcoriacea', N'bog spicebush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (940, N'LITR', N'Licaria triandra', N'pepperleaf sweetwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (941, N'LITU', N'Liriodendron tulipifera', N'tuliptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (942, N'LOPU4', N'Lonchocarpus punctatus', N'dotted lancepod')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (943, N'LYFE', N'Lyonia ferruginea', N'rusty staggerbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (944, N'LYFL2', N'Lyonothamnus floribundus', N'Catalina ironwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (945, N'LYFLA', N'Lyonothamnus floribundus ssp. aspleniifolius', N'fern-leaf Catalina ironwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (946, N'LYFLF', N'Lyonothamnus floribundus ssp. floribundus', N'Catalina ironwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (947, N'LYLA3', N'Lysiloma latisiliquum', N'false tamarind')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (948, N'LYSA5', N'Lysiloma sabicu', N'horseflesh mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (949, N'LYWA', N'Lysiloma watsonii', N'littleleaf false tamarind')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (950, N'MAAC', N'Magnolia acuminata', N'cucumber-tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (951, N'MAAN3', N'Malus angustifolia', N'southern crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (952, N'MAANA', N'Malus angustifolia var. angustifolia', N'southern crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (953, N'MAANP', N'Malus angustifolia var. puberula', N'southern crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (954, N'MAAS', N'Magnolia ashei', N'Ashe''s magnolia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (955, N'MABA', N'Malus baccata', N'Siberian crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (956, N'MABO8', N'Maytenus boaria', N'mayten')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (957, N'MACO5', N'Malus coronaria', N'sweet crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (958, N'MAEM', N'Malpighia emarginata', N'Barbados cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (959, N'MAES', N'Manihot esculenta', N'cassava')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (960, N'MAFL80', N'Malus floribunda', N'Japanese flowering crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (961, N'MAFR', N'Magnolia fraseri', N'mountain magnolia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (962, N'MAFU', N'Malus fusca', N'Oregon crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (963, N'MAGL6', N'Malpighia glabra', N'wild crapemyrtle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (964, N'MAGR4', N'Magnolia grandiflora', N'southern magnolia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (965, N'MAGR8', N'Manihot grahamii', N'Graham''s manihot')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (966, N'MAHA7', N'Malus halliana', N'Hall crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (967, N'MAIN3', N'Mangifera indica', N'mango')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (968, N'MAIO', N'Malus ioensis', N'prairie crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (969, N'MAIOI', N'Malus ioensis var. ioensis', N'prairie crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (970, N'MAIOT8', N'Malus ioensis var. texana', N'Texas crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (971, N'MAJA2', N'Manilkara jaimiqui', N'wild dilly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (972, N'MAJAE', N'Manilkara jaimiqui ssp. emarginata', N'wild dilly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (973, N'MAKO', N'Magnolia kobus', N'Kobus magnolia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (974, N'MALA6', N'Malosma laurina', N'laurel sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (975, N'MAMA2', N'Magnolia macrophylla', N'bigleaf magnolia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (976, N'MAPH', N'Maytenus phyllanthoides', N'Florida mayten')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (977, N'MAPL', N'Malus ×platycarpa', N'bigfruit crab')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (978, N'MAPO', N'Maclura pomifera', N'osage orange')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (979, N'MAPR', N'Malus prunifolia', N'plumleaf crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (980, N'MAPU', N'Malus pumila', N'paradise apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (981, N'MAPY', N'Magnolia pyramidata', N'pyramid magnolia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (982, N'MASO3', N'Malus ×soulardii', N'Soulard crab')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (983, N'MASO9', N'Magnolia ×soulangiana', N'Chinese magnolia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (984, N'MASP9', N'Malus spectabilis', N'Asiatic apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (985, N'MAST6', N'Magnolia stellata', N'star magnolia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (986, N'MASY2', N'Malus sylvestris', N'European crab apple')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (987, N'MATR', N'Magnolia tripetala', N'umbrella-tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (988, N'MAVI2', N'Magnolia virginiana', N'sweetbay')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (989, N'MAZA', N'Manilkara zapota', N'sapodilla')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (990, N'MEAZ', N'Melia azedarach', N'Chinaberrytree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (991, N'MEBI', N'Melicoccus bijugatus', N'Spanish lime')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (992, N'MELI7', N'Melaleuca linariifolia', N'cajeput tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (993, N'MEQU', N'Melaleuca quinquenervia', N'punktree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (994, N'METO3', N'Metopium toxiferum', N'Florida poisontree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (995, N'MIAC3', N'Mimosa aculeaticarpa', N'catclaw mimosa')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (996, N'MIACB', N'Mimosa aculeaticarpa var. biuncifera', N'catclaw mimosa')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (997, N'MIPI9', N'Millettia pinnata', N'pongame oiltree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (998, N'MOAL', N'Morus alba', N'white mulberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (999, N'MOCA6', N'Morella californica', N'California wax myrtle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1000, N'MOCA7', N'Morella caroliniensis', N'southern bayberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1001, N'MOCE2', N'Morella cerifera', N'wax myrtle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1002, N'MOCI3', N'Morinda citrifolia', N'Indian mulberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1003, N'MOIN', N'Morella inodora', N'scentless bayberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1004, N'MOMI', N'Morus microphylla', N'Texas mulberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1005, N'MONI', N'Morus nigra', N'black mulberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1006, N'MOOL', N'Moringa oleifera', N'horseradishtree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1007, N'MOPE6', N'Morella pensylvanica', N'northern bayberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1008, N'MORU2', N'Morus rubra', N'red mulberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1009, N'MORU3', N'Morella rubra', N'red bayberry')
GO
print 'Processed 1000 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1010, N'MORUR', N'Morus rubra var. rubra', N'red mulberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1011, N'MORUT', N'Morus rubra var. tomentosa', N'red mulberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1012, N'MUAC', N'Musa acuminata', N'edible banana')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1013, N'MUCA4', N'Muntingia calabura', N'strawberrytree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1014, N'MUEX2', N'Murraya exotica', N'Chinese box')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1015, N'MUPA3', N'Musa ×paradisiaca', N'French plantain')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1016, N'MYCU2', N'Myrsine cubana', N'Guianese colicwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1017, N'MYFR', N'Myrcianthes fragrans', N'twinberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1018, N'MYLA5', N'Myoporum laetum', N'ngaio tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1019, N'NECO', N'Nectandra coriacea', N'lancewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1020, N'NEOL', N'Nerium oleander', N'oleander')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1021, N'NIGL', N'Nicotiana glauca', N'tree tobacco')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1022, N'NOBI', N'Nolina bigelovii', N'Bigelow''s nolina')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1023, N'NOEM', N'Noronhia emarginata', N'Madagascar olive')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1024, N'NOPA', N'Nolina parryi', N'Parry''s beargrass')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1025, N'NYAQ2', N'Nyssa aquatica', N'water tupelo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1026, N'NYBI', N'Nyssa biflora', N'swamp tupelo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1027, N'NYOG', N'Nyssa ogeche', N'Ogeechee tupelo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1028, N'NYSY', N'Nyssa sylvatica', N'blackgum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1029, N'NYUR2', N'Nyssa ursina', N'bear tupelo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1030, N'OCEL', N'Ochrosia elliptica', N'elliptic yellowwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1031, N'OECE', N'Oemleria cerasiformis', N'Indian plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1032, N'OLEU', N'Olea europaea', N'olive')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1033, N'OLEUC', N'Olea europaea ssp. cuspidata', N'African olive')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1034, N'OLEUE', N'Olea europaea ssp. europaea', N'European olive')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1035, N'OLTE', N'Olneya tesota', N'desert ironwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1036, N'OPAU2', N'Opuntia aurea', N'golden pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1037, N'OPBA2', N'Opuntia basilaris', N'beavertail pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1038, N'OPBAB', N'Opuntia basilaris var. brachyclada', N'beavertail pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1039, N'OPBAB2', N'Opuntia basilaris var. basilaris', N'beavertail pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1040, N'OPBAL', N'Opuntia basilaris var. longiareolata', N'beavertail pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1041, N'OPBAT', N'Opuntia basilaris var. treleasei', N'Trelease''s beavertail pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1042, N'OPCO4', N'Opuntia cochenillifera', N'cochineal nopal cactus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1043, N'OPFI', N'Opuntia ficus-indica', N'Barbary fig')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1044, N'OPGO', N'Opuntia gosseliniana', N'violet pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1045, N'OPMA8', N'Opuntia macrocentra', N'purple pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1046, N'OPMAM', N'Opuntia macrocentra var. macrocentra', N'purple pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1047, N'OPMAM2', N'Opuntia macrocentra var. minor', N'purple pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1048, N'OPMO5', N'Opuntia monacantha', N'common pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1049, N'OPPI3', N'Opuntia pinkavae', N'Pinkava''s pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1050, N'OPSA', N'Opuntia santa-rita', N'Santa Rita pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1051, N'OPTO2', N'Opuntia tomentosa', N'woollyjoint pricklypear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1052, N'OSAM', N'Osmanthus americanus', N'devilwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1053, N'OSAMA', N'Osmanthus americanus var. americanus', N'devilwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1054, N'OSAMM', N'Osmanthus americanus var. megacarpus', N'devilwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1055, N'OSKN', N'Ostrya knowltonii', N'Knowlton''s hophornbeam')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1056, N'OSVI', N'Ostrya virginiana', N'hophornbeam')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1057, N'OSVIC', N'Ostrya virginiana var. chisosensis', N'Chisos hophornbeam')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1058, N'OSVIV', N'Ostrya virginiana var. virginiana', N'hophornbeam')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1059, N'OXAR', N'Oxydendrum arboreum', N'sourwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1060, N'PAAC3', N'Parkinsonia aculeata', N'Jerusalem thorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1061, N'PAFL6', N'Parkinsonia florida', N'blue paloverde')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1062, N'PALO8', N'Paraserianthes lophantha', N'plume albizia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1063, N'PAMI5', N'Parkinsonia microphylla', N'yellow paloverde')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1064, N'PASC14', N'Pachycereus schottii', N'senita cactus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1065, N'PASP16', N'Paliurus spina-christi', N'Jeruselem thorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1066, N'PATE10', N'Parkinsonia texana', N'Texas paloverde')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1067, N'PATEM', N'Parkinsonia texana var. macra', N'Texas paloverde')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1068, N'PATET2', N'Parkinsonia texana var. texana', N'Texas paloverde')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1069, N'PATO2', N'Paulownia tomentosa', N'princesstree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1070, N'PEAC2', N'Pereskia aculeata', N'Barbados shrub')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1071, N'PEAM3', N'Persea americana', N'avocado')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1072, N'PEBO', N'Persea borbonia', N'redbay')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1073, N'PEDO', N'Petitia domingensis', N'bastard stopper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1074, N'PEDU3', N'Peltophorum dubia', N'horsebush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1075, N'PEGR14', N'Pereskia grandifolia', N'rose cactus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1076, N'PEHU2', N'Persea humilis', N'silk bay')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1077, N'PEPA37', N'Persea palustris', N'swamp bay')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1078, N'PEPT3', N'Peltophorum pterocarpum', N'peltophorum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1079, N'PESC4', N'Peucephyllum schottii', N'Schott''s pygmycedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1080, N'PHAC3', N'Phyllanthus acidus', N'Tahitian gooseberry tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1081, N'PHAM2', N'Phellodendron amurense', N'Amur corktree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1082, N'PHBO9', N'Phytolacca bogotensis', N'southern pokeweed')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1083, N'PHCA13', N'Phoenix canariensis', N'Canary Island date palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1084, N'PHDA4', N'Phoenix dactylifera', N'date palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1085, N'PHDA5', N'Photinia davidiana', N'Chinese photinia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1086, N'PHJA', N'Phellodendron japonicum', N'Japanese corktree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1087, N'PHLA26', N'Phellodendron lavallei', N'Lavalle corktree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1088, N'PHRE', N'Phoenix reclinata', N'Senegal date palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1089, N'PHSA80', N'Phellodendron sachalinense', N'Sakhalin corktree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1090, N'PHSE17', N'Photinia serratifolia', N'Taiwanese photinia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1091, N'PHVI81', N'Photinia villosa', N'Oriental photinia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1092, N'PIAB', N'Picea abies', N'Norway spruce')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1093, N'PIAC2', N'Pisonia aculeata', N'pullback')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1094, N'PIAD', N'Piper aduncum', N'higuillo de hoja menuda')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1095, N'PIAL', N'Pinus albicaulis', N'whitebark pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1096, N'PIAR', N'Pinus aristata', N'bristlecone pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1097, N'PIAR5', N'Pinus arizonica', N'Arizona pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1098, N'PIARA', N'Pinus arizonica var. arizonica', N'Arizona pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1099, N'PIARS2', N'Pinus arizonica var. stormiae', N'Arizona pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1100, N'PIAT', N'Pinus attenuata', N'knobcone pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1101, N'PIAT4', N'Pistacia atlantica', N'Mt. Atlas mastic tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1102, N'PIAU', N'Piper auritum', N'Vera cruz pepper')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1103, N'PIBA', N'Pinus balfouriana', N'foxtail pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1104, N'PIBA2', N'Pinus banksiana', N'jack pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1105, N'PIBAA', N'Pinus balfouriana ssp. austrina', N'foxtail pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1106, N'PIBAB', N'Pinus balfouriana ssp. balfouriana', N'foxtail pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1107, N'PIBR', N'Picea breweriana', N'Brewer spruce')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1108, N'PIBR6', N'Pinckneya bracteata', N'fevertree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1109, N'PICA14', N'Pisonia capitata', N'Mexican devil''s-claws')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1110, N'PICE', N'Pinus cembroides', N'Mexican pinyon')
GO
print 'Processed 1100 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1111, N'PICH4', N'Pistacia chinensis', N'Chinese pistache')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1112, N'PICL', N'Pinus clausa', N'sand pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1113, N'PICO', N'Pinus contorta', N'lodgepole pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1114, N'PICO3', N'Pinus coulteri', N'Coulter pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1115, N'PICOB', N'Pinus contorta var. bolanderi', N'Bolander beach pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1116, N'PICOC', N'Pinus contorta var. contorta', N'beach pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1117, N'PICOL', N'Pinus contorta var. latifolia', N'lodgepole pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1118, N'PICOM', N'Pinus contorta var. murrayana', N'Sierra lodgepole pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1119, N'PICR', N'Pittosporum crassifolium', N'stiffleaf cheesewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1120, N'PIDI3', N'Pinus discolor', N'border pinyon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1121, N'PIDU', N'Pithecellobium dulce', N'monkeypod')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1122, N'PIEC2', N'Pinus echinata', N'shortleaf pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1123, N'PIED', N'Pinus edulis', N'twoneedle pinyon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1124, N'PIEL', N'Pinus elliottii', N'slash pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1125, N'PIELD', N'Pinus elliottii var. densa', N'Florida slash pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1126, N'PIELE2', N'Pinus elliottii var. elliottii', N'Honduras pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1127, N'PIEN', N'Picea engelmannii', N'Engelmann spruce')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1128, N'PIEN2', N'Pinus engelmannii', N'Apache pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1129, N'PIENE', N'Picea engelmannii var. engelmannii', N'Engelmann spruce')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1130, N'PIFL2', N'Pinus flexilis', N'limber pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1131, N'PIFL6', N'Pisonia floridana', N'Rock Key devil''s-claws')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1132, N'PIGL', N'Picea glauca', N'white spruce')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1133, N'PIGL2', N'Pinus glabra', N'spruce pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1134, N'PIHA7', N'Pinus halepensis', N'aleppo pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1135, N'PIJE', N'Pinus jeffreyi', N'Jeffrey pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1136, N'PIKE', N'Pithecellobium keyense', N'Florida Keys blackbead')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1137, N'PILA', N'Pinus lambertiana', N'sugar pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1138, N'PILE', N'Pinus leiophylla', N'Chihuahuan pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1139, N'PILEC', N'Pinus leiophylla var. chihuahuana', N'Chihuahuan pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1140, N'PILO', N'Pinus longaeva', N'Great Basin bristlecone pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1141, N'PIMA', N'Picea mariana', N'black spruce')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1142, N'PIMAM4', N'Picea mariana var. mariana', N'black spruce')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1143, N'PIME4', N'Pistacia mexicana', N'American pistachio')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1144, N'PIMO', N'Pinus monophylla', N'singleleaf pinyon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1145, N'PIMO3', N'Pinus monticola', N'western white pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1146, N'PIMOC', N'Pinus monophylla var. californiarum', N'California pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1147, N'PIMOF', N'Pinus monophylla var. fallax', N'singleleaf pinyon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1148, N'PIMOM2', N'Pinus monophylla var. monophylla', N'singleleaf pinyon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1149, N'PIMU', N'Pinus muricata', N'Bishop pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1150, N'PIMU80', N'Pinus mugo', N'mugo pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1151, N'PINI', N'Pinus nigra', N'Austrian pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1152, N'PIPA2', N'Pinus palustris', N'longleaf pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1153, N'PIPE', N'Picramnia pentandra', N'Florida bitterbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1154, N'PIPE8', N'Pittosporum pentandrum', N'Taiwanese cheesewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1155, N'PIPI3', N'Piscidia piscipula', N'Florida fishpoison tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1156, N'PIPI6', N'Pinus pinaster', N'maritime pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1157, N'PIPI7', N'Pinus pinea', N'Italian stone pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1158, N'PIPO', N'Pinus ponderosa', N'ponderosa pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1159, N'PIPO4', N'Pilosocereus polygonus', N'Deering''s tree cactus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1160, N'PIPOP', N'Pinus ponderosa var. ponderosa', N'ponderosa pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1161, N'PIPOS', N'Pinus ponderosa var. scopulorum', N'ponderosa pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1162, N'PIPU', N'Picea pungens', N'blue spruce')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1163, N'PIPU5', N'Pinus pungens', N'Table Mountain pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1164, N'PIQU', N'Pinus quadrifolia', N'Parry pinyon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1165, N'PIRA2', N'Pinus radiata', N'Monterey pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1166, N'PIRE', N'Pinus resinosa', N'red pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1167, N'PIRE5', N'Pinus remota', N'papershell pinyon')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1168, N'PIRI', N'Pinus rigida', N'pitch pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1169, N'PIRO3', N'Pisonia rotundata', N'smooth devil''s-claws')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1170, N'PIRU', N'Picea rubens', N'red spruce')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1171, N'PISA2', N'Pinus sabiniana', N'California foothill pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1172, N'PISE', N'Pinus serotina', N'pond pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1173, N'PISI', N'Picea sitchensis', N'Sitka spruce')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1174, N'PIST', N'Pinus strobus', N'eastern white pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1175, N'PIST3', N'Pinus strobiformis', N'southwestern white pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1176, N'PISY', N'Pinus sylvestris', N'Scots pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1177, N'PITA', N'Pinus taeda', N'loblolly pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1178, N'PITE11', N'Pittosporum tenuifolium', N'tawhiwhi')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1179, N'PITH2', N'Pinus thunbergii', N'Japanese black pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1180, N'PITO', N'Pinus torreyana', N'Torrey pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1181, N'PITO2', N'Pittosporum tobira', N'Japanese cheesewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1182, N'PITOI2', N'Pinus torreyana var. insularis', N'Santa Cruz Island Torrey pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1183, N'PITOT2', N'Pinus torreyana var. torreyana', N'Torrey pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1184, N'PIUN', N'Pithecellobium unguis-cati', N'catclaw blackbead')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1185, N'PIUN2', N'Pittosporum undulatum', N'Australian cheesewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1186, N'PIVI2', N'Pinus virginiana', N'Virginia pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1187, N'PIWA', N'Pinus washoensis', N'Washoe pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1188, N'PIWA3', N'Pinus wallichiana', N'Bhutan pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1189, N'PLAQ', N'Planera aquatica', N'planertree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1190, N'PLHY3', N'Platanus hybrida', N'London planetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1191, N'PLOB2', N'Plumeria obtusa', N'Singapore graveyard flower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1192, N'PLOBS', N'Plumeria obtusa var. sericifolia', N'Singapore graveyard flower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1193, N'PLOC', N'Platanus occidentalis', N'American sycamore')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1194, N'PLOR80', N'Platycladus orientalis', N'Oriental arborvitae')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1195, N'PLRA', N'Platanus racemosa', N'California sycamore')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1196, N'PLWR2', N'Platanus wrightii', N'Arizona sycamore')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1197, N'POAC5', N'Populus ×acuminata', N'lanceleaf cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1198, N'POAL7', N'Populus alba', N'white poplar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1199, N'POAN3', N'Populus angustifolia', N'narrowleaf cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1200, N'POBA2', N'Populus balsamifera', N'balsam poplar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1201, N'POBAB2', N'Populus balsamifera ssp. balsamifera', N'balsam poplar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1202, N'POBAT', N'Populus balsamifera ssp. trichocarpa', N'black cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1203, N'POBR7', N'Populus ×brayshawii', N'hybrid balsam poplar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1204, N'POCA14', N'Populus ×canescens', N'gray poplar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1205, N'POCA19', N'Populus ×canadensis', N'Carolina poplar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1206, N'POCA23', N'Pouteria campechiana', N'canistel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1207, N'PODE3', N'Populus deltoides', N'eastern cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1208, N'PODED', N'Populus deltoides ssp. deltoides', N'eastern cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1209, N'PODEM', N'Populus deltoides ssp. monilifera', N'plains cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1210, N'PODEW', N'Populus deltoides ssp. wislizeni', N'Rio Grande cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1211, N'PODO5', N'Pouteria dominigensis', N'jacana')
GO
print 'Processed 1200 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1212, N'POFR2', N'Populus fremontii', N'Fremont cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1213, N'POFRF3', N'Populus fremontii ssp. fremontii', N'Fremont cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1214, N'POFRM', N'Populus fremontii ssp. mesetae', N'Fremont cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1215, N'POGR4', N'Populus grandidentata', N'bigtooth aspen')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1216, N'POGU', N'Polyscias guilfoylei', N'geranium aralia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1217, N'POHE4', N'Populus heterophylla', N'swamp cottonwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1218, N'POJA2', N'Populus ×jackii', N'balm-of-Gilead')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1219, N'POMA32', N'Podocarpus macrophyllus', N'yew plum pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1220, N'POMAM', N'Podocarpus macrophyllus var. maki', N'yew plum pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1221, N'PONI', N'Populus nigra', N'Lombardy poplar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1222, N'POTO7', N'Populus tomentosa', N'Chinese white poplar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1223, N'POTR10', N'Populus tremula', N'European aspen')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1224, N'POTR4', N'Poncirus trifoliata', N'hardy orange')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1225, N'POTR5', N'Populus tremuloides', N'quaking aspen')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1226, N'PRAL5', N'Prunus alleghaniensis', N'Allegheny plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1227, N'PRAL7', N'Prunus alabamensis', N'Alabama cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1228, N'PRALA', N'Prunus alleghaniensis var. alleghaniensis', N'Allegheny plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1229, N'PRALD', N'Prunus alleghaniensis var. davisii', N'Davis'' plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1230, N'PRAM', N'Prunus americana', N'American plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1231, N'PRAN3', N'Prunus angustifolia', N'Chickasaw plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1232, N'PRANA', N'Prunus angustifolia var. angustifolia', N'Chickasaw plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1233, N'PRANW', N'Prunus angustifolia var. watsonii', N'Watson''s plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1234, N'PRAR3', N'Prunus armeniaca', N'apricot')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1235, N'PRAV', N'Prunus avium', N'sweet cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1236, N'PRCA', N'Prunus caroliniana', N'Carolina laurelcherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1237, N'PRCE', N'Prunus cerasus', N'sour cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1238, N'PRCE2', N'Prunus cerasifera', N'cherry plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1239, N'PRDO', N'Prunus domestica', N'European plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1240, N'PRDOD', N'Prunus domestica var. domestica', N'European plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1241, N'PRDOI', N'Prunus domestica var. insititia', N'European plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1242, N'PRDU', N'Prunus dulcis', N'sweet almond')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1243, N'PREM', N'Prunus emarginata', N'bitter cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1244, N'PREME', N'Prunus emarginata var. emarginata', N'bitter cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1245, N'PREMM', N'Prunus emarginata var. mollis', N'bitter cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1246, N'PRFA2', N'Prosopis farcta', N'Syrian mesquite')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1247, N'PRFR', N'Prunus fremontii', N'desert apricot')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1248, N'PRGL2', N'Prosopis glandulosa', N'honey mesquite')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1249, N'PRGLG', N'Prosopis glandulosa var. glandulosa', N'honey mesquite')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1250, N'PRGLP', N'Prosopis glandulosa var. prostrata', N'honey mesquite')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1251, N'PRGLT', N'Prosopis glandulosa var. torreyana', N'western honey mesquite')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1252, N'PRHO', N'Prunus hortulana', N'hortulan plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1253, N'PRIL', N'Prunus ilicifolia', N'hollyleaf cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1254, N'PRILI', N'Prunus ilicifolia ssp. ilicifolia', N'hollyleaf cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1255, N'PRILL', N'Prunus ilicifolia ssp. lyonii', N'hollyleaf cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1256, N'PRLA5', N'Prunus laurocerasus', N'cherry laurel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1257, N'PRLA6', N'Prosopis laevigata', N'smooth mesquite')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1258, N'PRLU', N'Prunus lusitanica', N'Portugal laurel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1259, N'PRMA', N'Prunus mahaleb', N'Mahaleb cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1260, N'PRME', N'Prunus mexicana', N'Mexican plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1261, N'PRMU', N'Prunus munsoniana', N'wild goose plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1262, N'PRMY', N'Prunus myrtifolia', N'West Indian cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1263, N'PRNI', N'Prunus nigra', N'Canadian plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1264, N'PROD', N'Premna odorata', N'fragrant premna')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1265, N'PRPA5', N'Prunus padus', N'European bird cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1266, N'PRPE2', N'Prunus pensylvanica', N'pin cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1267, N'PRPE3', N'Prunus persica', N'peach')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1268, N'PRPEP', N'Prunus pensylvanica var. pensylvanica', N'pin cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1269, N'PRPES', N'Prunus pensylvanica var. saximontana', N'pin cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1270, N'PRPU', N'Prosopis pubescens', N'screwbean mesquite')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1271, N'PRSE2', N'Prunus serotina', N'black cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1272, N'PRSE3', N'Prunus serrulata', N'Japanese flowering cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1273, N'PRSEE', N'Prunus serotina var. eximia', N'black cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1274, N'PRSER2', N'Prunus serotina var. rufula', N'black cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1275, N'PRSES', N'Prunus serotina var. serotina', N'black cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1276, N'PRSEV', N'Prunus serotina var. virens', N'black cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1277, N'PRSP', N'Prunus spinosa', N'blackthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1278, N'PRSU2', N'Prunus subcordata', N'Klamath plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1279, N'PRSU4', N'Prunus subhirtella', N'winter-flowering cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1280, N'PRSUK', N'Prunus subcordata var. kelloggii', N'Kellogg''s Klamath plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1281, N'PRSUO', N'Prunus subcordata var. oregana', N'Oregon Klamath plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1282, N'PRSUR', N'Prunus subcordata var. rubicunda', N'Klamath plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1283, N'PRSUS', N'Prunus subcordata var. subcordata', N'Klamath plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1284, N'PRTO80', N'Prunus tomentosa', N'Nanking cherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1285, N'PRTR3', N'Prunus triloba', N'flowering plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1286, N'PRUM', N'Prunus umbellata', N'hog plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1287, N'PRUMI', N'Prunus umbellata var. injuncunda', N'hog plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1288, N'PRUMU', N'Prunus umbellata var. umbellata', N'hog plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1289, N'PRVE', N'Prosopis velutina', N'velvet mesquite')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1290, N'PRVI', N'Prunus virginiana', N'chokecherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1291, N'PRVID', N'Prunus virginiana var. demissa', N'western chokecherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1292, N'PRVIM', N'Prunus virginiana var. melanocarpa', N'black chokecherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1293, N'PRVIV', N'Prunus virginiana var. virginiana', N'chokecherry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1294, N'PSCA', N'Psidium cattleianum', N'strawberry guava')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1295, N'PSGU', N'Psidium guajava', N'guava')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1296, N'PSLI2', N'Psychotria ligustrifolia', N'Bahama wild coffee')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1297, N'PSLO2', N'Psidium longipes', N'mangroveberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1298, N'PSLOL', N'Psidium longipes var. longipes', N'mangroveberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1299, N'PSMA', N'Pseudotsuga macrocarpa', N'bigcone Douglas-fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1300, N'PSME', N'Pseudotsuga menziesii', N'Douglas-fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1301, N'PSMEG', N'Pseudotsuga menziesii var. glauca', N'Rocky Mountain Douglas-fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1302, N'PSMEM', N'Pseudotsuga menziesii var. menziesii', N'Douglas-fir')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1303, N'PSNE', N'Psychotria nervosa', N'Seminole balsamo')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1304, N'PSPU2', N'Psychotria punctata', N'dotted wild coffee')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1305, N'PSSA', N'Pseudophoenix sargentii', N'Florida cherry palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1306, N'PSSAS3', N'Pseudophoenix sargentii ssp. sargentii', N'Florida cherry palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1307, N'PSSI4', N'Pseudocydonia sinensis', N'Chinese-quince')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1308, N'PSSP3', N'Psorothamnus spinosus', N'smoketree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1309, N'PTCR3', N'Ptelea crenulata', N'California hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1310, N'PTEL', N'Ptychosperma elegans', N'Alexander palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1311, N'PTMA8', N'Ptychosperma macarthuri', N'Macarthur feather palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1312, N'PTST80', N'Pterocarya stenoptera', N'Chinese wingnut')
GO
print 'Processed 1300 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1313, N'PTTR', N'Ptelea trifoliata', N'common hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1314, N'PTTRA', N'Ptelea trifoliata ssp. angustifolia', N'common hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1315, N'PTTRA2', N'Ptelea trifoliata ssp. angustifolia var. angustifolia', N'common hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1316, N'PTTRC', N'Ptelea trifoliata ssp. pallida var. cognata', N'pallid hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1317, N'PTTRC2', N'Ptelea trifoliata ssp. pallida var. confinis', N'pallid hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1318, N'PTTRL', N'Ptelea trifoliata ssp. pallida var. lutescens', N'pallid hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1319, N'PTTRM', N'Ptelea trifoliata ssp. trifoliata var. mollis', N'common hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1320, N'PTTRP', N'Ptelea trifoliata ssp. pallida', N'pallid hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1321, N'PTTRP2', N'Ptelea trifoliata ssp. polyadenia', N'pallid hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1322, N'PTTRP3', N'Ptelea trifoliata ssp. angustifolia var. persicifolia', N'common hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1323, N'PTTRP4', N'Ptelea trifoliata ssp. pallida var. pallida', N'pallid hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1324, N'PTTRT', N'Ptelea trifoliata ssp. trifoliata', N'common hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1325, N'PTTRT2', N'Ptelea trifoliata ssp. trifoliata var. trifoliata', N'common hoptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1326, N'PUGR2', N'Punica granatum', N'pomegranate')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1327, N'PUME', N'Purshia mexicana', N'Mexican cliffrose')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1328, N'PUST', N'Purshia stansburiana', N'Stansbury cliffrose')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1329, N'PYCA80', N'Pyrus calleryana', N'Callery pear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1330, N'PYCO', N'Pyrus communis', N'common pear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1331, N'PYPY2', N'Pyrus pyrifolia', N'Chinese pear')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1332, N'QUAC2', N'Quercus acerifolia', N'mapleleaf oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1333, N'QUAC80', N'Quercus acutissima', N'sawtooth oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1334, N'QUAG', N'Quercus agrifolia', N'California live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1335, N'QUAGA', N'Quercus agrifolia var. agrifolia', N'California live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1336, N'QUAGO', N'Quercus agrifolia var. oxyadenia', N'coastal live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1337, N'QUAJ', N'Quercus ajoensis', N'Ajo Mountain scrub oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1338, N'QUAL', N'Quercus alba', N'white oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1339, N'QUAL2', N'Quercus ×alvordiana', N'Alvord oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1340, N'QUAR', N'Quercus arizonica', N'Arizona white oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1341, N'QUAR2', N'Quercus arkansana', N'Arkansas oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1342, N'QUAU', N'Quercus austrina', N'bastard white oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1343, N'QUBE5', N'Quercus berberidifolia', N'scrub oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1344, N'QUBI', N'Quercus bicolor', N'swamp white oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1345, N'QUBO2', N'Quercus boyntonii', N'Boynton sand post oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1346, N'QUBU2', N'Quercus buckleyi', N'Buckley oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1347, N'QUCA7', N'Quercus carmenensis', N'Mexican oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1348, N'QUCE', N'Quercus cerris', N'European turkey oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1349, N'QUCE2', N'Quercus cedrosensis', N'Cedros Island oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1350, N'QUCH', N'Quercus chapmanii', N'Chapman oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1351, N'QUCH2', N'Quercus chrysolepis', N'canyon live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1352, N'QUCH4', N'Quercus chihuahuensis', N'Chihuahuan oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1353, N'QUCHC', N'Quercus chrysolepis var. chrysolepis', N'canyon live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1354, N'QUCHN', N'Quercus chrysolepis var. nana', N'canyon live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1355, N'QUCO2', N'Quercus coccinea', N'scarlet oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1356, N'QUCO7', N'Quercus cornelius-mulleri', N'Muller oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1357, N'QUCOC', N'Quercus coccinea var. coccinea', N'scarlet oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1358, N'QUCOT', N'Quercus coccinea var. tuberculata', N'scarlet oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1359, N'QUDE3', N'Quercus depressipes', N'Davis Mountain oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1360, N'QUDO', N'Quercus douglasii', N'blue oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1361, N'QUDU', N'Quercus dumosa', N'coastal sage scrub oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1362, N'QUDU4', N'Quercus durata', N'leather oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1363, N'QUDUD', N'Quercus dumosa var. dumosa', N'coastal sage scrub oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1364, N'QUDUD2', N'Quercus durata var. durata', N'leather oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1365, N'QUDUE', N'Quercus dumosa var. elegantula', N'coastal sage scrub oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1366, N'QUDUG', N'Quercus durata var. gabrielensis', N'leather oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1367, N'QUEL', N'Quercus ellipsoidalis', N'northern pin oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1368, N'QUEM', N'Quercus emoryi', N'Emory oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1369, N'QUEN', N'Quercus engelmannii', N'Engelmann oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1370, N'QUFA', N'Quercus falcata', N'southern red oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1371, N'QUFU', N'Quercus fusiformis', N'Texas live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1372, N'QUGA', N'Quercus gambelii', N'Gambel oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1373, N'QUGA4', N'Quercus garryana', N'Oregon white oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1374, N'QUGAB2', N'Quercus gambelii var. bonina', N'Gambel oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1375, N'QUGAG', N'Quercus gambelii var. gambelii', N'Gambel oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1376, N'QUGAG2', N'Quercus garryana var. garryana', N'Oregon white oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1377, N'QUGAS', N'Quercus garryana var. semota', N'Oregon white oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1378, N'QUGE', N'Quercus georgiana', N'Georgia oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1379, N'QUGE2', N'Quercus geminata', N'sand live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1380, N'QUGR', N'Quercus graciliformis', N'Chisos oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1381, N'QUGR2', N'Quercus gravesii', N'Chisos red oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1382, N'QUGR3', N'Quercus grisea', N'gray oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1383, N'QUHA3', N'Quercus havardii', N'Havard oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1384, N'QUHAH', N'Quercus havardii var. havardii', N'Havard oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1385, N'QUHAT', N'Quercus havardii var. tuckeri', N'Havard oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1386, N'QUHE2', N'Quercus hemisphaerica', N'Darlington oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1387, N'QUHEH', N'Quercus hemisphaerica var. hemisphaerica', N'Darlington oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1388, N'QUHEM', N'Quercus hemisphaerica var. maritima', N'Darlington oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1389, N'QUHY', N'Quercus hypoleucoides', N'silverleaf oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1390, N'QUIL', N'Quercus ilicifolia', N'bear oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1391, N'QUIL2', N'Quercus ilex', N'holly oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1392, N'QUIM', N'Quercus imbricaria', N'shingle oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1393, N'QUIN', N'Quercus incana', N'bluejack oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1394, N'QUJO3', N'Quercus john-tuckeri', N'Tucker oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1395, N'QUKE', N'Quercus kelloggii', N'California black oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1396, N'QULA', N'Quercus laceyi', N'Lacey oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1397, N'QULA2', N'Quercus laevis', N'turkey oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1398, N'QULA3', N'Quercus laurifolia', N'laurel oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1399, N'QULO', N'Quercus lobata', N'valley oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1400, N'QULY', N'Quercus lyrata', N'overcup oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1401, N'QUMA2', N'Quercus macrocarpa', N'bur oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1402, N'QUMA3', N'Quercus marilandica', N'blackjack oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1403, N'QUMA4', N'Quercus ×macdonaldii', N'MacDonald oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1404, N'QUMA6', N'Quercus margarettae', N'runner oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1405, N'QUMAA2', N'Quercus marilandica var. ashei', N'blackjack oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1406, N'QUMAD', N'Quercus macrocarpa var. depressa', N'bur oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1407, N'QUMAM', N'Quercus macrocarpa var. macrocarpa', N'bur oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1408, N'QUMAM2', N'Quercus marilandica var. marilandica', N'blackjack oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1409, N'QUMI', N'Quercus michauxii', N'swamp chestnut oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1410, N'QUMO', N'Quercus mohriana', N'Mohr oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1411, N'QUMO2', N'Quercus ×moreha', N'oracle oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1412, N'QUMU', N'Quercus muehlenbergii', N'chinkapin oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1413, N'QUMY', N'Quercus myrtifolia', N'myrtle oak')
GO
print 'Processed 1400 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1414, N'QUNI', N'Quercus nigra', N'water oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1415, N'QUOB', N'Quercus oblongifolia', N'Mexican blue oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1416, N'QUOG', N'Quercus oglethorpensis', N'Oglethorpe oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1417, N'QUPA10', N'Quercus palmeri', N'Palmer oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1418, N'QUPA2', N'Quercus palustris', N'pin oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1419, N'QUPA5', N'Quercus pagoda', N'cherrybark oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1420, N'QUPA6', N'Quercus pacifica', N'Channel Island scrub oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1421, N'QUPA8', N'Quercus parvula', N'coast oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1422, N'QUPAS2', N'Quercus parvula var. shrevei', N'Shreve oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1423, N'QUPH', N'Quercus phellos', N'willow oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1424, N'QUPO2', N'Quercus polymorpha', N'netleaf white oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1425, N'QUPR', N'Quercus prinoides', N'dwarf chinkapin oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1426, N'QUPR2', N'Quercus prinus', N'chestnut oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1427, N'QUPS', N'Quercus ×pseudomargaretta', N'false sand post oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1428, N'QUPU', N'Quercus pungens', N'pungent oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1429, N'QURO2', N'Quercus robur', N'English oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1430, N'QURO3', N'Quercus robusta', N'robust oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1431, N'QURU', N'Quercus rubra', N'northern red oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1432, N'QURU4', N'Quercus rugosa', N'netleaf oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1433, N'QURUA', N'Quercus rubra var. ambigua', N'northern red oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1434, N'QURUR', N'Quercus rubra var. rubra', N'northern red oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1435, N'QUSH', N'Quercus shumardii', N'Shumard''s oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1436, N'QUSHS', N'Quercus shumardii var. schneckii', N'Schneck oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1437, N'QUSHS2', N'Quercus shumardii var. shumardii', N'Shumard oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1438, N'QUSHS3', N'Quercus shumardii var. stenocarpa', N'Shumard oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1439, N'QUSI', N'Quercus sinuata', N'bastard oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1440, N'QUSI2', N'Quercus similis', N'bottomland post oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1441, N'QUSIB', N'Quercus sinuata var. breviloba', N'bastard oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1442, N'QUSIS', N'Quercus sinuata var. sinuata', N'bastard oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1443, N'QUST', N'Quercus stellata', N'post oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1444, N'QUSU5', N'Quercus suber', N'cork oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1445, N'QUTA', N'Quercus tardifolia', N'lateleaf oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1446, N'QUTE', N'Quercus texana', N'Texas red oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1447, N'QUTO', N'Quercus tomentella', N'island live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1448, N'QUTO2', N'Quercus toumeyi', N'Toumey oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1449, N'QUTU2', N'Quercus turbinella', N'Sonoran scrub oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1450, N'QUVA5', N'Quercus vaseyana', N'sandpaper oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1451, N'QUVE', N'Quercus velutina', N'black oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1452, N'QUVI', N'Quercus virginiana', N'live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1453, N'QUVI2', N'Quercus viminea', N'Sonoran oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1454, N'QUWI2', N'Quercus wislizeni', N'interior live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1455, N'QUWIF', N'Quercus wislizeni var. frutescens', N'interior live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1456, N'QUWIW', N'Quercus wislizeni var. wislizeni', N'interior live oak')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1457, N'RAAC', N'Randia aculeata', N'white indigoberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1458, N'RESE', N'Reynosia septentrionalis', N'darlingplum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1459, N'RHAR6', N'Rhamnus arguta', N'sharp-tooth buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1460, N'RHCA3', N'Rhamnus cathartica', N'common buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1461, N'RHCA8', N'Rhododendron catawbiense', N'Catawba rosebay')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1462, N'RHCO', N'Rhus copallinum', N'winged sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1463, N'RHCOC', N'Rhus copallinum var. copallinum', N'winged sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1464, N'RHCOL', N'Rhus copallinum var. leucantha', N'winged sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1465, N'RHCOL2', N'Rhus copallinum var. latifolia', N'winged sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1466, N'RHCR', N'Rhamnus crocea', N'redberry buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1467, N'RHCRC', N'Rhamnus crocea ssp. crocea', N'redberry buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1468, N'RHCRP2', N'Rhamnus crocea ssp. pilosa', N'hollyleaf buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1469, N'RHDA', N'Rhamnus davurica', N'Dahurian buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1470, N'RHDAD2', N'Rhamnus davurica ssp. davurica', N'Dahurian buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1471, N'RHDAN2', N'Rhamnus davurica ssp. nipponica', N'Dahurian buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1472, N'RHEA2', N'Rhododendron eastmanii', N'Santee azalea')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1473, N'RHGL', N'Rhus glabra', N'smooth sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1474, N'RHIL', N'Rhamnus ilicifolia', N'hollyleaf redberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1475, N'RHIN2', N'Rhus integrifolia', N'lemonade sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1476, N'RHJA8', N'Rhamnus japonica', N'Japanese buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1477, N'RHKE', N'Rhus kearneyi', N'Kearney''s sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1478, N'RHLA', N'Rhamnus lanceolata', N'lanceleaf buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1479, N'RHLA11', N'Rhus lancea', N'African sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1480, N'RHLA3', N'Rhus lanceolata', N'prairie sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1481, N'RHLAG2', N'Rhamnus lanceolata ssp. glabrata', N'lanceleaf buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1482, N'RHLAL3', N'Rhamnus lanceolata ssp. lanceolata', N'lanceleaf buckthorn')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1483, N'RHMA2', N'Rhizophora mangle', N'red mangrove')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1484, N'RHMA3', N'Rhododendron macrophyllum', N'Pacific rhododendron')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1485, N'RHMA4', N'Rhododendron maximum', N'great laurel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1486, N'RHMI3', N'Rhus microphylla', N'littleleaf sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1487, N'RHOV', N'Rhus ovata', N'sugar sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1488, N'RHPI', N'Rhamnus pirifolia', N'island redberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1489, N'RHPU12', N'Rhus pulvinata', N'northern smooth sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1490, N'RHTO10', N'Rhodomyrtus tomentosa', N'rose myrtle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1491, N'RHTY', N'Rhus typhina', N'staghorn sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1492, N'RHVI3', N'Rhus virens', N'evergreen sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1493, N'RHVIC', N'Rhus virens var. choriophylla', N'evergreen sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1494, N'RHVIV', N'Rhus virens var. virens', N'evergreen sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1495, N'RICO3', N'Ricinus communis', N'castorbean')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1496, N'ROEL', N'Roystonea elata', N'Florida royal palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1497, N'ROHI', N'Robinia hispida', N'bristly locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1498, N'ROHIF8', N'Robinia hispida var. fertilis', N'bristly locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1499, N'ROHIH', N'Robinia hispida var. hispida', N'bristly locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1500, N'ROHIK', N'Robinia hispida var. kelseyi', N'Kelsey''s locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1501, N'ROHIN', N'Robinia hispida var. nana', N'bristly locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1502, N'ROHIR', N'Robinia hispida var. rosea', N'bristly locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1503, N'RONE', N'Robinia neomexicana', N'New Mexico locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1504, N'RONEN', N'Robinia neomexicana var. neomexicana', N'New Mexico locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1505, N'RONER', N'Robinia neomexicana var. rusbyi', N'Rusby''s locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1506, N'ROPS', N'Robinia pseudoacacia', N'black locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1507, N'ROVI', N'Robinia viscosa', N'clammy locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1508, N'ROVIH2', N'Robinia viscosa var. hartwegii', N'Hartweg''s locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1509, N'ROVIV', N'Robinia viscosa var. viscosa', N'clammy locust')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1510, N'SAAL', N'Salix alaxensis', N'feltleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1511, N'SAAL2', N'Salix alba', N'white willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1512, N'SAAL5', N'Sassafras albidum', N'sassafras')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1513, N'SAALA', N'Salix alaxensis var. alaxensis', N'feltleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1514, N'SAALL', N'Salix alaxensis var. longistylis', N'feltleaf willow')
GO
print 'Processed 1500 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1515, N'SAAM2', N'Salix amygdaloides', N'peachleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1516, N'SAAR3', N'Salix arbusculoides', N'littletree willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1517, N'SAAT2', N'Salix atrocinerea', N'large gray willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1518, N'SABA3', N'Salix barclayi', N'Barclay''s willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1519, N'SABA6', N'Savia bahamensis', N'Bahama maidenbush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1520, N'SABE2', N'Salix bebbiana', N'Bebb willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1521, N'SABO', N'Salix bonplandiana', N'Bonpland willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1522, N'SABR2', N'Salix breweri', N'Brewer''s willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1523, N'SACA5', N'Salix caroliniana', N'coastal plain willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1524, N'SACI', N'Salix cinerea', N'large gray willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1525, N'SADI', N'Salix discolor', N'pussy willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1526, N'SAEL', N'Salix elaeagnos', N'Elaeagnus willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1527, N'SAER', N'Salix eriocephala', N'Missouri River willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1528, N'SAET', N'Sabal etonia', N'scrub palmetto')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1529, N'SAEX', N'Salix exigua', N'narrowleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1530, N'SAFL', N'Salix floridana', N'Florida willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1531, N'SAFR', N'Salix fragilis', N'crack willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1532, N'SAGE2', N'Salix geyeriana', N'Geyer willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1533, N'SAGL', N'Salix glauca', N'grayleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1534, N'SAGL5', N'Sapium glandulosum', N'gumtree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1535, N'SAGLA', N'Salix glauca ssp. glauca var. acutifolia', N'grayleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1536, N'SAGLC', N'Salix glauca ssp. callicarpaea', N'grayleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1537, N'SAGLG', N'Salix glauca ssp. glauca', N'grayleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1538, N'SAGLG2', N'Salix glauca ssp. glauca var. glauca', N'grayleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1539, N'SAGLV', N'Salix glauca ssp. glauca var. villosa', N'grayleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1540, N'SAGO', N'Salix gooddingii', N'Goodding''s willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1541, N'SAHO', N'Salix hookeriana', N'dune willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1542, N'SAIN3', N'Salix interior', N'sandbar willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1543, N'SAJA7', N'Salix ×jamesensis', N'James'' willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1544, N'SALA10', N'Salix ×laurentiana', N'Laurent''s willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1545, N'SALA6', N'Salix lasiolepis', N'arroyo willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1546, N'SALAB', N'Salix lasiolepis var. bigelovii', N'Bigelow''s willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1547, N'SALAL2', N'Salix lasiolepis var. lasiolepis', N'arroyo willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1548, N'SALI', N'Salix ligulifolia', N'strapleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1549, N'SALU', N'Salix lucida', N'shining willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1550, N'SALU2', N'Salix lutea', N'yellow willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1551, N'SALUC', N'Salix lucida ssp. caudata', N'greenleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1552, N'SALUL', N'Salix lucida ssp. lasiandra', N'Pacific willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1553, N'SALUL2', N'Salix lucida ssp. lucida', N'shining willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1554, N'SAMA12', N'Salix maccalliana', N'McCalla''s willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1555, N'SAME2', N'Salix melanopsis', N'dusky willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1556, N'SAME8', N'Sabal mexicana', N'Rio Grande palmetto')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1557, N'SAMI8', N'Sabal minor', N'dwarf palmetto')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1558, N'SAMO2', N'Salix monticola', N'park willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1559, N'SAMU6', N'Sapindus mukorossi', N'Chinese soapberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1560, N'SAMY', N'Salix myrtillifolia', N'blueberry willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1561, N'SAMY2', N'Salix myricoides', N'bayberry willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1562, N'SAMYA', N'Salix myricoides var. albovestita', N'bayberry willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1563, N'SAMYM', N'Salix myricoides var. myricoides', N'bayberry willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1564, N'SANI', N'Salix nigra', N'black willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1565, N'SANI4', N'Sambucus nigra', N'black elderberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1566, N'SANIC4', N'Sambucus nigra ssp. canadensis', N'American black elderberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1567, N'SANIC5', N'Sambucus nigra ssp. cerulea', N'blue elderberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1568, N'SANIN2', N'Sambucus nigra ssp. nigra', N'European black elderberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1569, N'SAOB', N'Salix ×obtusata', N'obtuse willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1570, N'SAPA', N'Sabal palmetto', N'cabbage palmetto')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1571, N'SAPE12', N'Salix ×pendulina', N'Wisconsin weeping willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1572, N'SAPE3', N'Salix pellita', N'satiny willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1573, N'SAPE4', N'Salix pentandra', N'laurel willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1574, N'SAPE5', N'Salix petiolaris', N'meadow willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1575, N'SAPL2', N'Salix planifolia', N'diamondleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1576, N'SAPLP4', N'Salix planifolia ssp. planifolia', N'diamondleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1577, N'SAPR3', N'Salix prolixa', N'MacKenzie''s willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1578, N'SAPS8', N'Salix pseudomyrsinites', N'firmleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1579, N'SAPU15', N'Salix pulchra', N'tealeaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1580, N'SAPU2', N'Salix purpurea', N'purpleosier willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1581, N'SAPY', N'Salix pyrifolia', N'balsam willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1582, N'SARA2', N'Sambucus racemosa', N'red elderberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1583, N'SARAM4', N'Sambucus racemosa var. melanocarpa', N'Rocky Mountain elder')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1584, N'SARAR3', N'Sambucus racemosa var. racemosa', N'red elderberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1585, N'SARI4', N'Salix richardsonii', N'Richardson''s willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1586, N'SARU3', N'Salix ×rubens', N'hybrid crack willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1587, N'SASA10', N'Samanea saman', N'raintree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1588, N'SASA4', N'Sapindus saponaria', N'wingleaf soapberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1589, N'SASAD', N'Sapindus saponaria var. drummondii', N'western soapberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1590, N'SASAS', N'Sapindus saponaria var. saponaria', N'wingleaf soapberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1591, N'SASC', N'Salix scouleriana', N'Scouler''s willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1592, N'SASE', N'Salix sericea', N'silky willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1593, N'SASE10', N'Salix ×sepulcralis', N'weeping willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1594, N'SASE2', N'Salix serissima', N'autumn willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1595, N'SASE3', N'Salix sessilifolia', N'northwest sandbar willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1596, N'SASI2', N'Salix sitchensis', N'Sitka willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1597, N'SATA', N'Salix taxifolia', N'yewleaf willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1598, N'SATR', N'Salix tracyi', N'Tracy''s willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1599, N'SAVI2', N'Salix viminalis', N'basket willow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1600, N'SCAC2', N'Schefflera actinophylla', N'octopus tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1601, N'SCFR', N'Schaefferia frutescens', N'Florida boxwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1602, N'SCLO2', N'Schinus longifolius', N'longleaf peppertree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1603, N'SCMO', N'Schinus molle', N'Peruvian peppertree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1604, N'SCPO7', N'Schinus polygamus', N'Hardee peppertree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1605, N'SCSC3', N'Schoepfia schreberi', N'gulf graytwig')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1606, N'SCTE', N'Schinus terebinthifolius', N'Brazilian peppertree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1607, N'SCTER2', N'Schinus terebinthifolius var. raddianus', N'Brazilian peppertree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1608, N'SEAL4', N'Senna alata', N'emperor''s candlesticks')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1609, N'SEBI9', N'Sebastiania bilocularis', N'arrow poision plant')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1610, N'SECO9', N'Senna corymbosa', N'Argentine senna')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1611, N'SEGI2', N'Sequoiadendron giganteum', N'giant sequoia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1612, N'SEGR5', N'Sesbania grandiflora', N'vegetable hummingbird')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1613, N'SEHI2', N'Senna hirsuta', N'woolly senna')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1614, N'SEME4', N'Senna mexicana', N'Mexican senna')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1615, N'SEMEC', N'Senna mexicana var. chapmanii', N'Chapman''s senna')
GO
print 'Processed 1600 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1616, N'SEMO6', N'Severinia monophylla', N'Chinese boxorange')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1617, N'SEMU14', N'Senna multiglandulosa', N'glandular senna')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1618, N'SEPE4', N'Senna pendula', N'valamuerto')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1619, N'SEPEG', N'Senna pendula var. glabrata', N'valamuerto')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1620, N'SERE2', N'Serenoa repens', N'saw palmetto')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1621, N'SESE3', N'Sequoia sempervirens', N'redwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1622, N'SESP9', N'Senna spectabilis', N'casia amarilla')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1623, N'SESU4', N'Senna surattensis', N'glossy shower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1624, N'SHAR', N'Shepherdia argentea', N'silver buffaloberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1625, N'SIAL13', N'Sideroxylon alachuense', N'Alachua bully')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1626, N'SICE2', N'Sideroxylon celastrinum', N'saffron plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1627, N'SIFO', N'Sideroxylon foetidissimum', N'false mastic')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1628, N'SIGL3', N'Simarouba glauca', N'paradisetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1629, N'SIGLL', N'Simarouba glauca var. latifolia', N'paradisetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1630, N'SILA20', N'Sideroxylon lanuginosum', N'gum bully')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1631, N'SILAA4', N'Sideroxylon lanuginosum ssp. albicans', N'gum bully')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1632, N'SILAL3', N'Sideroxylon lanuginosum ssp. lanuginosum', N'gum bully')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1633, N'SILAO', N'Sideroxylon lanuginosum ssp. oblongifolium', N'gum bully')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1634, N'SILAR2', N'Sideroxylon lanuginosum ssp. rigidum', N'gum bully')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1635, N'SILY', N'Sideroxylon lycioides', N'buckthorn bully')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1636, N'SISA6', N'Sideroxylon salicifolium', N'white bully')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1637, N'SITE2', N'Sideroxylon tenax', N'tough bully')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1638, N'SOAI', N'Sorbus airia', N'winterbeam')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1639, N'SOAM3', N'Sorbus americana', N'American mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1640, N'SOAU', N'Sorbus aucuparia', N'European mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1641, N'SOBA', N'Solanum bahamense', N'Bahama nightshade')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1642, N'SOBAB', N'Solanum bahamense var. bahamense', N'Bahama nightshade')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1643, N'SODE3', N'Sorbus decora', N'northern mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1644, N'SODO3', N'Solanum donianum', N'mullein nightshade')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1645, N'SOER2', N'Solanum erianthum', N'potatotree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1646, N'SOGR2', N'Sorbus groenlandica', N'Greenland mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1647, N'SOHY3', N'Sorbus hybrida', N'oakleaf mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1648, N'SOLE3', N'Sophora leachiana', N'western necklacepod')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1649, N'SOMA3', N'Solanum mauritianum', N'earleaf nightshade')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1650, N'SOSC2', N'Sorbus scopulina', N'Greene''s mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1651, N'SOSCC', N'Sorbus scopulina var. cascadensis', N'Cascade mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1652, N'SOSCS', N'Sorbus scopulina var. scopulina', N'Greene''s mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1653, N'SOSE3', N'Sophora secundiflora', N'mescal bean')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1654, N'SOSI2', N'Sorbus sitchensis', N'western mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1655, N'SOSIG', N'Sorbus sitchensis var. grayi', N'western mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1656, N'SOSIS2', N'Sorbus sitchensis var. sitchensis', N'Sitka mountain ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1657, N'SOTA3', N'Solanum tampicense', N'scrambling nightshade')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1658, N'SOTO3', N'Sophora tomentosa', N'yellow necklacepod')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1659, N'SOTO4', N'Solanum torvum', N'turkey berry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1660, N'SOTOO', N'Sophora tomentosa var. occidentalis', N'yellow necklacepod')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1661, N'SOTOT', N'Sophora tomentosa var. truncata', N'yellow necklacepod')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1662, N'SPCA2', N'Spathodea campanulata', N'African tuliptree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1663, N'SPPU', N'Spondias purpurea', N'purple mombin')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1664, N'STAF4', N'Styphnolobium affine', N'Eve''s necklacepod')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1665, N'STAM4', N'Styrax americanus', N'American snowbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1666, N'STBO', N'Staphylea bolanderi', N'Sierra bladdernut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1667, N'STGR4', N'Styrax grandifolius', N'bigleaf snowbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1668, N'STJA5', N'Styrax japonicus', N'Japanese snowbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1669, N'STJA9', N'Styphnolobium japonicum', N'Japanese pagoda tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1670, N'STMA', N'Stewartia malacodendron', N'silky camellia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1671, N'STMA4', N'Strumpfia maritima', N'pride of Big Pine')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1672, N'STOV', N'Stewartia ovata', N'mountain camellia')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1673, N'STPL3', N'Styrax platanifolius', N'sycamoreleaf snowbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1674, N'STPLP2', N'Styrax platanifolius ssp. platanifolius', N'sycamoreleaf snowbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1675, N'STPLS2', N'Styrax platanifolius ssp. stellatus', N'sycamoreleaf snowbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1676, N'STRE4', N'Styrax redivivus', N'drug snowbell')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1677, N'STTH3', N'Stenocereus thurberi', N'organpipe cactus')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1678, N'STTR', N'Staphylea trifolia', N'American bladdernut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1679, N'SUMA2', N'Suriana maritima', N'bay cedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1680, N'SWMA2', N'Swietenia mahagoni', N'West Indian mahogany')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1681, N'SYCU', N'Syzygium cumini', N'Java plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1682, N'SYJA', N'Syzygium jambos', N'Malabar plum')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1683, N'SYPA12', N'Symplocos paniculata', N'sapphire-berry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1684, N'SYPE4', N'Syringa pekinensis', N'Peking tree lilac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1685, N'SYRE2', N'Syringa reticulata', N'Japanese tree lilac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1686, N'SYREA', N'Syringa reticulata ssp. amurensis', N'Amur lilac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1687, N'SYRER2', N'Syringa reticulata ssp. reticulata', N'Japanese tree lilac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1688, N'SYRO4', N'Syagrus romanzoffiana', N'queen palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1689, N'SYTI', N'Symplocos tinctoria', N'common sweetleaf')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1690, N'TAAF', N'Tamarix africana', N'African tamarisk')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1691, N'TAAL4', N'Tabernaemontana alba', N'white milkwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1692, N'TAAP', N'Tamarix aphylla', N'Athel tamarisk')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1693, N'TAAR6', N'Tamarix aralensis', N'Russian tamarisk')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1694, N'TAAS', N'Taxodium ascendens', N'pond cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1695, N'TAAU2', N'Tabebuia aurea', N'Caribbean trumpet-tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1696, N'TABA80', N'Taxus baccata', N'English yew')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1697, N'TABR2', N'Taxus brevifolia', N'Pacific yew')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1698, N'TACA9', N'Tamarix canariensis', N'Canary Island tamarisk')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1699, N'TACH2', N'Tamarix chinensis', N'five-stamen tamarisk')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1700, N'TACU', N'Taxus cuspidata', N'Japanese yew')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1701, N'TADI2', N'Taxodium distichum', N'bald cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1702, N'TADI5', N'Tabernaemontana divaricata', N'pinwheelflower')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1703, N'TAFL', N'Taxus floridana', N'Florida yew')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1704, N'TAGA', N'Tamarix gallica', N'French tamarisk')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1705, N'TAHE', N'Tabebuia heterophylla', N'white cedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1706, N'TAIN2', N'Tamarindus indica', N'tamarind')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1707, N'TAMU', N'Taxodium mucronatum', N'Montezuma bald cypress')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1708, N'TAPA4', N'Tamarix parviflora', N'smallflower tamarisk')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1709, N'TARA', N'Tamarix ramosissima', N'saltcedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1710, N'TATE7', N'Tamarix tetragyna', N'four-stamen tamarisk')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1711, N'TEBI', N'Tetrazygia bicolor', N'Florida clover ash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1712, N'TECA', N'Terminalia catappa', N'tropical almond')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1713, N'TEDA', N'Tetradium daniellii', N'bee-bee tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1714, N'TEMU2', N'Terminalia muelleri', N'Australian almond')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1715, N'TEPA3', N'Tetrapanax papyrifer', N'rice-paper plant')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1716, N'TEST', N'Tecoma stans', N'yellow trumpetbush')
GO
print 'Processed 1700 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1717, N'THMO4', N'Thrinax morrisii', N'Key thatch palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1718, N'THOC2', N'Thuja occidentalis', N'arborvitae')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1719, N'THPE3', N'Thevetia peruviana', N'luckynut')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1720, N'THPL', N'Thuja plicata', N'western redcedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1721, N'THPO3', N'Thespesia populnea', N'Portia tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1722, N'THRA2', N'Thrinax radiata', N'Florida thatch palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1723, N'TIAM', N'Tilia americana', N'American basswood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1724, N'TIAMA', N'Tilia americana var. americana', N'American basswood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1725, N'TIAMC', N'Tilia americana var. caroliniana', N'Carolina basswood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1726, N'TIAMH', N'Tilia americana var. heterophylla', N'American basswood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1727, N'TICO2', N'Tilia cordata', N'littleleaf linden')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1728, N'TIEU3', N'Tilia ×euchlora', N'Caucasian lime')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1729, N'TIEU4', N'Tilia ×europaea', N'common linden')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1730, N'TIPE', N'Tilia petiolaris', N'pendent silver linden')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1731, N'TIPL', N'Tilia platyphyllos', N'largeleaf linden')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1732, N'TOCA', N'Torreya californica', N'California nutmeg')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1733, N'TOCI', N'Toona ciliata', N'Australian redcedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1734, N'TOCIA', N'Toona ciliata ssp. ciliata var. australis', N'Australian redcedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1735, N'TOCIC', N'Toona ciliata ssp. ciliata', N'Australian redcedar')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1736, N'TOTA', N'Torreya taxifolia', N'Florida nutmeg')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1737, N'TOVE', N'Toxicodendron vernix', N'poison sumac')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1738, N'TRLA2', N'Trema lamarckiana', N'Lamarck''s trema')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1739, N'TRMI2', N'Trema micrantha', N'Jamaican nettletree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1740, N'TRSE6', N'Triadica sebifera', N'Chinese tallow')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1741, N'TRTR7', N'Triphasia trifolia', N'limeberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1742, N'TSCA', N'Tsuga canadensis', N'eastern hemlock')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1743, N'TSCA2', N'Tsuga caroliniana', N'Carolina hemlock')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1744, N'TSHE', N'Tsuga heterophylla', N'western hemlock')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1745, N'TSME', N'Tsuga mertensiana', N'mountain hemlock')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1746, N'ULAL', N'Ulmus alata', N'winged elm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1747, N'ULAM', N'Ulmus americana', N'American elm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1748, N'ULCR', N'Ulmus crassifolia', N'cedar elm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1749, N'ULGL', N'Ulmus glabra', N'Wych elm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1750, N'ULPA', N'Ulmus parvifolia', N'Chinese elm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1751, N'ULPR', N'Ulmus procera', N'English elm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1752, N'ULPU', N'Ulmus pumila', N'Siberian elm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1753, N'ULRU', N'Ulmus rubra', N'slippery elm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1754, N'ULSE', N'Ulmus serotina', N'September elm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1755, N'ULTH', N'Ulmus thomasii', N'rock elm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1756, N'UMCA', N'Umbellularia californica', N'California laurel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1757, N'UMCAC', N'Umbellularia californica var. californica', N'California laurel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1758, N'UMCAF', N'Umbellularia californica var. fresnensis', N'California laurel')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1759, N'UNSP', N'Ungnadia speciosa', N'Mexican buckeye')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1760, N'VAAN3', N'Vallesia antillana', N'tearshrub')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1761, N'VAAR', N'Vaccinium arboreum', N'farkleberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1762, N'VACA5', N'Vauquelinia californica', N'Arizona rosewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1763, N'VACAC', N'Vauquelinia californica ssp. californica', N'Arizona rosewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1764, N'VACAP', N'Vauquelinia californica ssp. pauciflora', N'Arizona rosewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1765, N'VACAS', N'Vauquelinia californica ssp. sonorensis', N'Sonora rosewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1766, N'VACO4', N'Vauquelinia corymbosa', N'slimleaf rosewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1767, N'VACOA', N'Vauquelinia corymbosa ssp. angustifolia', N'slimleaf rosewood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1768, N'VEFO', N'Vernicia fordii', N'tungoil tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1769, N'VIAG', N'Vitex agnus-castus', N'lilac chastetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1770, N'VIAGA', N'Vitex agnus-castus var. agnus-castus', N'lilac chastetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1771, N'VIAGC', N'Vitex agnus-castus var. caerulea', N'lilac chastetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1772, N'VIDE', N'Viburnum dentatum', N'southern arrowwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1773, N'VIDED4', N'Viburnum dentatum var. dentatum', N'southern arrowwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1774, N'VIDEV', N'Viburnum dentatum var. venosum', N'southern arrowwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1775, N'VILA', N'Viburnum lantana', N'wayfaringtree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1776, N'VILE', N'Viburnum lentago', N'nannyberry')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1777, N'VINE2', N'Vitex negundo', N'Chinese chastetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1778, N'VINEH', N'Vitex negundo var. heterophylla', N'Chinese chastetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1779, N'VINEI', N'Vitex negundo var. intermedia', N'Chinese chastetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1780, N'VINEN', N'Vitex negundo var. negundo', N'Chinese chastetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1781, N'VINU', N'Viburnum nudum', N'possumhaw')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1782, N'VINUC', N'Viburnum nudum var. cassinoides', N'withe-rod')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1783, N'VINUN', N'Viburnum nudum var. nudum', N'possumhaw')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1784, N'VIOB', N'Viburnum obovatum', N'small-leaf arrowwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1785, N'VIOP', N'Viburnum opulus', N'European cranberrybush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1786, N'VIOPA2', N'Viburnum opulus var. americanum', N'American cranberrybush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1787, N'VIOPO', N'Viburnum opulus var. opulus', N'European cranberrybush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1788, N'VIPR', N'Viburnum prunifolium', N'blackhaw')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1789, N'VIRE7', N'Viburnum recognitum', N'southern arrowwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1790, N'VIRU', N'Viburnum rufidulum', N'rusty blackhaw')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1791, N'VISI', N'Viburnum sieboldii', N'Siebold''s arrowwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1792, N'VITR7', N'Vitex trifolia', N'simpleleaf chastetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1793, N'VITRS', N'Vitex trifolia var. subtrisecta', N'simpleleaf chastetree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1794, N'WAFI', N'Washingtonia filifera', N'California fan palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1795, N'WARO', N'Washingtonia robusta', N'Washington fan palm')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1796, N'XIAM', N'Ximenia americana', N'tallow wood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1797, N'XYCO7', N'Xylosma congestum', N'dense logwood')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1798, N'XYFL3', N'Xylosma flexuosa', N'brushholly')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1799, N'YUAL', N'Yucca aloifolia', N'aloe yucca')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1800, N'YUBR', N'Yucca brevifolia', N'Joshua tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1801, N'YUBRB', N'Yucca brevifolia var. brevifolia', N'Joshua tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1802, N'YUBRJ', N'Yucca brevifolia var. jaegeriana', N'Jaeger''s Joshua tree')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1803, N'YUEL', N'Yucca elata', N'soaptree yucca')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1804, N'YUFA', N'Yucca faxoniana', N'Eve''s needle')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1805, N'YUGL2', N'Yucca gloriosa', N'moundlily yucca')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1806, N'YUSC', N'Yucca ×schottii', N'Schott''s yucca')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1807, N'YUSC2', N'Yucca schidigera', N'Mojave yucca')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1808, N'YUTH', N'Yucca thompsoniana', N'Thompson''s yucca')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1809, N'YUTO', N'Yucca torreyi', N'Torrey''s yucca')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1810, N'YUTR', N'Yucca treculeana', N'Don Quixote''s lace')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1811, N'YUTRS', N'Yucca treculeana var. succulenta', N'Don Quixote''s lace')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1812, N'YUTRT', N'Yucca treculeana var. treculeana', N'Don Quixote''s lace')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1813, N'ZAAM', N'Zanthoxylum americanum', N'common pricklyash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1814, N'ZACL', N'Zanthoxylum clava-herculis', N'Hercules'' club')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1815, N'ZACO', N'Zanthoxylum coriaceum', N'Biscayne pricklyash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1816, N'ZAFA', N'Zanthoxylum fagara', N'lime pricklyash')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1817, N'ZAFL', N'Zanthoxylum flavum', N'West Indian satinwood')
GO
print 'Processed 1800 total records'
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1818, N'ZAHI2', N'Zanthoxylum hirsutum', N'Texas Hercules'' club')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1819, N'ZESE80', N'Zelkova serrata', N'Japanese zelkova')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1820, N'ZIMA', N'Ziziphus mauritiana', N'Indian jujube')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1821, N'ZIOB', N'Ziziphus obtusifolia', N'lotebush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1822, N'ZIOBC', N'Ziziphus obtusifolia var. canescens', N'lotebush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1823, N'ZIOBO', N'Ziziphus obtusifolia var. obtusifolia', N'lotebush')
INSERT [Trees].[KnownTrees] ([Id], [AcceptedSymbol], [ScientificName], [CommonName]) VALUES (1824, N'ZIZI', N'Ziziphus zizyphus', N'common jujube')
SET IDENTITY_INSERT [Trees].[KnownTrees] OFF
/****** Object:  UserDefinedFunction [dbo].[DistanceEuclidean]    Script Date: 12/26/2010 22:04:52 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- =============================================
-- Author:		<Author,,Name>
-- Create date: <Create Date, ,>
-- Description:	<Description, ,>
-- =============================================
CREATE FUNCTION [dbo].[DistanceEuclidean]
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
/****** Object:  Table [Locations].[Countries]    Script Date: 12/26/2010 22:04:50 ******/
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
/****** Object:  Table [Photos].[Stores]    Script Date: 12/26/2010 22:04:50 ******/
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
INSERT [Photos].[Stores] ([Id], [Type], [IsActive], [RootPath]) VALUES (3, 2, 1, N'\\Server1\PhotoStore')
SET IDENTITY_INSERT [Photos].[Stores] OFF
/****** Object:  Table [Locations].[States]    Script Date: 12/26/2010 22:04:50 ******/
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
/****** Object:  Table [Users].[Users]    Script Date: 12/26/2010 22:04:50 ******/
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
/****** Object:  Table [Trips].[Trips]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trips].[Trips](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[CreatorUserId] [int] NULL,
	[Created] [datetime] NOT NULL,
	[IsImported] [bit] NOT NULL,
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
	[DefaultCountryId] [int] NULL,
	[DefaultStateId] [int] NULL,
	[DefaultCounty] [varchar](100) NULL,
	[LastSaved] [datetime] NOT NULL,
 CONSTRAINT [PK_Trips] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Trips].[SubsiteVisits]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trips].[SubsiteVisits](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatorUserId] [int] NULL,
	[SiteVisitId] [int] NOT NULL,
	[Name] [varchar](100) NOT NULL,
	[Latitude] [real] NOT NULL,
	[LatitudeInputFormat] [tinyint] NOT NULL,
	[Longitude] [real] NOT NULL,
	[LongitudeInputFormat] [tinyint] NOT NULL,
	[CountryId] [int] NULL,
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
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Photos].[Photos]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Photos].[Photos](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[StoreId] [int] NULL,
	[LinkId] [int] NULL,
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
/****** Object:  Table [Trips].[SiteVisits]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trips].[SiteVisits](
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
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Trips].[Measurers]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trips].[Measurers](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatorUserId] [int] NULL,
	[TripId] [int] NOT NULL,
	[FirstName] [varchar](50) NOT NULL,
	[LastName] [varchar](50) NOT NULL,
 CONSTRAINT [PK_Measurers] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Trips].[SubsiteVisitPhotos]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Trips].[SubsiteVisitPhotos](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[SubsiteVisitId] [int] NOT NULL,
	[PhotoId] [int] NOT NULL,
 CONSTRAINT [PK_SubsiteVisitPhotos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [Trips].[TreeMeasurements]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trips].[TreeMeasurements](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatorUserId] [int] NULL,
	[SubsiteVisitId] [int] NOT NULL,
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
SET ANSI_PADDING OFF
GO
/****** Object:  Table [Trips].[TrunkMeasurements]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
SET ANSI_PADDING ON
GO
CREATE TABLE [Trips].[TrunkMeasurements](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Created] [datetime] NOT NULL,
	[CreatorUserId] [int] NULL,
	[TreeMeasurementId] [int] NOT NULL,
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
/****** Object:  Table [Trips].[TreeMeasurementPhotos]    Script Date: 12/26/2010 22:04:50 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [Trips].[TreeMeasurementPhotos](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[TreeMeasurementId] [int] NULL,
	[PhotoId] [int] NOT NULL,
 CONSTRAINT [PK_TreeMeasurementPhotos] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX  = OFF, STATISTICS_NORECOMPUTE  = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS  = ON, ALLOW_PAGE_LOCKS  = ON) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Default [DF_States_CountryId]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_CountryId]  DEFAULT ((1)) FOR [CountryId]
GO
/****** Object:  Default [DF_States_NELatitude]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_NELatitude]  DEFAULT ((0)) FOR [NELatitude]
GO
/****** Object:  Default [DF_States_NELongitude]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_NELongitude]  DEFAULT ((0)) FOR [NELongitude]
GO
/****** Object:  Default [DF_States_SWLatitude]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_SWLatitude]  DEFAULT ((0)) FOR [SWLatitude]
GO
/****** Object:  Default [DF_States_SWLongitude]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Locations].[States] ADD  CONSTRAINT [DF_States_SWLongitude]  DEFAULT ((0)) FOR [SWLongitude]
GO
/****** Object:  Default [DF_Measurers_Created]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[Measurers] ADD  CONSTRAINT [DF_Measurers_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_SiteVisits_Created]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[SiteVisits] ADD  CONSTRAINT [DF_SiteVisits_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_SubsiteVisits_Created]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[SubsiteVisits] ADD  CONSTRAINT [DF_SubsiteVisits_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_SubsiteVisits_MakeOwnershipContactInfoPublic]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[SubsiteVisits] ADD  CONSTRAINT [DF_SubsiteVisits_MakeOwnershipContactInfoPublic]  DEFAULT ((0)) FOR [MakeOwnershipContactInfoPublic]
GO
/****** Object:  Default [DF_TreeMeasurements_Created]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TreeMeasurements] ADD  CONSTRAINT [DF_TreeMeasurements_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_TreeMeasurements_Type]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TreeMeasurements] ADD  CONSTRAINT [DF_TreeMeasurements_Type]  DEFAULT ((1)) FOR [Type]
GO
/****** Object:  Default [DF_TreeMeasurements_MakeCoordinatesPublic]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TreeMeasurements] ADD  CONSTRAINT [DF_TreeMeasurements_MakeCoordinatesPublic]  DEFAULT ((0)) FOR [MakeCoordinatesPublic]
GO
/****** Object:  Default [DF_TreeMeasurements_HeightMeasurementMethod]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TreeMeasurements] ADD  CONSTRAINT [DF_TreeMeasurements_HeightMeasurementMethod]  DEFAULT ((0)) FOR [HeightMeasurementMethod]
GO
/****** Object:  Default [DF_Trips_Created]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[Trips] ADD  CONSTRAINT [DF_Trips_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_Trips_MakeMeasurerContactInfoPublic]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[Trips] ADD  CONSTRAINT [DF_Trips_MakeMeasurerContactInfoPublic]  DEFAULT ((0)) FOR [MakeMeasurerContactInfoPublic]
GO
/****** Object:  Default [DF_Trips_DefaultHeightMeasurementMethod]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[Trips] ADD  CONSTRAINT [DF_Trips_DefaultHeightMeasurementMethod]  DEFAULT ((0)) FOR [DefaultHeightMeasurementMethod]
GO
/****** Object:  Default [DF_Trips_LastSaved]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[Trips] ADD  CONSTRAINT [DF_Trips_LastSaved]  DEFAULT (getdate()) FOR [LastSaved]
GO
/****** Object:  Default [DF_TrunkMeasurements_IncludeHeightDistanceAndAngleMeasurements]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TrunkMeasurements] ADD  CONSTRAINT [DF_TrunkMeasurements_IncludeHeightDistanceAndAngleMeasurements]  DEFAULT ((0)) FOR [IncludeHeightDistanceAndAngleMeasurements]
GO
/****** Object:  Default [DF_TrunkMeasurements_TrunkComments]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TrunkMeasurements] ADD  CONSTRAINT [DF_TrunkMeasurements_TrunkComments]  DEFAULT ('') FOR [TrunkComments]
GO
/****** Object:  Default [DF_Users_Email]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Email]  DEFAULT ('Anonymous') FOR [Email]
GO
/****** Object:  Default [DF_Users_Firstname]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Firstname]  DEFAULT ('') FOR [Firstname]
GO
/****** Object:  Default [DF_Users_Lastname]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Lastname]  DEFAULT ('') FOR [Lastname]
GO
/****** Object:  Default [DF_Users_UserRoles]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_UserRoles]  DEFAULT ((0)) FOR [Roles]
GO
/****** Object:  Default [DF_Users_PasswordHash]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordHash]  DEFAULT (0x00) FOR [PasswordHash]
GO
/****** Object:  Default [DF_Users_PasswordNumerics]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordNumerics]  DEFAULT ((0)) FOR [PasswordNumerics]
GO
/****** Object:  Default [DF_Users_PasswordUppercase]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordUppercase]  DEFAULT ((0)) FOR [PasswordUppercase]
GO
/****** Object:  Default [DF_Users_PasswordLowercase]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordLowercase]  DEFAULT ((0)) FOR [PasswordLowercase]
GO
/****** Object:  Default [DF_Users_PasswordSpecials]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordSpecials]  DEFAULT ((0)) FOR [PasswordSpecials]
GO
/****** Object:  Default [DF_Users_PasswordLength]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_PasswordLength]  DEFAULT ((0)) FOR [PasswordLength]
GO
/****** Object:  Default [DF_Users_Created]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_Created]  DEFAULT (getdate()) FOR [Created]
GO
/****** Object:  Default [DF_Users_LastActivity]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_LastActivity]  DEFAULT (getdate()) FOR [LastActivity]
GO
/****** Object:  Default [DF_Users_LastLogin]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_LastLogin]  DEFAULT (getdate()) FOR [LastLogin]
GO
/****** Object:  Default [DF_Users_EmailVerificationToken]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_EmailVerificationToken]  DEFAULT (0x00) FOR [EmailVerificationToken]
GO
/****** Object:  Default [DF_Users_RecentlyFailedLoginAttempts]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Users].[Users] ADD  CONSTRAINT [DF_Users_RecentlyFailedLoginAttempts]  DEFAULT ((0)) FOR [RecentlyFailedLoginAttempts]
GO
/****** Object:  ForeignKey [FK_Photos_Links]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Photos].[Photos]  WITH CHECK ADD  CONSTRAINT [FK_Photos_Links] FOREIGN KEY([LinkId])
REFERENCES [Photos].[Links] ([Id])
GO
ALTER TABLE [Photos].[Photos] CHECK CONSTRAINT [FK_Photos_Links]
GO
/****** Object:  ForeignKey [FK_Photos_Stores]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Photos].[Photos]  WITH CHECK ADD  CONSTRAINT [FK_Photos_Stores] FOREIGN KEY([StoreId])
REFERENCES [Photos].[Stores] ([Id])
GO
ALTER TABLE [Photos].[Photos] CHECK CONSTRAINT [FK_Photos_Stores]
GO
/****** Object:  ForeignKey [FK_Measurers_Trips]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[Measurers]  WITH CHECK ADD  CONSTRAINT [FK_Measurers_Trips] FOREIGN KEY([TripId])
REFERENCES [Trips].[Trips] ([Id])
GO
ALTER TABLE [Trips].[Measurers] CHECK CONSTRAINT [FK_Measurers_Trips]
GO
/****** Object:  ForeignKey [FK_Measurers_Users]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[Measurers]  WITH CHECK ADD  CONSTRAINT [FK_Measurers_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Trips].[Measurers] CHECK CONSTRAINT [FK_Measurers_Users]
GO
/****** Object:  ForeignKey [FK_SitesVisits_Trips]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[SiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SitesVisits_Trips] FOREIGN KEY([TripId])
REFERENCES [Trips].[Trips] ([Id])
GO
ALTER TABLE [Trips].[SiteVisits] CHECK CONSTRAINT [FK_SitesVisits_Trips]
GO
/****** Object:  ForeignKey [FK_SiteVisits_Users]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[SiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SiteVisits_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Trips].[SiteVisits] CHECK CONSTRAINT [FK_SiteVisits_Users]
GO
/****** Object:  ForeignKey [FK_SubsiteVisitPhotos_Photos]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[SubsiteVisitPhotos]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisitPhotos_Photos] FOREIGN KEY([PhotoId])
REFERENCES [Photos].[Photos] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Trips].[SubsiteVisitPhotos] CHECK CONSTRAINT [FK_SubsiteVisitPhotos_Photos]
GO
/****** Object:  ForeignKey [FK_SubsiteVisitPhotos_SubsiteVisits]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[SubsiteVisitPhotos]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisitPhotos_SubsiteVisits] FOREIGN KEY([SubsiteVisitId])
REFERENCES [Trips].[SubsiteVisits] ([Id])
GO
ALTER TABLE [Trips].[SubsiteVisitPhotos] CHECK CONSTRAINT [FK_SubsiteVisitPhotos_SubsiteVisits]
GO
/****** Object:  ForeignKey [FK_SubsiteVisits_Countries]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[SubsiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_Countries] FOREIGN KEY([CountryId])
REFERENCES [Locations].[Countries] ([Id])
GO
ALTER TABLE [Trips].[SubsiteVisits] CHECK CONSTRAINT [FK_SubsiteVisits_Countries]
GO
/****** Object:  ForeignKey [FK_SubsiteVisits_States]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[SubsiteVisits]  WITH CHECK ADD  CONSTRAINT [FK_SubsiteVisits_States] FOREIGN KEY([StateId])
REFERENCES [Locations].[States] ([Id])
GO
ALTER TABLE [Trips].[SubsiteVisits] CHECK CONSTRAINT [FK_SubsiteVisits_States]
GO
/****** Object:  ForeignKey [FK_TreeMeasurementPhotos_Photos]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TreeMeasurementPhotos]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurementPhotos_Photos] FOREIGN KEY([PhotoId])
REFERENCES [Photos].[Photos] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [Trips].[TreeMeasurementPhotos] CHECK CONSTRAINT [FK_TreeMeasurementPhotos_Photos]
GO
/****** Object:  ForeignKey [FK_TreeMeasurementPhotos_TreeMeasurements]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TreeMeasurementPhotos]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurementPhotos_TreeMeasurements] FOREIGN KEY([TreeMeasurementId])
REFERENCES [Trips].[TreeMeasurements] ([Id])
GO
ALTER TABLE [Trips].[TreeMeasurementPhotos] CHECK CONSTRAINT [FK_TreeMeasurementPhotos_TreeMeasurements]
GO
/****** Object:  ForeignKey [FK_TreeMeasurements_SubsiteVisits]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TreeMeasurements]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurements_SubsiteVisits] FOREIGN KEY([SubsiteVisitId])
REFERENCES [Trips].[SubsiteVisits] ([Id])
GO
ALTER TABLE [Trips].[TreeMeasurements] CHECK CONSTRAINT [FK_TreeMeasurements_SubsiteVisits]
GO
/****** Object:  ForeignKey [FK_TreeMeasurements_Users]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TreeMeasurements]  WITH CHECK ADD  CONSTRAINT [FK_TreeMeasurements_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Trips].[TreeMeasurements] CHECK CONSTRAINT [FK_TreeMeasurements_Users]
GO
/****** Object:  ForeignKey [FK_Trips_Countries]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[Trips]  WITH CHECK ADD  CONSTRAINT [FK_Trips_Countries] FOREIGN KEY([DefaultCountryId])
REFERENCES [Locations].[Countries] ([Id])
GO
ALTER TABLE [Trips].[Trips] CHECK CONSTRAINT [FK_Trips_Countries]
GO
/****** Object:  ForeignKey [FK_Trips_States]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[Trips]  WITH CHECK ADD  CONSTRAINT [FK_Trips_States] FOREIGN KEY([DefaultStateId])
REFERENCES [Locations].[States] ([Id])
GO
ALTER TABLE [Trips].[Trips] CHECK CONSTRAINT [FK_Trips_States]
GO
/****** Object:  ForeignKey [FK_Trips_Users]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[Trips]  WITH CHECK ADD  CONSTRAINT [FK_Trips_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Trips].[Trips] CHECK CONSTRAINT [FK_Trips_Users]
GO
/****** Object:  ForeignKey [FK_TrunkMeasurements_TreeMeasurements1]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TrunkMeasurements]  WITH CHECK ADD  CONSTRAINT [FK_TrunkMeasurements_TreeMeasurements1] FOREIGN KEY([TreeMeasurementId])
REFERENCES [Trips].[TreeMeasurements] ([Id])
GO
ALTER TABLE [Trips].[TrunkMeasurements] CHECK CONSTRAINT [FK_TrunkMeasurements_TreeMeasurements1]
GO
/****** Object:  ForeignKey [FK_TrunkMeasurements_Users]    Script Date: 12/26/2010 22:04:50 ******/
ALTER TABLE [Trips].[TrunkMeasurements]  WITH CHECK ADD  CONSTRAINT [FK_TrunkMeasurements_Users] FOREIGN KEY([CreatorUserId])
REFERENCES [Users].[Users] ([Id])
GO
ALTER TABLE [Trips].[TrunkMeasurements] CHECK CONSTRAINT [FK_TrunkMeasurements_Users]
GO
