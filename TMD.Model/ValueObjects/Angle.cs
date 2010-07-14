using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;

namespace TMD.Model
{
    public enum AngleFormat
    {
        Invalid = 0,
        Unspecified = 1,
        Default = 2,
        Decimal = 3
    }

    [Serializable]
    public class Angle : IIsSpecified
    {
        private Angle()
        { }

        [RangeValidator(0f, RangeBoundaryType.Inclusive, 90f, RangeBoundaryType.Inclusive, MessageTemplate = "Angle must be in the range of 0 to 90 degrees.", Ruleset = "Screening")]
        public float Degrees { get; private set; }

        [ObjectEqualityValidator(AngleFormat.Invalid, Negated = true, MessageTemplate = "Angle must be in decimal format.", Ruleset = "Screening")]
        public AngleFormat InputFormat { get; private set; }

        public float Radians
        {
            get
            {
                return (float)(((double)Degrees / 360d) * 2d * Math.PI);
            }
        }

        public override string ToString()
        {
            string s;
            switch (InputFormat)
            {
                case AngleFormat.Default:
                case AngleFormat.Decimal:
                    s = Degrees.ToString();
                    break;
                default:
                    s = string.Empty;
                    break;
            }
            return s;
        }

        public static bool operator ==(Angle a1, Angle a2)
        {
            if ((object)a1 == null || (object)a2 == null)
            {
                return (object)a1 == null && (object)a2 == null;
            }
            return a1.Degrees == a2.Degrees;
        }

        public static bool operator !=(Angle a1, Angle a2)
        {
            if ((object)a1 == null || (object)a2 == null)
            {
                return !((object)a1 == null && (object)a2 == null);
            }
            return a1.Degrees != a2.Degrees;
        }

        public override bool Equals(object obj)
        {
            Angle a = obj as Angle;
            return a != null && a == this;
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
                    InputFormat = AngleFormat.Unspecified
                };
            }
            if (float.TryParse(s.Trim(), out degrees))
            {
                return new Angle()
                {
                    Degrees = degrees,
                    InputFormat = AngleFormat.Decimal
                };
            }
            return new Angle()
            {
                Degrees = 0f,
                InputFormat = AngleFormat.Invalid
            };
        }

        public static Angle Create(float degrees)
        {
            return new Angle()
            {
                Degrees = degrees,
                InputFormat = AngleFormat.Default
            };
        }

        public static Angle Null()
        {
            return new Angle()
            {
                Degrees = 0f,
                InputFormat = AngleFormat.Unspecified
            };
        }

        #region IIsSpecified Members

        public bool IsSpecified
        {
            get { return InputFormat != AngleFormat.Unspecified; }
        }

        #endregion
    }
}
