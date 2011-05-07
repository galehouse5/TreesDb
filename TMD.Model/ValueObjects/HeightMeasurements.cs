using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using System.ComponentModel;
using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;

namespace TMD.Model
{
    [ContextMethod("ValidateCanCalculateHeightIfSpecified", Tags = ValidationTag.Screening)]
    [ContextMethod("ValidateCanCalculateOffsetIfSpecified", Tags = ValidationTag.Screening)]
    public class HeightMeasurements : ISpecified
    {
        private HeightMeasurements() 
        { }

        [Valid] public Distance DistanceTop { get; private set; }
        [Valid] public Angle AngleTop { get; private set; }
        [Valid] public Distance DistanceBottom { get; private set; }
        [Valid] public Angle AngleBottom { get; private set; }
        [Valid] public DirectedDistance VerticalOffset { get; private set; }

        public bool IsSpecified { get { return DistanceTop.IsSpecified || AngleTop.IsSpecified || AngleTop.IsSpecified || AngleBottom.IsSpecified || VerticalOffset.IsSpecified; } }

        [Valid] public Distance Height { get { return calculateHeight(DistanceTop, AngleTop, DistanceBottom, AngleBottom, VerticalOffset); } }
        [Valid] public Distance Offset { get { return calculateOffset(DistanceTop, AngleTop, DistanceBottom, AngleBottom, VerticalOffset); } }

        protected internal virtual void ValidateCanCalculateHeightIfSpecified(IConstraintValidatorContext context)
        {
            if (IsSpecified && !Height.IsSpecified)
            {
                context.AddInvalid<HeightMeasurements, Distance>("You must specify proper distance and angle measurements to calculate a height.", hm => hm.Height);
            }
        }

        protected internal virtual void ValidateCanCalculateOffsetIfSpecified(IConstraintValidatorContext context)
        {
            if (IsSpecified && !Height.IsSpecified)
            {
                context.AddInvalid<HeightMeasurements, Distance>("You must specify proper distance and angle measurements to calculate an offset.", hm => hm.Offset);
            }
        }

        private static Distance calculateHeight(Distance distanceTop, Angle angleTop, Distance distanceBottom, Angle angleBottom, DirectedDistance verticalOffset)
        {
            float height = (float)(Math.Sin(angleTop.Radians) * (double)distanceTop.Feet
                + Math.Sin(angleBottom.Radians) * (double)distanceBottom.Feet 
                + (double)verticalOffset.Feet);
            if (height == 0f)
            {
                return Distance.Null();
            }
            return Distance.Create(height);
        }

        private static Distance calculateOffset(Distance distanceTop, Angle angleTop, Distance distanceBottom, Angle angleBottom, DirectedDistance verticalOffset)
        {
            float offset = (float)(Math.Cos(angleBottom.Radians) * (double)distanceBottom.Feet
                - Math.Cos(angleTop.Radians) * (double)distanceBottom.Feet);
            if (offset == 0f)
            {
                return Distance.Null();
            }
            return Distance.Create(Math.Abs(offset));
        }

        public override bool Equals(object obj)
        {
            var other = obj as HeightMeasurements;
            return other != null
                && DistanceTop.Equals(other.DistanceTop)
                && AngleTop.Equals(other.AngleTop)
                && DistanceBottom.Equals(other.DistanceBottom)
                && AngleBottom.Equals(other.AngleBottom)
                && VerticalOffset.Equals(other.VerticalOffset);
        }

        public override int GetHashCode()
        {
            return DistanceTop.GetHashCode()
                ^ AngleTop.GetHashCode()
                ^ DistanceBottom.GetHashCode()
                ^ AngleBottom.GetHashCode();
        }

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
