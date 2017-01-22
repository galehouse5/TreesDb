using System;

namespace TMD.Model
{
    public interface IGeoAreaMetrics
    {
        float? ComputedRHI5 { get; }
        float? ComputedRHI10 { get; }
        float? ComputedRHI20 { get; }
        float? ComputedRGI5 { get; }
        float? ComputedRGI10 { get; }
        float? ComputedRGI20 { get; }
        int? ComputedTreesMeasuredCount { get; }
        DateTime? ComputedLastMeasurementDate { get; }
        bool? ComputedContainsEntityWithCoordinates { get; }
    }
}
