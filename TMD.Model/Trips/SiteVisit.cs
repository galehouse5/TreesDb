using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using System.Diagnostics;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using System.ComponentModel;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using TMD.Model.Users;

namespace TMD.Model.Trips
{
    [Serializable]
    [DebuggerDisplay("{Name}")]
    [HasSelfValidation]
    public class SiteVisit : BaseUserCreatedEntity
    {
        protected SiteVisit()
        { }

        public virtual Trip Trip { get; private set; }

        private string m_Name;
        [DisplayName("*Site name:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Site name must be specified.", Ruleset = "Screening", Tag = "SiteVisit")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Site name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "SiteVisit")]
        public virtual string Name
        {
            get { return m_Name; }
            set { m_Name = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private Coordinates m_Coordinates;
        [ModelObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "SiteVisit")]
        [SpecifiedValidator(MessageTemplate = "You must specify coordinates for this site or any contained subsite.", Ruleset = "Import", Tag = "SiteVisit")]
        public virtual Coordinates Coordinates
        {
            get
            {
                if (CoordinatesCalculated)
                {
                    if (doesSomeContainedSubsiteVisitHaveEneteredCoordinates())
                    {
                        m_Coordinates = calculateCentralSubsiteVisitCoordinates();
                    }
                }
                return m_Coordinates;
            }
            set
            {
                m_Coordinates = value;
            }
        }

        public virtual Coordinates SubsiteVisitCentralCoordinates
        {
            get
            {
                CoordinateBounds cb = CoordinateBounds.Null();
                foreach (SubsiteVisit ssv in SubsiteVisits)
                {
                    if (ssv.CoordinatesEntered && ssv.Coordinates.IsSpecified)
                    {
                        cb.Extend(ssv.Coordinates);
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
                    results.AddResult(new ValidationResult("Latitude must be specified.", Coordinates.Latitude, "Coordinates.Latitude", "SiteVisit", null));
                }
                if (!Coordinates.Longitude.IsSpecified)
                {
                    results.AddResult(new ValidationResult("Longitude must be specified.", Coordinates.Longitude, "Coordinates.Longitude", "SiteVisit", null));
                }
            }
        }

        private string m_Comments;
        [DisplayName("Site comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Site comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "SiteVisit")]
        public virtual string Comments
        {
            get { return m_Comments; }
            set { m_Comments = (value ?? string.Empty).Trim(); }
        }

        private bool doesSomeContainedSubsiteVisitHaveEneteredCoordinates()
        {
            foreach (SubsiteVisit ssv in SubsiteVisits)
            {
                if (ssv.CoordinatesEntered && ssv.Coordinates.IsSpecified)
                {
                    return true;
                }
            }
            return false;
        }

        private Coordinates calculateCentralSubsiteVisitCoordinates()
        {
            CoordinateBounds cb = CoordinateBounds.Null();
            foreach (SubsiteVisit ssv in SubsiteVisits)
            {
                if (ssv.CoordinatesEntered && ssv.Coordinates.IsSpecified)
                {
                    cb.Extend(ssv.Coordinates);
                }
            }
            return cb.Center;
        }

        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Persistence", Ruleset = "Persistence")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Import", Ruleset = "Import")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Screening", Ruleset = "Screening")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Optional", Ruleset = "Optional")]
        [CollectionCountWhenNotNullValidator(1, int.MaxValue, MessageTemplate = "Site must contain at least one subsite.", Ruleset = "Screening", Tag = "SubsiteVisits")]
        [CollectionCountWhenNotNullValidator(int.MinValue, 100, MessageTemplate = "Site contains too many subsites.", Ruleset = "Screening", Tag = "SubsiteVisits")]
        public virtual IList<SubsiteVisit> SubsiteVisits { get; private set; }

        public virtual SubsiteVisit AddSubsiteVisit()
        {
            SubsiteVisit subsite = SubsiteVisit.Create(this);
            SubsiteVisits.Add(subsite);
            return subsite;
        }

        public virtual SubsiteVisit AddSubsiteVisit(SubsiteVisit ssv)
        {
            ssv.SetPrivatePropertyValue<SiteVisit>("SiteVisit", this);
            SubsiteVisits.Add(ssv);
            return ssv;
        }

        public virtual bool RemoveSubsiteVisit(SubsiteVisit subsite)
        {
            return SubsiteVisits.Remove(subsite);
        }

        public virtual bool HasSubsiteVisits
        {
            get { return SubsiteVisits.Count > 0; }
        }

        public virtual bool AllSubsiteVisitsHaveTreeMeasurements
        {
            get
            {
                foreach (SubsiteVisit ssv in SubsiteVisits)
                {
                    if (!ssv.HasTreeMeasurements)
                    {
                        return false;
                    }
                }
                return true;
            }
        }

        public virtual ValidationResults ValidateIgnoringCoordinatesSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
        {
            return this.Validate("Screening", "Persistence")
                .FindAll(TagFilter.Include, "SiteVisit");
        }

        public virtual ValidationResults ValidateIgnoringCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers()
        {
            return this.Validate("Screening", "Persistence")
                .FindAll(TagFilter.Include, "SiteVisit", "SubsiteVisits", "SubsiteVisit");
        }

        public virtual SubsiteVisit GetSubsiteVisit(int id)
        {
            foreach (SubsiteVisit ssv in SubsiteVisits)
            {
                if (ssv.Id == id)
                {
                    return ssv;
                }
            }
            return null;
        }

        public virtual bool HasBeenModifiedSinceCreation
        {
            get
            {
                return !Name.Equals(string.Empty)
                    || !CoordinatesCalculated
                    || Coordinates != Coordinates.Null()
                    || SubsiteVisits.Count != 0
                    || !Comments.Equals(string.Empty);
            }
        }

        internal static SiteVisit Create(Trip t)
        {
            return new SiteVisit()
            {
                Name = string.Empty,
                CoordinatesCalculated = true,
                Coordinates = t.SiteVisitCentralCoordinates,
                SubsiteVisits = new List<SubsiteVisit>(),
                Comments = string.Empty,
                Trip = t
            };
        }
    }
}
