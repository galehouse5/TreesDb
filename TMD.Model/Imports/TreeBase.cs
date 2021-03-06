﻿using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using TMD.Model.Extensions;
using TMD.Model.Photos;
using TMD.Model.Validation;

namespace TMD.Model.Imports
{
    public enum TreeHeightMeasurementMethod
    {
        [Description("")] NotSpecified = 0,
        [Description("Clinometer/laser rangefinder/sine")] ClinometerLaserRangefinderSine = 1,
        [Description("Tree climb with tape drop")] TreeClimbWithTapeDrop = 2,
        [Description("Long measuring pole")] LongMeasuringPole = 3,
        [Description("Formal transit/total station survey")] FormalTransitTotalStationSurvey = 4
    }

    public enum TreeAgeClass
    {
        [Description("")] NotSpecified = 0,
        Young = 1,
        Mature = 2,
        [Description("Late mature")] LateMature = 3,
        Old = 4,
        [Description("Very old")] VeryOld = 5
    }

    public enum TreeAgeType
    {
        [Description("")] NotSpecified = 0,
        Estimate = 1,
        [Description("Ring count")] RingCount = 2,
        XD = 3
    }

    public enum TreeStatus
    {
        [Description("")] NotSpecified = 0,
        Native = 1,
        [Description("Native planted")] NativePlanted = 2,
        [Description("Exotic planted")] ExoticPlanted = 3,
        [Description("Exotic naturalizing")] ExoticNaturalizing = 4,
        [Description("Introduced planted")] IntroducedPlanted = 5,
        [Description("Introduced naturalized")] IntroducedNaturalized = 6
    }

    public enum TreeTerrainType
    {
        [Description("")] NotSpecified = 0,
        [Description("Hill top")] HillTop = 1,
        [Description("Side slope")] SideSlope = 2,
        Valley = 3,
        [Description("Flood plain")] FloodPlain = 4,
        Swampy = 5
    }

    public enum TreeFormType
    {
        [Description("")] NotSpecified = 0,
        Single = 1,
        Multi = 2,
        Fusion = 3,
        Coppice = 4,
        Colony = 5,
        Vine = 6
    }

    [DebuggerDisplay("{ScientificName} ({CommonName})")]
    [ContextMethod(nameof(OptionalValidate), Tags = ValidationTag.Optional)]
    public abstract class TreeBase : UserCreatedEntityBase
    {
        protected TreeBase()
        { }

        public virtual Site Site { get; protected set; }

        public virtual void SetTripDefaults()
        {
            Site.Trip.DefaultHeightMeasurementMethod = HeightMeasurementMethod;
            Site.Trip.DefaultLaserBrand = LaserBrand;
            Site.Trip.DefaultClinometerBrand = ClinometerBrand;
        }

        /// <summary>
        /// Four digit number unique in the scope of the site.
        /// </summary>
        [Range(1, 9999, Message = "Tree number must be within the range of 1 to 9999.", Tags = ValidationTag.Required)]
        public virtual int? TreeNumber { get; set; }

        private string m_TreeName;
        [Length(100, Message = "Tree name must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string TreeName
        {
            get { return m_TreeName; }
            set { m_TreeName = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_CommonName;
        [NotEmptyOrWhitesapce(Message = "Common name must be specified.", Tags = ValidationTag.Required)]
        [Length(100, Message = "Common name must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string CommonName
        {
            get { return m_CommonName; }
            set { m_CommonName = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_ScientificName;
        [Length(100, Message = "Scientific name must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string ScientificName
        {
            get { return m_ScientificName; }
            set { m_ScientificName = value.OrEmptyAndTrimToSentenceCase(); }
        }

        [Valid]
        public virtual Coordinates Coordinates { get; set; }

        public virtual bool CanCalculateCoordinates(bool ignoreContaingSite = false)
            => Coordinates.IsValidAndSpecified() ? true
            : !ignoreContaingSite ? Site.CanCalculateCoordinates()
            : false;

        public virtual Coordinates CalculateCoordinates(bool ignoreContainingSite = false)
        {
            if (Coordinates.IsValidAndSpecified()) return Coordinates;
            if (!ignoreContainingSite && Site.CanCalculateCoordinates()) return Site.CalculateCoordinates();
            return Coordinates.Null();
        }

        protected internal virtual void OptionalValidate(IConstraintValidatorContext context)
        {
            if (Coordinates.IsSpecified
                && Site.Coordinates.IsSpecified
                && Coordinates.CalculateDistanceInMinutesTo(Site.Coordinates) > 1f)
            {
                context.AddInvalid("(Optional) Coordinates are more than one mile from site.  You might want to double check them.", nameof(Coordinates));
            }

            if (Coordinates.IsSpecified
                && Site.State.CoordinateBounds.Contains(Site.Coordinates)
                && !Site.State.CoordinateBounds.Contains(Coordinates))
            {
                context.AddInvalid($"(Optional) Coordinates appear to fall outside the state's boundaries.  You might want to double check them.", nameof(Coordinates));
            }
        }

        public virtual bool MakeCoordinatesPublic { get; set; }

        private string m_GeneralComments;
        [Length(1000, Message = "General comments must not exceed 1,000 characters.", Tags = ValidationTag.Required)]
        public virtual string GeneralComments
        {
            get { return m_GeneralComments; }
            set { m_GeneralComments = value.OrEmptyAndTrim(); }
        }

        [Valid] public virtual Distance Height { get; set; }
        public virtual TreeHeightMeasurementMethod HeightMeasurementMethod { get; set; }
        [Valid] public virtual HeightMeasurements HeightMeasurements { get; set; }

        private string m_HeightMeasurementType;
        [Length(100, Message = "Height measurement type must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string HeightMeasurementType
        {
            get { return m_HeightMeasurementType; }
            set { m_HeightMeasurementType = value.OrEmptyAndTrim(); }
        }

        private string m_LaserBrand;
        [Length(100, Message = "Laser brand must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string LaserBrand
        {
            get { return m_LaserBrand; }
            set { m_LaserBrand = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_ClinometerBrand;
        [Length(100, Message = "Clinometer brand must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string ClinometerBrand
        {
            get { return m_ClinometerBrand; }
            set { m_ClinometerBrand = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_HeightComments;
        [Length(1000, Message = "Height comments must not exceed 1,000 characters.", Tags = ValidationTag.Required)]
        public virtual string HeightComments
        {
            get { return m_HeightComments; }
            set { m_HeightComments = value.OrEmptyAndTrim(); }
        }

        [Valid] public virtual Distance Girth { get; set; }
        [Valid] public virtual Distance GirthMeasurementHeight { get; set; }
        [Valid] public virtual Distance GirthRootCollarHeight { get; set; }

        private string m_GirthComments;
        [Length(1000, Message = "Girth comments must not exceed 1,000 characters.", Tags = ValidationTag.Required)]
        public virtual string GirthComments
        {
            get { return m_GirthComments; }
            set { m_GirthComments = value.OrEmptyAndTrim(); }
        }

        [Range(1, int.MaxValue, Message = "Number of trunks must be positive.", Tags = ValidationTag.Required)]
        public virtual int? NumberOfTrunks { get; set; }

        [Valid] public virtual Volume TrunkVolume { get; set; }

        private string m_TrunkVolumeCalculationMethod;
        [Length(100, Message = "Trunk volume calculation method must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string TrunkVolumeCalculationMethod
        {
            get { return m_TrunkVolumeCalculationMethod; }
            set { m_TrunkVolumeCalculationMethod = value.OrEmptyAndTrim(); }
        }

        private string m_TrunkComments;
        [Length(1000, Message = "Trunk comments must not exceed 1,000 characters.", Tags = ValidationTag.Required)]
        public virtual string TrunkComments
        {
            get { return m_TrunkComments; }
            set { m_TrunkComments = value.OrEmptyAndTrim(); }
        }

        [Valid] public virtual Distance BaseCrownHeight { get; set; }
        [Valid] public virtual Distance CrownSpread { get; set; }

        private string m_CrownSpreadMeasurementMethod;
        [Length(100, Message = "Crown spread measurement method must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string CrownSpreadMeasurementMethod
        {
            get { return m_CrownSpreadMeasurementMethod; }
            set { m_CrownSpreadMeasurementMethod = value.OrEmptyAndTrim(); }
        }

        [Valid] public virtual Distance MaximumLimbLength { get; set; }
        [Valid] public virtual Volume CrownVolume { get; set; }

        private string m_CrownVolumeCalculationMethod;
        [Length(100, Message = "Crown volume calculation method must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string CrownVolumeCalculationMethod
        {
            get { return m_CrownVolumeCalculationMethod; }
            set { m_CrownVolumeCalculationMethod = value.OrEmptyAndTrim(); }
        }

        private string m_CrownComments;
        [Length(1000, Message = "Crown comments must not exceed 1,000 characters.", Tags = ValidationTag.Required)]
        public virtual string CrownComments
        {
            get { return m_CrownComments; }
            set { m_CrownComments = value.OrEmptyAndTrim(); }
        }

        public virtual TreeFormType FormType { get; set; }

        private string m_TreeFormComments;
        [Length(1000, Message = "Tree form comments must not exceed 1,000 characters.", Tags = ValidationTag.Required)]
        public virtual string TreeFormComments
        {
            get { return m_TreeFormComments; }
            set { m_TreeFormComments = value.OrEmptyAndTrim(); }
        }

        public virtual TreeAgeClass AgeClass { get; set; }
        public virtual TreeAgeType AgeType { get; set; }

        [Range(0, int.MaxValue, Message = "Age must be non-negative.", Tags = ValidationTag.Required)]
        public virtual int? Age { get; set; }

        public virtual TreeTerrainType TerrainType { get; set; }

        [Within(-1f, 1f, Message = "TSI must be within the range of -1 to 1.", Tags = ValidationTag.Required)]
        public virtual float? TerrainShapeIndex { get; set; }

        [Within(0f, 1f, Message = "LFI must be within the range of 0 to 1.", Tags = ValidationTag.Required)]
        public virtual float? LandformIndex { get; set; }

        private string m_TerrainComments;
        [Length(1000, Message = "Terrain comments must not exceed 1,000 characters.", Tags = ValidationTag.Required)]
        public virtual string TerrainComments
        {
            get { return m_TerrainComments; }
            set { m_TerrainComments = value.OrEmptyAndTrim(); }
        }

        public virtual TreeStatus Status { get; set; }

        private string m_HealthStatus;
        [Length(100, Message = "Health status must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string HealthStatus
        {
            get { return m_HealthStatus; }
            set { m_HealthStatus = value.OrEmptyAndTrim(); }
        }

        [Valid] public virtual Elevation Elevation { get; set; }

        [Size2(0, 100, Message = "This tree contains too many photos.", Tags = ValidationTag.Required)]
        [Valid] public virtual IList<IPhoto> Photos { get; protected set; }

        public virtual void AddPhoto(Photo photo)
        {
            Photos.Add(new TreePhotoReference(photo, this));
        }

        public virtual bool RemovePhoto(Photo photo)
        {
            var reference = (from p in Photos where p.EqualsPhoto(photo) select p).FirstOrDefault();
            if (reference == null) { return false; }
            return Photos.Remove(reference);
        }
    }
}
