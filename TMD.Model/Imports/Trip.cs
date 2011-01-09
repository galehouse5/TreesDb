using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Locations;
using TMD.Model.Validation;
using TMD.Model.Extensions;
using NHibernate.Validator.Constraints;

namespace TMD.Model.Imports
{
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

        public virtual DateTime LastSaved { get; protected internal set; }

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

        [Valid, Size(1, 100, Message = "You must add site visits to your trip.", Tags = Tag.Screening)]
        public virtual IList<Site> Sites { get; private set; }

        [Valid, Size2(1, int.MaxValue, Message = "You must record at least one measurer.", Tags = Tag.Screening)]
        [Size2(0, 3, Message = "You have recorded too many measurers.", Tags = new [] { Tag.Screening, Tag.Persistence })]
        public virtual IList<Measurer> Measurers { get; private set; }

        public virtual bool IsMerged { get { return Merged != null; } }
        public virtual DateTime? Merged { get; protected internal set; }

        public virtual bool CanCalculateCoordinates()
        {
            return Sites.Where(s => s.CanCalculateCoordinates(true)).Count() > 0;
        }

        public virtual Coordinates CalculateCoordinates()
        {
            return CoordinateBounds.Create(Sites
                .Where(s => s.CanCalculateCoordinates(true)).Select(s => s.CalculateCoordinates(true)))
                .Center;
        }

        public virtual string DefaultClinometerBrand { get; protected internal set; }
        public virtual string DefaultLaserBrand { get; protected internal set; }
        public virtual TreeHeightMeasurementMethod DefaultHeightMeasurementMethod { get; protected internal set; }
        public virtual Country DefaultCountry { get; protected internal set; }
        public virtual State DefaultState { get; protected internal set; }
        public virtual string DefaultCounty { get; protected internal set; }

        public virtual Site AddSite()
        {
            Site sv = Site.Create(this);
            Sites.Add(sv);
            return sv;
        }

        public virtual bool RemoveSite(Site sv)
        {
            return Sites.Remove(sv);
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

        public virtual Site FindSiteById(int id)
        {
            return Sites.FirstOrDefault(s => id.Equals(s.Id));
        }

        public virtual Subsite FindSubsiteById(int id)
        {
            var site = Sites.FirstOrDefault(s => s.FindSubsiteById(id) != null);
            return site == null ? null : site.FindSubsiteById(id);
        }

        public virtual TreeBase FindTreeById(int id)
        {
            var site = Sites.FirstOrDefault(s => s.FindTreeById(id) != null);
            return site == null ? null : site.FindTreeById(id);
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
                Sites = new List<Site>(),
                Measurers = new List<Measurer>(),
                DefaultClinometerBrand = string.Empty,
                DefaultLaserBrand = string.Empty,
                DefaultCountry = Repositories.Locations.FindCountryByCode("US"),
                DefaultState = null,
                MakeMeasurerContactInfoPublic = true
            }.RecordCreation() as Trip;
        }
    }
}
