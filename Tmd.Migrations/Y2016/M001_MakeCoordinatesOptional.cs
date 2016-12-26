using FluentMigrator;

namespace Tmd.Migrations.Y2016
{
    [Migration(1)]
    public class M001_MakeCoordinatesOptional : Migration
    {
        protected void Up(string schemaName, string tableName)
        {
            Create.Column("CalculatedLatitudeInputFormat").OnTable(tableName).InSchema(schemaName).AsByte().WithDefaultValue(2 /* Default */);
            Create.Column("CalculatedLongitudeInputFormat").OnTable(tableName).InSchema(schemaName).AsByte().WithDefaultValue(2 /* Default */);

            Execute.Sql($@"
update [{schemaName}].[{tableName}]
set CalculatedLatitudeInputFormat = 1 /* Unspecified */
where CalculatedLatitude = 0");

            Execute.Sql($@"
update [{schemaName}].[{tableName}]
set CalculatedLongitudeInputFormat = 1 /* Unspecified */
where CalculatedLongitude = 0");
        }

        public override void Up()
        {
            Up("Sites", "Sites");
            Up("Sites", "SiteVisits");
            Up("Sites", "Subsites");
            Up("Sites", "SubsiteVisits");
            Up("Trees", "Measurements");
            Up("Trees", "Trees");

            Delete.Column("TreesWithSpecifiedCoordinatesCount").FromTable("Sites").InSchema("Sites");
            Delete.Column("TreesWithSpecifiedCoordinatesCount").FromTable("Subsites").InSchema("Sites");
        }

        protected void Down(string schemaName, string tableName)
        {
            Delete.Column("CalculatedLatitudeInputFormat").FromTable(tableName).InSchema(schemaName);
            Delete.Column("CalculatedLongitudeInputFormat").FromTable(tableName).InSchema(schemaName);
        }

        public override void Down()
        {
            Create.Column("TreesWithSpecifiedCoordinatesCount").OnTable("Sites").InSchema("Sites").AsInt32().WithDefaultValue(0);
            Create.Column("TreesWithSpecifiedCoordinatesCount").OnTable("Subsites").InSchema("Sites").AsInt32().WithDefaultValue(0);

            Execute.Sql(@"
update ss
set TreesWithSpecifiedCoordinatesCount =
    (
        select count(*)
        from Trees.Trees
        where SubsiteId = ss.Id
            and LatitudeInputFormat != 1 /* Unspecified */
            and LongitudeInputFormat != 1 /* Unspecified */
    )
from Sites.Subsites ss");

            Execute.Sql(@"
update s
set TreesWithSpecifiedCoordinatesCount =
    (
        select count(*)
        from Trees.Trees t
        join Sites.Subsites ss
            on ss.Id = t.SubsiteId
        where ss.SiteId = s.Id
            and t.LatitudeInputFormat != 1 /* Unspecified */
            and t.LongitudeInputFormat != 1 /* Unspecified */
    )
from Sites.Sites s");

            Down("Sites", "Sites");
            Down("Sites", "SiteVisits");
            Down("Sites", "Subsites");
            Down("Sites", "SubsiteVisits");
            Down("Trees", "Measurements");
            Down("Trees", "Trees");
        }
    }
}
