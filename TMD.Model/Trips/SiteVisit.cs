using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Sites;
using TMD.Model.Trees;
using TMD.Model.Validation;

namespace TMD.Model.Trips
{
    [Serializable]
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
            this.MeasuredTrees = new List<Tree>();
        }

        public Site Site { get; private set; }

        [EmptyStringValidator("Site ownership type must be specified.")]
        [StringMaxLengthValidator("Site ownership type must not exceed 100 characters.", 100)]
        public string OwnershipType 
        {
            get { return m_OwnershipType; }
            set { m_OwnershipType = value.Trim(); }
        }

        [StringMaxLengthValidator("Site ownership contact info must not exceed 200 characters.", 200)]
        public string OwnershipContactInfo 
        {
            get { return m_OwnershipContactInfo; }
            set { m_OwnershipContactInfo = value.Trim(); }
        }

        [StringMaxLengthValidator("Site comments must not exceed 300 characters.", 300)]
        public string SiteComments 
        {
            get { return m_SiteComments; }
            set { m_SiteComments = value.Trim(); }
        }

        [IsNullValidator("Site coordinates must be specified or contained measurements must have specified coordinates.")]
        public Coordinates Coordinates
        {
            get
            {
                if (m_Coordinates.IsNull)
                {
                    m_Coordinates = calculateCoordinates();
                    Site.Coordinates = m_Coordinates;
                    CoordinatesCalculated = true;
                }
                return m_Coordinates;
            }
            set
            {
                m_Coordinates = value;
                Site.Coordinates = m_Coordinates;
                CoordinatesCalculated = false;
            }
        }

        public bool CoordinatesCalculated { get; private set; }
        internal IList<SubsiteVisit> SubsiteVisits { get; private set; }

        internal IList<Tree> MeasuredTrees { get; private set; }

        internal void AddMeasuredTree(Tree t)
        {
            invalidateCoordinatesCalculation();
            MeasuredTrees.Add(t);
        }

        internal bool RemoveMeasuredTree(Tree t)
        {
            invalidateCoordinatesCalculation();
            return MeasuredTrees.Remove(t);
        }

        internal bool AddSubsiteMeasuredTree(Subsite s, Tree t)
        {
            foreach (SubsiteVisit sv in SubsiteVisits)
            {
                if (sv.Subsite == s)
                {
                    sv.AddMeasuredTree(t);
                    invalidateCoordinatesCalculation();
                    return true;
                }
            }
            return false;
        }

        internal bool RemoveSubsiteMeasuredTree(Subsite s, Tree t)
        {
            foreach (SubsiteVisit sv in SubsiteVisits)
            {
                if (sv.Subsite == s)
                {
                    invalidateCoordinatesCalculation();
                    return sv.RemoveMeasuredTree(t);
                }
            }
            return false;
        }

        internal SubsiteVisit AddSubsite(Subsite s)
        {
            SubsiteVisit sv = new SubsiteVisit(s);
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
            foreach (Tree t in MeasuredTrees)
            {
                coordinatesList.Add(t.CurrentMeasurement.Coordinates);
            }
            foreach (SubsiteVisit sv in SubsiteVisits)
            {
                foreach (Tree t in sv.MeasuredTrees)
                {
                    coordinatesList.Add(t.CurrentMeasurement.Coordinates);
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

        public override bool IsValid
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
                bool containsMeasurements = MeasuredTrees.Count > 0;
                foreach (SubsiteVisit sv in SubsiteVisits)
                {
                    if (sv.MeasuredTrees.Count > 0)
                    {
                        containsMeasurements = true;
                    }
                }
                return containsMeasurements && base.IsValid;
            }
        }

        public override IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            bool containsMeasurements = MeasuredTrees.Count > 0;
            foreach (SubsiteVisit sv in SubsiteVisits)
            {
                if (sv.MeasuredTrees.Count > 0)
                {
                    containsMeasurements = true;
                }
            }
            if (!containsMeasurements)
            {
                errors.Add("Site or contained subsites must have measurements.");
            }
            errors.AddRange(base.GetValidationErrors());
            foreach (SubsiteVisit sv in SubsiteVisits)
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
                errors.AddRange(sv.GetConflicts());
            }
            return errors;
        }

        #endregion
    }
}
