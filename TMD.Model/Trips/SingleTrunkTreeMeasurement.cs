using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using System.ComponentModel;
using System.Diagnostics;
using System.ComponentModel.DataAnnotations;
using TMD.Model.Extensions;

namespace TMD.Model.Trips
{
    [Serializable]
    [DebuggerDisplay("{ScientificName} (single trunk)")]
    public class SingleTrunkTreeMeasurement : TreeMeasurementBase
    {
        protected SingleTrunkTreeMeasurement()
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

        internal static SingleTrunkTreeMeasurement Create(SubsiteVisit ssv)
        {
            return new SingleTrunkTreeMeasurement
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
                CoordinatesEntered = ssv.CoordinatesEntered && ssv.Coordinates.IsValidAndSpecified(),
                Coordinates = ssv.CoordinatesEntered && ssv.Coordinates.IsValidAndSpecified() ? ssv.Coordinates : Coordinates.Null(),
                Elevation = Elevation.Null(),
                Height = Distance.Null(),
                HeightMeasurements = HeightMeasurements.Null(),
                HeightMeasurementMethod = ssv.SiteVisit.Trip.DefaultHeightMeasurementMethod,
                HeightMeasurementType = string.Empty,
                LaserBrand = ssv.SiteVisit.Trip.DefaultLaserBrand,
                ClinometerBrand = ssv.SiteVisit.Trip.DefaultClinometerBrand,
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
                SubsiteVisit = ssv,
                MakeCoordinatesPublic = true,
                IncludeHeightDistanceAndAngleMeasurements = false,
            }.RecordCreation() as SingleTrunkTreeMeasurement;
        }
    }
}
