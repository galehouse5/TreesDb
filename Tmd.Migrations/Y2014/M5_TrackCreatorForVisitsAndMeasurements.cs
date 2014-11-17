using FluentMigrator;

namespace Tmd.Migrations.Y2014
{
    [Migration(5)]
    public class M5_TrackCreatorForVisitsAndMeasurements : Migration
    {
        public override void Up()
        {
            Create.Column("Created").OnTable("SiteVisits").InSchema("Sites").AsDateTime().Nullable();
            Create.Column("Created").OnTable("SubsiteVisits").InSchema("Sites").AsDateTime().Nullable();
            Create.Column("Created").OnTable("Measurements").InSchema("Trees").AsDateTime().Nullable();

            Create.Column("CreatorUserID").OnTable("SiteVisits").InSchema("Sites").AsInt32().Nullable();
            Create.Column("CreatorUserID").OnTable("SubsiteVisits").InSchema("Sites").AsInt32().Nullable();
            Create.Column("CreatorUserID").OnTable("Measurements").InSchema("Trees").AsInt32().Nullable();

            Execute.Sql(
@"update visit
set CreatorUserId = trip.CreatorUserid,
    Created = trip.Created
from Sites.SiteVisits visit
join dbo.LegacyImport_Trips trip
    on trip.Id = visit.ImportingTripId");
            Execute.Sql(
@"update visit
set CreatorUserId = trip.CreatorUserid,
    Created = trip.Created
from Sites.SubsiteVisits visit
join dbo.LegacyImport_Trips trip
    on trip.Id = visit.ImportingTripId");
            Execute.Sql(
@"update measurement
set CreatorUserId = trip.CreatorUserid,
    Created = trip.Created
from Trees.Measurements measurement
join dbo.LegacyImport_Trips trip
    on trip.Id = measurement.ImportingTripId");

            Alter.Column("Created").OnTable("SiteVisits").InSchema("Sites").AsDateTime().NotNullable();
            Alter.Column("Created").OnTable("SubsiteVisits").InSchema("Sites").AsDateTime().NotNullable();
            Alter.Column("Created").OnTable("Measurements").InSchema("Trees").AsDateTime().NotNullable();

            Alter.Column("CreatorUserID").OnTable("SiteVisits").InSchema("Sites").AsInt32().NotNullable()
                .ForeignKey("FK_Sites.SiteVisits_Users.Users_Id", "Users", "Users", "Id").Indexed();
            Alter.Column("CreatorUserID").OnTable("SubsiteVisits").InSchema("Sites").AsInt32().NotNullable()
                .ForeignKey("FK_Sites.SubsiteVisits_Users.Users_Id", "Users", "Users", "Id").Indexed();
            Alter.Column("CreatorUserID").OnTable("Measurements").InSchema("Trees").AsInt32().NotNullable()
                .ForeignKey("FK_Trees.Measurements_Users.Users_Id", "Users", "Users", "Id").Indexed();
        }

        public override void Down()
        {
            Delete.Column("Created").FromTable("SiteVisits").InSchema("Sites");
            Delete.Column("Created").FromTable("SubsiteVisits").InSchema("Sites");
            Delete.Column("Created").FromTable("Measurements").InSchema("Trees");

            Delete.Index("IX_SiteVisits_CreatorUserID").OnTable("SiteVisits").InSchema("Sites");
            Delete.Index("IX_SubsiteVisits_CreatorUserID").OnTable("SubsiteVisits").InSchema("Sites");
            Delete.Index("IX_Measurements_CreatorUserID").OnTable("Measurements").InSchema("Trees");

            Delete.ForeignKey("FK_Sites.SiteVisits_Users.Users_Id").OnTable("SiteVisits").InSchema("Sites");
            Delete.ForeignKey("FK_Sites.SubsiteVisits_Users.Users_Id").OnTable("SubsiteVisits").InSchema("Sites");
            Delete.ForeignKey("FK_Trees.Measurements_Users.Users_Id").OnTable("Measurements").InSchema("Trees");

            Delete.Column("CreatorUserID").FromTable("SiteVisits").InSchema("Sites");
            Delete.Column("CreatorUserID").FromTable("SubsiteVisits").InSchema("Sites");
            Delete.Column("CreatorUserID").FromTable("Measurements").InSchema("Trees");
        }
    }
}
