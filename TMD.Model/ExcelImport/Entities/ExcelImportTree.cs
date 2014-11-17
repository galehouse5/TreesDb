using System;
using System.Collections.Generic;
using System.Linq;
using TMD.Model.ExcelImport.EntityTypes;
using TMD.Model.Photo;
using TMD.Model.Trees;

namespace TMD.Model.ExcelImport.Entities
{
    public class ExcelImportTree : ExcelImportEntity
    {
        protected internal ExcelImportTree()
        { }

        public override ExcelImportEntityType EntityType
        {
            get { return ExcelImportEntityType.Tree; }
        }

        public string SubsiteName
        {
            get { return (string)this[ExcelImportTreeType.SubsiteName]; }
        }

        public string TreeName
        {
            get { return (string)this[ExcelImportTreeType.TreeName]; }
        }

        public string CommonName
        {
            get { return (string)this[ExcelImportTreeType.CommonName]; }
        }

        public string BotanicalName
        {
            get { return (string)this[ExcelImportTreeType.BotanicalName]; }
        }

        public DateTime Date
        {
            get { return (DateTime)this[ExcelImportTreeType.Date]; }
        }

        public float? Latitude
        {
            get { return (float?)this[ExcelImportTreeType.Latitude]; }
        }

        public float? Longitude
        {
            get { return (float?)this[ExcelImportTreeType.Longitude]; }
        }

        public Coordinates Coordinates
        {
            get { return Latitude.HasValue && Longitude.HasValue ? Coordinates.Create(Latitude.Value, Longitude.Value) : Coordinates.Null(); }
        }

        public float? Height
        {
            get { return (float?)this[ExcelImportTreeType.Height]; }
        }

        public ExcelImportHeightMeasurementMethod? HeightMeasurementMethod
        {
            get { return (ExcelImportHeightMeasurementMethod?)this[ExcelImportTreeType.HeightMeasurementMethod]; }
        }

        public float? Girth
        {
            get { return (float?)this[ExcelImportTreeType.Girth]; }
        }

        public float? CrownMaxSpread
        {
            get { return (float?)this[ExcelImportTreeType.CrownMaxSpread]; }
        }

        public int? Elevation
        {
            get { return (int?)this[ExcelImportTreeType.Elevation]; }
        }

        public string GeneralComments
        {
            get { return (string)this[ExcelImportTreeType.GeneralComments]; }
        }

        public IEnumerable<string> Measurers
        {
            get
            {
                if (this[ExcelImportTreeType.FirstMeasurer] != null)
                    yield return (string)this[ExcelImportTreeType.FirstMeasurer];

                if (this[ExcelImportTreeType.SecondMeasurer] != null)
                    yield return (string)this[ExcelImportTreeType.SecondMeasurer];

                if (this[ExcelImportTreeType.ThirdMeasurer] != null)
                    yield return (string)this[ExcelImportTreeType.ThirdMeasurer];
            }
        }

        public Measurement CreateMeasurement(IEnumerable<ExcelImportEntity> entities, IEnumerable<PhotoFile> photoFiles)
        {
            Measurement measurement = new Measurement
            {
                Measured = Date,
                CommonName = CommonName,
                ScientificName = BotanicalName,
                Height = Height.HasValue ? Distance.Create(Height.Value) : Distance.Null(),
                HeightMeasurementMethod = ExcelImportHeightMeasurementMethod.ClinometerLaserRangefinderSine == HeightMeasurementMethod ? TreeHeightMeasurementMethod.ClinometerLaserRangefinderSine
                    : ExcelImportHeightMeasurementMethod.FormalTransitTotalStationSurvey == HeightMeasurementMethod ? TreeHeightMeasurementMethod.FormalTransitTotalStationSurvey
                    : ExcelImportHeightMeasurementMethod.LongMeasuringPole == HeightMeasurementMethod ? TreeHeightMeasurementMethod.LongMeasuringPole
                    : ExcelImportHeightMeasurementMethod.TreeClimbWithTapeDrop == HeightMeasurementMethod ? TreeHeightMeasurementMethod.TreeClimbWithTapeDrop
                    : TreeHeightMeasurementMethod.NotSpecified,
                Girth = Girth.HasValue ? Distance.Create(Girth.Value) : Distance.Null(),
                CrownSpread = CrownMaxSpread.HasValue ? Distance.Create(CrownMaxSpread.Value) : Distance.Null(),
                Coordinates = Coordinates,
                CalculatedCoordinates = Coordinates,
                Elevation = Elevation.HasValue ? Model.Elevation.Create(Elevation.Value) : Model.Elevation.Null(),
                GeneralComments = GeneralComments ?? string.Empty,
                Measurers = Measurers.Select(m => Name.Create(m)).Distinct().ToList()
            }.RecordCreation();

            measurement.Photos = (from photo in entities.OfType<ExcelImportPhoto>()
                                  where string.Equals(photo.TreeName, TreeName)
                                  select photo.CreatePhotoReference(photoFiles, measurement))
                                  .ToList();

            measurement.RecalculateProperties();
            return measurement;
        }

        public override string ToString()
        {
            return string.Format(string.IsNullOrEmpty(TreeName) ? "{0}: {1}" : "{0}: {2} ({3})",
                RowIndex, TreeName, CommonName, BotanicalName);
        }
    }
}
