using FluentMigrator;

namespace Tmd.Migrations.Y2019
{
    [Migration(5)]
    public class M005_RemoveSubsiteTables : ForwardOnlyMigration // Because I'm feeling too lazy to implement the down migration.
    {
        public void PhotosDotReferencesUp()
        {
            Alter.Table("References").InSchema("Photos")
                .AddColumn("ImportSiteId").AsInt32().Nullable().ForeignKey(null, "Imports", "Sites", "Id")
                .AddColumn("SiteId").AsInt32().Nullable().ForeignKey(null, "Sites", "Sites", "Id")
                .AddColumn("SiteVisitId").AsInt32().Nullable().ForeignKey(null, "Sites", "SiteVisits", "Id");

            Execute.Sql(@"
update r
set ImportSiteId = ss.SiteId
from Photos.[References] r
join Imports.Subsites ss
    on ss.Id = r.ImportSubsiteId");

            Execute.Sql(@"
update r
set SiteId = ss.SiteId
from Photos.[References] r
join Sites.Subsites ss
    on ss.Id = r.SubsiteId");

            Execute.Sql(@"
update r
set SiteVisitId = sv.Id
from Photos.[References] r
join Sites.SubsiteVisits ssv
    on ssv.Id = r.SubsiteVisitId
join Sites.Subsites ss
    on ss.Id = ssv.SubsiteId
join Sites.SiteVisits sv
    on sv.SiteId = ss.SiteId
    and sv.ImportingTripId = ssv.ImportingTripId");

            Execute.Sql("ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Subsites]");
            Delete.Column("ImportSubsiteId").FromTable("References").InSchema("Photos");
            Execute.Sql("ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_Subsites1]");
            Delete.Column("SubsiteId").FromTable("References").InSchema("Photos");
            Execute.Sql("ALTER TABLE [Photos].[References] DROP CONSTRAINT [FK_References_SubsiteVisits]");
            Delete.Column("SubsiteVisitId").FromTable("References").InSchema("Photos");
        }

        protected void ImportsDotTreesUp()
        {
            Alter.Table("Trees").InSchema("Imports")
                .AddColumn("SiteId").AsInt32().Nullable().ForeignKey(null, "Imports", "Sites", "Id");

            Execute.Sql(@"
update t
set SiteId = ss.SiteId
from Imports.Trees t
join Imports.Subsites ss
    on ss.Id = t.SubsiteId");

            // The name of this index is misleading, it's actually references "SubsiteId".
            Execute.Sql("ALTER TABLE [Imports].[Trees] DROP CONSTRAINT [FK_TreeMeasurements_SubsiteVisits]");
            Delete.Column("SubsiteId").FromTable("Trees").InSchema("Imports");
        }

        protected void SitesDotVisitorsUp()
        {
            Execute.Sql("delete from Sites.Visitors where SubsiteId is not null");
            Execute.Sql("delete from Sites.Visitors where SubsiteVisitId is not null");

            Execute.Sql("ALTER TABLE [Sites].[Visitors] DROP CONSTRAINT [FK_Visitors_Subsites]");
            Delete.Column("SubsiteId").FromTable("Visitors").InSchema("Sites");
            Execute.Sql("ALTER TABLE [Sites].[Visitors] DROP CONSTRAINT [FK_Visitors_SubsiteVisits]");
            Delete.Column("SubsiteVisitId").FromTable("Visitors").InSchema("Sites");
        }

        protected void ImportsDotSitesUp()
        {
            Alter.Table("Sites").InSchema("Imports")
                .AddColumn("StateId").AsInt32().Nullable().ForeignKey(null, "Locations", "States", "Id")
                .AddColumn("County").AsString(100).Nullable()
                .AddColumn("OwnershipType").AsAnsiString(100).Nullable()
                .AddColumn("OwnershipContactInfo").AsAnsiString(200).Nullable()
                .AddColumn("MakeOwnershipContactInfoPublic").AsBoolean().Nullable();

            Execute.Sql(@"
update s
set StateId = ss.StateId,
    County = ss.County,
    OwnershipType = ss.OwnershipType,
    OwnershipContactInfo = ss.OwnershipContactInfo,
    MakeOwnershipContactInfoPublic = ss.MakeOwnershipContactInfoPublic
from Imports.Sites s
join Imports.Subsites ss
    on ss.SiteId = s.Id");

            Alter.Table("Sites").InSchema("Imports")
                //.AlterColumn("StateId").AsInt32().NotNullable()
                .AlterColumn("County").AsAnsiString(100).NotNullable()
                .AlterColumn("OwnershipType").AsAnsiString(100).NotNullable()
                .AlterColumn("OwnershipContactInfo").AsAnsiString(200).NotNullable()
                .AlterColumn("MakeOwnershipContactInfoPublic").AsBoolean().NotNullable();

            Delete.Table("Subsites").InSchema("Imports");
        }

        public void SitesDotSiteVisitsUp()
        {
            Alter.Table("SiteVisits").InSchema("Sites")
                .AddColumn("StateId").AsInt32().Nullable().ForeignKey(null, "Locations", "States", "Id")
                .AddColumn("County").AsAnsiString(100).Nullable()
                .AddColumn("OwnershipType").AsAnsiString(100).Nullable()
                .AddColumn("OwnershipContactInfo").AsAnsiString(200).Nullable()
                .AddColumn("MakeOwnershipContactInfoPublic").AsBoolean().Nullable();

            Execute.Sql(@"
update sv
set StateId = ssv.StateId,
    County = ssv.County,
    OwnershipType = ssv.OwnershipType,
    OwnershipContactInfo = ssv.OwnershipContactInfo,
    MakeOwnershipContactInfoPublic = ssv.MakeOwnershipContactInfoPublic
from Sites.SiteVisits sv
join Sites.Subsites ss
    on ss.SiteId = sv.SiteId
join Sites.SubsiteVisits ssv
    on ssv.SubsiteId = ss.Id
    and ssv.ImportingTripId = sv.ImportingTripId");

            Alter.Table("SiteVisits").InSchema("Sites")
                .AlterColumn("StateId").AsInt32().NotNullable()
                .AlterColumn("County").AsAnsiString(100).NotNullable()
                .AlterColumn("OwnershipType").AsAnsiString(100).NotNullable()
                .AlterColumn("OwnershipContactInfo").AsAnsiString(200).NotNullable()
                .AlterColumn("MakeOwnershipContactInfoPublic").AsBoolean().NotNullable();

            Delete.Table("SubsiteVisits").InSchema("Sites");
        }

        protected void SitesDotSitesUp()
        {
            Alter.Table("Sites").InSchema("Sites")
                .AddColumn("StateId").AsInt32().Nullable().ForeignKey(null, "Locations", "States", "Id")
                .AddColumn("County").AsAnsiString(100).Nullable()
                .AddColumn("OwnershipType").AsAnsiString(100).Nullable()
                .AddColumn("OwnershipContactInfo").AsAnsiString(200).Nullable()
                .AddColumn("MakeOwnershipContactInfoPublic").AsBoolean().Nullable();

            Delete.Column("SubsiteCount").FromTable("Sites").InSchema("Sites");

            Execute.Sql(@"
update s
set StateId = ss.StateId,
    County = ss.County,
    OwnershipType = ss.OwnershipType,
    OwnershipContactInfo = ss.OwnershipContactInfo,
    MakeOwnershipContactInfoPublic = ss.MakeOwnershipContactInfoPublic
from Sites.Sites s
join Sites.Subsites ss
    on ss.SiteId = s.Id");

            Alter.Table("Sites").InSchema("Sites")
                .AlterColumn("StateId").AsInt32().NotNullable()
                .AlterColumn("County").AsAnsiString(100).NotNullable()
                .AlterColumn("OwnershipType").AsAnsiString(100).NotNullable()
                .AlterColumn("OwnershipContactInfo").AsAnsiString(200).NotNullable()
                .AlterColumn("MakeOwnershipContactInfoPublic").AsBoolean().NotNullable();

            Delete.Table("Subsites").InSchema("Sites");
        }

        protected void TreesDotTreesUp()
        {
            Alter.Table("Trees").InSchema("Trees")
                .AddColumn("SiteId").AsInt32().Nullable().ForeignKey(null, "Sites", "Sites", "Id");

            Execute.Sql(@"
update t
set SiteId = ss.SiteId
from Trees.Trees t
join Sites.Subsites ss
    on ss.Id = t.SubsiteId");

            Alter.Table("Trees").InSchema("Trees")
                .AlterColumn("SiteId").AsInt32().NotNullable();

            // The name of this index is misleading, it's actually references "SubsiteId".
            Execute.Sql("ALTER TABLE [Trees].[Trees] DROP CONSTRAINT [FK_Trees_Subsites]");
            Delete.Column("SubsiteId").FromTable("Trees").InSchema("Trees");
        }

        public override void Up()
        {
            // Prior to running this migration, sites having multiple subsites should be manually divided so
            // that no sites have more than one.
            PhotosDotReferencesUp();
            ImportsDotTreesUp();
            SitesDotVisitorsUp();
            ImportsDotSitesUp();
            SitesDotSiteVisitsUp();
            TreesDotTreesUp();
            SitesDotSitesUp();
        }
    }
}
