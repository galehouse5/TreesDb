using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using System.ComponentModel;
using System.Diagnostics;
using System.ComponentModel.DataAnnotations;

namespace TMD.Model.Trips
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

    public enum TreeAgeClass
    {
        [Description("")]
        NotSpecified = 0,
        Young = 1,
        Mature = 2,
        [Description("Late mature")]
        LateMature = 3,
        Old = 4,
        [Description("Very old")]
        VeryOld = 5
    }

    public enum TreeAgeType
    {
        [Description("")]
        NotSpecified = 0,
        Estimate = 1,
        [Description("Ring count")]
        RingCount = 2,
        XD = 3
    }

    public enum TreeStatus
    {
        [Description("")]
        NotSpecified = 0,
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
        IntroducedNaturalized = 6
    }

    public enum TreeTerrainType
    {
        [Description("")]
        NotSpecified = 0,
        [Description("Hill top")]
        HillTop = 1,
        [Description("Side slope")]
        SideSlope = 2,
        Valley = 3,
        [Description("Flood plain")]
        FloodPlain = 4,
        Swampy = 5
    }

    public enum TreeFormType
    {
        [Description("")]
        NotSpecified = 0,
        Single = 1,
        Multi = 2,
        Fusion = 3,
        Coppice = 4,
        Colony = 5,
        Vine = 6
    }

    [Serializable]
    [DebuggerDisplay("{ScientificName} ({CommonName})")]
    [HasSelfValidation]
    public abstract class TreeMeasurementBase : BaseUserCreatedEntity
    {
        protected TreeMeasurementBase()
        { }

        public virtual SubsiteVisit SubsiteVisit { get; protected set; }

        public virtual void SetTripDefaults()
        {
            SubsiteVisit.SiteVisit.Trip.SetPrivatePropertyValue<TreeHeightMeasurementMethod>("DefaultHeightMeasurementMethod", HeightMeasurementMethod);
            SubsiteVisit.SiteVisit.Trip.SetPrivatePropertyValue<string>("DefaultLaserBrand", LaserBrand);
            SubsiteVisit.SiteVisit.Trip.SetPrivatePropertyValue<string>("DefaultClinometerBrand", ClinometerBrand);
        }

        /// <summary>
        /// Four digit number unique in the scope of the subsite.
        /// </summary>
        [DisplayName("Number this tree:")]
        [IgnoreNulls(Ruleset = "Screening")]
        [RangeValidator(0, RangeBoundaryType.Inclusive, 9999, RangeBoundaryType.Inclusive, MessageTemplate = "Tree number must be within the range of 0 to 9999.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual int? TreeNumber { get; set; }

        public virtual bool TreeNumberSpecified
        {
            get { return TreeNumber != null; }
        }

        private string m_TreeName;
        [DisplayName("Name this tree:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Tree name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string TreeName
        {
            get { return m_TreeName; }
            set { m_TreeName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        public virtual bool TreeNameSpecified
        {
            get { return !string.IsNullOrWhiteSpace(TreeName); }
        }

        #region General information

        private string m_CommonName;
        [DisplayName("*Common name:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Common name must be specified.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Common name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string CommonName
        {
            get { return m_CommonName; }
            set { m_CommonName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_ScientificName;
        [DisplayName("*Scientific name:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Scientific name must be specified.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Scientific name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string ScientificName
        {
            get { return m_ScientificName; }
            set { m_ScientificName = (value ?? string.Empty).Trim().ToSentenceCase(); }
        }

        private Coordinates m_Coordinates;
        [ModelObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        [SpecifiedValidator(MessageTemplate = "You must specify coordinates for this measurement or its containing subsite.", Ruleset = "Import", Tag = "TreeMeasurement")]
        public virtual Coordinates Coordinates
        {
            get
            {
                if (CoordinatesCalculated)
                {
                    if (SubsiteVisit.CoordinatesEntered && SubsiteVisit.Coordinates.IsSpecified && SubsiteVisit.Coordinates.IsValid)
                    {
                        m_Coordinates = SubsiteVisit.Coordinates;
                    }
                    else
                    {
                        m_Coordinates = Coordinates.Null();
                    }
                }
                return m_Coordinates;
            }
            set { m_Coordinates = value; }
        }

        public virtual bool CoordinatesCalculatedFromContainingSubsiteVisit
        {
            get
            {
                return CoordinatesCalculated
                    && SubsiteVisit.CoordinatesEntered && SubsiteVisit.Coordinates.IsSpecified && SubsiteVisit.Coordinates.IsValid;
            }
        }

        [SelfValidation(Ruleset = "Optional")]
        public virtual void CheckedCoordinatesAreWithinOneMinuteOfSubsiteCoordinates(ValidationResults results)
        {
            if (Coordinates.IsSpecified && SubsiteVisit.Coordinates.IsSpecified)
            {
                if (Coordinates.CalculateDistanceInMinutesTo(SubsiteVisit.Coordinates) > 1f)
                {
                    results.AddResult(new Microsoft.Practices.EnterpriseLibrary.Validation.ValidationResult("Coordinates are not within one minute of containing subsite coordinates.", this, "Coordinates", "TreeMeasurement", null));
                }
            }
        }

        public virtual bool CoordinatesCalculated { get; set; }
    
        [DisplayName("Make public")]
        public virtual bool MakeCoordinatesPublic { get; set; }

        [DisplayName("Keep private")]
        public virtual bool KeepCoordinatesPrivate
        {
            get { return !MakeCoordinatesPublic; }
            set { MakeCoordinatesPublic = !value; }
        }

        [DisplayName("Enter coordinates")]
        public virtual bool CoordinatesEntered
        {
            get { return !CoordinatesCalculated; }
            set { CoordinatesCalculated = !value; }
        }

        [SelfValidation(Ruleset = "Import")]
        public virtual void CheckCoordinatesAreSpecifiedIfCoordinatesAreEntered(ValidationResults results)
        {
            if (CoordinatesEntered)
            {
                if (!Coordinates.Latitude.IsSpecified)
                {
                    results.AddResult(new Microsoft.Practices.EnterpriseLibrary.Validation.ValidationResult("Latitude must be specified.", Coordinates.Latitude, "Coordinates.Latitude", "TreeMeasurement", null));
                }
                if (!Coordinates.Longitude.IsSpecified)
                {
                    results.AddResult(new Microsoft.Practices.EnterpriseLibrary.Validation.ValidationResult("Longitude must be specified.", Coordinates.Longitude, "Coordinates.Longitude", "TreeMeasurement", null));
                }
            }
        }

        private string m_GeneralComments;
        [DisplayName("General comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "General comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string GeneralComments
        {
            get { return m_GeneralComments; }
            set { m_GeneralComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Height information

        [DisplayName("Height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance Height { get; set; }

        [DisplayName("Measurement method:")]
        public virtual TreeHeightMeasurementMethod HeightMeasurementMethod { get; set; }

        [DisplayName("Enter distance and angle measurements")]
        public virtual bool IncludeHeightDistanceAndAngleMeasurements { get; set; }

        [ModelObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual HeightMeasurements HeightMeasurements { get; set; }

        [SelfValidation(Ruleset = "Screening")]
        public virtual void CheckHeightDistanceAngeAngleMeasurementsAreIncluded(ValidationResults results)
        {
            if (IncludeHeightDistanceAndAngleMeasurements)
            {
                if (!HeightMeasurements.IsSpecified)
                {
                    results.AddResult(new Microsoft.Practices.EnterpriseLibrary.Validation.ValidationResult(
                        "You must specify enough distance and angle measurements to calculate a height.", this, "HeightMeasurements.Height", "TreeMeasurement", null));
                }
            }
        }

        private string m_HeightMeasurementType;
        [DisplayName("Measurement type:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Height measurement type must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string HeightMeasurementType
        {
            get { return m_HeightMeasurementType; }
            set { m_HeightMeasurementType = (value ?? string.Empty).Trim(); }
        }

        private string m_LaserBrand;
        [DisplayName("Laser brand:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Laser brand must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string LaserBrand
        {
            get { return m_LaserBrand; }
            set { m_LaserBrand = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_ClinometerBrand;
        [DisplayName("Clinometer brand:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Clinometer brand must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string ClinometerBrand
        {
            get { return m_ClinometerBrand; }
            set { m_ClinometerBrand = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_HeightComments;
        [DisplayName("Height comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Height comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string HeightComments
        {
            get { return m_HeightComments; }
            set { m_HeightComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Girth information

        [DisplayName("Girth:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance Girth { get; set; }

        [DisplayName("Measurement height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance GirthMeasurementHeight { get; set; }

        [DisplayName("Root collar height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance GirthRootCollarHeight { get; set; }

        private string m_GirthComments;
        [DisplayName("Girth comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Girth comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string GirthComments
        {
            get { return m_GirthComments; }
            set { m_GirthComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Trunk information

        [IgnoreNulls(Ruleset = "Screening")]
        [DisplayName("Number of trunks:")]
        [RangeValidator(1, RangeBoundaryType.Inclusive, int.MaxValue, RangeBoundaryType.Inclusive, MessageTemplate = "Number of trunks must be positive.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual int? NumberOfTrunks { get; set; }

        [DisplayName("Volume:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Volume TrunkVolume { get; set; }

        private string m_TrunkVolumeCalculationMethod;
        [DisplayName("Volume calculation method:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Trunk volume calculation method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string TrunkVolumeCalculationMethod
        {
            get { return m_TrunkVolumeCalculationMethod; }
            set { m_TrunkVolumeCalculationMethod = (value ?? string.Empty).Trim(); }
        }

        private string m_TrunkComments;
        [DisplayName("Trunk comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Trunk comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string TrunkComments
        {
            get { return m_TrunkComments; }
            set { m_TrunkComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Crown information

        [DisplayName("Base crown height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance BaseCrownHeight { get; set; }

        [DisplayName("Crown spread:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance CrownSpread { get; set; }

        private string m_CrownSpreadMeasurementMethod;
        [DisplayName("Measurement method:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Crown spread measurement method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string CrownSpreadMeasurementMethod
        {
            get { return m_CrownSpreadMeasurementMethod; }
            set { m_CrownSpreadMeasurementMethod = (value ?? string.Empty).Trim(); }
        }

        [DisplayName("Max limb length:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Distance MaximumLimbLength { get; set; }

        [DisplayName("Volume:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Volume CrownVolume { get; set; }

        private string m_CrownVolumeCalculationMethod;
        [DisplayName("Volume calculation method:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Crown volume calculation method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string CrownVolumeCalculationMethod
        {
            get { return m_CrownVolumeCalculationMethod; }
            set { m_CrownVolumeCalculationMethod = (value ?? string.Empty).Trim(); }
        }

        private string m_CrownComments;
        [DisplayName("Crown comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Crown comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string CrownComments
        {
            get { return m_CrownComments; }
            set { m_CrownComments = (value ?? string.Empty).Trim(); }
        }
        
        #endregion

        #region Form type information

        [DisplayName("Tree form type:")]
        public virtual TreeFormType FormType { get; set; }

        private string m_TreeFormComments;
        [DisplayName("Tree form comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Tree form comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string TreeFormComments
        {
            get { return m_TreeFormComments; }
            set { m_TreeFormComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Age information

        [DisplayName("Age class:")]
        public virtual TreeAgeClass AgeClass { get; set; }

        [DisplayName("Age type:")]
        public virtual TreeAgeType AgeType { get; set; }

        [DisplayName("Age:")]
        [IgnoreNulls(Ruleset = "Screening")]
        [RangeValidator(0, RangeBoundaryType.Inclusive, int.MaxValue, RangeBoundaryType.Inclusive, MessageTemplate = "Age must be non-negative.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual int? Age { get; set; }

        #endregion

        #region Terrain information

        [DisplayName("Terrain type:")]
        public virtual TreeTerrainType TerrainType { get; set; }

        [DisplayName("Terrain shape index:")]
        [IgnoreNulls(Ruleset = "Screening")]
        [RangeValidator(-1f, RangeBoundaryType.Inclusive, 1f, RangeBoundaryType.Inclusive, MessageTemplate = "TSI must be within the range of -1 to 1.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual float? TerrainShapeIndex { get; set; }

        [DisplayName("Land form index:")]
        [IgnoreNulls(Ruleset = "Screening")]
        [RangeValidator(0f, RangeBoundaryType.Inclusive, 1f, RangeBoundaryType.Inclusive, MessageTemplate = "LFI must be within the range of 0 to 1.", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual float? LandformIndex { get; set; }

        private string m_TerrainComments;
        [DisplayName("Terrain comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Terrain comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string TerrainComments
        {
            get { return m_TerrainComments; }
            set { m_TerrainComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Status information

        [DisplayName("Tree status:")]
        public virtual TreeStatus Status { get; set; }

        private string m_HealthStatus;
        [DisplayName("Health status:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Health status must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement")]
        public virtual string HealthStatus
        {
            get { return m_HealthStatus; }
            set { m_HealthStatus = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Other information

        [DisplayName("Elevation:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement")]
        public virtual Elevation Elevation { get; set; }

        #endregion


        public virtual ValidationResults ValidateRegardingScreeningAndPersistence()
        {
            return ModelValidator.Validate(this, "Screening", "Persistence");
        }

        public virtual ValidationResults ValidateRegardingPersistence()
        {
            return ModelValidator.Validate(this, "Persistence");
        }
    }
}
