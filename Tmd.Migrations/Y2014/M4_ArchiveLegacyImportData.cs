using FluentMigrator;

namespace Tmd.Migrations.Y2014
{
    [Migration(4)]
    public class M4_ArchiveLegacyImportData : Migration
    {
        public override void Up()
        {
            Execute.EmbeddedScript("M4_ArchiveLegacyImportData_Up.sql");
        }

        public override void Down()
        {
            Execute.EmbeddedScript("M4_ArchiveLegacyImportData_Down.sql");
        }
    }
}
