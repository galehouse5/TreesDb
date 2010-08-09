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
    public class Trip : BaseUserCreatedEntity
    {
        protected Trip()
        { }

        private string m_Name;
        [DisplayName("*Trip name:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Trip name must be specified.", Ruleset = "Screening", Tag = "Trip")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Trip name must not exceed 100 characters.", Ruleset = "Persistence", Tag = "Trip")]
        public virtual string Name
        {
            get { return m_Name; }
            set { m_Name = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        public virtual DateTime LastSaved { get; private set; }

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

        [DisplayName("Make public")]
        public virtual bool MakeMeasurerContactInfoPublic { get; set; }

        [DisplayName("Keep private")]
        public virtual bool KeepMeasurerContactInfoPrivate
        {
            get { return !MakeMeasurerContactInfoPublic; }
            set { MakeMeasurerContactInfoPublic = !value; }
        }

        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Persistence", Ruleset = "Persistence")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Import", Ruleset = "Import")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Screening", Ruleset = "Screening")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Optional", Ruleset = "Optional")]
        [CollectionCountWhenNotNullValidator(1, 100, MessageTemplate = "Your must add site visits to your trip.", Ruleset = "Screening", Tag = "SiteVisits")]
        public virtual IList<SiteVisit> SiteVisits { get; private set; }

        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Screening", Ruleset = "Screening", Tag = "Measurers")]
        [ModelObjectCollectionValidator(CollectionNamespaceQualificationMode.PrependToKeyAndIndex, TargetRuleset = "Persistence", Ruleset = "Persistence", Tag = "Measurers")]
        [CollectionCountWhenNotNullValidator(1, int.MaxValue, MessageTemplate = "You must record at least one measurer.", Ruleset = "Screening", Tag = "Measurers")]
        [CollectionCountWhenNotNullValidator(0, 3, MessageTemplate = "You have recorded too many measurers.", Ruleset = "Screening", Tag = "Measurers")]
        public virtual IList<Measurer> Measurers { get; private set; }
        
        public virtual bool IsImported { get; private set; }

        public virtual Coordinates SiteVisitCentralCoordinates
        {
            get
            {
                CoordinateBounds cb = CoordinateBounds.Null();
                foreach (SiteVisit sv in SiteVisits)
                {
                    if (sv.CoordinatesEntered && sv.Coordinates.IsSpecified)
                    {
                        cb.Extend(sv.Coordinates);
                    }
                }
                return cb.Center;
            }
        }

        public virtual bool HasEnteredCoordinates
        {
            get
            {
                foreach (SiteVisit sv in SiteVisits)
                {
                    if (sv.CoordinatesEntered)
                    {
                        return true; 
                    }
                    foreach (SubsiteVisit ssv in sv.SubsiteVisits)
                    {
                        if (ssv.CoordinatesEntered)
                        {
                            return true;
                        }
                        foreach (TreeMeasurementBase tm in ssv.TreeMeasurements)
                        {
                            if (tm.CoordinatesEntered)
                            {
                                return true;
                            }
                        }
                    }
                }
                return false;
            }
        }

        private string m_DefaultClinometerBrand;
        public virtual string DefaultClinometerBrand
        {
            get { return m_DefaultClinometerBrand; }
            private set { m_DefaultClinometerBrand = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_DefaultLaserBrand;
        public virtual string DefaultLaserBrand
        {
            get { return m_DefaultLaserBrand; }
            private set { m_DefaultLaserBrand = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        public virtual TreeHeightMeasurementMethod DefaultHeightMeasurementMethod { get; private set; }
        public virtual Country DefaultCountry { get; private set; }
        public virtual State DefaultState { get; private set; }

        private string m_DefaultCounty;
        public virtual string DefaultCounty
        {
            get { return m_DefaultCounty; }
            private set { m_DefaultCounty = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

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

        public virtual Measurer AddMeasurer()
        {
            Measurer m = Measurer.Create(this);
            Measurers.Add(m);
            return m;
        }

        public virtual bool RemoveMeasurer(Measurer m)
        {
            return Measurers.Remove(m);
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
                .FindAll(TagFilter.Include, "Trip", "TreeMeasurers", "TreeMeasurer");
        }

        public virtual ValidationResults ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers()
        {
            return this.Validate("Screening", "Persistence")
                .FindAll(TagFilter.Include, "Trip", "TreeMeasurers", "TreeMeasurer", "SiteVisit", "SiteVisits", "SubsiteVisit", "SubsiteVisits");
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
                IsImported = false,
                Measurers = new List<Measurer>(),
                DefaultClinometerBrand = string.Empty,
                DefaultLaserBrand = string.Empty,
                DefaultCountry = LocationService.FindCountryByCode("US"),
                DefaultState = null,
                MakeMeasurerContactInfoPublic = true
            };
        }
    }
}
