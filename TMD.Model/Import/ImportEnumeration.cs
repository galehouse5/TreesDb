using System.ComponentModel;

namespace TMD.Model.Import
{
    [Description("State")]
    public enum ImportState
    {
        // United States
        AK, AL, AR, AS, AZ, CA, CO, CT, DC, DE,
        FL, GA, GU, HI, IA, ID, IL, IN, KS, KY,
        LA, MA, MD, ME, MI, MN, MO, MP, MS, MT,
        NC, ND, NE, NH, NJ, NM, NV, NY, OH, OK,
        OR, PA, PR, RI, SC, SD, TN, TX, UM, UT,
        VA, VI, VT, WA, WI, WV, WY,
        // Canada
        AB, BC, MB, NB, NL, NS, NT, NU, ON, PE,
        QC, SK, YT,
        // Mexico
        AGU, BCN, BCS, CAM, CHH, CHP, COA, COL, DIF, DUR,
        GRO, GUA, HID, JAL, MEX, MIC, MOR, NAY, NLE, OAX,
        PUE, QUE, ROO, SIN, SLP, SON, TAB, TAM, TLA, VER,
        YUC, ZAC
    }

    [Description("Site Ownership Type")]
    public enum ImportSiteOwnershipType
    {
        Private, Federal, State, County, City, Unknown
    }

    [Description("Height Measurement Method")]
    public enum ImportHeightMeasurementMethod
    {
        [Description("Clinometer/laser rangefinder/sine")]
        ClinometerLaserRangefinderSine,
        [Description("Tree climb with tape drop")]
        TreeClimbWithTapeDrop,
        [Description("Long measuring pole")]
        LongMeasuringPole,
        [Description("Formal transit/total station survey")]
        FormalTransitTotalStationSurvey,
        [Description("Laser rangefinder-clinometer: sine top–tangent base")]
        LaserRangefinderClinometerSineTopTangentBase,
        [Description("Hypsometer with sine method")]
        HypsometerWithSineMethod,
        [Description("Hypsometer with tangent method")]
        HypsometerWithTangentMethod,
        [Description("External baseline method")]
        ExternalBaselineMethod
    }

    [Description("Laser Brand")]
    public enum ImportLaserBrand
    {
        Nikon,
        TruPulse,
        Bushnell,
        [Description("Opti-logic")]
        OptiLogic
    }

    [Description("Clinometer Brand")]
    public enum ImportClinometerBrand
    {
        Suunto, Brunton, iPhone, TruPulse
    }

    [Description("Height Measurement Type")]
    public enum ImportHeightMeasurementType
    {
        [Description("Single measurement")]
        SingleMeasurement,
        [Description("Average of a set")]
        AverageOfASet,
        [Description("Selection from a set")]
        SelectionFromASet
    }

    [Description("Crown Spread Measurement Method")]
    public enum ImportCrownSpreadMeasurementMethod
    {
        [Description("Average of max and min")]
        AverageOfMaxAndMin,
        Spoke
    }

    [Description("Crown Volume Calculation Method")]
    public enum ImportCrownVolumeCalculationMethod
    {
        Mapping,
        [Description("CFF estimate")]
        CffEstimate
    }

    [Description("Trunk Volume Calculation Method")]
    public enum ImportTrunkVolumeCalculationMethod
    {
        Reticle,
        [Description("Tree climb with tape")]
        TreeClimbWithTape
    }

    [Description("Tree Form Type")]
    public enum ImportTreeFormType
    {
        Single, Multi, Fusion, Coppice, Colony, Vine
    }

    [Description("Tree Status")]
    public enum ImportTreeStatus
    {
        Native,
        [Description("Native planted")]
        NativePlanted,
        [Description("Exotic planted")]
        ExoticPlanted,
        [Description("Exotic naturalizing")]
        ExoticNaturalizing,
        [Description("Introduced planted")]
        IntroducedPlanted,
        [Description("Introduced naturalized")]
        IntroducedNaturalizing
    }

    [Description("Tree Age Class")]
    public enum ImportTreeAgeClass
    {
        Young,
        Mature,
        [Description("Late mature")]
        LateMature,
        Old,
        [Description("Very old")]
        VeryOld
    }

    [Description("Tree Age Method")]
    public enum ImportTreeAgeMethod
    {
        Estimate,
        [Description("Ring count")]
        RingCount,
        XD
    }

    [Description("Terrain Type")]
    public enum ImportTerrainType
    {
        [Description("Hill top")]
        HillTop,
        [Description("Side slope")]
        SideSlope,
        Valley,
        [Description("Flood plain")]
        FloodPlain,
        Swampy,
        [Description("Base of slope")]
        BaseOfSlope,
        [Description("Toe slope")]
        ToeSlope
    }
}
