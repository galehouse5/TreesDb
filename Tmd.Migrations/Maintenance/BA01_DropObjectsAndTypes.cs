using FluentMigrator;

namespace Tmd.Migrations.Profiles
{
    [Maintenance(MigrationStage.BeforeAll)]
    public class BA01_DropObjectsAndTypes : ForwardOnlyMigration
    {
        public override void Up()
        {
            Execute.EmbeddedScript("DropObjectsAndTypes.sql");
        }
    }
}
