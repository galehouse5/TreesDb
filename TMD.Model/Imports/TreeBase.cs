﻿using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;
using System.Collections.Generic;
using System.ComponentModel;
using System.Diagnostics;
using System.Linq;
using TMD.Model.Extensions;
using TMD.Model.Photos;
using TMD.Model.Users;
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
    [ContextMethod(nameof(ValidateCanCalculateCoordinates), Tags = ValidationTag.Screening)]
    [ContextMethod(nameof(ValidateCoordinatesAreCloseToSubsite), Tags = ValidationTag.Optional)]
    public abstract class TreeBase : UserCreatedEntityBase
    {
        protected TreeBase()
        { }

        public virtual Subsite Subsite { get; protected set; }

        public virtual void SetTripDefaults()
        {
            Subsite.Site.Trip.DefaultHeightMeasurementMethod = HeightMeasurementMethod;
            Subsite.Site.Trip.DefaultLaserBrand = LaserBrand;
            Subsite.Site.Trip.DefaultClinometerBrand = ClinometerBrand;
        }

        /// <summary>
        /// Four digit number unique in the scope of the subsite.
        /// </summary>
        [Range(1, 9999, Message = "Tree number must be within the range of 1 to 9999.", Tags = ValidationTag.Screening)]
        public virtual int? TreeNumber { get; set; }

        private string m_TreeName;
        [Length(100, Message = "Tree name must not exceed 100 characters.", Tags = ValidationTag.Persistence)]
        public virtual string TreeName
        {
            get { return m_TreeName; }
            set { m_TreeName = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_CommonName;
        [NotEmptyOrWhitesapce(Message = "Common name must be specified.", Tags = ValidationTag.Screening)]
        [Length(100, Message = "Common name must not exceed 100 characters.", Tags = ValidationTag.Persistence)]
        public virtual string CommonName
        {
            get { return m_CommonName; }
            set { m_CommonName = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_ScientificName;
        [Length(100, Message = "Scientific name must not exceed 100 characters.", Tags = ValidationTag.Persistence)]
        public virtual string ScientificName
        {
            get { return m_ScientificName; }
            set { m_ScientificName = value.OrEmptyAndTrimToSentenceCase(); }
        }

        [Valid, Specified(Message = "You must either specify coordinates for this measurement or the subsite that contains it.", Tags = ValidationTag.Finalization)]
        public virtual Coordinates Coordinates { get; set; }

        public virtual bool CanCalculateCoordinates(bool ignoreContaingSubsite = false)
            => Coordinates.IsValidAndSpecified() ? true
            : !ignoreContaingSubsite ? Subsite.CanCalculateCoordinates()
            : false;

        public virtual Coordinates CalculateCoordinates(bool ignoreContainingSubsite = false)
        {
            if (Coordinates.IsValidAndSpecified())
            {
                return Coordinates;
            }
            if (!ignoreContainingSubsite && Subsite.CanCalculateCoordinates())
            {
                return Subsite.CalculateCoordinates();
            }
            return Coordinates.Null();
        }

        protected internal virtual void ValidateCanCalculateCoordinates(IConstraintValidatorContext context)
        {
            if (!CanCalculateCoordinates())
            {
                context.AddInvalid<TreeBase, Coordinates>("You must either specify coordinates for this measurement or the subsite that contains it.", tm => tm.Coordinates);
            }
        }

        protected internal virtual void ValidateCoordinatesAreCloseToSubsite(IConstraintValidatorContext context)
        {
            if (CanCalculateCoordinates() && Subsite.CanCalculateCoordinates())
            {
                if (CalculateCoordinates().CalculateDistanceInMinutesTo(Subsite.CalculateCoordinates()) > 1f)
                {
                    context.AddInvalid<TreeBase, Coordinates>("Coordinates are more than a mile from subsite.", tm => tm.Coordinates);
                }
            }
        }

        public virtual bool MakeCoordinatesPublic { get; set; }

        private string m_GeneralComments;
        [Length(300, Message = "General comments must not exceed 300 characters.", Tags = ValidationTag.Persistence)] 
        public virtual string GeneralComments
        {
            get { return m_GeneralComments; }
            set { m_GeneralComments = value.OrEmptyAndTrim(); }
        }

        [Valid] public virtual Distance Height { get; set; }
        public virtual TreeHeightMeasurementMethod HeightMeasurementMethod { get; set; }
        [Valid] public virtual HeightMeasurements HeightMeasurements { get; set; }

        private string m_HeightMeasurementType;
        [Length(100, Message = "Height measurement type must not exceed 100 characters.", Tags = ValidationTag.Persistence)]
        public virtual string HeightMeasurementType
        {
            get { return m_HeightMeasurementType; }
            set { m_HeightMeasurementType = value.OrEmptyAndTrim(); }
        }

        private string m_LaserBrand;
        [Length(100, Message = "Laser brand must not exceed 100 characters.", Tags = ValidationTag.Persistence)]
        public virtual string LaserBrand
        {
            get { return m_LaserBrand; }
            set { m_LaserBrand = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_ClinometerBrand;
        [Length(100, Message = "Clinometer brand must not exceed 100 characters.", Tags = ValidationTag.Persistence)]
        public virtual string ClinometerBrand
        {
            get { return m_ClinometerBrand; }
            set { m_ClinometerBrand = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_HeightComments;
        [Length(300, Message = "Height comments must not exceed 300 characters.", Tags = ValidationTag.Persistence)]
        public virtual string HeightComments
        {
            get { return m_HeightComments; }
            set { m_HeightComments = value.OrEmptyAndTrim(); }
        }

        [Valid] public virtual Distance Girth { get; set; }
        [Valid] public virtual Distance GirthMeasurementHeight { get; set; }
        [Valid] public virtual Distance GirthRootCollarHeight { get; set; }

        private string m_GirthComments;
        [Length(300, Message = "Girth comments must not exceed 300 characters.", Tags = ValidationTag.Persistence)]
        public virtual string GirthComments
        {
            get { return m_GirthComments; }
            set { m_GirthComments = value.OrEmptyAndTrim(); }
        }

        [Range(1, int.MaxValue, Message = "Number of trunks must be positive.", Tags = ValidationTag.Screening)]
        public virtual int? NumberOfTrunks { get; set; }

        [Valid] public virtual Volume TrunkVolume { get; set; }

        private string m_TrunkVolumeCalculationMethod;
        [Length(100, Message = "Trunk volume calculation method must not exceed 100 characters.", Tags = ValidationTag.Persistence)]
        public virtual string TrunkVolumeCalculationMethod
        {
            get { return m_TrunkVolumeCalculationMethod; }
            set { m_TrunkVolumeCalculationMethod = value.OrEmptyAndTrim(); }
        }

        private string m_TrunkComments;
        [Length(300, Message = "Trunk comments must not exceed 300 characters.", Tags = ValidationTag.Persistence )]
        public virtual string TrunkComments
        {
            get { return m_TrunkComments; }
            set { m_TrunkComments = value.OrEmptyAndTrim(); }
        }

        [Valid] public virtual Distance BaseCrownHeight { get; set; }
        [Valid] public virtual Distance CrownSpread { get; set; }

        private string m_CrownSpreadMeasurementMethod;
        [Length(100, Message = "Crown spread measurement method must not exceed 100 characters.", Tags = ValidationTag.Persistence)]
        public virtual string CrownSpreadMeasurementMethod
        {
            get { return m_CrownSpreadMeasurementMethod; }
            set { m_CrownSpreadMeasurementMethod = value.OrEmptyAndTrim(); }
        }

        [Valid] public virtual Distance MaximumLimbLength { get; set; }
        [Valid] public virtual Volume CrownVolume { get; set; }

        private string m_CrownVolumeCalculationMethod;
        [Length(100, Message = "Crown volume calculation method must not exceed 100 characters.", Tags = ValidationTag.Persistence)]
        public virtual string CrownVolumeCalculationMethod
        {
            get { return m_CrownVolumeCalculationMethod; }
            set { m_CrownVolumeCalculationMethod = value.OrEmptyAndTrim(); }
        }

        private string m_CrownComments;
        [Length(300, Message = "Crown comments must not exceed 300 characters.", Tags = ValidationTag.Persistence)]
        public virtual string CrownComments
        {
            get { return m_CrownComments; }
            set { m_CrownComments = value.OrEmptyAndTrim(); }
        }

        public virtual TreeFormType FormType { get; set; }

        private string m_TreeFormComments;
        [Length(300, Message = "Tree form comments must not exceed 300 characters.", Tags = ValidationTag.Persistence)]
        public virtual string TreeFormComments
        {
            get { return m_TreeFormComments; }
            set { m_TreeFormComments = value.OrEmptyAndTrim(); }
        }

        public virtual TreeAgeClass AgeClass { get; set; }
        public virtual TreeAgeType AgeType { get; set; }

        [Range(0, int.MaxValue, Message = "Age must be non-negative.", Tags = ValidationTag.Screening)]
        public virtual int? Age { get; set; }

        public virtual TreeTerrainType TerrainType { get; set; }

        [Within(-1f, 1f, Message = "TSI must be within the range of -1 to 1.", Tags = ValidationTag.Screening)]
        public virtual float? TerrainShapeIndex { get; set; }

        [Within(0f, 1f, Message = "LFI must be within the range of 0 to 1.", Tags = ValidationTag.Screening)]
        public virtual float? LandformIndex { get; set; }

        private string m_TerrainComments;
        [Length(300, Message = "Terrain comments must not exceed 300 characters.", Tags = ValidationTag.Persistence)]
        public virtual string TerrainComments
        {
            get { return m_TerrainComments; }
            set { m_TerrainComments = value.OrEmptyAndTrim(); }
        }

        public virtual TreeStatus Status { get; set; }

        private string m_HealthStatus;
        [Length(100, Message = "Health status must not exceed 100 characters.", Tags = ValidationTag.Persistence)]
        public virtual string HealthStatus
        {
            get { return m_HealthStatus; }
            set { m_HealthStatus = value.OrEmptyAndTrim(); }
        }

        [Valid] public virtual Elevation Elevation { get; set; }

        [Size2(0, 100, Message = "This tree contains too many photos.", Tags = ValidationTag.Screening)]
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

    public class TreePhotoReference : PhotoReferenceBase
    {
        protected TreePhotoReference() { }
        protected internal TreePhotoReference(Photo photo, TreeBase tree) : base(photo) { this.Tree = tree; }
        public virtual TreeBase Tree { get; protected set; }
        public override bool IsAuthorizedToAdd(User user) { return user.IsAuthorizedToEdit(Tree.Subsite.Site.Trip); }
        public override bool IsAuthorizedToView(User user) { return user.IsAuthorizedToEdit(Tree.Subsite.Site.Trip); }
        public override bool IsAuthorizedToRemove(User user) { return user.IsAuthorizedToEdit(Tree.Subsite.Site.Trip); }

        public override IList<Name> Photographers
        {
            get { return Tree.Subsite.Site.Trip.Measurers; }
        }
    }
}
