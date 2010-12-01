using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using System.Diagnostics;
using NHibernate.Validator.Constraints;
using System.ComponentModel;
using TMD.Model.Extensions;

namespace TMD.Model.Trips
{
    public enum MultiTrunkTreeFormType
    {
        [Description("")]
        NotSpecified = TreeFormType.NotSpecified,
        Multi = TreeFormType.Multi,
        Fusion = TreeFormType.Fusion,
        Coppice = TreeFormType.Coppice,
        Colony = TreeFormType.Colony,
        Vine = TreeFormType.Vine
    }

    [Serializable]
    [DebuggerDisplay("{ScientificName} (multi trunk)")]
    public class MultiTrunkTreeMeasurement : TreeMeasurementBase
    {
        protected MultiTrunkTreeMeasurement()
        { }

        private int? m_NumberOfTrunks;
        
        [Range(2, int.MaxValue, Message = "Number of trunks must be greater than one.", Tags = Tag.Screening)]
        public override int? NumberOfTrunks 
        {
            get 
            {
                if (m_NumberOfTrunks == null && TrunkMeasurements.Count > 1)
                {
                    m_NumberOfTrunks = TrunkMeasurements.Count;
                }
                else if (m_NumberOfTrunks != null)
                {
                    m_NumberOfTrunks = Math.Max((int)m_NumberOfTrunks, TrunkMeasurements.Count);
                }
                return m_NumberOfTrunks; 
            }
            set { m_NumberOfTrunks = value; }
        }

        [NotEqualsAttribute(TreeFormType.Single, Message = "Form type must not be single.", Tags = Tag.Screening)]
        public override TreeFormType FormType { get; set; }

        public virtual MultiTrunkTreeFormType MultiTrunkFormType
        {
            get { return (MultiTrunkTreeFormType)FormType; }
            set { FormType = (TreeFormType)value; }
        }

        public override Distance Girth { get; set; }

        public virtual Distance CombinedGirth
        {
            get { return Girth; }
            set { Girth = value; }
        }
        
        [Range(1, int.MaxValue, Message = "Number of trunks in combined girth must be positive.", Tags = Tag.Screening)]
        public virtual int? CombinedGirthNumberOfTrunks { get; set; }

        public override Distance CrownSpread { get; set; }

        public virtual Distance CombinedCrownSpread
        {
            get { return CrownSpread; }
            set { CrownSpread = value; }
        }

        [Valid]
        [Size(0, 100, Message = "This tree contains too many trunk measurements.", Tags = new [] { Tag.Screening, Tag.Persistence })]
        public virtual IList<TrunkMeasurement> TrunkMeasurements { get; private set; }

        public virtual TrunkMeasurement AddTrunkMeasurement()
        {
            TrunkMeasurement tm = TrunkMeasurement.Create(this);
            TrunkMeasurements.Add(tm);
            return tm;
        }

        public virtual bool RemoveTrunkMeasurement(TrunkMeasurement tm)
        {
            return TrunkMeasurements.Remove(tm);
        }

        internal static MultiTrunkTreeMeasurement Create(SubsiteVisit ssv)
        {
            return new MultiTrunkTreeMeasurement
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
                FormType = TreeFormType.Multi,
                NumberOfTrunks = null,
                TreeFormComments = string.Empty,
                TerrainType = TreeTerrainType.NotSpecified,
                TerrainShapeIndex = null,
                LandformIndex = null,
                TerrainComments = string.Empty,
                SubsiteVisit = ssv,
                MakeCoordinatesPublic = true,
                IncludeHeightDistanceAndAngleMeasurements = false,
                CombinedGirthNumberOfTrunks = null,
                TrunkMeasurements = new List<TrunkMeasurement>()
            }.RecordCreation() as MultiTrunkTreeMeasurement;
        }
    }
}
