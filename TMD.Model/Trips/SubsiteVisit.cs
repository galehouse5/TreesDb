using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using System.Diagnostics;
using TMD.Model.Locations;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using System.ComponentModel;
using TMD.Model.Users;

namespace TMD.Model.Trips
{
    [Serializable]
    [DebuggerDisplay("{Name}")]
    [HasSelfValidation]
    public class SubsiteVisit : BaseUserCreatedEntity
    {
        protected SubsiteVisit()
        { }

        public virtual SiteVisit SiteVisit { get; private set; }

        public virtual void SetTripDefaults()
        {
            SiteVisit.Trip.SetPrivatePropertyValue<Country>("DefaultCountry", Country);
            SiteVisit.Trip.SetPrivatePropertyValue<State>("DefaultState", State);
            SiteVisit.Trip.SetPrivatePropertyValue<string>("DefaultCounty", County);
        }

        private string m_Name;
        [DisplayName("*Subsite name:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Subsite name must be specified.", Ruleset = "Screening", Tag = "SubsiteVisit")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Subsite name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "SubsiteVisit")]
        public virtual string Name
        {
            get { return m_Name; }
            set { m_Name = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private Coordinates m_Coordinates;
        [ModelObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "SubsiteVisit")]
        [SpecifiedValidator(MessageTemplate = "You must specify coordinates for this subsite, its containing site, or any contained measurement.", Ruleset = "Import", Tag = "SubsiteVisit")]
        public virtual Coordinates Coordinates
        {
            get
            {
                if (CoordinatesCalculated)
                {
                    if (TreeMeasurementCentralCoordinates.IsSpecified)
                    {
                        m_Coordinates = TreeMeasurementCentralCoordinates;
                    }
                    else if (SiteVisit.CoordinatesEntered && SiteVisit.Coordinates.IsSpecified && SiteVisit.Coordinates.IsValid)
                    {
                        m_Coordinates = SiteVisit.Coordinates;
                    }
                    else
                    {
                        m_Coordinates = Coordinates.Null();
                    }
                }
                return m_Coordinates;
            }
            set
            {
                m_Coordinates = value;
            }
        }

        public virtual bool CoordinatesCalculatedFromContainedTreeMeasurements
        {
            get 
            { 
                return CoordinatesCalculated 
                    && TreeMeasurementCentralCoordinates.IsSpecified; 
            }
        }

        public virtual bool CoordinatesCalculatedFromContainingSiteVisit
        {
            get 
            {
                return CoordinatesCalculated
                    && !TreeMeasurementCentralCoordinates.IsSpecified
                    && SiteVisit.CoordinatesEntered && SiteVisit.Coordinates.IsSpecified && SiteVisit.Coordinates.IsValid;
            }
        }

        public virtual Coordinates TreeMeasurementCentralCoordinates
        {
            get
            {
                CoordinateBounds cb = CoordinateBounds.Null();
                foreach (TreeMeasurement tm in TreeMeasurements)
                {
                    if (tm.CoordinatesEntered && tm.Coordinates.IsSpecified && tm.Coordinates.IsValid)
                    {
                        cb.Extend(tm.Coordinates);
                    }
                }
                return cb.Center;
            }
        }

        public virtual bool CoordinatesCalculated { get; set; }

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
                    results.AddResult(new ValidationResult("Latitude must be specified.", Coordinates.Latitude, "Coordinates.Latitude", "SubsiteVisit", null));
                }
                if (!Coordinates.Longitude.IsSpecified)
                {
                    results.AddResult(new ValidationResult("Longitude must be specified.", Coordinates.Longitude, "Coordinates.Longitude", "SubsiteVisit", null));
                }
            }
        }

        [DisplayName("*Subsite country:")]
        [NotNullValidator(MessageTemplate = "Subsite country must be specified.", Ruleset = "Screening", Tag = "SubsiteVisit")]
        public virtual Country Country { get; set; }

        [DisplayName("*Subsite state:")]
        [NotNullValidator(MessageTemplate = "Subsite state must be specified.", Ruleset = "Screening", Tag = "SubsiteVisit")]
        public virtual State State { get; set; }

        private string m_County;
        [DisplayName("*Subsite county:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Subsite county must be specified.", Ruleset = "Screening", Tag = "SubsiteVisit")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Site county must not exceed 100 characters.", Ruleset = "Persistence", Tag = "SubsiteVisit")]
        public virtual string County
        {
            get { return m_County; }
            set { m_County = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_OwnershipType;
        [DisplayName("*Ownership type:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Subsite ownership type name must be specified.", Ruleset = "Screening", Tag = "SubsiteVisit")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Subsite ownership type must not exceed 100 characters.", Ruleset = "Persistence", Tag = "SubsiteVisit")]
        public virtual string OwnershipType
        {
            get { return m_OwnershipType; }
            set { m_OwnershipType = (value ?? string.Empty).Trim(); }
        }

        private string m_OwnershipContactInfo;
        [DisplayName("Ownership contact:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(200, MessageTemplate = "Subsite ownership contact info must not exceed 200 characters.", Ruleset = "Persistence", Tag = "SubsiteVisit")]
        public virtual string OwnershipContactInfo
        {
            get { return m_OwnershipContactInfo; }
            set { m_OwnershipContactInfo = (value ?? string.Empty).Trim(); }
        }

        [DisplayName("Make public")]
        public virtual bool MakeOwnershipContactInfoPublic { get; set; }

        [DisplayName("Keep private")]
        public virtual bool KeepOwnershipContactInfoPrivate
        {
            get { return !MakeOwnershipContactInfoPublic; }
            set { MakeOwnershipContactInfoPublic = !value; }
        }

        private string m_Comments;
        [DisplayName("Subsite comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Subsite comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "SubsiteVisit")]
        public virtual string Comments
        {
            get { return m_Comments; }
            set { m_Comments = (value ?? string.Empty).Trim(); }
        }

        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Persistence", Ruleset = "Persistence")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Import", Ruleset = "Import")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Screening", Ruleset = "Screening")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Optional", Ruleset = "Optional")]
        [CollectionCountWhenNotNullValidator(1, int.MaxValue, MessageTemplate = "You must add tree measurements to this subsite.", Ruleset = "Screening", Tag = "TreeMeasurements")]
        [CollectionCountWhenNotNullValidator(0, 10000, MessageTemplate = "This subsite contains too many tree measurements.", Ruleset = "Screening", Tag = "TreeMeasurements")]
        public virtual IList<TreeMeasurement> TreeMeasurements { get; private set; }

        public virtual TreeMeasurement AddTreeMeasurement()
        {
            TreeMeasurement tm = TreeMeasurement.Create(this);
            TreeMeasurements.Add(tm);
            return tm;
        }

        public virtual bool RemoveTreeMeasurement(TreeMeasurement tm)
        {
            return TreeMeasurements.Remove(tm);
        }

        public virtual bool HasTreeMeasurements
        {
            get { return TreeMeasurements.Count > 0; }
        }

        public virtual ValidationResults ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers()
        {
            return this.Validate("Screening", "Persistence")
                .FindAll(TagFilter.Include, "SubsiteVisit");
        }

        public virtual ValidationResults ValidateIgnoringCoordinates()
        {
            return this.Validate("Screening", "Persistence");
        }

        internal static SubsiteVisit Create(SiteVisit sv)
        {
            return new SubsiteVisit()
            {
                Name = string.Empty,
                CoordinatesEntered = sv.CoordinatesEntered && sv.Coordinates.IsSpecified && sv.Coordinates.IsValid,
                Coordinates = sv.CoordinatesEntered && sv.Coordinates.IsSpecified && sv.Coordinates.IsValid ? sv.Coordinates : Coordinates.Null(),
                OwnershipType = string.Empty,
                OwnershipContactInfo = string.Empty,
                Comments = string.Empty,
                TreeMeasurements = new List<TreeMeasurement>(),
                Country = sv.Trip.DefaultCountry,
                State = sv.Trip.DefaultState,
                County = sv.Trip.DefaultCounty,
                SiteVisit = sv,
                MakeOwnershipContactInfoPublic = true
            };
        }
    }
}
