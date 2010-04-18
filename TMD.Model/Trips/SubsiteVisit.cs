using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trees;
using TMD.Model.Sites;
using TMD.Model.Validation;

namespace TMD.Model.Trips
{
    [Serializable]
    public class SubsiteVisit : EntityBase, IEntity, IIsConflicting
    {
        private Coordinates m_Coordinates;

        private SubsiteVisit()
        { }

        public Subsite Subsite { get; private set; }
       
        [IsNullValidator("Subsite coordinates must be specified or contained measurements must have specified coordinates.")]
        public Coordinates Coordinates
        {
            get
            {
                if (m_Coordinates.IsNull)
                {
                    m_Coordinates = calculateCoordinates();
                    Subsite.Coordinates = m_Coordinates;
                    CoordinatesCalculated = true;
                }
                return m_Coordinates;
            }
            set 
            { 
                m_Coordinates = value;
                Subsite.Coordinates = m_Coordinates;
                CoordinatesCalculated = false;
            }
        }

        public bool CoordinatesCalculated { get; private set; }

        [EmptyCollectionValidator("Subsite must contain measurements.")]
        public IList<Tree> MeasuredTrees { get; private set; }

        public bool HasMeasuredTrees
        {
            get { return MeasuredTrees.Count > 0; }
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

        private Coordinates calculateCoordinates()
        {
            List<Coordinates> coordinatesList = new List<Coordinates>();
            foreach (Tree t in MeasuredTrees)
            {
                coordinatesList.Add(t.CurrentMeasurement.Coordinates);
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
                if (MeasuredTrees.Count == 0)
                {
                    return false;
                }
                foreach (Tree t in MeasuredTrees)
                {
                    if (!t.IsValid)
                    {
                        return false;
                    }
                }
                return base.IsValid && Subsite.IsValid;
            }
        }

        public override IList<ValidationError> GetValidationErrors()
        {
            List<ValidationError> errors = new List<ValidationError>();
            errors.AddRange(base.GetValidationErrors());
            if (MeasuredTrees.Count == 0)
            {
                errors.Add(ValidationError.Create(this, "MeasuredTrees", "Subsite must have measurements."));
            }
            foreach (Tree t in MeasuredTrees)
            {
                errors.AddRange(t.GetValidationErrors());
            }
            errors.AddRange(Subsite.GetValidationErrors());
            return errors;
        }

        #endregion

        #region IIsConflicting Members

        public bool IsConflicting
        {
            get { return !CoordinatesCalculated 
                && CoordinateDistance.Calculate(Coordinates, calculateCoordinates()).TotalMinutes > 1f; }
        }

        public IList<string> GetConflicts()
        {
            List<string> errors = new List<string>();
            if (!CoordinatesCalculated && CoordinateDistance.Calculate(Coordinates, calculateCoordinates()).TotalMinutes > 1f)
            {
                errors.Add("Subsite specified coordinates diverge from calculated coordinates by more than one minute.");
            }
            return errors;
        }

        #endregion

        public static SubsiteVisit Create(Subsite ss)
        {
            SubsiteVisit ssv = new SubsiteVisit();
            ssv.Subsite = ss;
            ssv.m_Coordinates = (Coordinates)ss.Coordinates.Clone();
            ssv.MeasuredTrees = new List<Tree>();
            return ssv;
        }
    }
}
