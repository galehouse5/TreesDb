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

        public virtual Distance Diameter { get; private set; }
        public virtual float? ENTSPTS { get; private set; }
        public virtual Volume ConicalVolume { get; private set; }
        public virtual float? ENTSPTS2 { get; private set; }
        public virtual float? ChampionPoints { get; private set; }
        public virtual float? AbbreviatedChampionPoints { get; private set; }

        public virtual IList<IPhoto> Photos { get; private set; }
        public virtual Measurement LastMeasurement { get { return (from m in Measurements orderby m.Measured select m).Last(); } }
        public virtual IList<Name> Measurers { get; private set; }

        public virtual Coordinates CalculateCoordinates() 
        { 
            return (from m in Measurements orderby m.Measured where m.Coordinates.IsSpecified select m.Coordinates).LastOrDefault() ?? Coordinates.Null(); 
        }

        public virtual Coordinates CalculateCalculatedCoordinates() 
        { 
            return (from m in Measurements orderby m.Measured where m.CalculatedCoordinates.IsSpecified select m.CalculatedCoordinates).LastOrDefault() ?? Coordinates.Null(); 
        }

        public virtual Tree RecalculateProperties()
        {
            LastMeasured = LastMeasurement.Measured;
            CommonName = LastMeasurement.CommonName;
            ScientificName = LastMeasurement.ScientificName;
            Height = LastMeasurement.Height;
            HeightMeasurementMethod = LastMeasurement.HeightMeasurementMethod;
            Girth = LastMeasurement.Girth;
            CrownSpread = LastMeasurement.CrownSpread;
            Coordinates = CalculateCoordinates();
            CalculatedCoordinates = CalculateCalculatedCoordinates();
            Elevation = LastMeasurement.Elevation;
            Diameter = LastMeasurement.Diameter;
            ENTSPTS = LastMeasurement.ENTSPTS;
            ConicalVolume = LastMeasurement.ConicalVolume;
            ENTSPTS2 = LastMeasurement.ENTSPTS2;
            ChampionPoints = LastMeasurement.ChampionPoints;
            AbbreviatedChampionPoints = LastMeasurement.AbbreviatedChampionPoints;
            Photos.RemoveAll().AddRange(from photo in LastMeasurement.Photos 
                                        select new TreePhotoReference(photo.ToPhoto(), this));
            Measurers.RemoveAll().AddRange(from measurement in Measurements
                                           from measurer in measurement.Measurers
                                           select measurer).Distinct();
            MeasurementCount = Measurements.Count;
            return this;
        }

        public virtual float? TDI2 { get { return Species.CalculateTDI2(Height, Girth); } }
        public virtual float? TDI3 { get { return Species.CalculateTDI3(Height, Girth, CrownSpread); } }

        public virtual IList<Measurement> Measurements { get; private set; }
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
                Measurements = new List<Measurement> { Measurement.Create(importedTree) },
                Photos = new List<IPhoto>(),
                Measurers = new List<Name>()
            }.RecalculateProperties();
        }
    }

    public class TreePhotoReference : PhotoReferenceBase
    {
        protected TreePhotoReference() { }
        protected internal TreePhotoReference(Photo photo, Tree tree) : base(photo) { this.Tree = tree; }
        public virtual Tree Tree { get; private set; }
        public override bool IsAuthorizedToView(User user) { return true; }
    }
}
