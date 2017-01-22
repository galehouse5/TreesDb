using FluentMigrator;

namespace Tmd.Migrations.Profiles
{
    [Maintenance(MigrationStage.AfterAll)]
    public class AA02_UpdateStaleMetrics : ForwardOnlyMigration
    {
        public override void Up()
        {
            Execute.Sql("exec dbo.UpdateStaleMetrics");
        }
    }
}
