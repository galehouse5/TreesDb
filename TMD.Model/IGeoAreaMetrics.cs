using System;

namespace TMD.Model
{
    public interface IGeoAreaMetrics
    {
        RuckerIndex? ComputedRHI5 { get; }
        RuckerIndex? ComputedRHI10 { get; }
        RuckerIndex? ComputedRHI20 { get; }
        RuckerIndex? ComputedRGI5 { get; }
        RuckerIndex? ComputedRGI10 { get; }
        RuckerIndex? ComputedRGI20 { get; }
        int? ComputedTreesMeasuredCount { get; }
        DateTime? ComputedLastMeasurementDate { get; }
        bool? ComputedContainsEntityWithCoordinates { get; }
    }
}
