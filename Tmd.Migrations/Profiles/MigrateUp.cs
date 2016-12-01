using FluentMigrator;

namespace Tmd.Migrations.Profiles
{
    [Profile("MigrateUp")]
    public class MigrateUp : ForwardOnlyMigration
    {
        public override void Up()
        {
            Execute.EmbeddedScript("DropObjectsAndTypes.sql");
            Execute.EmbeddedScript("CreateObjectsAndTypes.sql");
        }
    }
}
