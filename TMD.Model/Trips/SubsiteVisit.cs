using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trees;
using TMD.Model.Sites;

namespace TMD.Model.Trips
{
    public class SubsiteVisit : EntityBase, IEntity, IIsConflicting
    {
        private Coordinates m_Coordinates;

        private SubsiteVisit()
        { }

        internal SubsiteVisit(SiteVisit sv, Subsite s)
        {
            this.SiteVisit = sv;
            this.Subsite = s;
            m_Coordinates = Coordinates.Null();
            this.Measurements = new List<Measurement>();
        }

        public SiteVisit SiteVisit { get; private set; }
        public Subsite Subsite { get; private set; }
       
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
        internal IList<Measurement> Measurements { get; private set; }

        internal void AddMeasurement(Measurement m)
        {
            invalidateCoordinatesCalculation();
            Measurements.Add(m);
        }

        internal bool RemoveMeasurement(Measurement m)
        {
            invalidateCoordinatesCalculation();
            return Measurements.Remove(m);
        }

        private Coordinates calculateCoordinates()
        {
            List<Coordinates> coordinatesList = new List<Coordinates>();
            foreach (Measurement m in Measurements)
            {
                coordinatesList.Add(m.Coordinates);
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
            get { return !Coordinates.IsNull && Measurements.Count > 0; }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            if (Coordinates.IsNull)
            {
                errors.Add("Subsite coordinates must be specified or contained measurements must have specified coordinates.");
            }
            if (Measurements.Count == 0)
            {
                errors.Add("Subsite must contain measurements.");
            }
            return errors;
        }

        #endregion

        #region IIsConflicting Members

        public bool IsConflicting
        {
            get { return !CoordinatesCalculated && CoordinateDistance.Calculate(Coordinates, calculateCoordinates()).TotalMinutes > 1f; }
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
    }
}
