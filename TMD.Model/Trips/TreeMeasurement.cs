using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;

namespace TMD.Model.Trips
{
    public enum TreeAgeClass
    {
        NotSpecified = 0,
        Young = 1,
        Mature = 2,
        LateMature = 3,
        Old = 4,
        VeryOld = 5
    }

    public enum TreeAgeType
    {
        NotSpecified = 0,
        Estimate = 1,
        RingCount = 2,
        XD = 3
    }

    public enum TreeFormType
    {
        NotSpecified = 0,
        Single = 1,
        Multi = 2,
        Fusion = 3,
        Coppice = 4,
        Colony = 5,
        Vine = 6
    }

    public enum TreePositionMeasurementType
    {
        NotSpecified = 0,
        Map = 1,
        GPS = 2
    }

    public enum TreeStatus
    {
        NotSpecified = 0,
        Native = 1,
        NativePlanted = 2,
        ExoticPlanted = 3,
        ExoticNaturalizing = 4
    }

    public enum TreeTerrainType
    {
        NotSpecified = 0,
        HillTop = 1,
        SideSlope = 2,
        Valley = 3,
        FloodPlain = 4,
        Swampy = 5
    }

    public enum TreeGpsDatum
    {
        NotSpecified = 0,
        WGS84NAD83 = 1,
        WGS60 = 2,
        WGS66 = 3,
        WGS72 = 4
    }

    [Serializable]
    public class TreeMeasurement : IEntity
    {
        protected TreeMeasurement()
        { }

        public virtual int Id { get; private set; }
        public virtual SubsiteVisit SubsiteVisit { get; private set; }

        #region General Properties

        private string m_TreeName;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Tree name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string TreeName
        {
            get { return m_TreeName; }
            set { m_TreeName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        /// <summary>
        /// Four digit number unique in the scope of the subsite.
        /// </summary>
        public virtual int TreeNumber { get; private set; }

        private string m_CommonName;
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Common name must be specified.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Common name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string CommonName
        {
            get { return m_CommonName; }
            set { m_CommonName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_ScientificName;
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Scientific name must be specified.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Scientific name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string ScientificName
        {
            get { return m_ScientificName; }
            set { m_ScientificName = (value ?? string.Empty).Trim().ToSentenceCase(); }
        }

        [NotNullValidator(MessageTemplate = "Measurement date must be specified.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual DateTime? Measured { get; set; }

        public virtual TreeStatus Status { get; set; }

        private string m_HealthStatus;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Health status must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string HealthStatus
        {
            get { return m_HealthStatus; }
            set { m_HealthStatus = (value ?? string.Empty).Trim(); }
        }

        public virtual TreeAgeClass AgeClass { get; set; }
        public virtual TreeAgeType AgeType { get; set; }

        [RangeValidator(0, RangeBoundaryType.Inclusive, int.MaxValue, RangeBoundaryType.Inclusive, MessageTemplate = "Age must be non-negative.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual int Age { get; set; }

        private string m_GeneralComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "General comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string GeneralComments
        {
            get { return m_GeneralComments; }
            set { m_GeneralComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Location Properties

        [ValueObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        [SpecifiedValidator(MessageTemplate = "Tree measurement coordinates must be specified.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Coordinates Coordinates { get; set; }

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Elevation Elevation { get; set; }

        public virtual TreeGpsDatum GpsDatum { get; set; }
        public virtual TreePositionMeasurementType PositionMeasurementType { get; set; }

        #endregion

        #region Height Properties

        private Distance m_Height;
        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance Height
        {
            get
            {
                if (HeightMeasurements.IsSpecified)
                {
                    return HeightMeasurements.Height;
                }
                return m_Height;
            }
            set { m_Height = value; }
        }

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual HeightMeasurements HeightMeasurements { get; set; }

        private string m_HeightMeasurementType;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Height measurement type must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string HeightMeasurementType
        {
            get { return m_HeightMeasurementType; }
            set { m_HeightMeasurementType = (value ?? string.Empty).Trim(); }
        }

        private string m_LaserBrand;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Laser brand must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string LaserBrand
        {
            get { return m_LaserBrand; }
            set { m_LaserBrand = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_ClinometerBrand;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Clinometer brand must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string ClinometerBrand
        {
            get { return m_ClinometerBrand; }
            set { m_ClinometerBrand = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_HeightComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Height comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string HeightComments
        {
            get { return m_HeightComments; }
            set { m_HeightComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Girth Properties

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance GirthBreastHeight { get; set; }

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance GirthMeasurementHeight { get; set; }

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance GirthRootCollarHeight { get; set; }

        private string m_GirthComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Girth comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string GirthComments
        {
            get { return m_GirthComments; }
            set { m_GirthComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Crown Properties

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance MaximumCrownSpread { get; set; }

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance AverageCrownSpread { get; set; }

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance MaximumLimbLength { get; set; }

        private string m_CrownSpreadMeasurementMethod;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Crown spread measurement method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string CrownSpreadMeasurementMethod
        {
            get { return m_CrownSpreadMeasurementMethod; }
            set { m_CrownSpreadMeasurementMethod = (value ?? string.Empty).Trim(); }
        }

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance BaseCrownHeight { get; set; }

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Volume CrownVolume { get; set; }

        private string m_CrownVolumeCalculationMethod;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Crown volume calculation method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string CrownVolumeCalculationMethod
        {
            get { return m_CrownVolumeCalculationMethod; }
            set { m_CrownVolumeCalculationMethod = (value ?? string.Empty).Trim(); }
        }

        private string m_CrownComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Crown comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string CrownComments
        {
            get { return m_CrownComments; }
            set { m_CrownComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Trunk Properties

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Volume TrunkVolume { get; set; }

        private string m_TrunkVolumeCalculationMethod;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Trunk volume calculation method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string TrunkVolumeCalculationMethod
        {
            get { return m_TrunkVolumeCalculationMethod; }
            set { m_TrunkVolumeCalculationMethod = (value ?? string.Empty).Trim(); }
        }

        private string m_TrunkComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Trunk comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string TrunkComments
        {
            get { return m_TrunkComments; }
            set { m_TrunkComments = (value ?? string.Empty).Trim(); }
        }

        public virtual TreeFormType FormType { get; set; }

        [RangeValidator(0, RangeBoundaryType.Inclusive, int.MaxValue, RangeBoundaryType.Inclusive, MessageTemplate = "Number of trunks must be non-negative.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual int NumberOfTrunks { get; set; }

        private string m_TreeFormComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Tree form comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string TreeFormComments
        {
            get { return m_TreeFormComments; }
            set { m_TreeFormComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Terrain Properties

        public virtual TreeTerrainType TerrainType { get; set; }

        [RangeValidator(-1f, RangeBoundaryType.Inclusive, 1f, RangeBoundaryType.Inclusive, MessageTemplate = "TSI must be within the range of -1 to 1.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual float TerrainShapeIndex { get; set; }

        [RangeValidator(0f, RangeBoundaryType.Inclusive, 1f, RangeBoundaryType.Inclusive, MessageTemplate = "LFI must be within the range of 0 to 1.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual float LandformIndex { get; set; }

        private string m_TerrainComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Terrain comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string TerrainComments
        {
            get { return m_TerrainComments; }
            set { m_TerrainComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        [ObjectCollectionValidator(TargetRuleset = "Screening", Ruleset = "Screening")]
        [CollectionCountWhenNotNullValidator(1, int.MaxValue, MessageTemplate = "Measurement must be attributed to at least one measurer.", Ruleset = "Screening", Tag = "TreeMeasurers")]
        [CollectionCountWhenNotNullValidator(0, 3, MessageTemplate = "Measurement cannot be attributed to more than three measurers.", Ruleset = "Screening", Tag = "TreeMeasurers")]
        public virtual IList<TreeMeasurer> Measurers { get; private set; }

        public virtual TreeMeasurer AddMeasurer()
        {
            TreeMeasurer m = TreeMeasurer.Create(this);
            Measurers.Add(m);
            return m;
        }

        public virtual bool RemoveMeasurer(TreeMeasurer m)
        {
            return Measurers.Remove(m);
        }

        internal static TreeMeasurement Create(SubsiteVisit ssv)
        {
            return new TreeMeasurement()
            {
                TreeName = string.Empty,
                TreeNumber = 0,
                CommonName = string.Empty,
                ScientificName = string.Empty,
                Measured = ssv.SiteVisit.Trip.Date,
                Status = TreeStatus.NotSpecified,
                HealthStatus = string.Empty,
                AgeClass = TreeAgeClass.NotSpecified,
                AgeType = TreeAgeType.NotSpecified,
                Age = 0,
                GeneralComments = string.Empty,
                Coordinates = ssv.Coordinates,
                Elevation = Elevation.Null(),
                PositionMeasurementType = TreePositionMeasurementType.NotSpecified,
                Height = Distance.Null(),
                HeightMeasurements = HeightMeasurements.Null(),
                HeightMeasurementType = string.Empty,
                LaserBrand = string.Empty,
                ClinometerBrand = string.Empty,
                HeightComments = string.Empty,
                GirthBreastHeight = Distance.Null(),
                GirthMeasurementHeight = Distance.Null(),
                GirthRootCollarHeight = Distance.Null(),
                GirthComments = string.Empty,
                MaximumCrownSpread = Distance.Null(),
                AverageCrownSpread = Distance.Null(),
                MaximumLimbLength = Distance.Null(),
                CrownSpreadMeasurementMethod = string.Empty,
                BaseCrownHeight = Distance.Null(),
                CrownVolume = Volume.Null(),
                CrownVolumeCalculationMethod = string.Empty,
                CrownComments = string.Empty,
                TrunkVolume = Volume.Null(),
                TrunkVolumeCalculationMethod = string.Empty,
                TrunkComments = string.Empty,
                FormType = TreeFormType.NotSpecified,
                NumberOfTrunks = 0,
                TreeFormComments = string.Empty,
                TerrainType = TreeTerrainType.NotSpecified,
                TerrainShapeIndex = 0f,
                LandformIndex = 0f,
                TerrainComments = string.Empty,
                Measurers = new List<TreeMeasurer>(),
                SubsiteVisit = ssv
            };
        }
    }
}
