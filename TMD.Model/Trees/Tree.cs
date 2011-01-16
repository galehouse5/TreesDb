using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Imports;
using TMD.Model.Extensions;
using TMD.Model.Photos;
using TMD.Model.Users;

namespace TMD.Model.Trees
{
    [DebuggerDisplay("{ScientificName} ({CommonName})")]
    public class Tree : IEntity
    {
        protected Tree()
        { }

        public virtual int Id { get; private set; }
        public virtual MeasuredSpecies Species { get; private set; }
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
        public virtual IList<TreePhotoReference> Photos { get; private set; }

        public virtual TreeMeasurement GetLastMeasurement() { return (from m in Measurements orderby m.Measured select m).Last(); }
        public virtual DateTime CalculateLastMeasured() { return GetLastMeasurement().Measured; }
        public virtual string CalculateCommonName() { return GetLastMeasurement().CommonName; }
        public virtual string CalculateScientificName() { return GetLastMeasurement().ScientificName; }
        public virtual Distance CalculateHeight() { return GetLastMeasurement().Height; }
        public virtual TreeHeightMeasurementMethod CalculateHeightMeasurementMethod() { return GetLastMeasurement().HeightMeasurementMethod; }
        public virtual Distance CalculateGirth() { return GetLastMeasurement().Girth; }
        public virtual Distance CalculateCrownSpread() { return GetLastMeasurement().CrownSpread; }
        public virtual Coordinates CalculateCoordinates() { return (from m in Measurements orderby m.Measured where m.Coordinates.IsSpecified select m.Coordinates).LastOrDefault() ?? Coordinates.Null(); }
        public virtual Coordinates CalculateCalculatedCoordinates() { return (from m in Measurements orderby m.Measured where m.CalculatedCoordinates.IsSpecified select m.CalculatedCoordinates).LastOrDefault() ?? Coordinates.Null(); }
        public virtual Elevation CalculateElevation() { return GetLastMeasurement().Elevation; }
        public virtual float? CalculateENTSPTS() { return GetLastMeasurement().ENTSPTS; }
        public virtual float? CalculateENTSPTS2() { return GetLastMeasurement().ENTSPTS2; }

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
            GetLastMeasurement().Photos.ForEach(p =>
            {
                var reference = new TreePhotoReference(this);
                p.AddReference(reference);
                Photos.Add(reference);
            });
            MeasurementCount = Measurements.Count;
            return this;
        }

        public virtual float? TDI2 { get { return Species.CalculateTDI2(Height, Girth); } }
        public virtual float? TDI3 { get { return Species.CalculateTDI3(Height, Girth, CrownSpread); } }

        public virtual IList<TreeMeasurement> Measurements { get; private set; }
        public virtual int MeasurementCount { get; private set; }

        public virtual Tree Merge(Tree treeToMerge)
        {
            Measurements.AddRange(treeToMerge.Measurements);
            return RecalculateProperties();
        }

        public virtual bool ShouldMerge(Tree treeToMerge)
        {
            if (!CommonName.Equals(treeToMerge.CommonName, StringComparison.OrdinalIgnoreCase)
                || !ScientificName.Equals(treeToMerge.ScientificName, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            if (!Coordinates.IsSpecified || !treeToMerge.Coordinates.IsSpecified
                || !Coordinates.Equals(treeToMerge.Coordinates))
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
                Measurements = new List<TreeMeasurement> { TreeMeasurement.Create(importedTree) },
                Photos = new List<TreePhotoReference>()
            }.RecalculateProperties();
        }
    }

    public class TreePhotoReference : PhotoReferenceBase
    {
        protected TreePhotoReference() { }
        protected internal TreePhotoReference(Tree tree) { this.Tree = tree; }
        public virtual Tree Tree { get; private set; }
        public override bool IsAuthorizedToView(User user) { return true; }
    }
}
