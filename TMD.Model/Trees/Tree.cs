using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Imports;
using TMD.Model.Extensions;

namespace TMD.Model.Trees
{
    [DebuggerDisplay("{ScientificName} ({CommonName})")]
    public class Tree : IEntity
    {
        protected Tree()
        { }

        public virtual int Id { get; private set; }
        public virtual DateTime LastMeasured { get; private set; }
        public virtual string CommonName { get; private set; }
        public virtual string ScientificName { get; private set; }
        public virtual Distance Height { get; private set; }
        public virtual TreeHeightMeasurementMethod HeightMeasurementMethod { get; private set; }
        public virtual Distance Girth { get; private set; }
        public virtual Distance CrownSpread { get; private set; }
        public virtual Coordinates Coordinates { get; private set; }
        public virtual Coordinates CalculatedCoordinates { get; private set; }
        public virtual Elevation Elevation { get; private set; }
        public virtual float? ENTSPTS { get; private set; }
        public virtual float? ENTSPTS2 { get; private set; }

        public virtual DateTime CalculateLastMeasured() { return (from measurement in Measurements orderby measurement.Measured select measurement).Last().Measured; }
        public virtual string CalculateCommonName() { return (from measurement in Measurements orderby measurement.Measured select measurement).Last().CommonName; }
        public virtual string CalculateScientificName() { return (from measurement in Measurements orderby measurement.Measured select measurement).Last().ScientificName; }
        public virtual Distance CalculateHeight() { return (from measurement in Measurements orderby measurement.Measured where measurement.Height.IsSpecified select measurement.Height).LastOrDefault() ?? Distance.Null(); }
        public virtual TreeHeightMeasurementMethod CalculateHeightMeasurementMethod() { return (from measurement in Measurements orderby measurement.Measured where measurement.Height.IsSpecified select measurement.HeightMeasurementMethod).LastOrDefault(); }
        public virtual Distance CalculateGirth() { return (from measurement in Measurements orderby measurement.Measured where measurement.Girth.IsSpecified select measurement.Girth).LastOrDefault() ?? Distance.Null(); }
        public virtual Distance CalculateCrownSpread() { return (from measurement in Measurements orderby measurement.Measured where measurement.CrownSpread.IsSpecified select measurement.CrownSpread).LastOrDefault() ?? Distance.Null(); }
        public virtual Coordinates CalculateCoordinates() { return (from measurement in Measurements orderby measurement.Measured where measurement.Coordinates.IsSpecified select measurement.Coordinates).LastOrDefault() ?? Coordinates.Null(); }
        public virtual Coordinates CalculateCalculatedCoordinates() { return (from measurement in Measurements orderby measurement.Measured where measurement.CalculatedCoordinates.IsSpecified select measurement.CalculatedCoordinates).LastOrDefault() ?? Coordinates.Null(); }
        public virtual Elevation CalculateElevation() { return (from measurement in Measurements orderby measurement.Measured where measurement.Elevation.IsSpecified select measurement.Elevation).LastOrDefault() ?? Elevation.Null(); }
        public virtual float? CalculateENTSPTS() { return (from measurement in Measurements orderby measurement.Measured where measurement.ENTSPTS.HasValue select measurement.ENTSPTS).FirstOrDefault(); }
        public virtual float? CalculateENTSPTS2() { return (from measurement in Measurements orderby measurement.Measured where measurement.ENTSPTS2.HasValue select measurement.ENTSPTS2).FirstOrDefault(); }

        public virtual Tree RecalculateProperties()
        {
            LastMeasured = CalculateLastMeasured();
            CommonName = CalculateCommonName();
            ScientificName = CalculateScientificName();
            Height = CalculateHeight();
            HeightMeasurementMethod = CalculateHeightMeasurementMethod();
            Girth = CalculateGirth();
            CrownSpread = CalculateCrownSpread();
            Coordinates = CalculateCoordinates();
            CalculatedCoordinates = CalculateCalculatedCoordinates();
            Elevation = CalculateElevation();
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

        public virtual IList<TreeMeasurement> Measurements { get; private set; }

        public virtual Tree Merge(Tree treeToMerge)
        {
            Measurements.AddRange(treeToMerge.Measurements);
            return RecalculateProperties();
        }

        public const float CoordinateMinutesEquivalenceProximity = .02f;
        public virtual bool ShouldMerge(Tree treeToMerge)
        {
            if (!CommonName.Equals(treeToMerge.CommonName, StringComparison.OrdinalIgnoreCase)
                || !ScientificName.Equals(treeToMerge.ScientificName, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            if (CalculatedCoordinates.CalculateDistanceInMinutesTo(treeToMerge.CalculatedCoordinates) > CoordinateMinutesEquivalenceProximity)
            {
                return false;
            }
            return true;
        }

        public static Tree Create(Imports.TreeBase importedTree)
        {
            importedTree.Subsite.Site.Trip.AssertIsImported();
            return new Tree
            {
                Measurements = new List<TreeMeasurement> { TreeMeasurement.Create(importedTree) }
            }.RecalculateProperties();
        }
    }
}
