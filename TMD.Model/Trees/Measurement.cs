using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    public class Measurement : IEntity
    {
        private Measurement()
        {
            GpsDatum = EGpsDatum.WGS84NAD83;
        }

        public Guid Id { get; set; }
        public DateTime Created { get; set; }
        public string CommonName { get; set; }
        public string Genus { get; set; }
        public string Species { get; set; }
        public string Name { get; set; }
        public string Code { get; internal set; }
        public string MeasurersTreeID { get; set; }
        public Coordinates Coordinates { get; set; }
        public Elevation Elevation { get; set; }
        public EPositionMeasurementType PositionMeasurementType { get; set; }
        public EGpsDatum GpsDatum { get; private set; }
        public Distance Height { get; set; }
        public HeightMeasurements HeightMeasurements { get; set; }
        public string HeightMeasurementType { get; set; }
        public string LaserBrand { get; set; }
        public string ClinometerBrand { get; set; }
        public string HeightComments { get; set; }
        public Distance GirthBreatHeight { get; set; }
        public Distance GirthMeasurementHeight { get; set; }
        public Distance GirthRootCollarHeight { get; set; }
        public string GirthComments { get; set; }
        public Distance MaximumCrownSpread { get; set; }
        public Distance MaximumLimbLength { get; set; }
        public Distance AverageCrownSpread { get; set; }
        public string CrownSpreadMeasurementMethod { get; set; }
        public Distance BaseCrownHeight { get; set; }
        public Volume CrownVolume { get; set; }
        public string CrownVolumeCalculationMethod { get; set; }
        public string CrownComments { get; set; }
        public Volume TrunkVolume { get; set; }
        public string TrunkVolumeCalculationMethod { get; set; }
        public string TrunkComments { get; set; }
        public EFormType FormType { get; set; }
        public int NumberOfTrunks { get; set; }
        public string TreeFormComments { get; set; }
        public DateTime Measured { get; set; }
        public EStatus Status { get; set; }
        public string HealthStatus { get; set; }
        public EAgeClass AgeClass { get; set; }
        public int Age { get; set; }
        public EAgeType AgeType { get; set; }
        public ETerrainType TerrainType { get; set; }
        public int TerrainShapeIndex { get; set; }
        public int LandformIndex { get; set; }
        public string OtherComments { get; set; }
        public IList<Measurer> Measurers { get; private set; }
    }
}
