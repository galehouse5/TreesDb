using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    public enum EAgeClass
    {
        NotSpecified = 0,
        Young = 1,
        Mature = 2,
        LateMature = 3,
        Old = 4,
        VeryOld = 5
    }

    public enum EAgeType
    {
        NotSpecified = 0,
        Estimate = 1,
        RingCount = 2,
        XD = 3
    }

    public enum EFormType
    {
        NotSpecified = 0,
        Single = 1,
        Multi = 2,
        Fusion = 3,
        Coppice = 4,
        Colony = 5,
        Vine = 6
    }

    public enum EPositionMeasurementType
    {
        NotSpecified = 0,
        Map = 1,
        GPS = 2
    }

    public enum EStatus
    {
        Native = 1,
        NativePlanted = 2,
        ExoticPlanted = 3,
        ExoticNaturalizing = 4
    }

    public enum ETerrainType
    {
        NotSpecified = 0,
        HillTop = 1,
        SideSlope = 2,
        Valley = 3,
        FloodPlain = 4,
        Swampy = 5
    }

    public enum EGpsDatum
    {
        WGS84NAD83 = 1,
        WGS60 = 2,
        WGS66 = 3,
        WGS72 = 4
    }
}
