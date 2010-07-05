using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace TMD.Model.Trips
{
    public enum TreeAgeClass
    {
        [Description("")]
        NotSpecified = 0,
        [Description("Young")]
        Young = 1,
        [Description("Mature")]
        Mature = 2,
        [Description("Late mature")]
        LateMature = 3,
        [Description("Old")]
        Old = 4,
        [Description("Very old")]
        VeryOld = 5
    }

    public enum TreeAgeType
    {
        [Description("")]
        NotSpecified = 0,
        [Description("Estimate")]
        Estimate = 1,
        [Description("Ring count")]
        RingCount = 2,
        [Description("XD")]
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
        [Description("")]
        NotSpecified = 0,
        [Description("Native")]
        Native = 1,
        [Description("Native planted")]
        NativePlanted = 2,
        [Description("Exotic planted")]
        ExoticPlanted = 3,
        [Description("Exotic naturalizing")]
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
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Tree name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement General")]
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
        [DisplayName("*Common name:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Common name must be specified.", Ruleset = "Screening", Tag = "TreeMeasurement General")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Common name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement General")]
        public virtual string CommonName
        {
            get { return m_CommonName; }
            set { m_CommonName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_ScientificName;
        [DisplayName("*Scientific name:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Scientific name must be specified.", Ruleset = "Screening", Tag = "TreeMeasurement General")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Scientific name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement General")]
        public virtual string ScientificName
        {
            get { return m_ScientificName; }
            set { m_ScientificName = (value ?? string.Empty).Trim().ToSentenceCase(); }
        }

        [DisplayName("*Measurement date:")]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:MM/dd/yyyy}")]
        [NotNullValidator(MessageTemplate = "Measurement date must be specified.", Ruleset = "Screening", Tag = "TreeMeasurement General")]
        public virtual DateTime? Measured { get; set; }

        [DisplayName("Tree status:")]
        public virtual TreeStatus Status { get; set; }

        private string m_HealthStatus;
        [DisplayName("Health status:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Health status must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement General")]
        public virtual string HealthStatus
        {
            get { return m_HealthStatus; }
            set { m_HealthStatus = (value ?? string.Empty).Trim(); }
        }

        [DisplayName("Age class:")]
        public virtual TreeAgeClass AgeClass { get; set; }

        [DisplayName("Age type:")]
        public virtual TreeAgeType AgeType { get; set; }

        [DisplayName("Age:")]
        [RangeValidator(0, RangeBoundaryType.Inclusive, int.MaxValue, RangeBoundaryType.Inclusive, MessageTemplate = "Age must be non-negative.", Ruleset = "Screening", Tag = "TreeMeasurement General")]
        public virtual int Age { get; set; }

        private string m_GeneralComments;
        [DisplayName("General comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "General comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement General")]
        public virtual string GeneralComments
        {
            get { return m_GeneralComments; }
            set { m_GeneralComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Location Properties

        [ModelObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Location")]
        [SpecifiedValidator(MessageTemplate = "Tree measurement coordinates must be specified.", Ruleset = "Screening", Tag = "TreeMeasurement Location")]
        public virtual Coordinates Coordinates { get; set; }

        [ObjectValidator("Screening", Ruleset = "Screening", Tag = "TreeMeasurement Location")]
        public virtual Elevation Elevation { get; set; }

        public virtual TreeGpsDatum GpsDatum { get; set; }
        public virtual TreePositionMeasurementType PositionMeasurementType { get; set; }

        #endregion

        #region Height Properties

        private Distance m_Height;
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Height")]
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

        [ModelObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Height")]
        public virtual HeightMeasurements HeightMeasurements { get; set; }

        private string m_HeightMeasurementType;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Height measurement type must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Height")]
        public virtual string HeightMeasurementType
        {
            get { return m_HeightMeasurementType; }
            set { m_HeightMeasurementType = (value ?? string.Empty).Trim(); }
        }

        private string m_LaserBrand;
        [DisplayName("Laser brand:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Laser brand must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Height")]
        public virtual string LaserBrand
        {
            get { return m_LaserBrand; }
            set { m_LaserBrand = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_ClinometerBrand;
        [DisplayName("Clinometer brand:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Clinometer brand must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Height")]
        public virtual string ClinometerBrand
        {
            get { return m_ClinometerBrand; }
            set { m_ClinometerBrand = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_HeightComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Height comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Height")]
        public virtual string HeightComments
        {
            get { return m_HeightComments; }
            set { m_HeightComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Girth Properties

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Girth")]
        public virtual Distance GirthBreastHeight { get; set; }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Girth")]
        public virtual Distance GirthMeasurementHeight { get; set; }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Girth")]
        public virtual Distance GirthRootCollarHeight { get; set; }

        private string m_GirthComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Girth comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Girth")]
        public virtual string GirthComments
        {
            get { return m_GirthComments; }
            set { m_GirthComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Crown Properties

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Crown")]
        public virtual Distance MaximumCrownSpread { get; set; }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Crown")]
        public virtual Distance AverageCrownSpread { get; set; }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Crown")]
        public virtual Distance MaximumLimbLength { get; set; }

        private string m_CrownSpreadMeasurementMethod;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Crown spread measurement method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Crown")]
        public virtual string CrownSpreadMeasurementMethod
        {
            get { return m_CrownSpreadMeasurementMethod; }
            set { m_CrownSpreadMeasurementMethod = (value ?? string.Empty).Trim(); }
        }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Crown")]
        public virtual Distance BaseCrownHeight { get; set; }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Crown")]
        public virtual Volume CrownVolume { get; set; }

        private string m_CrownVolumeCalculationMethod;
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Crown volume calculation method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Crown")]
        public virtual string CrownVolumeCalculationMethod
        {
            get { return m_CrownVolumeCalculationMethod; }
            set { m_CrownVolumeCalculationMethod = (value ?? string.Empty).Trim(); }
        }

        private string m_CrownComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Crown comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Crown")]
        public virtual string CrownComments
        {
            get { return m_CrownComments; }
            set { m_CrownComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Trunk Properties

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Trunk")]
        public virtual Volume TrunkVolume { get; set; }

        private string m_TrunkVolumeCalculationMethod;
        [DisplayName("Trunk volume calculation method:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Trunk volume calculation method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Trunk")]
        public virtual string TrunkVolumeCalculationMethod
        {
            get { return m_TrunkVolumeCalculationMethod; }
            set { m_TrunkVolumeCalculationMethod = (value ?? string.Empty).Trim(); }
        }

        private string m_TrunkComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Trunk comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Trunk")]
        public virtual string TrunkComments
        {
            get { return m_TrunkComments; }
            set { m_TrunkComments = (value ?? string.Empty).Trim(); }
        }

        public virtual TreeFormType FormType { get; set; }

        [RangeValidator(0, RangeBoundaryType.Inclusive, int.MaxValue, RangeBoundaryType.Inclusive, MessageTemplate = "Number of trunks must be non-negative.", Ruleset = "Screening", Tag = "TreeMeasurement Trunk")]
        public virtual int NumberOfTrunks { get; set; }

        private string m_TreeFormComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Tree form comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Trunk")]
        public virtual string TreeFormComments
        {
            get { return m_TreeFormComments; }
            set { m_TreeFormComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Terrain Properties

        public virtual TreeTerrainType TerrainType { get; set; }

        [DisplayName("Terrain shape index:")]
        [RangeValidator(-1f, RangeBoundaryType.Inclusive, 1f, RangeBoundaryType.Inclusive, MessageTemplate = "TSI must be within the range of -1 to 1.", Ruleset = "Screening", Tag = "TreeMeasurement Terrain")]
        public virtual float TerrainShapeIndex { get; set; }

        [DisplayName("Land form index:")]
        [RangeValidator(0f, RangeBoundaryType.Inclusive, 1f, RangeBoundaryType.Inclusive, MessageTemplate = "LFI must be within the range of 0 to 1.", Ruleset = "Screening", Tag = "TreeMeasurement Terrain")]
        public virtual float LandformIndex { get; set; }

        private string m_TerrainComments;
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Terrain comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Terrain")]
        public virtual string TerrainComments
        {
            get { return m_TerrainComments; }
            set { m_TerrainComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Screening", Ruleset = "Screening", Tag = "TreeMeasurers General")]
        [CollectionCountWhenNotNullValidator(1, int.MaxValue, MessageTemplate = "Tree measurement must be attributed to at least one measurer.", Ruleset = "Screening", Tag = "TreeMeasurers General")]
        [CollectionCountWhenNotNullValidator(0, 3, MessageTemplate = "Tree measurement cannot be attributed to more than three measurers.", Ruleset = "Screening", Tag = "TreeMeasurers General")]
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

        public virtual ValidationResults ValidateRegardingGeneralInformation()
        {
            return ModelValidator.Validate(this, "Screening", "Persistence")
                .FindAllContainingTag(TagFilter.Include, "TreeMeasurement", "TreeMeasurers")
                .FindAllContainingTag(TagFilter.Include, "General", "Location");
        }

        public virtual ValidationResults ValidateRegardingHeightAndGirthInformation()
        {
            return ModelValidator.Validate(this, "Screening", "Persistence")
                .FindAllContainingTag(TagFilter.Include, "TreeMeasurement", "TreeMeasurers")
                .FindAllContainingTag(TagFilter.Include, "Height", "Girth");
        }

        public virtual ValidationResults ValidateRegardingTrunkAndCrownInformation()
        {
            return ModelValidator.Validate(this, "Screening", "Persistence")
                .FindAllContainingTag(TagFilter.Include, "TreeMeasurement", "TreeMeasurers")
                .FindAllContainingTag(TagFilter.Include, "Trunk", "Crown");
        }

        public virtual ValidationResults ValidateRegardingMiscInformation()
        {
            return ModelValidator.Validate(this, "Screening", "Persistence")
                .FindAllContainingTag(TagFilter.Include, "TreeMeasurement", "TreeMeasurers")
                .FindAllContainingTag(TagFilter.Include, "Terrain");
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
