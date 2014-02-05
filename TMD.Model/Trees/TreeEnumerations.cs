using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TMD.Model.Trees
{
    public enum TreeHeightMeasurementMethod
    {
        [Description("")]
        NotSpecified = 0,
        [Description("Clinometer/laser rangefinder/sine")]
        ClinometerLaserRangefinderSine = 1,
        [Description("Tree climb with tape drop")]
        TreeClimbWithTapeDrop = 2,
        [Description("Long measuring pole")]
        LongMeasuringPole = 3,
        [Description("Formal transit/total station survey")]
        FormalTransitTotalStationSurvey = 4
    }
}
