using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Locations;
using TMD.Model.Validation;
using TMD.Model.Extensions;
using NHibernate.Validator.Constraints;

namespace TMD.Model.Trips
{
    [Serializable]
    public class Trip : UserCreatedEntityBase
    {
        protected Trip()
        { }

        private string m_Name;
        [NotEmptyOrWhitesapce(Message = "Trip name must be specified.", Tags =  Tag.Screening)]
        [Length(100, Message = "Trip name must not exceed 100 characters.", Tags = Tag.Persistence)]
        public virtual string Name
        {
            get { return m_Name; }
            set { m_Name = value.OrEmptyAndTrimToTitleCase(); }
        }

        public virtual DateTime LastSaved { get; private set; }

        [NotNull(Message = "Trip date must be specified.", Tags = Tag.Screening)]
        public virtual DateTime? Date { get; set; }

        private string m_Website;
        [Length(100, Message = "Trip website must not exceed 100 characters.", Tags = Tag.Persistence)]
        public virtual string Website
        {
            get { return m_Website; }
            set { m_Website = value.OrEmptyAndTrim(); }
        }

        public virtual bool PhotosAvailable { get; set; }

        private string m_MeasurerContactInfo;
        [NotEmptyOrWhitesapce(Message = "Measurer contact must be specified for this trip.", Tags = Tag.Screening)]
        [Length(200, Message = "Trip measurer contact info must not exceed 200 characters.", Tags = Tag.Persistence)]
        public virtual string MeasurerContactInfo
        {
            get { return m_MeasurerContactInfo; }
            set { m_MeasurerContactInfo = value.OrEmptyAndTrim(); }
        }

        public virtual bool MakeMeasurerContactInfoPublic { get; set; }

        public virtual bool KeepMeasurerContactInfoPrivate
        {
            get { return !MakeMeasurerContactInfoPublic; }
            set { MakeMeasurerContactInfoPublic = !value; }
        }

        [Valid]
        [Size(1, 100, Message = "You must add site visits to your trip.", Tags = Tag.Screening)]
        public virtual IList<SiteVisit> SiteVisits { get; private set; }

        [Valid]
        [Size2(1, int.MaxValue, Message = "You must record at least one measurer.", Tags = Tag.Screening)]
        [Size2(0, 3, Message = "You have recorded too many measurers.", Tags = new [] { Tag.Screening, Tag.Persistence })]
        public virtual IList<Measurer> Measurers { get; private set; }
        
        public virtual bool IsImported { get; private set; }
        public virtual DateTime? Imported { get; private set; }

        public virtual TimeSpan ImportAge
        {
            get { return IsImported ? DateTime.Now.Subtract(Imported.Value) : TimeSpan.Zero; }
        }

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
            private set { m_DefaultClinometerBrand = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_DefaultLaserBrand;
        public virtual string DefaultLaserBrand
        {
            get { return m_DefaultLaserBrand; }
            private set { m_DefaultLaserBrand = value.OrEmptyAndTrimToTitleCase(); }
        }

        public virtual TreeHeightMeasurementMethod DefaultHeightMeasurementMethod { get; private set; }
        public virtual Country DefaultCountry { get; private set; }
        public virtual State DefaultState { get; private set; }

        private string m_DefaultCounty;
        public virtual string DefaultCounty
        {
            get { return m_DefaultCounty; }
            private set { m_DefaultCounty = value.OrEmptyAndTrimToTitleCase(); }
        }

        public virtual SiteVisit AddSiteVisit()
        {
            SiteVisit sv = SiteVisit.Create(this);
            SiteVisits.Add(sv);
            return sv;
        }

        public virtual SiteVisit AddSiteVisit(SiteVisit sv)
        {
            sv.SetPrivatePropertyValue("Trip", this);
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
                DefaultCountry = Repositories.Locations.FindCountryByCode("US"),
                DefaultState = null,
                MakeMeasurerContactInfoPublic = true
            };
        }
    }
}
