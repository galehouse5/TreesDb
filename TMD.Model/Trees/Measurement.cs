using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using TMD.Common;


namespace TMD.Model.Trees
{
    [Serializable]
    public class Measurement : EntityBase, IEntity, IIsValid, ICloneable
    {
        private Distance m_Height;
        private HeightMeasurements m_HeightMeasurements;
        private string m_CommonName;
        private string m_ScientificName;
        private string m_Name;
        private string m_MeasurersTreeId;
        private string m_HeightMeasurementType;
        private string m_LaserBrand;
        private string m_ClinometerBrand;
        private string m_HeightComments;
        private string m_GirthComments;
        private string m_CrownSpreadMeasurementMethod;
        private string m_CrownVolumeCalculationMethod;
        private string m_CrownComments;
        private string m_TrunkVolumeCalculationMethod;
        private string m_TrunkComments;
        private string m_TreeFormComments;
        private string m_HealthStatus;
        private string m_OtherComments;

        private Measurement()
        { }

        public string Code { get; internal set; }

        [EmptyStringValidator("Common name must be specified.")]
        [StringMaxLengthValidator("Common name must not exceed 100 characters.", 100)]
        public string CommonName 
        {
            get { return m_CommonName; }
            set { m_CommonName = value.Trim().ToTitleCase(); }
        }

        [EmptyStringValidator("Genus must be specified.")]
        [StringMaxLengthValidator("Genus must not exceed 100 characters.", 100)]
        public string ScientificName 
        {
            get { return m_ScientificName; }
            set { m_ScientificName = (value ?? string.Empty).ToSentenceCase(); }
        }

        [StringMaxLengthValidator("Name must not exceed 100 characters.", 100)]
        public string Name 
        {
            get { return m_Name; }
            set { m_Name = value.Trim().ToTitleCase(); }
        }

        [StringMaxLengthValidator("Measurers tree id must not exceed 100 characters.", 100)]
        public string MeasurersTreeId 
        {
            get { return m_MeasurersTreeId; }
            set { m_MeasurersTreeId = value.Trim(); }
        }

        public Coordinates Coordinates { get; set; }
        public Elevation Elevation { get; set; }
        public EPositionMeasurementType PositionMeasurementType { get; set; }
        public EGpsDatum GpsDatum { get; private set; }
        
        public Distance Height 
        {
            get { return m_Height; }
            set
            {
                if (HeightMeasurements == null || HeightMeasurements.IsNull)
                {
                    m_Height = value;
                }
            }
        }
        
        public HeightMeasurements HeightMeasurements 
        {
            get { return m_HeightMeasurements; }
            set
            {
                m_HeightMeasurements = value;
                if (!m_HeightMeasurements.IsNull)
                {
                    m_Height = (Distance)m_HeightMeasurements.Height.Clone();
                }
            }
        }

        [StringMaxLengthValidator("Height measurement type must not exceed 100 characters.", 100)]
        public string HeightMeasurementType 
        {
            get { return m_HeightMeasurementType; }
            set { m_HeightMeasurementType = value.Trim(); }
        }

        [StringMaxLengthValidator("Laser brand must not exceed 100 characters.", 100)]
        public string LaserBrand 
        {
            get { return m_LaserBrand; }
            set { m_LaserBrand = value.Trim().ToTitleCase(); }
        }

        [StringMaxLengthValidator("Clinometer brand must not exceed 100 characters.", 100)]
        public string ClinometerBrand 
        {
            get { return m_ClinometerBrand; }
            set { m_ClinometerBrand = value.Trim().ToTitleCase(); }
        }

        [StringMaxLengthValidator("Height comments must not exceed 300 characters.", 300)]
        public string HeightComments 
        {
            get { return m_HeightComments; }
            set { m_HeightComments = value.Trim(); }
        }

        public Distance GirthBreastHeight { get; set; }
        public Distance GirthMeasurementHeight { get; set; }
        public Distance GirthRootCollarHeight { get; set; }

        [StringMaxLengthValidator("Girth comments must not exceed 300 characters.", 300)]
        public string GirthComments 
        {
            get { return m_GirthComments; }
            set { m_GirthComments = value.Trim(); }
        }

        public Distance MaximumCrownSpread { get; set; }
        public Distance AverageCrownSpread { get; set; }
        public Distance MaximumLimbLength { get; set; }
        public Distance TDICrownSpread
        {
            get
            {
                if (!AverageCrownSpread.IsNull)
                {
                    return (Distance)AverageCrownSpread.Clone();
                }
                else
                {
                    return (Distance)MaximumCrownSpread.Clone();
                }
            }
            private set { }
        }

        [StringMaxLengthValidator("Crown spread measurement method must not exceed 100 characters.", 100)]
        public string CrownSpreadMeasurementMethod 
        {
            get { return m_CrownSpreadMeasurementMethod; }
            set { m_CrownSpreadMeasurementMethod = value.Trim(); }
        }

        public Distance BaseCrownHeight { get; set; }
        public Volume CrownVolume { get; set; }

        [StringMaxLengthValidator("Crown volume calculation method must not exceed 100 characters.", 100)]
        public string CrownVolumeCalculationMethod 
        {
            get { return m_CrownVolumeCalculationMethod; }
            set { m_CrownVolumeCalculationMethod = value.Trim(); }
        }

        [StringMaxLengthValidator("Crown comments must not exceed 300 characters.", 300)]
        public string CrownComments 
        {
            get { return m_CrownComments; }
            set { m_CrownComments = value.Trim(); }
        }

        public Volume TrunkVolume { get; set; }

        [StringMaxLengthValidator("Trunk volume calculation method must not exceed 100 characters.", 100)]
        public string TrunkVolumeCalculationMethod 
        {
            get { return m_TrunkVolumeCalculationMethod; }
            set { m_TrunkVolumeCalculationMethod = value.Trim(); }
        }

        [StringMaxLengthValidator("Trunk comments must not exceed 300 characters.", 300)]
        public string TrunkComments 
        {
            get { return m_TrunkComments; }
            set { m_TrunkComments = value.Trim(); }
        }

        public EFormType FormType { get; set; }

        [ZeroValidator("Number of trunks must be specified.")]
        public int NumberOfTrunks { get; set; }

        [StringMaxLengthValidator("Tree form comments must not exceed 300 characters.", 300)]
        public string TreeFormComments 
        {
            get { return m_TreeFormComments; }
            set { m_TreeFormComments = value.Trim(); }
        }

        [DateRangeValidator("Measured date must be specified.", "1/1/1753", "1/1/9999")]
        public Date Measured { get; set; }

        public EStatus Status { get; set; }

        [StringMaxLengthValidator("Health status must not exceed 100 characters.", 100)]
        public string HealthStatus 
        {
            get { return m_HealthStatus; }
            set { m_HealthStatus = value.Trim(); }
        }

        public EAgeClass AgeClass { get; set; }
        public EAgeType AgeType { get; set; }

        [NonNegativeValidator("Age must be non-negative.")]
        public int Age { get; set; }

        public ETerrainType TerrainType { get; set; }

        [NumberRangeValidator("TSI must be within the range of -1 to 1.", -1d, 1d)]
        public int TerrainShapeIndex { get; set; }

        [NumberRangeValidator("LFI must be within the range of 0 to 1.", 0f, 1d)]
        public int LandformIndex { get; set; }

        [StringMaxLengthValidator("Other comments must not exceed 300 characters.", 300)]
        public string OtherComments 
        {
            get { return m_OtherComments; }
            set { m_OtherComments = value.Trim(); }
        }

        [EmptyCollectionValidator("Measurement must contain measurers.")]
        [CollectionMaxCountValidator("Measurers must not exceed three.", 3)]
        internal IList<Measurer> Measurers { get; private set; }

        internal Measurer AddMeasurer()
        {
            Measurer m = new Measurer();
            Measurers.Add(m);
            return m;
        }

        internal bool RemoveMeasurer(Measurer m)
        {
            return Measurers.Remove(m);
        }

        public float LiveCrownRatio
        {
            get { return (float)(((double)Height.Feet - (double)BaseCrownHeight.Feet) / (double)Height.Feet); }
        }

        public float ENTSPNT2
        {
            get { return (float)(((double)Height.Feet * (double)GirthBreastHeight.Feet * (double)GirthBreastHeight.Feet) / 100d); }
        }

        #region ICloneable Members

        public object Clone()
        {
            Measurement c = new Measurement();
            c.Age = Age;
            c.AgeClass = AgeClass;
            c.AgeType = AgeType;
            c.AverageCrownSpread = (Distance)AverageCrownSpread.Clone();
            c.BaseCrownHeight = (Distance)BaseCrownHeight.Clone();
            c.ClinometerBrand = ClinometerBrand;
            c.Code = Code;
            c.CommonName = CommonName;
            c.Coordinates = (Coordinates)Coordinates.Clone();
            c.CrownComments = CrownComments;
            c.CrownSpreadMeasurementMethod = CrownSpreadMeasurementMethod;
            c.CrownVolume = (Volume)CrownVolume.Clone();
            c.CrownVolumeCalculationMethod = CrownVolumeCalculationMethod;
            c.Elevation = (Elevation)Elevation.Clone();
            c.FormType = FormType;
            c.ScientificName = ScientificName;
            c.GirthBreastHeight = (Distance)GirthBreastHeight.Clone();
            c.GirthComments = GirthComments;
            c.GirthMeasurementHeight = (Distance)GirthMeasurementHeight.Clone();
            c.GirthRootCollarHeight = (Distance)GirthRootCollarHeight.Clone();
            c.GpsDatum = GpsDatum;
            c.HealthStatus = HealthStatus;
            c.Height = (Distance)Height.Clone();
            c.HeightComments = HeightComments;
            c.HeightMeasurements = (HeightMeasurements)HeightMeasurements.Clone();
            c.HeightMeasurementType = HeightMeasurementType;
            c.LandformIndex = LandformIndex;
            c.LaserBrand = LaserBrand;
            c.MaximumCrownSpread = (Distance)MaximumCrownSpread.Clone();
            c.MaximumLimbLength = (Distance)MaximumLimbLength.Clone();
            c.Measured = Measured;
            c.Measurers = new List<Measurer>(Measurers);
            c.MeasurersTreeId = MeasurersTreeId;
            c.Name = Name;
            c.NumberOfTrunks = NumberOfTrunks;
            c.OtherComments = OtherComments;
            c.PositionMeasurementType = PositionMeasurementType;
            c.Status = Status;
            c.TerrainShapeIndex = TerrainShapeIndex;
            c.TerrainType = TerrainType;
            c.TreeFormComments = TreeFormComments;
            c.TrunkComments = TrunkComments;
            c.TrunkVolume = (Volume)TrunkVolume.Clone();
            c.TrunkVolumeCalculationMethod = TrunkVolumeCalculationMethod;
            return c;
        }

        #endregion

        internal static Measurement Create()
        {
            Measurement m = new Measurement();
            m.Coordinates = Coordinates.Null();
            m.Elevation = Elevation.Null();
            m.PositionMeasurementType = EPositionMeasurementType.NotSpecified;
            m.GpsDatum = EGpsDatum.WGS84NAD83;
            m.Height = Distance.Null();
            m.HeightMeasurements = HeightMeasurements.Null();
            m.GirthBreastHeight = Distance.Null();
            m.GirthMeasurementHeight = Distance.Null();
            m.GirthRootCollarHeight = Distance.Null();
            m.MaximumCrownSpread = Distance.Null();
            m.MaximumLimbLength = Distance.Null();
            m.AverageCrownSpread = Distance.Null();
            m.BaseCrownHeight = Distance.Null();
            m.CrownVolume = Volume.Null();
            m.TrunkVolume = Volume.Null();
            m.FormType = EFormType.NotSpecified;
            m.Measured = Date.Now;
            m.Status = EStatus.Native;
            m.AgeClass = EAgeClass.NotSpecified;
            m.AgeType = EAgeType.NotSpecified;
            m.TerrainType = ETerrainType.NotSpecified;
            m.Measurers = new List<Measurer>();
            return m;
        }
    }
}
