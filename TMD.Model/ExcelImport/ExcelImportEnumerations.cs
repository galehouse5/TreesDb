using System.ComponentModel;

namespace TMD.Model.ExcelImport
{
    [Description("State")]
    public enum ExcelImportState
    {
        // United States
        AK = 62, AL = 1, AR = 2, AS = 65, AZ = 3, CA = 4, CO = 5, CT = 6, DC = 64, DE = 7,
        FL = 8, GA = 9, GU = 66, HI = 63, IA = 10, ID = 11, IL = 12, IN = 13, KS = 14, KY = 15,
        LA = 16, MA = 17, MD = 18, ME = 19, MI = 20, MN = 21, MO = 22, MP = 67, MS = 23, MT = 24,
        NC = 25, ND = 26, NE = 27, NH = 28, NJ = 29, NM = 30, NV = 31, NY = 32, OH = 33, OK = 34,
        OR = 35, PA = 36, PR = 68, RI = 37, SC = 38, SD = 39, TN = 40, TX = 41, UM = 69, UT = 42,
        VA = 43, VI = 70, VT = 44, WA = 45, WI = 46, WV = 47, WY = 48,
        // Canada
        AB = 49, BC = 50, MB = 51, NB = 52, NL = 53, NS = 55, NT = 54, NU = 56, ON = 57, PE = 58,
        QC = 59, SK = 60, YT = 61,
        // Mexico
        AGU = 72, BCN = 73, BCS = 74, CAM = 75, CHH = 79, CHP = 78, COA = 76, COL = 77, DIF = 71, DUR = 80,
        GRO = 82, GUA = 81, HID = 83, JAL = 84, MEX = 85, MIC = 86, MOR = 87, NAY = 88, NLE = 89, OAX = 90,
        PUE = 91, QUE = 92, ROO = 93, SIN = 95, SLP = 94, SON = 96, TAB = 97, TAM = 98, TLA = 99, VER = 100,
        YUC = 101, ZAC = 102
    }

    [Description("Height Measurement Method")]
    public enum ExcelImportHeightMeasurementMethod
    {
        [Description("Clinometer/laser rangefinder/sine")]
        ClinometerLaserRangefinderSine = 1,
        [Description("Tree climb with tape drop")]
        TreeClimbWithTapeDrop = 2,
        [Description("Long measuring pole")]
        LongMeasuringPole = 3,
        [Description("Formal transit/total station survey")]
        FormalTransitTotalStationSurvey = 4,
        [Description("Laser rangefinder-clinometer: sine top–tangent base")]
        LaserRangefinderClinometerSineTopTangentBase = 5,
        [Description("Hypsometer with sine method")]
        HypsometerWithSineMethod = 6,
        [Description("Hypsometer with tangent method")]
        HypsometerWithTangentMethod = 7,
        [Description("External baseline method")]
        ExternalBaselineMethod = 8
    }

    [Description("Height Measurement Type")]
    public enum ExcelImportHeightMeasurementType
    {
        [Description("Single measurement")]
        SingleMeasurement = 1,
        [Description("Average of a set")]
        AverageOfASet = 2,
        [Description("Selection from a set")]
        SelectionFromASet = 3
    }

    [Description("Crown Spread Measurement Method")]
    public enum ExcelImportCrownSpreadMeasurementMethod
    {
        [Description("Average of max and min")]
        AverageOfMaxAndMin = 1,
        Spoke = 2,
        Estimate = 3
    }

    [Description("Crown Volume Calculation Method")]
    public enum ExcelImportCrownVolumeCalculationMethod
    {
        Mapping = 1,
        [Description("CFF estimate")]
        CffEstimate = 2
    }

    [Description("Trunk Volume Calculation Method")]
    public enum ExcelImportTrunkVolumeCalculationMethod
    {
        Reticle = 1,
        [Description("Tree climb with tape")]
        TreeClimbWithTape = 2
    }

    [Description("Tree Form Type")]
    public enum ExcelImportTreeFormType
    {
        Single = 1,
        Multi = 2,
        Fusion = 3,
        Coppice = 4,
        Colony = 5,
        Vine = 6
    }

    [Description("Tree Status")]
    public enum ExcelImportTreeStatus
    {
        Native = 1,
        [Description("Native planted")]
        NativePlanted = 2,
        [Description("Exotic planted")]
        ExoticPlanted = 3,
        [Description("Exotic naturalizing")]
        ExoticNaturalizing = 4,
        [Description("Introduced planted")]
        IntroducedPlanted = 5,
        [Description("Introduced naturalized")]
        IntroducedNaturalizing = 6
    }

    [Description("Tree Age Class")]
    public enum ExcelImportTreeAgeClass
    {
        Young = 1,
        Mature = 2,
        [Description("Late mature")]
        LateMature = 3,
        Old = 4,
        [Description("Very old")]
        VeryOld = 5
    }

    [Description("Tree Age Method")]
    public enum ExcelImportTreeAgeMethod
    {
        Estimate = 1,
        [Description("Ring count")]
        RingCount = 2,
        XD = 3
    }

    [Description("Terrain Type")]
    public enum ExcelImportTerrainType
    {
        [Description("Hill top")]
        HillTop = 1,
        [Description("Side slope")]
        SideSlope = 2,
        Valley = 3,
        [Description("Flood plain")]
        FloodPlain = 4,
        Swampy = 5,
        [Description("Base of slope")]
        BaseOfSlope = 6,
        [Description("Toe slope")]
        ToeSlope = 7,
        Terrace = 8
    }
}
