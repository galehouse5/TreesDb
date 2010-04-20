using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Sites;
using TMD.Model.Trees;
using TMD.Model.Validation;
using TMD.Common;

namespace TMD.Model.Trips
{
    [Serializable]
    public class Trip : EntityBase, IEntity, IIsValid, IIsConflicting
    {
        private string m_Name;
        private string m_Website;
        private string m_MeasurerContactInfo;

        protected Trip()
        { }

        [StringMaxLengthValidator("Trip name must not exceed 100 characters.", 100)]
        public string Name
        {
            get { return m_Name; }
            set { m_Name = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        [DateRangeValidator("Trip date must be specified.", "1/1/1753", "1/1/9999")]
        public Date Date { get; set; }

        [StringMaxLengthValidator("Trip website must not exceed 100 characters.", 100)]
        public string Website 
        {
            get { return m_Website; }
            set { m_Website = (value ?? string.Empty).Trim(); }
        }

        public bool PhotosAvailable { get; set; }

        [EmptyStringValidator("Trip measurer contact info must be specified.")]
        [StringMaxLengthValidator("Trip measurer contact info must not exceed 200 characters.", 200)]
        public string MeasurerContactInfo 
        {
            get { return m_MeasurerContactInfo; }
            set { m_MeasurerContactInfo = (value ?? string.Empty).Trim(); }
        }

        [EmptyCollectionValidator("Trip must contain site visits.")]
        private IList<SiteVisit> SiteVisits { get; set; }

        public bool AllSitesAndSubsitesHaveMeasuredTrees
        {
            get
            {
                foreach (SiteVisit sv in SiteVisits)
                {
                    if (!sv.HasMeasuredTrees)
                    {
                        return false;
                    }
                }
                return true;
            }
        }

        public bool HasSiteVisits
        {
            get { return SiteVisits.Count > 0; }
        }

        public bool AreSiteVisitsValidIgnoringCoordinatesAndMeasuredTrees
        {
            get
            {
                foreach (SiteVisit sv in SiteVisits)
                {
                    if (!sv.IsValidIgnoringCoordinatesAndMeasuredTrees)
                    {
                        return false;
                    }
                }
                return true;
            }
        }

        public bool IsValidIgnoringSiteVisits
        {
            get { return base.isValidExcludingProperties("SiteVisits"); }
        }

        public IList<SiteVisit> ListSiteVisists()
        {
            IOrderedEnumerable<SiteVisit> svs = SiteVisits.OrderByDescending(sv => sv.Created);
            return svs.ToList();
        }

        public void AddSiteVisist(SiteVisit sv)
        {
            SiteVisits.Add(sv);
        }

        public bool RemoveSiteVisit(SiteVisit sv)
        {
            return SiteVisits.Remove(sv);
        }

        public SiteVisit GetSiteVisitById(Guid id)
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

        #region IIsValid Members

        public override bool IsValid
        {
            get 
            {
                foreach (SiteVisit sv in SiteVisits)
                {
                    if (!sv.IsValid)
                    {
                        return false;
                    }
                }
                return base.IsValid;
            }
        }

        public int SiteVisistCount
        {
            get { return SiteVisits.Count; }
        }

        public override IList<ValidationError> GetValidationErrors()
        {
            List<ValidationError> errors = new List<ValidationError>();
            errors.AddRange(base.GetValidationErrors());
            foreach (SiteVisit sv in SiteVisits)
            {
                errors.AddRange(sv.GetValidationErrors());
            }
            return errors;
        }

        #endregion

        #region IIsConflicting Members

        public bool IsConflicting
        {
            get 
            {
                foreach (SiteVisit sv in SiteVisits)
                {
                    if (sv.IsConflicting)
                    {
                        return true;
                    }
                }
                return false;
            }
        }

        public IList<string> GetConflicts()
        {
            List<string> errors = new List<string>();
            foreach (SiteVisit sv in SiteVisits)
            {
                errors.AddRange(sv.GetConflicts());
            }
            return errors;
        }

        #endregion

        public static Trip Create()
        {
            Trip t = new Trip();
            t.Date = Date.Null;
            t.SiteVisits = new List<SiteVisit>();
            t.PhotosAvailable = false;
            t.MeasurerContactInfo = string.Empty;
            t.Name = string.Empty;
            t.Website = string.Empty;
            t.MeasurerContactInfo = string.Empty;
            return t;
        }
    }
}
