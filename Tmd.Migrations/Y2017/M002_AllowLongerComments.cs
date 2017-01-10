using FluentMigrator;

namespace Tmd.Migrations.Y2017
{
    [Migration(2)]
    public class M002_AllowLongerComments : Migration
    {
        public override void Up()
        {
            Delete.Column("LastActivity").FromTable("Users").InSchema("Users");

            Alter.Column("Comments").OnTable("Sites").InSchema("Imports").AsString(1000);

            Alter.Column("Comments").OnTable("Subsites").InSchema("Imports").AsString(1000);

            Alter.Column("CrownComments").OnTable("Trees").InSchema("Imports").AsString(1000);
            Alter.Column("GeneralComments").OnTable("Trees").InSchema("Imports").AsString(1000);
            Alter.Column("GirthComments").OnTable("Trees").InSchema("Imports").AsString(1000);
            Alter.Column("HeightComments").OnTable("Trees").InSchema("Imports").AsString(1000);
            Alter.Column("TerrainComments").OnTable("Trees").InSchema("Imports").AsString(1000);
            Alter.Column("TreeFormComments").OnTable("Trees").InSchema("Imports").AsString(1000);
            Alter.Column("TrunkComments").OnTable("Trees").InSchema("Imports").AsString(1000);

            Execute.Sql("ALTER TABLE [Imports].[Trunks] DROP CONSTRAINT [DF_TrunkMeasurements_TrunkComments]");
            Alter.Column("TrunkComments").OnTable("Trunks").InSchema("Imports").AsString(1000);
            Execute.Sql("ALTER TABLE [Imports].[Trunks] ADD  CONSTRAINT [DF_TrunkMeasurements_TrunkComments]  DEFAULT (N'') FOR [TrunkComments]");

            Alter.Column("Comments").OnTable("SiteVisits").InSchema("Sites").AsString(1000);

            Alter.Column("Comments").OnTable("SubsiteVisits").InSchema("Sites").AsString(1000);

            Alter.Column("GeneralComments").OnTable("Measurements").InSchema("Trees").AsString(1000);
        }

        public override void Down()
        {
            Create.Column("LastActivity").OnTable("Users").InSchema("Users").AsDateTime().NotNullable()
                .WithDefault(SystemMethods.CurrentDateTime);

            Alter.Column("Comments").OnTable("Sites").InSchema("Imports").AsAnsiString(300);

            Alter.Column("Comments").OnTable("Subsites").InSchema("Imports").AsAnsiString(300);

            Alter.Column("CrownComments").OnTable("Trees").InSchema("Imports").AsAnsiString(300);
            Alter.Column("GeneralComments").OnTable("Trees").InSchema("Imports").AsAnsiString(300);
            Alter.Column("GirthComments").OnTable("Trees").InSchema("Imports").AsAnsiString(300);
            Alter.Column("HeightComments").OnTable("Trees").InSchema("Imports").AsAnsiString(300);
            Alter.Column("TerrainComments").OnTable("Trees").InSchema("Imports").AsAnsiString(300);
            Alter.Column("TreeFormComments").OnTable("Trees").InSchema("Imports").AsAnsiString(300);
            Alter.Column("TrunkComments").OnTable("Trees").InSchema("Imports").AsAnsiString(300);

            Execute.Sql("ALTER TABLE [Imports].[Trunks] DROP CONSTRAINT [DF_TrunkMeasurements_TrunkComments]");
            Alter.Column("TrunkComments").OnTable("Trunks").InSchema("Imports").AsAnsiString(300);
            Execute.Sql("ALTER TABLE [Imports].[Trunks] ADD  CONSTRAINT [DF_TrunkMeasurements_TrunkComments]  DEFAULT (N'') FOR [TrunkComments]");

            Alter.Column("Comments").OnTable("SiteVisits").InSchema("Sites").AsAnsiString(300);

            Alter.Column("Comments").OnTable("SubsiteVisits").InSchema("Sites").AsAnsiString(300);

            Alter.Column("GeneralComments").OnTable("Measurements").InSchema("Trees").AsAnsiString(300);
        }
    }
}
