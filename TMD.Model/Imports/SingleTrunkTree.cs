using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using System.ComponentModel;
using System.Diagnostics;
using System.ComponentModel.DataAnnotations;
using TMD.Model.Extensions;
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
            set {}
        }

        internal static SingleTrunkTree Create(Subsite ssv)
        {
            return new SingleTrunkTree
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
                HeightMeasurementMethod = ssv.Site.Trip.DefaultHeightMeasurementMethod,
                HeightMeasurementType = string.Empty,
                LaserBrand = ssv.Site.Trip.DefaultLaserBrand,
                ClinometerBrand = ssv.Site.Trip.DefaultClinometerBrand,
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
                Subsite = ssv,
                MakeCoordinatesPublic = true,
                Photos = new List<IPhoto>()
            }.RecordCreation() as SingleTrunkTree;
        }
    }
}
