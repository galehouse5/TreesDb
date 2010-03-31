using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Model.Trips
{
    public class SiteVisit : EntityBase, IEntity, IIsValid
    {
        private Coordinates m_Coordinates;
        private string m_OwnershipType;
        private string m_OwnershipContactInfo;
        private string m_SiteComments;

        private SiteVisit()
        { }

        internal SiteVisit(Site site)
        {
            this.Site = site;
            m_Coordinates = Coordinates.Null();
            this.SubsiteVisits = new List<SubsiteVisit>();
            this.Measurements = new List<Measurement>();
        }

        public Site Site { get; set; }
        public string OwnershipType 
        {
            get { return m_OwnershipType; }
            set { m_OwnershipType = value.Trim(); }
        }
        public string OwnershipContactInfo 
        {
            get { return m_OwnershipContactInfo; }
            set { m_OwnershipContactInfo = value.Trim(); }
        }
        public string SiteComments 
        {
            get { return m_SiteComments; }
            set { m_SiteComments = value.Trim(); }
        }

        public Coordinates Coordinates
        {
            get
            {
                if (m_Coordinates.IsNull)
                {
                    m_Coordinates = calculateCoordinates();
                    CoordinatesCalculated = true;
                }
                return m_Coordinates;
            }
            set
            {
                m_Coordinates = value;
                CoordinatesCalculated = false;
            }
        }

        public bool CoordinatesCalculated { get; private set; }
        internal IList<SubsiteVisit> SubsiteVisits { get; private set; }
        internal IList<Measurement> Measurements { get; private set; }

        internal void AddMeasurement(Measurement m)
        {
            invalidateCoordinatesCalculation();
            Measurements.Add(m);
        }

        internal bool RemoveMeasurement(Measurement measurement)
        {
            invalidateCoordinatesCalculation();
            return Measurements.Remove(measurement);
        }

        internal bool AddSubsiteMeasurement(Subsite s, Measurement m)
        {
            foreach (SubsiteVisit sv in SubsiteVisits)
            {
                if (sv.Subsite == s)
                {
                    sv.AddMeasurement(m);
                    invalidateCoordinatesCalculation();
                    return true;
                }
            }
            return false;
        }

        internal bool RemoveSubsiteMeasurement(Subsite s, Measurement m)
        {
            foreach (SubsiteVisit sv in SubsiteVisits)
            {
                if (sv.Subsite == s)
                {
                    invalidateCoordinatesCalculation();
                    return sv.RemoveMeasurement(m);
                }
            }
            return false;
        }

        internal SubsiteVisit AddSubsite(Subsite s)
        {
            SubsiteVisit sv = new SubsiteVisit(this, s);
            SubsiteVisits.Add(sv);
            return sv;
        }

        internal bool RemoveSubsite(Subsite s)
        {
            for (int i = SubsiteVisits.Count - 1; i >= 0; i--)
            {
                SubsiteVisit sv = SubsiteVisits[i];
                if (sv.Subsite == s)
                {
                    SubsiteVisits.RemoveAt(i);
                    invalidateCoordinatesCalculation();
                    return true;
                }
            }
            return false;
        }

        private Coordinates calculateCoordinates()
        {
            List<Coordinates> coordinatesList = new List<Coordinates>();
            foreach (Measurement m in Measurements)
            {
                coordinatesList.Add(m.Coordinates);
            }
            foreach (SubsiteVisit sv in SubsiteVisits)
            {
                foreach (Measurement m in sv.Measurements)
                {
                    coordinatesList.Add(m.Coordinates);
                }
            }
            CoordinateBounds cb = CoordinateBounds.Create(coordinatesList);
            return cb.Center;
        }

        private void invalidateCoordinatesCalculation()
        {
            if (CoordinatesCalculated)
            {
                m_Coordinates = Coordinates.Null();
            }
        }

        #region IIsValid Members

        public bool IsValid
        {
            get 
            {
                foreach (SubsiteVisit sv in SubsiteVisits)
                {
                    if (!sv.IsValid)
                    {
                        return false;
                    }
                }
                return !Coordinates.IsNull && Measurements.Count > 0; 
            }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            if (Coordinates.IsNull)
            {
                errors.Add("Site coordinates must be specified or contained measurements must have specified coordinates.");
            }
            if (Measurements.Count == 0)
            {
                errors.Add("Site must contain measurements.");
            }
            foreach (SubsiteVisit sv in SubsiteVisits)
            {
                if (!sv.IsValid)
                {
                    errors.AddRange(sv.GetValidationErrors());
                }
            }
            return errors;
        }

        #endregion

        #region IIsConflicting Members

        public bool IsConflicting
        {
            get 
            {
                foreach (SubsiteVisit sv in SubsiteVisits)
                {
                    if (sv.IsConflicting)
                    {
                        return true;
                    }
                }
                return !CoordinatesCalculated && CoordinateDistance.Calculate(Coordinates, calculateCoordinates()).TotalMinutes > 1f;
            }
        }

        public IList<string> GetConflicts()
        {
            List<string> errors = new List<string>();
            if (!CoordinatesCalculated && CoordinateDistance.Calculate(Coordinates, calculateCoordinates()).TotalMinutes > 1f)
            {
                errors.Add("Site specified coordinates diverge from calculated coordinates by more than one minute.");
            }
            foreach (SubsiteVisit sv in SubsiteVisits)
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
