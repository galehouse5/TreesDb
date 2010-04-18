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

        public Site Site { get; private set; }

        [EmptyStringValidator("Site ownership type must be specified.")]
        [StringMaxLengthValidator("Site ownership type must not exceed 100 characters.", 100)]
        public string OwnershipType 
        {
            get { return m_OwnershipType; }
            set { m_OwnershipType = (value ?? string.Empty).Trim(); }
        }

        [StringMaxLengthValidator("Site ownership contact info must not exceed 200 characters.", 200)]
        public string OwnershipContactInfo 
        {
            get { return m_OwnershipContactInfo; }
            set { m_OwnershipContactInfo = (value ?? string.Empty).Trim(); }
        }

        [StringMaxLengthValidator("Site comments must not exceed 300 characters.", 300)]
        public string SiteComments 
        {
            get { return m_SiteComments; }
            set { m_SiteComments = (value ?? string.Empty).Trim(); }
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
        private IList<SubsiteVisit> SubsiteVisits { get; set; }

        public IList<Tree> MeasuredTrees { get; private set; }

        public bool HasMeasuredTrees
        {
            get
            {
                if (SubsiteVisits.Count > 0)
                {
                    foreach (SubsiteVisit sv in SubsiteVisits)
                    {
                        if (!sv.HasMeasuredTrees)
                        {
                            return false;
                        }
                    }
                    return true;
                }
                else
                {
                    return MeasuredTrees.Count > 0;
                }
            }
        }

        public void AddMeasuredTree(Tree t)
        {
            invalidateCoordinatesCalculation();
            MeasuredTrees.Add(t);
        }

        public bool RemoveMeasuredTree(Tree t)
        {
            invalidateCoordinatesCalculation();
            return MeasuredTrees.Remove(t);
        }

        public bool AddSubsiteMeasuredTree(Subsite s, Tree t)
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

        public bool RemoveSubsiteMeasuredTree(Subsite s, Tree t)
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

        public IList<SubsiteVisit> ListSubsiteVisists()
        {
            IOrderedEnumerable<SubsiteVisit> ssvs = SubsiteVisits.OrderByDescending(ssv => ssv.Created);
            return ssvs.ToList();
        }

        public void AddSubsiteVisit(SubsiteVisit ssv)
        {
            SubsiteVisits.Add(ssv);
        }

        public bool RemoveSubsiteVisit(SubsiteVisit ssv)
        {
            return SubsiteVisits.Remove(ssv);
        }

        public SubsiteVisit GetSubsiteVisitById(Guid id)
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
                if (!base.IsValid)
                {
                    return false;
                }
                foreach (SubsiteVisit sv in SubsiteVisits)
                {
                    if (!sv.IsValid)
                    {
                        return false;
                    }
                }
                foreach (Tree t in MeasuredTrees)
                {
                    if (!t.IsValid)
                    {
                        return false;
                    }
                }
                if (SubsiteVisits.Count == 0 && MeasuredTrees.Count == 0)
                {
                    return false;
                }
                return true;
            }
        }

        public override IList<ValidationError> GetValidationErrors()
        {
            List<ValidationError> errors = new List<ValidationError>();
            errors.AddRange(base.GetValidationErrors());
            foreach (SubsiteVisit sv in SubsiteVisits)
            {
                errors.AddRange(sv.GetValidationErrors());
            }
            foreach (Tree t in MeasuredTrees)
            {
                errors.AddRange(t.GetValidationErrors());
            }
            if (SubsiteVisits.Count == 0 && MeasuredTrees.Count == 0)
            {
                errors.Add(ValidationError.Create(this, "MeasuredTrees", "Site must have measurements."));
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

        public static SiteVisit Create(Site site)
        {
            SiteVisit sv = new SiteVisit();
            sv.Site = site;
            sv.m_Coordinates = (Coordinates)site.Coordinates.Clone();
            sv.SubsiteVisits = new List<SubsiteVisit>();
            sv.MeasuredTrees = new List<Tree>();
            return sv;
        }
    }
}
