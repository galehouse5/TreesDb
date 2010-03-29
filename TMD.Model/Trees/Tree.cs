using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;

namespace TMD.Model.Trees
{
    public class Tree : IEntity, IIsValid
    {
        public Guid Id { get; private set; }
        public DateTime Created { get; private set; }
        public string CommonName { get; private set; }
        public string Genus { get; private set; }
        public string Species { get; private set; }
        public string Name { get; private set; }
        public string Code { get; private set; }
        public string MeasurementCode { get; private set; }
        public string MeasurersTreeID { get; private set; }
        public Coordinates Coordinates { get; private set; }
        public Elevation Elevation { get; private set; }
        public EPositionMeasurementType PositionMeasurementType { get; private set; }
        public EGpsDatum GpsDatum { get; private set; }
        public Height Height { get; private set; }
        public HeightMeasurements HeightMeasurements { get; private set; }
        public string HeightMeasurementType { get; private set; }
        public string LaserBrand { get; private set; }
        public string ClinometerBrand { get; private set; }
        public string HeightComments { get; private set; }
        public Height GirthBreatHeight { get; private set; }
        public Height GirthMeasurementHeight { get; private set; }
        public Height GirthRootCollarHeight { get; private set; }
        public string GirthComments { get; private set; }
        public Height MaximumCrownSpread { get; private set; }
        public Height MaximumLimbLength { get; private set; }
        public Height AverageCrownSpread { get; private set; }
        public string CrownSpreadMeasurementMethod { get; private set; }
        public Height BaseCrownHeight { get; private set; }
        public Volume CrownVolume { get; private set; }
        public string CrownVolumeCalculationMethod { get; private set; }
        public string CrownComments { get; private set; }
        public Volume TrunkVolume { get; private set; }
        public string TrunkVolumeCalculationMethod { get; private set; }
        public string TrunkComments { get; private set; }
        public EFormType FormType { get; private set; }
        public int NumberOfTrunks { get; private set; }
        public string TreeFormComments { get; private set; }
        public DateTime Measured { get; private set; }
        public EStatus Status { get; private set; }
        public string HealthStatus { get; private set; }
        public EAgeClass AgeClass { get; private set; }
        public int Age { get; private set; }
        public EAgeType AgeType { get; private set; }
        public ETerrainType TerrainType { get; private set; }
        public int TerrainShapeIndex { get; private set; }
        public int LandformIndex { get; private set; }
        public string OtherComments { get; private set; }
        public int Measurers { get; private set; }
        public IList<Measurement> Measurements { get; private set; }
        public IList<Correction> Corrections { get; private set; }
        public bool IsDeleted { get; internal set; }
        public DateTime Deleted { get; internal set; }
        public User Deletor { get; internal set; }

        public void RecordMeasurement(Measurement measurement)
        {
            this.Measurements.Add(measurement);
            this.Measurers = measurement.Measurers.Count;
            this.CommonName = measurement.CommonName;
            this.Genus = measurement.Genus;
            this.Species = measurement.Species;
            this.MeasurementCode = this.MeasurementCode + 1;
            measurement.Code = this.MeasurementCode;
            this.Name = measurement.Name;
            this.MeasurersTreeID = measurement.MeasurersTreeID;
            this.Coordinates = (Coordinates)measurement.Coordinates.Clone();
            this.Elevation = (Elevation)measurement.Elevation.Clone();
            this.PositionMeasurementType = measurement.PositionMeasurementType;
            this.GpsDatum = measurement.GpsDatum;
            this.Height = (Height)measurement.Height.Clone();
            this.HeightMeasurementType = measurement.HeightMeasurementType;
            this.LaserBrand = measurement.LaserBrand;
            this.ClinometerBrand = measurement.ClinometerBrand;
            this.HeightComments = measurement.HeightComments;
            this.GirthBreatHeight = (Height)measurement.GirthBreatHeight.Clone();
            this.GirthMeasurementHeight = (Height)measurement.GirthMeasurementHeight.Clone();
            this.GirthRootCollarHeight = (Height)measurement.GirthRootCollarHeight.Clone();
            this.GirthComments = measurement.GirthComments;
            this.MaximumCrownSpread = (Height)measurement.MaximumCrownSpread.Clone();
            this.MaximumLimbLength = (Height)measurement.MaximumLimbLength.Clone();
            this.AverageCrownSpread = (Height)measurement.AverageCrownSpread.Clone();
            this.CrownSpreadMeasurementMethod = measurement.CrownSpreadMeasurementMethod;
            this.BaseCrownHeight = (Height)measurement.BaseCrownHeight.Clone();
            this.CrownVolume = (Volume)measurement.CrownVolume.Clone();
            this.CrownVolumeCalculationMethod = measurement.CrownVolumeCalculationMethod;
            this.CrownComments = measurement.CrownComments;
            this.TrunkVolume = (Volume)measurement.TrunkVolume.Clone();
            this.TrunkVolumeCalculationMethod = measurement.TrunkVolumeCalculationMethod;
            this.TrunkComments = measurement.TrunkComments;
            this.FormType = measurement.FormType;
            this.NumberOfTrunks = measurement.NumberOfTrunks;
            this.TreeFormComments = measurement.TreeFormComments;
            this.Measured = measurement.Measured;
            this.Status = measurement.Status;
            this.HealthStatus = measurement.HealthStatus;
            this.AgeClass = measurement.AgeClass;
            this.Age = measurement.Age;
            this.AgeType = measurement.AgeType;
            this.TerrainType = measurement.TerrainType;
            this.TerrainShapeIndex = measurement.TerrainShapeIndex;
            this.LandformIndex = measurement.LandformIndex;
            this.OtherComments = measurement.OtherComments;
        }

        public void ApplyCorrection(Correction correction)
        {
            this.Corrections.Add(correction);
            this.CommonName = correction.CommonName;
            this.Genus = correction.Genus;
            this.Species = correction.Species;
            this.Name = correction.Name;
            this.MeasurersTreeID = correction.MeasurersTreeID;
            this.Coordinates = (Coordinates)correction.Coordinates.Clone();
            this.Elevation = (Elevation)correction.Elevation.Clone();
            this.PositionMeasurementType = correction.PositionMeasurementType;
            this.Height = (Height)correction.Height.Clone();
            this.HeightMeasurementType = correction.HeightMeasurementType;
            this.LaserBrand = correction.LaserBrand;
            this.ClinometerBrand = correction.ClinometerBrand;
            this.HeightComments = correction.HeightComments;
            this.GirthBreatHeight = (Height)correction.GirthBreatHeight.Clone();
            this.GirthMeasurementHeight = (Height)correction.GirthMeasurementHeight.Clone();
            this.GirthRootCollarHeight = (Height)correction.GirthRootCollarHeight.Clone();
            this.GirthComments = correction.GirthComments;
            this.MaximumCrownSpread = (Height)correction.MaximumCrownSpread.Clone();
            this.MaximumLimbLength = (Height)correction.MaximumLimbLength.Clone();
            this.AverageCrownSpread = (Height)correction.AverageCrownSpread.Clone();
            this.CrownSpreadMeasurementMethod = correction.CrownSpreadMeasurementMethod;
            this.BaseCrownHeight = (Height)correction.BaseCrownHeight.Clone();
            this.CrownVolume = (Volume)correction.CrownVolume.Clone();
            this.CrownVolumeCalculationMethod = correction.CrownVolumeCalculationMethod;
            this.CrownComments = correction.CrownComments;
            this.TrunkVolume = (Volume)correction.TrunkVolume.Clone();
            this.TrunkVolumeCalculationMethod = correction.TrunkVolumeCalculationMethod;
            this.TrunkComments = correction.TrunkComments;
            this.FormType = correction.FormType;
            this.NumberOfTrunks = correction.NumberOfTrunks;
            this.TreeFormComments = correction.TreeFormComments;
            this.Measured = correction.Measured;
            this.Status = correction.Status;
            this.HealthStatus = correction.HealthStatus;
            this.AgeClass = correction.AgeClass;
            this.Age = correction.Age;
            this.AgeType = correction.AgeType;
            this.TerrainType = correction.TerrainType;
            this.TerrainShapeIndex = correction.TerrainShapeIndex;
            this.LandformIndex = correction.LandformIndex;
            this.OtherComments = correction.OtherComments;
        }

        public void Delete(User responsibleUser)
        {
            IsDeleted = true;
            Deleted = DateTime.Now;
            Deletor = responsibleUser;
        }

        public bool IsValid
        {
            get 
            {
                return !string.IsNullOrWhiteSpace(CommonName)
                    && !string.IsNullOrWhiteSpace(Genus)
                    && !string.IsNullOrWhiteSpace(Species)
                    && FormType != EFormType.NotSpecified
                    && NumberOfTrunks != 0
                    && Measurers != 0
                    && Measured != DateTime.MinValue;
            }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> validationErrors = new List<string>();
            if (string.IsNullOrWhiteSpace(CommonName))
            {
                validationErrors.Add("Common name is required.");
            }
            if (string.IsNullOrWhiteSpace(Genus))
            {
                validationErrors.Add("Genus is required.");
            }
            if (string.IsNullOrWhiteSpace(Species))
            {
                validationErrors.Add("Species is required.");
            }
            if (FormType == EFormType.NotSpecified)
            {
                validationErrors.Add("Tree form type is required.");
            }
            if (NumberOfTrunks == 0)
            {
                validationErrors.Add("Number of trunks is required.");
            }
            if (Measurers == 0)
            {
                validationErrors.Add("Measurers must be included.");
            }
            if (Measured == DateTime.MinValue)
            {
                validationErrors.Add("Measurement date is required.");
            }
            return validationErrors;
        }
    }
}
