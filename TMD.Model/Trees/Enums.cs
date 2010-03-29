using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    public enum EAgeClass
    {
        Young,
        Mature,
        LateMature,
        Old,
        VeryOld
    }

    public enum EAgeType
    {
        Estimate,
        RingCount
    }

    public enum EFormType
    {
        NotSpecified = 0,
        Single,
        Multi,
        Fusion,
        Coppice,
        Colony,
        Vine
    }

    public enum EPositionMeasurementType
    {
        Map,
        GPS
    }

    public enum EStatus
    {
        Native,
        NativePlanted,
        ExoticPlanted,
        ExoticNaturalizing
    }

    public enum ETerrainType
    {
        HillTop,
        SideSlope,
        Valley,
        FloodPlain,
        Swampy
    }

    public enum EGpsDatum
    {
        WGS84NAD83,
        WGS60,
        WGS66,
        WGS72
    }
}
