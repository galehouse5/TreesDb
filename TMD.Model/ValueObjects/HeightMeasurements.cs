using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;

namespace TMD.Model
{
    [Serializable]
    public class HeightMeasurements : IIsSpecified
    {
        private HeightMeasurements() 
        { }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening")]
        public Distance DistanceTop { get; private set; }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening")]
        public Angle AngleTop { get; private set; }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening")]
        public Distance DistanceBottom { get; private set; }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening")]
        public Angle AngleBottom { get; private set; }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening")]
        public DirectedDistance VerticalOffset { get; private set; }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening")]
        public Distance Height 
        {
            get { return calculateHeight(DistanceTop, AngleTop, DistanceBottom, AngleBottom, VerticalOffset); }
        }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening")]
        public Distance Offset
        {
            get { return calculateOffset(DistanceTop, AngleTop, DistanceBottom, AngleBottom, VerticalOffset); }
        }

        private static Distance calculateHeight(Distance distanceTop, Angle angleTop, Distance distanceBottom, Angle angleBottom, DirectedDistance verticalOffset)
        {
            float height = (float)(Math.Sin(angleTop.Degrees) * (double)distanceTop.Feet 
                + Math.Sin(angleBottom.Degrees) * (double)distanceBottom.Feet 
                + (double)verticalOffset.Feet);
            if (height == 0f)
            {
                return Distance.Null();
            }
            return Distance.Create(height);
        }

        private static Distance calculateOffset(Distance distanceTop, Angle angleTop, Distance distanceBottom, Angle angleBottom, DirectedDistance verticalOffset)
        {
            float offset = (float)(Math.Cos(angleBottom.Degrees) * (double)distanceBottom.Feet 
                - Math.Cos(angleTop.Degrees) * (double)distanceTop.Feet);
            if (offset == 0f)
            {
                return Distance.Null();
            }
            return Distance.Create(Math.Abs(offset));
        }

        public static bool operator ==(HeightMeasurements hm1, HeightMeasurements hm2)
        {
            if ((object)hm1 == null || (object)hm2 == null)
            {
                return (object)hm1 == null && (object)hm2 == null;
            }
            return hm1.DistanceTop == hm2.DistanceTop
                && hm1.AngleTop == hm2.AngleTop
                && hm1.DistanceBottom == hm2.DistanceBottom
                && hm1.AngleBottom == hm2.AngleBottom
                && hm1.VerticalOffset == hm2.VerticalOffset;
        }

        public static bool operator !=(HeightMeasurements hm1, HeightMeasurements hm2)
        {
            if ((object)hm1 == null || (object)hm2 == null)
            {
                return !((object)hm1 == null && (object)hm2 == null);
            }
            return hm1.DistanceTop != hm2.DistanceTop
                || hm1.AngleTop != hm2.AngleTop
                || hm1.DistanceBottom != hm2.DistanceBottom
                || hm1.AngleBottom != hm2.AngleBottom
                || hm1.VerticalOffset != hm2.VerticalOffset;
        }

        public override bool Equals(object obj)
        {
            HeightMeasurements hm = obj as HeightMeasurements;
            return hm != null && hm == this;
        }

        public override int GetHashCode()
        {
            return DistanceTop.GetHashCode()
                ^ AngleTop.GetHashCode()
                ^ DistanceBottom.GetHashCode()
                ^ AngleBottom.GetHashCode();
        }

        #region IIsSpecified Members

        public bool IsSpecified
        {
            get { return Height.IsSpecified; }
        }

        #endregion

        public static HeightMeasurements Create(Distance distanceTop, Angle angleTop, Distance distanceBottom, Angle angleBottom, DirectedDistance verticalOffset)
        {
            return new HeightMeasurements()
            {
                AngleBottom = angleBottom,
                AngleTop = angleTop,
                DistanceBottom = distanceBottom,
                DistanceTop = distanceTop,
                VerticalOffset = verticalOffset
            };
        }

        public static HeightMeasurements Null()
        {
            return new HeightMeasurements()
            {
                AngleBottom = Angle.Null(),
                AngleTop = Angle.Null(),
                DistanceBottom = Distance.Null(),
                DistanceTop = Distance.Null(),
                VerticalOffset = DirectedDistance.Null()
            };
        }
    }
}
