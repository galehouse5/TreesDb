using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Imports;

namespace TMD.Model.Trees
{
    [DebuggerDisplay("{ScientificName} ({CommonName})")]
    public class TreeMeasurement : IEntity
    {
        protected TreeMeasurement()
        { }

        public virtual int Id { get; private set; }
        public virtual Trip ImportingTrip { get; private set; }
        public virtual DateTime Measured { get; private set; }
        public string CommonName { get; private set; }
        public string ScientificName { get; private set; }
        public Distance Height { get; private set; }
        public TreeHeightMeasurementMethod HeightMeasurementMethod { get; private set; }
        public Distance Girth { get; private set; }
        public Distance CrownSpread { get; private set; }
        public Coordinates Coordinates { get; private set; }
        public Coordinates CalculatedCoordinates { get; private set; }
        public Elevation Elevation { get; private set; }
        public string GeneralComments { get; private set; }

        public float? ENTSPTS { get; private set; }
        public float? ENTSPTS2 { get; private set; }

        public float? CalculateENTSPTS()
        {
            if (!Height.IsSpecified || !CrownSpread.IsSpecified)
            {
                return null;
            }
            double circumference = (double)CrownSpread.Feet * Math.PI;
            return (float)((double)Height.Feet * circumference);
        }

        public float? CalculateENTSPTS2()
        {
            if (!Height.IsSpecified || !CrownSpread.IsSpecified)
            {
                return null;
            }
            double circumference = (double)CrownSpread.Feet * Math.PI;
            return (float)((double)Height.Feet * Math.Pow(circumference, 2) / 100.0);
        }

        public virtual TreeMeasurement RecalculateProperties()
        {
            ENTSPTS = CalculateENTSPTS();
            ENTSPTS2 = CalculateENTSPTS2();
            TDICalculation = null;
            return this;
        }

        protected TDICalculation TDICalculation { get; private set; }

        private void ensureTDIIsCalculated()
        {
            if (TDICalculation == null)
            {
                var species = Repositories.Trees.FindSpeciesByScientificName(ScientificName);
                TDICalculation = species.CalculateTDI(Height, Girth, CrownSpread);
            }
        }
        
        public float? TDI2 
        {
            get 
            {
                ensureTDIIsCalculated();
                return TDICalculation.TDI2; 
            } 
        }

        public float? TDI3
        {
            get
            {
                ensureTDIIsCalculated();
                return TDICalculation.TDI3;
            }
        }

        public static TreeMeasurement Create(Imports.TreeBase importedTree)
        {
            importedTree.Subsite.Site.Trip.AssertIsImported();
            return new TreeMeasurement
            {
                ImportingTrip = importedTree.Subsite.Site.Trip,
                Measured = importedTree.Subsite.Site.Trip.Date.Value,
                CommonName = importedTree.CommonName,
                ScientificName = importedTree.ScientificName,
                Height = importedTree.Height,
                HeightMeasurementMethod = importedTree.HeightMeasurementMethod,
                Girth = importedTree.Girth,
                CrownSpread = importedTree.CrownSpread,
                Coordinates = importedTree.Coordinates,
                CalculatedCoordinates = importedTree.CalculateCoordinates(),
                Elevation = importedTree.Elevation,
                GeneralComments = importedTree.GeneralComments
            }.RecalculateProperties();
        }
    }
}
