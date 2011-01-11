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
        public virtual MeasuredSpecies Species { get; private set; }
        public virtual Trip ImportingTrip { get; private set; }
        public virtual DateTime Measured { get; private set; }
        public virtual string CommonName { get; private set; }
        public virtual string ScientificName { get; private set; }
        public virtual Distance Height { get; private set; }
        public virtual TreeHeightMeasurementMethod HeightMeasurementMethod { get; private set; }
        public virtual Distance Girth { get; private set; }
        public virtual Distance CrownSpread { get; private set; }
        public virtual Coordinates Coordinates { get; private set; }
        public virtual Coordinates CalculatedCoordinates { get; private set; }
        public virtual Elevation Elevation { get; private set; }
        public virtual string GeneralComments { get; private set; }

        public virtual float? ENTSPTS { get; private set; }
        public virtual float? ENTSPTS2 { get; private set; }

        public virtual float? CalculateENTSPTS()
        {
            if (!Height.IsSpecified || !CrownSpread.IsSpecified)
            {
                return null;
            }
            double circumference = (double)CrownSpread.Feet * Math.PI;
            return (float)((double)Height.Feet * circumference);
        }

        public virtual float? CalculateENTSPTS2()
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
            return this;
        }

        public virtual float? TDI2 { get { return Species.CalculateTDI2(Height, Girth); } }
        public virtual float? TDI3 { get { return Species.CalculateTDI3(Height, Girth, CrownSpread); } }

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
