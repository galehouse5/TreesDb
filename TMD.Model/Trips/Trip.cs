using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Model.Trips
{
    public class Trip : EntityBase, IEntity, IIsValid, IIsConflicting
    {
        private string m_Website;
        private string m_MeasurerContact;

        private Trip()
        {
            this.Date = DateTime.Now;
            this.SiteVisits = new List<SiteVisit>();
        }

        public DateTime Date { get; set; }
        public string Website 
        {
            get { return m_Website; }
            set { m_Website = value.Trim(); }
        }
        public bool PhotosAvailable { get; set; }
        public string MeasurerContact 
        {
            get { return m_MeasurerContact; }
            set { m_MeasurerContact = value.Trim(); }
        }
        public bool Reviewed { get; private set; }
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

        public SubsiteVisit AddSubsite(Subsite s)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site == s.Site)
                {
                    return sv.AddSubsite(s);
                }
            }
            return null;
        }

        public bool RemoveSubsite(Subsite s)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site == s.Site)
                {
                    return sv.RemoveSubsite(s);
                }
            }
            return false;
        }

        public bool AddMeasurement(Site s, Measurement m)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site == s)
                {
                    sv.AddMeasurement(m);
                    return true;
                }
            }
            return false;
        }

        public bool RemoveMeasurement(Site s, Measurement m)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site == s)
                {
                    return sv.RemoveMeasurement(m);
                }
            }
            return false;
        }

        public bool AddSubsiteMeasurement(Subsite s, Measurement m)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site == s.Site)
                {
                    sv.AddSubsiteMeasurement(s, m);
                    return true;
                }
            }
            return false;
        }

        public bool RemoveSubsiteMeasurement(Subsite s, Measurement m)
        {
            foreach (SiteVisit sv in SiteVisits)
            {
                if (sv.Site == s.Site)
                {
                    sv.RemoveSubsiteMeasurement(s, m);
                    return true;
                }
            }
            return false;
        }

        #region IIsValid Members

        public bool IsValid
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
                return SiteVisits.Count > 0;
            }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            foreach (SiteVisit sv in SiteVisits)
            {
                if (!sv.IsValid)
                {
                    errors.AddRange(sv.GetValidationErrors());
                }
            }
            if (SiteVisits.Count == 0)
            {
                errors.Add("Trip must contain site visits.");
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
                if (sv.IsConflicting)
                {
                    errors.AddRange(sv.GetConflicts());
                }
            }
            return errors;
        }

        #endregion
    }
}
