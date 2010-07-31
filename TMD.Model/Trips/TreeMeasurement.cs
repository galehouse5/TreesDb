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

    public enum TreePositionMeasurementType
    {
        [Description("")]
        NotSpecified = 0,
        Map = 1,
        GPS = 2
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

    public enum TreeGpsDatum
    {
        [Description("")]
        NotSpecified = 0,
        WGS84NAD83 = 1,
        WGS60 = 2,
        WGS66 = 3,
        WGS72 = 4
    }

    [Serializable]
    [DebuggerDisplay("{ScientificName} ({CommonName})")]
    [HasSelfValidation]
    public class TreeMeasurement : BaseUserCreatedEntity
    {
        protected TreeMeasurement()
        { }

        public virtual SubsiteVisit SubsiteVisit { get; private set; }

        /// <summary>
        /// Four digit number unique in the scope of the subsite.
        /// </summary>
        public virtual int TreeNumber { get; private set; }

        #region General information

        [DisplayName("Assign a name or number to this tree")]
        public virtual bool TreeNameOrNumberSpecified { get; set; }

        private string m_TreeName;
        [DisplayName("*Name or number:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Tree name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement General")]
        public virtual string TreeNameOrNumber
        {
            get { return m_TreeName; }
            set { m_TreeName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        [SelfValidation(Ruleset = "Screening")]
        protected virtual void validateTreeNameOrNumberIsSpecified(ValidationResults results)
        {
            if (TreeNameOrNumberSpecified && string.IsNullOrWhiteSpace(TreeNameOrNumber))
            {
                Microsoft.Practices.EnterpriseLibrary.Validation.ValidationResult result = new Microsoft.Practices.EnterpriseLibrary.Validation.ValidationResult(
                    "Tree name or number must be specified.", TreeNameOrNumber, "TreeNameOrNumber", "TreeMeasurement General", null);
                results.AddResult(result);
            }
        }

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

        private Coordinates m_Coordinates;
        [ModelObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement General")]
        [SpecifiedValidator(MessageTemplate = "You must specify coordinates for this measurement or its containing subsite.", Ruleset = "Import", Tag = "TreeMeasurement General")]
        public virtual Coordinates Coordinates
        {
            get
            {
                if (CoordinatesCalculated)
                {
                    if (SubsiteVisit.CoordinatesEntered && SubsiteVisit.Coordinates.IsSpecified)
                    {
                        m_Coordinates = SubsiteVisit.Coordinates;
                    }
                }
                return m_Coordinates;
            }
            set { m_Coordinates = value; }
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

        [DisplayName("Enter coordinates for this tree")]
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
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "General comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement General")]
        public virtual string GeneralComments
        {
            get { return m_GeneralComments; }
            set { m_GeneralComments = (value ?? string.Empty).Trim(); }
        }
        
        [DisplayName("Gps datum:")]
        public virtual TreeGpsDatum GpsDatum { get; set; }

        [DisplayName("Position measurement type:")]
        public virtual TreePositionMeasurementType PositionMeasurementType { get; set; }

        #endregion

        #region Height information

        private Distance m_Height;
        [DisplayName("Height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Height")]
        public virtual Distance Height
        {
            get
            {
                if (DetailedHeightMeasurements)
                {
                    m_Height = HeightMeasurements.Height;
                }
                return m_Height;
            }
            set { m_Height = value; }
        }

        public virtual bool DetailedHeightMeasurements { get; set; }

        public virtual bool SimpleHeightMeasurements
        {
            get { return !DetailedHeightMeasurements; }
            set { DetailedHeightMeasurements = !value; }
        }

        [ModelObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Height")]
        public virtual HeightMeasurements HeightMeasurements { get; set; }

        [DisplayName("Base crown height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Height")]
        public virtual Distance BaseCrownHeight { get; set; }

        private string m_HeightMeasurementType;
        [DisplayName("Height measurement type:")]
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
            set 
            { 
                m_LaserBrand = (value ?? string.Empty).Trim().ToTitleCase();
                if (SubsiteVisit != null && SubsiteVisit.SiteVisit != null && SubsiteVisit.SiteVisit.Trip != null)
                {
                    SubsiteVisit.SiteVisit.Trip.DefaultLaserBrand = m_LaserBrand;
                }
            }
        }

        private string m_ClinometerBrand;
        [DisplayName("Clinometer brand:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Clinometer brand must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Height")]
        public virtual string ClinometerBrand
        {
            get { return m_ClinometerBrand; }
            set 
            { 
                m_ClinometerBrand = (value ?? string.Empty).Trim().ToTitleCase();
                if (SubsiteVisit != null && SubsiteVisit.SiteVisit != null && SubsiteVisit.SiteVisit.Trip != null)
                {
                    SubsiteVisit.SiteVisit.Trip.DefaultClinometerBrand = m_ClinometerBrand;
                }
            }
        }

        private string m_HeightComments;
        [DisplayName("Height comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Height comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Height")]
        public virtual string HeightComments
        {
            get { return m_HeightComments; }
            set { m_HeightComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Girth information

        [DisplayName("Girth breast height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Girth")]
        public virtual Distance GirthBreastHeight { get; set; }

        [DisplayName("Girth measurement height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Girth")]
        public virtual Distance GirthMeasurementHeight { get; set; }

        [DisplayName("Girth root collar height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Girth")]
        public virtual Distance GirthRootCollarHeight { get; set; }

        private string m_GirthComments;
        [DisplayName("Girth comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Girth comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Girth")]
        public virtual string GirthComments
        {
            get { return m_GirthComments; }
            set { m_GirthComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Trunk information

        [IgnoreNulls(Ruleset = "Screening")]
        [DisplayName("Number of trunks:")]
        [RangeValidator(0, RangeBoundaryType.Inclusive, int.MaxValue, RangeBoundaryType.Inclusive, MessageTemplate = "Number of trunks must be non-negative.", Ruleset = "Screening", Tag = "TreeMeasurement Trunk")]
        public virtual int? NumberOfTrunks { get; set; }

        [DisplayName("Trunk volume:")]
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
        [DisplayName("Trunk comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Trunk comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Trunk")]
        public virtual string TrunkComments
        {
            get { return m_TrunkComments; }
            set { m_TrunkComments = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Crown information

        [DisplayName("Max crown spread:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Crown")]
        public virtual Distance MaximumCrownSpread { get; set; }

        [DisplayName("Avg crown spread:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Crown")]
        public virtual Distance AverageCrownSpread { get; set; }

        private string m_CrownSpreadMeasurementMethod;
        [DisplayName("Spread measurement method:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Crown spread measurement method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Crown")]
        public virtual string CrownSpreadMeasurementMethod
        {
            get { return m_CrownSpreadMeasurementMethod; }
            set { m_CrownSpreadMeasurementMethod = (value ?? string.Empty).Trim(); }
        }

        [DisplayName("Max limb length:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Crown")]
        public virtual Distance MaximumLimbLength { get; set; }

        [DisplayName("Crown volume:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Crown")]
        public virtual Volume CrownVolume { get; set; }

        private string m_CrownVolumeCalculationMethod;
        [DisplayName("Volume calculation method:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Crown volume calculation method must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Crown")]
        public virtual string CrownVolumeCalculationMethod
        {
            get { return m_CrownVolumeCalculationMethod; }
            set { m_CrownVolumeCalculationMethod = (value ?? string.Empty).Trim(); }
        }

        private string m_CrownComments;
        [DisplayName("Crown comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Crown comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Crown")]
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
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Tree form comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement FormType")]
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
        [RangeValidator(0, RangeBoundaryType.Inclusive, int.MaxValue, RangeBoundaryType.Inclusive, MessageTemplate = "Age must be non-negative.", Ruleset = "Screening", Tag = "TreeMeasurement Age")]
        public virtual int? Age { get; set; }

        #endregion

        #region Terrain information

        [DisplayName("Terrain type:")]
        public virtual TreeTerrainType TerrainType { get; set; }

        [DisplayName("Terrain shape index:")]
        [IgnoreNulls(Ruleset = "Screening")]
        [RangeValidator(-1f, RangeBoundaryType.Inclusive, 1f, RangeBoundaryType.Inclusive, MessageTemplate = "TSI must be within the range of -1 to 1.", Ruleset = "Screening", Tag = "TreeMeasurement Terrain")]
        public virtual float? TerrainShapeIndex { get; set; }

        [DisplayName("Land form index:")]
        [IgnoreNulls(Ruleset = "Screening")]
        [RangeValidator(0f, RangeBoundaryType.Inclusive, 1f, RangeBoundaryType.Inclusive, MessageTemplate = "LFI must be within the range of 0 to 1.", Ruleset = "Screening", Tag = "TreeMeasurement Terrain")]
        public virtual float? LandformIndex { get; set; }

        private string m_TerrainComments;
        [DisplayName("Terrain comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Terrain comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Terrain")]
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
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Health status must not exceed 100 characters.", Ruleset = "Persistence", Tag = "TreeMeasurement Status")]
        public virtual string HealthStatus
        {
            get { return m_HealthStatus; }
            set { m_HealthStatus = (value ?? string.Empty).Trim(); }
        }

        #endregion

        #region Other information

        [DisplayName("Elevation:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TreeMeasurement Other")]
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

        internal static TreeMeasurement Create(SubsiteVisit ssv)
        {
            return new TreeMeasurement()
            {
                TreeNameOrNumber = string.Empty,
                TreeNameOrNumberSpecified = false,
                TreeNumber = 0,
                CommonName = string.Empty,
                ScientificName = string.Empty,
                Status = TreeStatus.NotSpecified,
                HealthStatus = string.Empty,
                AgeClass = TreeAgeClass.NotSpecified,
                AgeType = TreeAgeType.NotSpecified,
                Age = null,
                GeneralComments = string.Empty,
                Coordinates = ssv.Coordinates,
                Elevation = Elevation.Null(),
                PositionMeasurementType = TreePositionMeasurementType.NotSpecified,
                Height = Distance.Null(),
                HeightMeasurements = HeightMeasurements.Null(),
                HeightMeasurementType = string.Empty,
                LaserBrand = ssv.SiteVisit.Trip.DefaultLaserBrand,
                ClinometerBrand = ssv.SiteVisit.Trip.DefaultClinometerBrand,
                HeightComments = string.Empty,
                GirthBreastHeight = Distance.Null(),
                GirthMeasurementHeight = Distance.Create(4.5f),
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
                NumberOfTrunks = null,
                TreeFormComments = string.Empty,
                TerrainType = TreeTerrainType.NotSpecified,
                TerrainShapeIndex = null,
                LandformIndex = null,
                TerrainComments = string.Empty,
                CoordinatesCalculated = true,
                SubsiteVisit = ssv,
                MakeCoordinatesPublic = true
            };
        }
    }
}
