using FluentMigrator;

namespace Tmd.Migrations.Y2014
{
    [Migration(3)]
    public class M3_ArchiveLegacyImportData : Migration
    {
        public override void Up()
        {
            Execute.EmbeddedScript("M3_ArchiveLegacyImportData_Up.sql");
        }

        public override void Down()
        {
            Execute.EmbeddedScript("M3_ArchiveLegacyImportData_Down.sql");
        }
    }
}
