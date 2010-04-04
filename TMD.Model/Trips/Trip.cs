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

        private Trip()
        { }

        [StringMaxLengthValidator("Trip name must not exceed 100 characters.", 100)]
        public string Name
        {
            get { return m_Name; }
            set { m_Name = value.Trim().ToTitleCase(); }
        }

        [DateTimeRangeValidator("Trip date must be specified.", "1/1/1753", "1/1/9999")]
        public DateTime Date { get; set; }

        [StringMaxLengthValidator("Trip website must not exceed 100 characters.", 100)]
        public string Website 
        {
            get { return m_Website; }
            set { m_Website = value.Trim(); }
        }

        public bool PhotosAvailable { get; set; }

        [EmptyStringValidator("Trip measurer contact info must be specified.")]
        [StringMaxLengthValidator("Trip measurer contact info must not exceed 200 characters.", 200)]
        public string MeasurerContactInfo 
        {
            get { return m_MeasurerContactInfo; }
            set { m_MeasurerContactInfo = value.Trim(); }
        }

        [EmptyCollectionValidator("Trip must contain site visits.")]
        internal IList<SiteVisit> SiteVisits { get; private set; }

        public SiteVisit AddSite(Site s)
        {
            SiteVisit sv = new SiteVisit(s);
            SiteVisits.Add(sv);
            return sv;
        }

        public bool RemoveSite(Site s)
        {
            for (int i = SiteVisits.Count - 1; i >= 0; i--)
            {
                SiteVisit sv = SiteVisits[i];
                if (sv.Site == s)
                {
                    SiteVisits.RemoveAt(i);
                    return true;
                }
            }
            return false;
        }

        public SubsiteVisit AddSubsite(Site s, Subsite ss)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site == s)
                {
                    return sv.AddSubsite(ss);
                }
            }
            return null;
        }

        public bool RemoveSubsite(Site s, Subsite ss)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site == s)
                {
                    return sv.RemoveSubsite(ss);
                }
            }
            return false;
        }

        public bool AddSiteMeasuredTree(Site s, Tree t)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site == s)
                {
                    sv.AddMeasuredTree(t);
                    return true;
                }
            }
            return false;
        }

        public bool RemoveSiteMeasuredTree(Site s, Tree t)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site == s)
                {
                    return sv.RemoveMeasuredTree(t);
                }
            }
            return false;
        }

        public bool AddSubsiteMeasuredTree(Subsite s, Tree t)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site.Subsites.Contains(s))
                {
                    sv.AddSubsiteMeasuredTree(s, t);
                    return true;
                }
            }
            return false;
        }

        public bool RemoveSubsiteMeasuredTree(Subsite s, Tree t)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site.Subsites.Contains(s))
                {
                    sv.RemoveSubsiteMeasuredTree(s, t);
                    return true;
                }
            }
            return false;
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

        public override IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
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
            t.Date = DateTime.Now;
            t.SiteVisits = new List<SiteVisit>();
            t.PhotosAvailable = false;
            t.MeasurerContactInfo = string.Empty;
            t.Name = string.Empty;
            return t;
        }
    }
}
