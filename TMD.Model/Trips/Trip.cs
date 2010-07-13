using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Locations;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace TMD.Model.Trips
{
    [Serializable]
    public class Trip : IEntity
    {
        protected Trip()
        { }

        public virtual int Id { get; private set; }

        private string m_Name;
        [DisplayName("*Trip name:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Trip name must be specified.", Ruleset = "Screening", Tag = "Trip")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Trip name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "Trip")]
        public virtual string Name
        {
            get { return m_Name; }
            set { m_Name = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        [DisplayName("*Trip date:")]
        [DisplayFormat(ApplyFormatInEditMode = true, DataFormatString = "{0:MM/dd/yyyy}")]
        [NotNullValidator(MessageTemplate = "Trip date must be specified.", Ruleset = "Screening", Tag = "Trip")]
        public virtual DateTime? Date { get; set; }

        private string m_Website;
        
        [DisplayName("Trip website:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Trip website must not exceed 100 characters.", Ruleset = "Persistence", Tag = "Trip")]
        public virtual string Website
        {
            get { return m_Website; }
            set { m_Website = (value ?? string.Empty).Trim(); }
        }

        [DisplayName("Photos available:")]
        public virtual bool PhotosAvailable { get; set; }

        private string m_MeasurerContactInfo;
        [DisplayName("*Measurer contact:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Measurer contact must be specified for this trip.", Ruleset = "Screening", Tag = "Trip")]
        [StringLengthWhenNotNullOrWhitespaceValidator(200, MessageTemplate = "Trip measurer contact info must not exceed 200 characters.", Ruleset = "Persistence", Tag = "Trip")]
        public virtual string MeasurerContactInfo
        {
            get { return m_MeasurerContactInfo; }
            set { m_MeasurerContactInfo = (value ?? string.Empty).Trim(); }
        }

        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Persistence", Ruleset = "Persistence")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Import", Ruleset = "Import")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Screening", Ruleset = "Screening")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Optional", Ruleset = "Optional")]
        [CollectionCountWhenNotNullValidator(1, 100, MessageTemplate = "Your must add site visits to your trip.", Ruleset = "Screening", Tag = "SiteVisits")]
        public virtual IList<SiteVisit> SiteVisits { get; private set; }

        public virtual bool IsImported { get; private set; }

        public virtual SiteVisit AddSiteVisit()
        {
            SiteVisit sv = SiteVisit.Create(this);
            SiteVisits.Add(sv);
            return sv;
        }

        public virtual SiteVisit AddSiteVisit(SiteVisit sv)
        {
            sv.SetPrivatePropertyValue<Trip>("Trip", this);
            SiteVisits.Add(sv);
            return sv;
        }

        public virtual bool RemoveSiteVisit(SiteVisit sv)
        {
            return SiteVisits.Remove(sv);
        }

        public virtual bool HasSiteVisits
        {
            get { return SiteVisits.Count > 0; }
        }

        public virtual bool AllSubsiteVisitsOfAllSiteVisitsHaveTreeMeasurements
        {
            get
            {
                foreach (SiteVisit sv in SiteVisits)
                {
                    if (!sv.AllSubsiteVisitsHaveTreeMeasurements)
                    {
                        return false;
                    }
                }
                return true;
            }
        }

        public virtual ValidationResults ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
        {
            return this.Validate("Screening", "Persistence")
                .FindAll(TagFilter.Include, "Trip");
        }

        public virtual ValidationResults ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers()
        {
            return this.Validate("Screening", "Persistence")
                .FindAll(TagFilter.Include, "Trip", "SiteVisit", "SiteVisits", "SubsiteVisit", "SubsiteVisits");
        }

        public virtual ValidationResults ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates()
        {
            return this.Validate("Screening", "Persistence");
        }

        public virtual ValidationResults ValidateRegardingPersistence()
        {
            return this.Validate("Persistence");
        }

        public virtual ValidationResults ValidateRegardingImport()
        {
            return this.Validate("Screening", "Persistence", "Import");
        }

        public virtual ValidationResults ValidateRegardingOptionalRules()
        {
            return this.Validate("Optional");
        }

        public virtual SiteVisit GetSiteVisit(int id)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Id == id)
                {
                    return sv;
                }
            }
            return null;
        }

        public virtual bool AllSiteVisitsHaveSubsiteVisits
        {
            get
            {
                foreach (SiteVisit sv in SiteVisits)
                {
                    if (!sv.HasSubsiteVisits)
                    {
                        return false;
                    }
                }
                return true;
            }
        }

        public static Trip Create()
        {
            return new Trip()
            {
                Name = string.Empty,
                Date = null,
                Website = string.Empty,
                PhotosAvailable = false,
                MeasurerContactInfo = string.Empty,
                SiteVisits = new List<SiteVisit>(),
                IsImported = false
            };
        }
    }
}
