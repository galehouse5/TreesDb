using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;

namespace TMD.Model
{
    [Serializable]
    public class HeightMeasurements : ICloneable, IIsValid, IIsNull
    {
        private HeightMeasurements() { }

        private HeightMeasurements(Distance distanceTop, Angle angleTop, Distance distanceBottom, Angle angleBottom, DirectedDistance verticalOffset)
        {
            this.DistanceTop = distanceTop;
            this.AngleTop = angleTop;
            this.DistanceBottom = distanceBottom;
            this.AngleBottom = angleBottom;
            this.VerticalOffset = verticalOffset;
            this.Height = CalculateHeight(distanceTop, angleTop, distanceBottom, angleBottom, verticalOffset);
            this.Offset = CalculateOffset(distanceTop, angleTop, distanceBottom, angleBottom, verticalOffset);
        }

        public Distance DistanceTop { get; private set; }
        public Angle AngleTop { get; private set; }
        public Distance DistanceBottom { get; private set; }
        public Angle AngleBottom { get; private set; }
        public DirectedDistance VerticalOffset { get; private set; }
        public Distance Height { get; private set; }
        public Distance Offset { get; private set; }

        public static Distance CalculateHeight(Distance distanceTop, Angle angleTop, Distance distanceBottom, Angle angleBottom, DirectedDistance verticalOffset)
        {
            float height = (float)(Math.Sin(angleTop.Degrees) * (double)distanceTop.Feet + Math.Sin(angleBottom.Degrees) * (double)distanceBottom.Feet + (double)verticalOffset.Feet);
            return Distance.Create(height);
        }

        public static Distance CalculateOffset(Distance distanceTop, Angle angleTop, Distance distanceBottom, Angle angleBottom, DirectedDistance verticalOffset)
        {
            float offset = (float)(Math.Cos(angleBottom.Degrees) * (double)distanceBottom.Feet - Math.Cos(angleTop.Degrees) * (double)distanceTop.Feet);
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

        #region ICloneable Members

        public object Clone()
        {
            return new HeightMeasurements((Distance)DistanceTop.Clone(), (Angle)AngleTop.Clone(), (Distance)DistanceBottom.Clone(), (Angle)AngleBottom.Clone(), (DirectedDistance)VerticalOffset.Clone());
        }

        #endregion

        #region IIsValid Members

        public bool IsValid
        {
            get 
            {
                return DistanceTop.IsValid
                    && AngleTop.IsValid
                    && DistanceBottom.IsValid
                    && AngleBottom.IsValid
                    && VerticalOffset.IsValid
                    && Height.Feet >= 0f;
            }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            errors.AddRange(DistanceTop.GetValidationErrors());
            errors.AddRange(AngleTop.GetValidationErrors());
            errors.AddRange(DistanceBottom.GetValidationErrors());
            errors.AddRange(AngleBottom.GetValidationErrors());
            errors.AddRange(VerticalOffset.GetValidationErrors());
            if (Height.Feet < 0f)
            {
                errors.Add("Calculated height is negative, double check angle measurements.");
            }
            return errors;
        }

        #endregion

        #region IIsNull Members

        public bool IsNull
        {
            get { return Height.IsNull; }
        }

        #endregion

        public static HeightMeasurements Create(Distance distanceTop, Angle angleTop, Distance distanceBottom, Angle angleBottom, DirectedDistance verticalOffset)
        {
            return new HeightMeasurements(distanceTop, angleTop, distanceBottom, angleBottom, verticalOffset);
        }

        public static HeightMeasurements Null()
        {
            return new HeightMeasurements(Distance.Null(), Angle.Null(), Distance.Null(), Angle.Null(), DirectedDistance.Null());
        }
    }
}
