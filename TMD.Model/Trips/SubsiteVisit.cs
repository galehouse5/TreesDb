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

namespace TMD.Model.Trips
{
    [Serializable]
    [DebuggerDisplay("{Name}")]
    [HasSelfValidation]
    public class SubsiteVisit : IEntity
    {
        protected SubsiteVisit()
        { }

        public virtual int Id { get; private set; }
        public virtual SiteVisit SiteVisit { get; private set; }

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
        [ValueObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "SubsiteVisit")]
        [SpecifiedValidator(MessageTemplate = "Subsite coordinates must be specified.", Ruleset = "Import", Tag = "SubsiteVisit")]
        public virtual Coordinates Coordinates
        {
            get
            {
                if (CoordinatesCalculated && Measurements.Count > 0)
                {
                    m_Coordinates = calculateAverageCoordinates();
                }
                return m_Coordinates;
            }
            set
            {
                m_Coordinates = value;
            }
        }

        public virtual bool CoordinatesCalculated { get; set; }

        public virtual bool CoordinatesEntered
        {
            get { return !CoordinatesCalculated; }
            set { CoordinatesCalculated = !value; }
        }

        [SelfValidation(Ruleset = "Screening")]
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

        private Coordinates calculateAverageCoordinates()
        {
            List<Coordinates> coords = new List<Coordinates>();
            foreach (TreeMeasurement tm in Measurements)
            {
                if (tm.Coordinates.IsSpecified)
                {
                    coords.Add(tm.Coordinates);
                }
            }
            CoordinateBounds cb = CoordinateBounds.Create(coords);
            return cb.Center;
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

        private string m_Comments;
        [DisplayName("Subsite comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Subsite comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "SubsiteVisit")]
        public virtual string Comments
        {
            get { return m_Comments; }
            set { m_Comments = (value ?? string.Empty).Trim(); }
        }

        [ObjectCollectionValidator(TargetRuleset = "Persistence", Ruleset = "Persistence")]
        [ObjectCollectionValidator(TargetRuleset = "Import", Ruleset = "Import")]
        [ObjectCollectionValidator(TargetRuleset = "Screening", Ruleset = "Screening")]
        [CollectionCountWhenNotNullValidator(1, int.MaxValue, MessageTemplate = "Subsite must have measurements.", Ruleset = "Screening", Tag = "TreeMeasurements")]
        [CollectionCountWhenNotNullValidator(0, 10000, MessageTemplate = "Subsites Measurement cannot be attributed to more than three measurers.", Ruleset = "Screening", Tag = "TreeMeasurements")]
        public virtual IList<TreeMeasurement> Measurements { get; private set; }

        public virtual TreeMeasurement AddMeasurement()
        {
            TreeMeasurement tm = TreeMeasurement.Create(this);
            Measurements.Add(tm);
            return tm;
        }

        public virtual bool RemoveMeasurement(TreeMeasurement tm)
        {
            return Measurements.Remove(tm);
        }

        public virtual bool HasTreeMeasurements
        {
            get { return Measurements.Count > 0; }
        }

        public virtual ValidationResults ValidateIgnoringCoordinatesTreeMeasurementsAndTreeMeasurers()
        {
            return this.Validate("Screening", "Persistence")
                .FindAll(TagFilter.Include, "SubsiteVisit");
        }

        internal static SubsiteVisit Create(SiteVisit sv)
        {
            return new SubsiteVisit()
            {
                Name = string.Empty,
                Coordinates = sv.Coordinates,
                CoordinatesCalculated = true,
                County = string.Empty,
                OwnershipType = string.Empty,
                OwnershipContactInfo = string.Empty,
                Comments = string.Empty,
                Measurements = new List<TreeMeasurement>(),
                Country = LocationService.FindCountryByCode("US"),
                SiteVisit = sv
            };
        }
    }
}
