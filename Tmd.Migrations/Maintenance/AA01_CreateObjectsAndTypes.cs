using FluentMigrator;

namespace Tmd.Migrations.Profiles
{
    [Maintenance(MigrationStage.AfterAll)]
    public class AA01_CreateObjectsAndTypes : ForwardOnlyMigration
    {
        public override void Up()
        {
            Execute.EmbeddedScript("CreateObjectsAndTypes.sql");
        }
    }
}
