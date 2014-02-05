using FluentMigrator;

namespace Tmd.Migrations.Y2014
{
    [Migration(2)]
    public class M2_MigrateLegacyImportData : Migration
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

        public string BuildLegacyValueSelectionSql(int entityType, string attribute, string legacyTable, string legacyColumn)
        {
            return string.Format(
@"select entity.ID EntityID,
	(
		select ID
		from ExcelImport_Attributes
		where EntityTypeID = {0}
			and Name = '{1}'
	) AttributeID,
	{3} Value
from Imports.{2} legacyEntity
join ExcelImport_Entities entity
	on entity.LegacyID = legacyEntity.Id
where entity.EntityTypeID = {0}", entityType, attribute, legacyTable, legacyColumn);
        }

        public string BuildLegacyTripValueSelectionSql(string attribute, string legacyColumn)
        {
            return string.Format(
@"select entity.ID EntityID,
	(
		select ID
		from ExcelImport_Attributes
		where EntityTypeID = 1
			and Name = '{0}'
	) AttributeID,
	legacyTrip.{1} Value
from Imports.Trips legacyTrip
join Imports.Sites legacySite
	on legacySite.TripId = legacyTrip.Id
join ExcelImport_Entities entity
	on entity.LegacyID = legacySite.Id
where entity.EntityTypeID = 1", attribute, legacyColumn);
        }

        public string BuildLegacyMeasurerValueSelectionSql(string attribute, int measurer)
        {
            return string.Format(
@"select entity.ID EntityID,
	(
		select ID
		from ExcelImport_Attributes
		where EntityTypeID = 3
			and Name = '{0}'
	) AttributeID,
	legacyMeasurer.Name Value
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
            InsertStringValue(BuildLegacyValueSelectionSql(1, "Site Name", "Sites", "Name"));
            InsertFloatValue(BuildLegacyValueSelectionSql(1, "Latitude", "Sites", "Latitude"));
            InsertFloatValue(BuildLegacyValueSelectionSql(1, "Longitude", "Sites", "Longitude"));
            InsertStringValue(BuildLegacyTripValueSelectionSql("Measurer Contact", "MeasurerContactInfo"));
            InsertBooleanValue(BuildLegacyTripValueSelectionSql("Publicize Contact", "MakeMeasurerContactInfoPublic"));
            InsertStringValue(BuildLegacyValueSelectionSql(1, "Comments", "Sites", "Comments"));
            InsertStringValue(BuildLegacyTripValueSelectionSql("Report Url", "Website"));
        }

        public void MigrateSubsites()
        {
            MigrateEntities(2, "Subsites");
            InsertStringValue(
@"select entity.ID EntityID,
	(
		select ID
		from ExcelImport_Attributes
		where EntityTypeID = 2
			and Name = 'Site Name'
	) AttributeID,
	legacySite.Name Value
from Imports.Subsites legacySubsite
join Imports.Sites legacySite
	on legacySite.Id = legacySubsite.SiteId
join ExcelImport_Entities entity
	on entity.LegacyID = legacySubsite.Id
where entity.EntityTypeID = 2");
            InsertStringValue(BuildLegacyValueSelectionSql(2, "Subsite Name", "Subsites", "Name"));
            InsertByteValue(BuildLegacyValueSelectionSql(2, "State", "Subsites", "StateId"));
            InsertStringValue(BuildLegacyValueSelectionSql(2, "County", "Subsites", "County"));
            InsertFloatValue(BuildLegacyValueSelectionSql(2, "Latitude", "Subsites", "Latitude"));
            InsertFloatValue(BuildLegacyValueSelectionSql(2, "Longitude", "Subsites", "Longitude"));
            InsertStringValue(BuildLegacyValueSelectionSql(2, "Comments", "Subsites", "Comments"));
            InsertStringValue(BuildLegacyValueSelectionSql(2, "Ownership Type", "Subsites", "OwnershipType"));
            InsertStringValue(BuildLegacyValueSelectionSql(2, "Ownership Contact", "Subsites", "OwnershipContactInfo"));
            InsertBooleanValue(BuildLegacyValueSelectionSql(2, "Publicize Contact", "Subsites", "MakeOwnershipContactInfoPublic"));
        }

        public void MigrateTrees()
        {
            MigrateEntities(3, "Trees");
            InsertStringValue(
@"select entity.ID EntityID,
	(
		select ID
		from ExcelImport_Attributes
		where EntityTypeID = 3
			and Name = 'Subsite Name'
	) AttributeID,
	legacySubsite.Name Value
from Imports.Trees legacyTree
join Imports.Subsites legacySubsite
	on legacySubsite.Id = legacyTree.SubsiteId
join ExcelImport_Entities entity
	on entity.LegacyID = legacyTree.Id
where entity.EntityTypeID = 3");
            // Tree Name was never collected
            InsertStringValue(BuildLegacyValueSelectionSql(3, "Common Name", "Trees", "CommonName"));
            InsertStringValue(BuildLegacyValueSelectionSql(3, "Botanical Name", "Trees", "ScientificName"));
            InsertFloatValue(BuildLegacyValueSelectionSql(3, "Height", "Trees", "Height"));
            InsertByteValue(BuildLegacyValueSelectionSql(3, "Height Measurement Method", "Trees", "HeightMeasurementMethod"));
            InsertFloatValue(BuildLegacyValueSelectionSql(3, "Girth", "Trees", "Girth"));
            InsertFloatValue(BuildLegacyValueSelectionSql(3, "Crown Max Spread", "Trees", "CrownSpread"));
            InsertDateValue(
@"select entity.ID EntityID,
	(
		select ID
		from ExcelImport_Attributes
		where EntityTypeID = 3
			and Name = 'Date'
	) AttributeID,
	legacyTrip.Date Value
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
            InsertStringValue(BuildLegacyMeasurerValueSelectionSql("First Measurer", 1));
            InsertStringValue(BuildLegacyMeasurerValueSelectionSql("Second Measurer", 2));
            InsertStringValue(BuildLegacyMeasurerValueSelectionSql("Third Measurer", 3));
            InsertByteValue(BuildLegacyValueSelectionSql(3, "Form Type", "Trees", "FormType"));
            // Form Comments was never collected
            InsertByteValue(BuildLegacyValueSelectionSql(3, "Status", "Trees", "Status"));
            InsertStringValue(BuildLegacyValueSelectionSql(3, "Health Status", "Trees", "HealthStatus"));
            InsertByteValue(BuildLegacyValueSelectionSql(3, "Age Class", "Trees", "AgeClass"));
            // Age was never collected
            InsertByteValue(BuildLegacyValueSelectionSql(3, "Age Method", "Trees", "AgeType"));
            InsertByteValue(BuildLegacyValueSelectionSql(3, "Terrain Type", "Trees", "TerrainType"));
            InsertFloatValue(BuildLegacyValueSelectionSql(3, "Latitude", "Trees", "Latitude"));
            InsertFloatValue(BuildLegacyValueSelectionSql(3, "Longitude", "Trees", "Longitude"));
            InsertBooleanValue(BuildLegacyValueSelectionSql(3, "Publicize Coordinates", "Trees", "MakeCoordinatesPublic"));
            InsertIntegerValue(BuildLegacyValueSelectionSql(3, "Elevation", "Trees", "Elevation"));
            InsertStringValue(BuildLegacyValueSelectionSql(3, "General Comments", "Trees", "GeneralComments"));
            InsertStringValue(BuildLegacyValueSelectionSql(3, "Height Laser Brand", "Trees", "LaserBrand"));
            InsertStringValue(BuildLegacyValueSelectionSql(3, "Height Clinometer Brand", "Trees", "ClinometerBrand"));
            // Height Measurement Type was never collected
            // Height Distance Top was never collected
            // Height Angle Top was never collected
            // Height Distance Bottom was never collected
            // Height Angle Bottom was never collected
            // Height Vertical Offset was never collected
            InsertStringValue(BuildLegacyValueSelectionSql(3, "Height Comments", "Trees", "HeightComments"));
            InsertFloatValue(BuildLegacyValueSelectionSql(3, "Girth Measurement Height", "Trees", "GirthMeasurementHeight"));
            // Girth Root Collar Height was never collected
            InsertStringValue(BuildLegacyValueSelectionSql(3, "Girth Comments", "Trees", "GirthComments"));
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
            InsertStringValue(BuildLegacyValueSelectionSql(3, "Trunk Comments", "Trees", "TrunkComments"));
            // Terrain Shape Index was never collected
            // Landform Index was never collected
            // Terrain Comments was never collected
        }

        public override void Up()
        {
            Create.Column("LegacyID").OnTable("ExcelImport_Entities").AsInt32().Nullable();

            MigrateSites();
            MigrateSubsites();
            MigrateTrees();
            // Trunks were never collected
        }

        public override void Down()
        {
            Delete.FromTable("ExcelImport_Values").AllRows();
            Delete.FromTable("ExcelImport_Entities").AllRows();

            Delete.Column("LegacyID").FromTable("ExcelImport_Entities");
        }
    }
}
