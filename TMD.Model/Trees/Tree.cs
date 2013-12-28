using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using TMD.Model.Extensions;
using TMD.Model.Photos;
using TMD.Model.Sites;
using TMD.Model.Users;

namespace TMD.Model.Trees
{
    [DebuggerDisplay("{ScientificName} ({Id})")]
    public class Tree : IEntity
    {
        protected Tree()
        { }

        public virtual int Id { get; protected set; }
        public virtual Subsite Subsite { get; protected internal set; }
        public virtual GlobalMeasuredSpecies Species { get; protected set; }
        public virtual DateTime LastMeasured { get; protected set; }
        public virtual string CommonName { get; protected set; }
        public virtual string ScientificName { get; protected set; }
        public virtual Distance Height { get; protected set; }
        public virtual Imports.TreeHeightMeasurementMethod HeightMeasurementMethod { get; protected set; }
        public virtual Distance Girth { get; protected set; }
        public virtual Distance CrownSpread { get; protected set; }
        public virtual Coordinates Coordinates { get; protected set; }
        public virtual Coordinates CalculatedCoordinates { get; protected set; }
        public virtual Elevation Elevation { get; protected set; }

        public virtual Distance Diameter { get; protected set; }
        public virtual float? ENTSPTS { get; protected set; }
        public virtual Volume ConicalVolume { get; protected set; }
        public virtual float? ENTSPTS2 { get; protected set; }
        public virtual float? ChampionPoints { get; protected set; }
        public virtual float? AbbreviatedChampionPoints { get; protected set; }

        public virtual IList<IPhoto> Photos { get; protected set; }
        public virtual Measurement LastMeasurement { get { return (from m in Measurements orderby m.Measured select m).Last(); } }
        public virtual IList<Name> Measurers { get; protected set; }

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

        public virtual IList<Measurement> Measurements { get; protected set; }
        public virtual int MeasurementCount { get; protected set; }

        public virtual void AddMeasurement(Measurement measurement)
        {
            Measurements.Add(measurement);
            measurement.Tree = this;
        }

        public virtual bool RemoveMeasurement(Measurement measurement)
        {
            if (Measurements.Remove(measurement))
            {
                measurement.Tree = null;
                return true;
            }
            return false;
        }

        public virtual Tree Merge(Tree otherTree)
        {
            foreach (var measurement in otherTree.Measurements)
            {
                AddMeasurement(measurement);
            }

            return RecalculateProperties();
        }

        public virtual bool ShouldMerge(Tree otherTree)
        {
            if (!CommonName.Equals(otherTree.CommonName, StringComparison.OrdinalIgnoreCase)
                || !ScientificName.Equals(otherTree.ScientificName, StringComparison.OrdinalIgnoreCase))
                return false;

            if (!Coordinates.IsSpecified || !otherTree.Coordinates.IsSpecified
                || !Coordinates.Equals(otherTree.Coordinates))
                return false;

            return true;
        }

        public static Tree Create(Imports.TreeBase importedTree)
        {
            importedTree.Subsite.Site.Trip.AssertIsImported();
            Tree tree = new Tree
            {
                Measurements = new List<Measurement>(),
                Photos = new List<IPhoto>(),
                Measurers = new List<Name>()
            };
            tree.AddMeasurement(Measurement.Create(importedTree));            
            return tree.RecalculateProperties();
        }
    }

    public class TreePhotoReference : PhotoReferenceBase
    {
        protected TreePhotoReference() { }
        protected internal TreePhotoReference(Photo photo, Tree tree) : base(photo) { this.Tree = tree; }
        public virtual Tree Tree { get; protected set; }
        public override bool IsAuthorizedToView(User user) { return true; }

        public override IList<Name> Photographers
        {
            get { return Tree.Measurers; }
        }
    }
}
