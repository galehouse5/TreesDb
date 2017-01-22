using FluentMigrator;

namespace Tmd.Migrations.Y2017
{
    [Migration(3)]
    public class M003_PrecomputeSiteAndStateMetrics : Migration
    {
        public override void Up()
        {
            Rename.Column("RHI5").OnTable("Sites").InSchema("Sites").To("ComputedRHI5");
            Rename.Column("RHI10").OnTable("Sites").InSchema("Sites").To("ComputedRHI10");
            Rename.Column("RHI20").OnTable("Sites").InSchema("Sites").To("ComputedRHI20");
            Rename.Column("RGI5").OnTable("Sites").InSchema("Sites").To("ComputedRGI5");
            Rename.Column("RGI10").OnTable("Sites").InSchema("Sites").To("ComputedRGI10");
            Rename.Column("RGI20").OnTable("Sites").InSchema("Sites").To("ComputedRGI20");
            Create.Column("ComputedTreesMeasuredCount").OnTable("Sites").InSchema("Sites").AsInt32().Nullable();
            Rename.Column("LastVisited").OnTable("Sites").InSchema("Sites").To("ComputedLastMeasurementDate");
            Alter.Column("ComputedLastMeasurementDate").OnTable("Sites").InSchema("Sites").AsDate().Nullable();
            Create.Column("ComputedContainsEntityWithCoordinates").OnTable("Sites").InSchema("Sites").AsBoolean().Nullable();
            Create.Column("AreMetricsStale").OnTable("Sites").InSchema("Sites").AsBoolean().WithDefaultValue(true);
            Create.Column("LastMetricsUpdateTimestamp").OnTable("Sites").InSchema("Sites").AsDateTime().Nullable();

            Rename.Column("RHI5").OnTable("Subsites").InSchema("Sites").To("ComputedRHI5");
            Rename.Column("RHI10").OnTable("Subsites").InSchema("Sites").To("ComputedRHI10");
            Rename.Column("RHI20").OnTable("Subsites").InSchema("Sites").To("ComputedRHI20");
            Rename.Column("RGI5").OnTable("Subsites").InSchema("Sites").To("ComputedRGI5");
            Rename.Column("RGI10").OnTable("Subsites").InSchema("Sites").To("ComputedRGI10");
            Rename.Column("RGI20").OnTable("Subsites").InSchema("Sites").To("ComputedRGI20");
            Create.Column("ComputedTreesMeasuredCount").OnTable("Subsites").InSchema("Sites").AsInt32().Nullable();
            Rename.Column("LastVisited").OnTable("Subsites").InSchema("Sites").To("ComputedLastMeasurementDate");
            Alter.Column("ComputedLastMeasurementDate").OnTable("Subsites").InSchema("Sites").AsDate().Nullable();
            Create.Column("ComputedContainsEntityWithCoordinates").OnTable("Subsites").InSchema("Sites").AsBoolean().Nullable();
            Create.Column("AreMetricsStale").OnTable("Subsites").InSchema("Sites").AsBoolean().WithDefaultValue(true);
            Create.Column("LastMetricsUpdateTimestamp").OnTable("Subsites").InSchema("Sites").AsDateTime().Nullable();

            Create.Column("ComputedRHI5").OnTable("States").InSchema("Locations").AsFloat().Nullable();
            Create.Column("ComputedRHI10").OnTable("States").InSchema("Locations").AsFloat().Nullable();
            Create.Column("ComputedRHI20").OnTable("States").InSchema("Locations").AsFloat().Nullable();
            Create.Column("ComputedRGI5").OnTable("States").InSchema("Locations").AsFloat().Nullable();
            Create.Column("ComputedRGI10").OnTable("States").InSchema("Locations").AsFloat().Nullable();
            Create.Column("ComputedRGI20").OnTable("States").InSchema("Locations").AsFloat().Nullable();
            Create.Column("ComputedTreesMeasuredCount").OnTable("States").InSchema("Locations").AsInt32().Nullable();
            Create.Column("ComputedLastMeasurementDate").OnTable("States").InSchema("Locations").AsDate().Nullable();
            Create.Column("ComputedContainsEntityWithCoordinates").OnTable("States").InSchema("Locations").AsBoolean().Nullable();
            Create.Column("AreMetricsStale").OnTable("States").InSchema("Locations").AsBoolean().WithDefaultValue(true);
            Create.Column("LastMetricsUpdateTimestamp").OnTable("States").InSchema("Locations").AsDateTime().Nullable();
        }

        public override void Down()
        {
            Delete.Column("ComputedRHI5").FromTable("States").InSchema("Locations");
            Delete.Column("ComputedRHI10").FromTable("States").InSchema("Locations");
            Delete.Column("ComputedRHI20").FromTable("States").InSchema("Locations");
            Delete.Column("ComputedRGI5").FromTable("States").InSchema("Locations");
            Delete.Column("ComputedRGI10").FromTable("States").InSchema("Locations");
            Delete.Column("ComputedRGI20").FromTable("States").InSchema("Locations");
            Delete.Column("ComputedTreesMeasuredCount").FromTable("States").InSchema("Locations");
            Delete.Column("ComputedLastMeasurementDate").FromTable("States").InSchema("Locations");
            Delete.Column("ComputedContainsEntityWithCoordinates").FromTable("States").InSchema("Locations");
            Delete.Column("AreMetricsStale").FromTable("States").InSchema("Locations");
            Delete.Column("LastMetricsUpdateTimestamp").FromTable("States").InSchema("Locations");

            Rename.Column("ComputedRHI5").OnTable("Subsites").InSchema("Sites").To("RHI5");
            Rename.Column("ComputedRHI10").OnTable("Subsites").InSchema("Sites").To("RHI10");
            Rename.Column("ComputedRHI20").OnTable("Subsites").InSchema("Sites").To("RHI20");
            Rename.Column("ComputedRGI5").OnTable("Subsites").InSchema("Sites").To("RGI5");
            Rename.Column("ComputedRGI10").OnTable("Subsites").InSchema("Sites").To("RGI10");
            Rename.Column("ComputedRGI20").OnTable("Subsites").InSchema("Sites").To("RGI20");
            Delete.Column("ComputedTreesMeasuredCount").FromTable("Subsites").InSchema("Sites");
            Rename.Column("ComputedLastMeasurementDate").OnTable("Subsites").InSchema("Sites").To("LastVisited");
            Delete.Column("ComputedContainsEntityWithCoordinates").FromTable("Subsites").InSchema("Sites");
            Delete.Column("AreMetricsStale").FromTable("Subsites").InSchema("Sites");
            Delete.Column("LastMetricsUpdateTimestamp").FromTable("Subsites").InSchema("Sites");

            Rename.Column("ComputedRHI5").OnTable("Sites").InSchema("Sites").To("RHI5");
            Rename.Column("ComputedRHI10").OnTable("Sites").InSchema("Sites").To("RHI10");
            Rename.Column("ComputedRHI20").OnTable("Sites").InSchema("Sites").To("RHI20");
            Rename.Column("ComputedRGI5").OnTable("Sites").InSchema("Sites").To("RGI5");
            Rename.Column("ComputedRGI10").OnTable("Sites").InSchema("Sites").To("RGI10");
            Rename.Column("ComputedRGI20").OnTable("Sites").InSchema("Sites").To("RGI20");
            Delete.Column("ComputedTreesMeasuredCount").FromTable("Sites").InSchema("Sites");
            Rename.Column("ComputedLastMeasurementDate").OnTable("Sites").InSchema("Sites").To("LastVisited");
            Delete.Column("ComputedContainsEntityWithCoordinates").FromTable("Sites").InSchema("Sites");
            Delete.Column("AreMetricsStale").FromTable("Sites").InSchema("Sites");
            Delete.Column("LastMetricsUpdateTimestamp").FromTable("Sites").InSchema("Sites");
        }
    }
}
