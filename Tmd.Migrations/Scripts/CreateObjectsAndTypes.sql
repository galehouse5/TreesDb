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









CREATE FUNCTION [dbo].[SearchStates]
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
  from Locations.States
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









create view dbo.StateMetrics
as
    with trees as
    (
        select ss.StateId, t.*
        from Trees.Trees t
        join Sites.Subsites ss
            on ss.Id = t.SubsiteId
    ),

    species as
    (
        select StateId, ScientificName,
            max(Height) MaxHeight, max(Girth) MaxGirth
        from trees
        group by StateId, ScientificName
    )

    select s.Id StateId,
        (
          select case when count(*) >= 5 then sum(MaxHeight) / count(*) else null end
          from (select top 5 MaxHeight from species where StateId = s.Id order by MaxHeight desc) _
        ) RHI5,
        (
          select case when count(*) >= 10 then sum(MaxHeight) / count(*) else null end
          from (select top 10 MaxHeight from species where StateId = s.Id order by MaxHeight desc) _
        ) RHI10,
        (
          select case when count(*) >= 20 then sum(MaxHeight) / count(*) else null end
          from (select top 20 MaxHeight from species where StateId = s.Id order by MaxHeight desc) _
        ) RHI20,
        (
          select case when count(*) >= 5 then sum(MaxGirth) / count(*) else null end
          from (select top 5 MaxGirth from species where StateId = s.Id order by MaxGirth desc) _
        ) RGI5,
        (
          select case when count(*) >= 10 then sum(MaxGirth) / count(*) else null end
          from (select top 10 MaxGirth from species where StateId = s.Id order by MaxGirth desc) _
        ) RGI10,
        (
          select case when count(*) >= 20 then sum(MaxGirth) / count(*) else null end
          from (select top 20 MaxGirth from species where StateId = s.Id order by MaxGirth desc) _
        ) RGI20,
        (select count(*) from trees where StateId = s.Id) TreesMeasuredCount,
        (select max(LastMeasured) from trees where StateId = s.Id) LastMeasurementDate,
        case when exists
        (
            select *
            from Sites.Subsites
            where StateId = s.Id
                and LatitudeInputFormat != 1 -- Unspecified
                and LongitudeInputFormat != 1 -- Unspecified
        )
         then 1 else 0
        end ContainsEntityWithCoordinates
    from Locations.States s
go









create view dbo.SiteMetrics
as
    with trees as
    (
        select ss.SiteId, t.*
        from Trees.Trees t
        join Sites.Subsites ss
            on ss.Id = t.SubsiteId
    ),

    species as
    (
        select SiteId, ScientificName,
            max(Height) MaxHeight,
            max(Girth) MaxGirth,
            count(*) TreeCount
        from trees
        group by SiteId, ScientificName
    )

    select s.Id SiteId,
        (
          select case when count(*) >= 5 then sum(MaxHeight) / count(*) else null end
          from (select top 5 MaxHeight from species where SiteId = s.Id order by MaxHeight desc) _
        ) RHI5,
        (
          select case when count(*) >= 10 then sum(MaxHeight) / count(*) else null end
          from (select top 10 MaxHeight from species where SiteId = s.Id order by MaxHeight desc) _
        ) RHI10,
        (
          select case when count(*) >= 20 then sum(MaxHeight) / count(*) else null end
          from (select top 20 MaxHeight from species where SiteId = s.Id order by MaxHeight desc) _
        ) RHI20,
        (
          select case when count(*) >= 5 then sum(MaxGirth) / count(*) else null end
          from (select top 5 MaxGirth from species where SiteId = s.Id order by MaxGirth desc) _
        ) RGI5,
        (
          select case when count(*) >= 10 then sum(MaxGirth) / count(*) else null end
          from (select top 10 MaxGirth from species where SiteId = s.Id order by MaxGirth desc) _
        ) RGI10,
        (
          select case when count(*) >= 20 then sum(MaxGirth) / count(*) else null end
          from (select top 20 MaxGirth from species where SiteId = s.Id order by MaxGirth desc) _
        ) RGI20,
        (select count(*) from trees where SiteId = s.Id) TreesMeasuredCount,
        (select max(LastMeasured) from trees where SiteId = s.Id) LastMeasurementDate,
        case when exists
        (
            select *
            from Sites.Subsites
            where SiteId = s.Id
                and LatitudeInputFormat != 1 -- Unspecified
                and LongitudeInputFormat != 1 -- Unspecified
        )
         then 1 else 0
        end ContainsEntityWithCoordinates
    from Sites.Sites s
go









create view dbo.SubsiteMetrics
as
    with species as
    (
        select SubsiteId, ScientificName,
            max(Height) MaxHeight,
            max(Girth) MaxGirth,
            count(*) TreeCount
        from Trees.Trees
        group by SubsiteId, ScientificName
    )

    select ss.Id SubsiteId,
        (
          select case when count(*) >= 5 then sum(MaxHeight) / count(*) else null end
          from (select top 5 MaxHeight from species where SubsiteId = ss.Id order by MaxHeight desc) _
        ) RHI5,
        (
          select case when count(*) >= 10 then sum(MaxHeight) / count(*) else null end
          from (select top 10 MaxHeight from species where SubsiteId = ss.Id order by MaxHeight desc) _
        ) RHI10,
        (
          select case when count(*) >= 20 then sum(MaxHeight) / count(*) else null end
          from (select top 20 MaxHeight from species where SubsiteId = ss.Id order by MaxHeight desc) _
        ) RHI20,
        (
          select case when count(*) >= 5 then sum(MaxGirth) / count(*) else null end
          from (select top 5 MaxGirth from species where SubsiteId = ss.Id order by MaxGirth desc) _
        ) RGI5,
        (
          select case when count(*) >= 10 then sum(MaxGirth) / count(*) else null end
          from (select top 10 MaxGirth from species where SubsiteId = ss.Id order by MaxGirth desc) _
        ) RGI10,
        (
          select case when count(*) >= 20 then sum(MaxGirth) / count(*) else null end
          from (select top 20 MaxGirth from species where SubsiteId = ss.Id order by MaxGirth desc) _
        ) RGI20,
        (select count(*) from Trees.Trees where SubsiteId = ss.Id) TreesMeasuredCount,
        (select max(LastMeasured) from Trees.Trees where SubsiteId = ss.Id) LastMeasurementDate,
        case when exists
        (
            select *
            from Trees.Trees
            where SubsiteId = ss.Id
                and LatitudeInputFormat != 1 -- Unspecified
                and LongitudeInputFormat != 1 -- Unspecified
        ) then 1 else 0
        end ContainsEntityWithCoordinates
    from Sites.Subsites ss
go









create procedure dbo.UpdateStaleMetrics
as
begin
    update ss
    set ComputedRHI5 = m.RHI5,
        ComputedRHI10 = m.RHI10,
        ComputedRHI20 = m.RHI20,
        ComputedRGI5 = m.RGI5,
        ComputedRGI10 = m.RGI10,
        ComputedRGI20 = m.RGI20,
        ComputedTreesMeasuredCount = m.TreesMeasuredCount,
        ComputedLastMeasurementDate = m.LastMeasurementDate,
        ComputedContainsEntityWithCoordinates = m.ContainsEntityWithCoordinates,
        AreMetricsStale = 0,
        LastMetricsUpdateTimestamp = getdate()
    from Sites.Subsites ss
    join dbo.SubsiteMetrics m
        on m.SubsiteId = ss.Id
    where ss.AreMetricsStale = 1

    update s
    set ComputedRHI5 = m.RHI5,
        ComputedRHI10 = m.RHI10,
        ComputedRHI20 = m.RHI20,
        ComputedRGI5 = m.RGI5,
        ComputedRGI10 = m.RGI10,
        ComputedRGI20 = m.RGI20,
        ComputedTreesMeasuredCount = m.TreesMeasuredCount,
        ComputedLastMeasurementDate = m.LastMeasurementDate,
        ComputedContainsEntityWithCoordinates = m.ContainsEntityWithCoordinates,
        AreMetricsStale = 0,
        LastMetricsUpdateTimestamp = getdate()
    from Sites.Sites s
    join dbo.SiteMetrics m
        on m.SiteId = s.Id
    where s.AreMetricsStale = 1

    update s
    set ComputedRHI5 = m.RHI5,
        ComputedRHI10 = m.RHI10,
        ComputedRHI20 = m.RHI20,
        ComputedRGI5 = m.RGI5,
        ComputedRGI10 = m.RGI10,
        ComputedRGI20 = m.RGI20,
        ComputedTreesMeasuredCount = m.TreesMeasuredCount,
        ComputedLastMeasurementDate = m.LastMeasurementDate,
        ComputedContainsEntityWithCoordinates = m.ContainsEntityWithCoordinates,
        AreMetricsStale = 0,
        LastMetricsUpdateTimestamp = getdate()
    from Locations.States s
    join dbo.StateMetrics m
        on m.StateId = s.Id
    where s.AreMetricsStale = 1
end
go









create trigger Trees.FlagStaleMetrics_Trees
    on Trees.Trees
    after insert, update, delete
as
begin
    set nocount on

    update Sites.Subsites
    set AreMetricsStale = 1
    where ID in (select SubsiteId from inserted)
        or ID in (select SubsiteId from deleted)
end
go









create trigger Sites.FlagStaleMetrics_Subsites
    on Sites.Subsites
    after insert, update, delete
as
begin
    set nocount on

    update Sites.Sites
    set AreMetricsStale = 1
    where ID in (select SiteId from inserted)
        or ID in (select SiteId from deleted)

    update Locations.States
    set AreMetricsStale = 1
    where ID in (select StateId from inserted)
        or ID in (select StateId from deleted)
end
go