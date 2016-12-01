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









create view dbo.MeasurerActivity
as
    select
        abs(
            cast(hashbytes('MD5', lower(ltrim(rtrim(m.LastName)))) as int)
            ^ cast(hashbytes('MD5', lower(ltrim(rtrim(m.FirstName)))) as int)
        ) Id,
        m.LastName,
        m.FirstName,
        count(distinct m.TreeID) TreesMeasuredCount,
        count(distinct t.SubsiteId) SitesVisitedCount,
        max(t.LastMeasured) LastMeasurementDate
    from Trees.Measurers m
    join Trees.Trees t
        on t.Id = m.TreeId
    group by m.LastName, m.FirstName
go









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









create FUNCTION [Helpers].[DistanceEuclidean]
(
    @x1 real,
    @y1 real,
    @x2 real,
    @y2 real
)
RETURNS real
AS
BEGIN
    return sqrt(
      square(@x1 - @x2) 
      + square(@y1 - @y2)
    )
END
GO









CREATE FUNCTION [Helpers].[Max]
(
    @f1 float,
    @f2 float
)
RETURNS float
AS
BEGIN
  RETURN 0.5 * ((@f1 + @f2) + ABS(@f1 - @f2))
END
GO









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