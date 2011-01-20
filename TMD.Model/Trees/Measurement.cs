using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Imports;
using TMD.Model.Photos;
using TMD.Model.Users;
using TMD.Model.Extensions;

namespace TMD.Model.Trees
{
    [DebuggerDisplay("{ScientificName} ({CommonName})")]
    public class Measurement : IEntity
    {
        protected Measurement()
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

        public virtual Distance Diameter { get; private set; }
        public virtual float? ENTSPTS { get; private set; }
        public virtual Volume ConicalVolume { get; private set; }
        public virtual float? ENTSPTS2 { get; private set; }
        public virtual float? ChampionPoints { get; private set; }
        public virtual float? AbbreviatedChampionPoints { get; private set; }

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
        public virtual IList<IPhoto> Photos { get; private set; }
        public virtual IList<Name> Measurers { get; private set; }

        public static Measurement Create(Imports.TreeBase importedTree)
        {
            importedTree.Subsite.Site.Trip.AssertIsImported();
            var measurement = new Measurement
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
                GeneralComments = importedTree.GeneralComments,
                Photos = new List<IPhoto>(),
                Measurers = new List<Name>(importedTree.Subsite.Site.Trip.Measurers)
            }.RecalculateProperties();
            measurement.Photos.AddRange(from photo in importedTree.Photos select new TreeMeasurementPhotoReference(photo.ToPhoto(), measurement));
            return measurement;
        }
    }

    public class TreeMeasurementPhotoReference : PhotoReferenceBase
    {
        protected TreeMeasurementPhotoReference() { }
        protected internal TreeMeasurementPhotoReference(Photo photo, Measurement measurement) : base(photo) { this.TreeMeasurement = measurement; }
        public virtual Measurement TreeMeasurement { get; private set; }
        public override bool IsAuthorizedToView(User user) { return true; }
    }
}
