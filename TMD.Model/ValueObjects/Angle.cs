using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using NHibernate.Validator.Constraints;

namespace TMD.Model
{
    public enum AngleFormat
    {
        Invalid = 0,
        Unspecified = 1,
        Default = 2,
        Decimal = 3
    }

    public class Angle : ISpecified
    {
        private Angle()
        { }

        public string RawValue { get; private set; }

        [Within2(0f, 90f, Inclusive = true, Message = "Angle must be in the range of 0 to 90 degrees.", Tags = Tag.Screening)]
        public float Degrees { get; private set; }

        [NotEquals(AngleFormat.Invalid, Message = "Angle must be in decimal format.", Tags = Tag.Screening)]
        public AngleFormat InputFormat { get; private set; }

        public float Radians { get { return (float)(((double)Degrees / 360d) * 2d * Math.PI); } }
        public bool IsSpecified { get { return InputFormat != AngleFormat.Unspecified; } }

        public override string ToString()
        {
            switch (InputFormat)
            {
                case AngleFormat.Default:
                case AngleFormat.Decimal:
                    return Degrees.ToString();
                default:
                    return RawValue;
            }
        }

        public override bool Equals(object obj)
        {
            var other = obj as Angle;
            return other != null && Degrees.Equals(other.Degrees);
        }

        public override int GetHashCode()
        {
            return Degrees.GetHashCode();
        }

        public static Angle Create(string s)
        {
            float degrees;
            if (string.IsNullOrWhiteSpace(s))
            {
                return new Angle()
                {
                    Degrees = 0,
                    InputFormat = AngleFormat.Unspecified,
                    RawValue = s
                };
            }
            if (float.TryParse(s.Trim(), out degrees))
            {
                return new Angle()
                {
                    Degrees = degrees,
                    InputFormat = AngleFormat.Decimal,
                    RawValue = s
                };
            }
            return new Angle()
            {
                Degrees = 0f,
                InputFormat = AngleFormat.Invalid,
                RawValue = s
            };
        }

        public static Angle Create(float degrees)
        {
            return new Angle()
            {
                Degrees = degrees,
                InputFormat = AngleFormat.Default,
                RawValue = degrees.ToString()
            };
        }

        public static Angle Null()
        {
            return new Angle()
            {
                Degrees = 0f,
                InputFormat = AngleFormat.Unspecified,
                RawValue = string.Empty
            };
        }
    }
}
