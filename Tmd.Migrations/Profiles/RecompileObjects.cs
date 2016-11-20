using FluentMigrator;

namespace Tmd.Migrations.Profiles
{
    [Profile("RecompileObjects")]
    public class RecompileObjects : ForwardOnlyMigration
    {
        public override void Up()
        {
            Execute.EmbeddedScript("RecompileObjects.sql");
        }
    }
}
