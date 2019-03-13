using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using TMD.Model.Extensions;
using TMD.Model.Imports;
using TMD.Model.Photos;
using TMD.Model.Users;

namespace TMD.Model.Trees
{
    [DebuggerDisplay("{ScientificName} ({Id})")]
    public class Measurement : IEntity
    {
        protected Measurement()
        { }

        public virtual int Id { get; protected set; }
        public virtual GlobalMeasuredSpecies Species { get; protected set; }
        public virtual Trip ImportingTrip { get; protected set; }
        public virtual Tree Tree { get; protected internal set; }

        public virtual DateTime Measured { get; protected set; }
        public virtual string CommonName { get; protected set; }
        public virtual string ScientificName { get; protected set; }
        public virtual Distance Height { get; protected set; }
        public virtual TreeHeightMeasurementMethod HeightMeasurementMethod { get; protected set; }
        public virtual Distance Girth { get; protected set; }
        public virtual Distance CrownSpread { get; protected set; }
        public virtual Coordinates Coordinates { get; protected set; }
        public virtual Coordinates CalculatedCoordinates { get; protected set; }
        public virtual Elevation Elevation { get; protected set; }
        public virtual string GeneralComments { get; protected set; }

        public virtual Distance Diameter { get; protected set; }
        public virtual float? ENTSPTS { get; protected set; }
        public virtual Volume ConicalVolume { get; protected set; }
        public virtual float? ENTSPTS2 { get; protected set; }
        public virtual float? ChampionPoints { get; protected set; }
        public virtual float? AbbreviatedChampionPoints { get; protected set; }

        public virtual float? CalculateDiameter()
        {
            if (!Girth.IsSpecified)
            {
                return null;
            }
            double diameter = (double)Girth.Feet / Math.PI;
            return (float)diameter;
        }

        /// <summary>
        /// Height x Circumference
        /// </summary>
        /// <returns></returns>
        public virtual float? CalculateENTSPTS()
        {
            if (!Height.IsSpecified || !Girth.IsSpecified)
            {
                return null;
            }
            double ENTSPTS = (double)Height.Feet * (double)Girth.Feet;
            return (float)ENTSPTS;
        }

        /// <summary>
        /// 1/3 (Base x Height)
        /// </summary>
        /// <returns></returns>
        public virtual Volume CalculateConicalVolume()
        {
            if (!Height.IsSpecified || !Girth.IsSpecified)
            {
                return Volume.Null();
            }
            double radius = (double)Girth.Feet / Math.PI / 2.0;
            return Volume.CalculateConical(radius, Height.Feet);
        }

        /// <summary>
        /// (Height x Circumference ^ 2) / 100
        /// </summary>
        /// <returns></returns>
        public virtual float? CalculateENTSPTS2()
        {
            if (!Height.IsSpecified || !Girth.IsSpecified)
            {
                return null;
            }
            double ENTSPTS2 = ((double)Height.Feet * Math.Pow((double)Girth.Feet, 2) / 100.0);
            return (float)ENTSPTS2;
        }

        /// <summary>
        /// Circumference(in) + Height(ft) + ¼ Average Crown Spread(ft)
        /// </summary>
        /// <returns></returns>
        public virtual float? CalculateChampionPoints()
        {
            if (!Girth.IsSpecified || !Height.IsSpecified || !CrownSpread.IsSpecified)
            {
                return null;
            }
            double championPoints = (double)Girth.Inches + (double)Height.Feet + ((double)CrownSpread.Feet / 4.0);
            return (float)championPoints;
        }

        /// <summary>
        /// Circumference(in) + Height(ft)
        /// </summary>
        /// <returns></returns>
        public virtual float? CalculateAbbreviatedChampionPoints()
        {
            if (!Girth.IsSpecified || !Height.IsSpecified)
            {
                return null;
            }
            double championPoints = (double)Girth.Inches + (double)Height.Feet;
            return (float)championPoints;
        }

        public virtual Measurement RecalculateProperties()
        {
            Diameter = CalculateDiameter().HasValue ? Distance.Create(CalculateDiameter().Value) : Distance.Null();
            ENTSPTS = CalculateENTSPTS();
            ConicalVolume = CalculateConicalVolume();
            ENTSPTS2 = CalculateENTSPTS2();
            ChampionPoints = CalculateChampionPoints();
            AbbreviatedChampionPoints = CalculateAbbreviatedChampionPoints();
            return this;
        }

        public virtual float? TDI2 { get { return Species.CalculateTDI2(Height, Girth); } }
        public virtual float? TDI3 { get { return Species.CalculateTDI3(Height, Girth, CrownSpread); } }
        public virtual IList<IPhoto> Photos { get; protected set; }
        public virtual IList<Name> Measurers { get; protected set; }

        public static Measurement Create(Imports.TreeBase importedTree)
        {
            importedTree.Site.Trip.AssertIsImported();
            var measurement = new Measurement
            {
                ImportingTrip = importedTree.Site.Trip,
                Measured = importedTree.Site.Trip.Date.Value,
                CommonName = importedTree.CommonName,
                ScientificName = importedTree.ScientificName.NullIfEmpty() ?? "(Unidentified)",
                Height = importedTree.Height,
                HeightMeasurementMethod = importedTree.HeightMeasurementMethod,
                Girth = importedTree.Girth,
                CrownSpread = importedTree.CrownSpread,
                Coordinates = importedTree.Coordinates,
                CalculatedCoordinates = importedTree.CalculateCoordinates(),
                Elevation = importedTree.Elevation,
                GeneralComments = importedTree.GeneralComments,
                Photos = new List<IPhoto>(),
                Measurers = new List<Name>(importedTree.Site.Trip.Measurers)
            }.RecalculateProperties();
            measurement.Photos.AddRange(from photo in importedTree.Photos select new TreeMeasurementPhotoReference(photo.ToPhoto(), measurement));
            return measurement;
        }
    }

    public class TreeMeasurementPhotoReference : PhotoReferenceBase
    {
        protected TreeMeasurementPhotoReference() { }
        protected internal TreeMeasurementPhotoReference(Photo photo, Measurement measurement) : base(photo) { this.TreeMeasurement = measurement; }
        public virtual Measurement TreeMeasurement { get; protected set; }
        public override bool IsAuthorizedToView(User user) { return true; }

        public override IList<Name> Photographers
        {
            get { return TreeMeasurement.Measurers; }
        }
    }
}
