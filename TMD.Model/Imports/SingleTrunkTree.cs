using System.Collections.Generic;
using System.Diagnostics;
using TMD.Model.Photos;

namespace TMD.Model.Imports
{
    [DebuggerDisplay("{ScientificName} (single trunk)")]
    public class SingleTrunkTree : TreeBase
    {
        protected SingleTrunkTree()
        { }

        public override TreeFormType FormType
        {
            get { return TreeFormType.Single; }
            set { }
        }

        public override int? NumberOfTrunks
        {
            get { return 1; }
            set { }
        }

        internal static SingleTrunkTree Create(Site site)
            => new SingleTrunkTree
            {
                TreeName = string.Empty,
                TreeNumber = null,
                CommonName = string.Empty,
                ScientificName = string.Empty,
                Status = TreeStatus.NotSpecified,
                HealthStatus = string.Empty,
                AgeClass = TreeAgeClass.NotSpecified,
                AgeType = TreeAgeType.NotSpecified,
                Age = null,
                GeneralComments = string.Empty,
                Coordinates = Coordinates.Null(),
                Elevation = Elevation.Null(),
                Height = Distance.Null(),
                HeightMeasurements = HeightMeasurements.Null(),
                HeightMeasurementMethod = site.Trip.DefaultHeightMeasurementMethod,
                HeightMeasurementType = string.Empty,
                LaserBrand = site.Trip.DefaultLaserBrand,
                ClinometerBrand = site.Trip.DefaultClinometerBrand,
                HeightComments = string.Empty,
                Girth = Distance.Null(),
                GirthMeasurementHeight = Distance.Null(),
                GirthRootCollarHeight = Distance.Null(),
                GirthComments = string.Empty,
                CrownSpread = Distance.Null(),
                MaximumLimbLength = Distance.Null(),
                CrownSpreadMeasurementMethod = string.Empty,
                BaseCrownHeight = Distance.Null(),
                CrownVolume = Volume.Null(),
                CrownVolumeCalculationMethod = string.Empty,
                CrownComments = string.Empty,
                TrunkVolume = Volume.Null(),
                TrunkVolumeCalculationMethod = string.Empty,
                TrunkComments = string.Empty,
                NumberOfTrunks = null,
                TreeFormComments = string.Empty,
                TerrainType = TreeTerrainType.NotSpecified,
                TerrainShapeIndex = null,
                LandformIndex = null,
                TerrainComments = string.Empty,
                Site = site,
                MakeCoordinatesPublic = true,
                Photos = new List<IPhoto>()
            }.RecordCreation() as SingleTrunkTree;
    }
}
