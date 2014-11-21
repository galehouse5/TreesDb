using FluentMigrator;

namespace Tmd.Migrations.Y2014
{
    [Migration(3)]
    public class M3_MigrateLegacyImportData : Migration
    {
        public void MigrateEntities(int entityType, string legacyTable)
        {
            Execute.Sql(string.Format(
@"insert into ExcelImport_Entities (EntityTypeID, LegacyID, UserID, RowIndex)
select {0}, Id, CreatorUserId, 
	(row_number() over (partition by CreatorUserId order by Created)) - 1 RowIndex
from Imports.{1}
where CreatorUserID is not null", entityType, legacyTable));
        }

        public void InsertFloatValue(string legacyValueSelectionSql)
        {
            Execute.Sql(string.Format(
@"insert into ExcelImport_Values (Type, EntityID, AttributeID, FloatValue)
select 1, EntityID, AttributeID, Value
from ({0}) value
where Value is not null and Value != 0", legacyValueSelectionSql));
        }

        public void InsertStringValue(string legacyValueSelectionSql)
        {
            Execute.Sql(string.Format(
@"insert into ExcelImport_Values (Type, EntityID, AttributeID, StringValue)
select 3, EntityID, AttributeID, Value
from ({0}) value
where Value is not null and Value != ''", legacyValueSelectionSql));
        }

        public void InsertBooleanValue(string legacyValueSelectionSql)
        {
            Execute.Sql(string.Format(
@"insert into ExcelImport_Values (Type, EntityID, AttributeID, BooleanValue)
select 4, EntityID, AttributeID, Value
from ({0}) value
where Value is not null", legacyValueSelectionSql));
        }

        public void InsertByteValue(string legacyValueSelectionSql)
        {
            Execute.Sql(string.Format(
@"insert into ExcelImport_Values (Type, EntityID, AttributeID, ByteValue)
select 5, EntityID, AttributeID, Value
from ({0}) value
where Value is not null and Value != 0", legacyValueSelectionSql));
        }

        public void InsertDateValue(string legacyValueSelectionSql)
        {
            Execute.Sql(string.Format(
@"insert into ExcelImport_Values (Type, EntityID, AttributeID, DateValue)
select 6, EntityID, AttributeID, Value
from ({0}) value
where Value is not null", legacyValueSelectionSql));
        }

        public void InsertIntegerValue(string legacyValueSelectionSql)
        {
            Execute.Sql(string.Format(
@"insert into ExcelImport_Values (Type, EntityID, AttributeID, IntegerValue)
select 2, EntityID, AttributeID, Value
from ({0}) value
where Value is not null and Value != 0", legacyValueSelectionSql));
        }

        public string BuildLegacyValueSelectionSql(string legacyTable, string legacyColumn, int entityType, int attribute)
        {
            return string.Format(
@"select entity.ID EntityID, {0} AttributeID, {3} Value
from Imports.{2} legacyEntity
join ExcelImport_Entities entity
	on entity.LegacyID = legacyEntity.Id
where entity.EntityTypeID = {1}", attribute, entityType, legacyTable, legacyColumn);
        }

        public string BuildLegacyTripValueSelectionSql(string legacyColumn, int attribute)
        {
            return string.Format(
@"select entity.ID EntityID, {0} AttributeID, legacyTrip.{1} Value
from Imports.Trips legacyTrip
join Imports.Sites legacySite
	on legacySite.TripId = legacyTrip.Id
join ExcelImport_Entities entity
	on entity.LegacyID = legacySite.Id
where entity.EntityTypeID = 1", attribute, legacyColumn);
        }

        public string BuildLegacyMeasurerValueSelectionSql(int measurer, int attribute)
        {
            return string.Format(
@"select entity.ID EntityID, {0} AttributeID, legacyMeasurer.Name Value
from Imports.Trees legacyTree
join Imports.Subsites legacySubsite
	on legacySubsite.Id = legacyTree.SubsiteId
join Imports.Sites legacySite
	on legacySite.Id = legacySubsite.SiteId
join
(
	select TripId,
		FirstName + ' ' + LastName Name,
		(row_number() over (partition by TripId order by Id)) Number
	from Imports.Measurers
) legacyMeasurer
	on legacyMeasurer.TripId = legacySite.TripId
join ExcelImport_Entities entity
	on entity.LegacyID = legacyTree.Id
where entity.EntityTypeID = 3
	and legacyMeasurer.Number = {1}", attribute, measurer);
        }

        public void MigrateSites()
        {
            MigrateEntities(1, "Sites");
            InsertStringValue(BuildLegacyValueSelectionSql("Sites", "Name", 1, 1));
            InsertFloatValue(BuildLegacyValueSelectionSql("Sites", "Latitude", 1, 2));
            InsertFloatValue(BuildLegacyValueSelectionSql("Sites", "Longitude", 1, 3));
            InsertStringValue(BuildLegacyTripValueSelectionSql("MeasurerContactInfo", 4));
            InsertBooleanValue(BuildLegacyTripValueSelectionSql("MakeMeasurerContactInfoPublic", 5));
            InsertStringValue(BuildLegacyValueSelectionSql("Sites", "Comments", 1, 6));
            InsertStringValue(BuildLegacyTripValueSelectionSql("Website", 7));
        }

        public void MigrateSubsites()
        {
            MigrateEntities(2, "Subsites");
            InsertStringValue(
@"select entity.ID EntityID, 1 AttributeID, legacySite.Name Value
from Imports.Subsites legacySubsite
join Imports.Sites legacySite
	on legacySite.Id = legacySubsite.SiteId
join ExcelImport_Entities entity
	on entity.LegacyID = legacySubsite.Id
where entity.EntityTypeID = 2");
            // Subsite Name is sometimes NULL, auto generate one when needed for photo associations
            InsertStringValue(
@"select entity.ID EntityID, 2 AttributeID,
    case
        when legacySubsite.Name is not null and legacySubsite.Name != '' then legacySubsite.Name
        else (select top 1 SubsiteName from Imports.ExcelPhotos where SubsiteID = legacySubsite.ID)
    end Value
from Imports.Subsites legacySubsite
join ExcelImport_Entities entity
	on entity.LegacyID = legacySubsite.Id
where entity.EntityTypeID = 2");
            InsertByteValue(BuildLegacyValueSelectionSql("Subsites", "StateId", 2, 3));
            InsertStringValue(BuildLegacyValueSelectionSql("Subsites", "County", 2, 4));
            InsertFloatValue(BuildLegacyValueSelectionSql("Subsites", "Latitude", 2, 6));
            InsertFloatValue(BuildLegacyValueSelectionSql("Subsites", "Longitude", 2, 7));
            InsertStringValue(BuildLegacyValueSelectionSql("Subsites", "Comments", 2, 8));
            InsertStringValue(BuildLegacyValueSelectionSql("Subsites", "OwnershipType", 2, 9));
            InsertStringValue(BuildLegacyValueSelectionSql("Subsites", "OwnershipContactInfo", 2, 10));
            InsertBooleanValue(BuildLegacyValueSelectionSql("Subsites", "MakeOwnershipContactInfoPublic", 2, 11));
        }

        public void MigrateTrees()
        {
            MigrateEntities(3, "Trees");
            InsertStringValue(
@"select entity.ID EntityID, 1 AttributeID, legacySubsite.Name Value
from Imports.Trees legacyTree
join Imports.Subsites legacySubsite
	on legacySubsite.Id = legacyTree.SubsiteId
join ExcelImport_Entities entity
	on entity.LegacyID = legacyTree.Id
where entity.EntityTypeID = 3");
            // Tree Name was never collected, auto generate one when needed for photo associations
            InsertStringValue(
@"select entity.ID EntityID, 2 AttributeID,
    (select top 1 TreeName from Imports.ExcelPhotos where TreeID = entity.LegacyID) Value
from ExcelImport_Entities entity
where entity.EntityTypeID = 3");
            InsertStringValue(BuildLegacyValueSelectionSql("Trees", "CommonName", 3, 3));
            InsertStringValue(BuildLegacyValueSelectionSql("Trees", "ScientificName", 3, 4));
            InsertFloatValue(BuildLegacyValueSelectionSql("Trees", "Height", 3, 5));
            InsertByteValue(BuildLegacyValueSelectionSql("Trees", "HeightMeasurementMethod", 3, 6));
            InsertFloatValue(BuildLegacyValueSelectionSql("Trees", "Girth", 3, 7));
            InsertFloatValue(BuildLegacyValueSelectionSql("Trees", "CrownSpread", 3, 8));
            InsertDateValue(
@"select entity.ID EntityID, 9 AttributeID, legacyTrip.Date Value
from Imports.Trees legacyTree
join Imports.Subsites legacySubsite
	on legacySubsite.Id = legacyTree.SubsiteId
join Imports.Sites legacySite
	on legacySite.Id = legacySubsite.SiteId
join Imports.Trips legacyTrip
	on legacyTrip.Id = legacySite.TripId
join ExcelImport_Entities entity
	on entity.LegacyID = legacyTree.Id
where entity.EntityTypeID = 3");
            InsertStringValue(BuildLegacyMeasurerValueSelectionSql(1, 10));
            InsertStringValue(BuildLegacyMeasurerValueSelectionSql(2, 11));
            InsertStringValue(BuildLegacyMeasurerValueSelectionSql(3, 12));
            InsertByteValue(BuildLegacyValueSelectionSql("Trees", "FormType", 3, 13));
            // Form Comments was never collected
            InsertByteValue(BuildLegacyValueSelectionSql("Trees", "Status", 3, 15));
            InsertStringValue(BuildLegacyValueSelectionSql("Trees", "HealthStatus", 3, 16));
            InsertByteValue(BuildLegacyValueSelectionSql("Trees", "AgeClass", 3, 17));
            // Age was never collected
            InsertByteValue(BuildLegacyValueSelectionSql("Trees", "AgeType", 3, 19));
            InsertByteValue(BuildLegacyValueSelectionSql("Trees", "TerrainType", 3, 20));
            InsertFloatValue(BuildLegacyValueSelectionSql("Trees", "Latitude", 3, 21));
            InsertFloatValue(BuildLegacyValueSelectionSql("Trees", "Longitude", 3, 22));
            InsertBooleanValue(BuildLegacyValueSelectionSql("Trees", "MakeCoordinatesPublic", 3, 23));
            InsertIntegerValue(BuildLegacyValueSelectionSql("Trees", "Elevation", 3, 24));
            InsertStringValue(BuildLegacyValueSelectionSql("Trees", "GeneralComments", 3, 25));
            InsertStringValue(BuildLegacyValueSelectionSql("Trees", "LaserBrand", 3, 26));
            InsertStringValue(BuildLegacyValueSelectionSql("Trees", "ClinometerBrand", 3, 27));
            // Height Measurement Type was never collected
            // Height Distance Top was never collected
            // Height Angle Top was never collected
            // Height Distance Bottom was never collected
            // Height Angle Bottom was never collected
            // Height Vertical Offset was never collected
            InsertStringValue(BuildLegacyValueSelectionSql("Trees", "HeightComments", 3, 34));
            InsertFloatValue(BuildLegacyValueSelectionSql("Trees", "GirthMeasurementHeight", 3, 35));
            // Girth Root Collar Height was never collected
            InsertStringValue(BuildLegacyValueSelectionSql("Trees", "GirthComments", 3, 37));
            // Crown Average Spread was never collected
            // Crown Spread Measurement Method was never collected
            // Crown Base Height was never collected
            // Crown Area was never collected
            // Crown Area Measurement Method was never collected
            // Crown Volume was never collected
            // Crown Volume Calculation Method was never collected
            // Crown Comments was never collected
            // Trunk Volume was never collected
            // Trunk Volume Calculation Method was never collected
            // Trunk Count was never collected
            InsertStringValue(BuildLegacyValueSelectionSql("Trees", "TrunkComments", 3, 49));
            // Terrain Shape Index was never collected
            // Landform Index was never collected
            // Terrain Comments was never collected
        }

        public void MigratePhotos()
        {
            MigrateEntities(5, "ExcelPhotos");
            // Site Name was never collected
            InsertStringValue(BuildLegacyValueSelectionSql("ExcelPhotos", "SubsiteName", 5, 2));
            InsertStringValue(BuildLegacyValueSelectionSql("ExcelPhotos", "TreeName", 5, 3));
            InsertStringValue(BuildLegacyValueSelectionSql("ExcelPhotos", "Filename", 5, 4));
            InsertStringValue(BuildLegacyValueSelectionSql("ExcelPhotos", "Photographer", 5, 5));
            // Caption was never collected
        }

        public override void Up()
        {
            Create.Column("LegacyID").OnTable("ExcelImport_Entities").AsInt32().Nullable();

            Create.Table("ExcelPhotos").InSchema("Imports")
                .WithColumn("ID").AsInt32().PrimaryKey()
                .WithColumn("CreatorUserID").AsInt32()
                .WithColumn("Created").AsDateTime()
                .WithColumn("SubsiteID").AsInt32().Nullable()
                .WithColumn("SubsiteName").AsString(100).Nullable()
                .WithColumn("TreeID").AsInt32().Nullable()
                .WithColumn("TreeName").AsString(100).Nullable()
                .WithColumn("Photographer").AsString(100)
                .WithColumn("Filename").AsString(500);

            Execute.Sql(
@"insert into Imports.ExcelPhotos (ID, CreatorUserID, Created, SubsiteID, SubsiteName, TreeID, TreeName, Photographer, Filename)
select ID, CreatorUserID, Created, SubsiteID, SubsiteName, TreeID, TreeName, Photographer,
	case (row_number() over (partition by CreatorUserID, coalesce(SubsiteName, TreeName) order by ID))
		when 1 then coalesce(SubsiteName, TreeName)
		else coalesce(SubsiteName, TreeName) + ' (' + convert(varchar, (row_number() over (partition by CreatorUserID, coalesce(SubsiteName, TreeName) order by ID)) - 1) + ')'
	end + '.' + Extension Filename
from
(
	select
		[file].ID,
		[file].Created,
		coalesce(legacySubsite.CreatorUserId, legacyTree.CreatorUserId) CreatorUserID,
		legacySubsite.ID SubsiteID, 
		case reference.Type
			when 2 then
				case legacySubsite.Name
					when '' then 'Subsite ' + convert(varchar, legacySubsite.ID)
					else legacySubsite.Name
				end
		end SubsiteName,
		legacyTree.ID TreeID,
		case reference.Type
			when 3 then
				case legacyTree.CommonName
					when '' then 'Tree'
					else legacyTree.CommonName
				end + ' ' + convert(varchar, legacyTree.ID)
		end TreeName,
		(
			select top 1 measurer.FirstName + ' ' + measurer.LastName
			from Imports.Measurers measurer
			join Imports.Trips trip
				on trip.Id = measurer.TripId
			join Imports.Sites site
				on site.TripId = trip.Id
			join Imports.Subsites subsite
				on subsite.SiteId = site.Id
			left join Imports.Trees tree
				on tree.SubsiteId = subsite.Id
			where subsite.Id = legacySubsite.Id
				or tree.Id = legacyTree.Id
		) Photographer,
		case [file].Format when 1 then 'jpg' when 2 then 'gif' when 3 then 'png' end Extension
	from dbo.PhotoFiles [file]
	join dbo.PhotoReferences reference
		on [file].Id = reference.PhotoFileId
	left join Imports.Subsites legacySubsite
		on legacySubsite.Id = reference.ImportSubsiteId
	left join Imports.Trees legacyTree
		on legacyTree.Id = reference.ImportTreeId
	where reference.Type in (2, 3)
		and coalesce(legacySubsite.CreatorUserId, legacyTree.CreatorUserId) is not null
) photo");

            MigrateSites();
            MigrateSubsites();
            MigrateTrees();
            // Trunks were never collected
            MigratePhotos();
        }

        public override void Down()
        {
            Delete.FromTable("ExcelImport_Values").AllRows();
            Delete.FromTable("ExcelImport_Entities").AllRows();

            Delete.Table("ExcelPhotos").InSchema("Imports");

            Delete.Column("LegacyID").FromTable("ExcelImport_Entities");
        }
    }
}
