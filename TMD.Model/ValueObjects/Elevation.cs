using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using TMD.Model.Validation;
using NHibernate.Validator.Constraints;

namespace TMD.Model
{
    public enum ElevationFormat
    {
        Invalid = 0,
        Unspecified = 1,
        Default = 2,
        DecimalFeet = 3,
        DecimalMeters = 4,
        DecimalYards = 5
    }

    public class Elevation : ISpecified
    {
        private Elevation()
        { }

        public string RawValue { get; private set; }

        [Within2(0, 17000, Inclusive = true, Message = "Elevation must fall within sea level to 17000 feet.", Tags = ValidationTag.Screening)]
        public float Feet { get; private set; }

        [NotEqualsAttribute(ElevationFormat.Invalid, Message = "Elevation must be in fffff ft or mmmmm m format.", Tags = ValidationTag.Screening)]
        public ElevationFormat InputFormat { get; private set; }

        public float Yards
        {
            get { return Feet / 3f; }
        }

        public float Meters
        {
            get { return Feet / 3.2808399f; }
        }

        public static bool operator ==(Elevation e1, Elevation e2)
        {
            if ((object)e1 == null || (object)e2 == null)
            {
                return (object)e1 == null && (object)e2 == null;
            }
            return e1.Feet == e2.Feet;
        }

        public static bool operator !=(Elevation e1, Elevation e2)
        {
            if ((object)e1 == null || (object)e2 == null)
            {
                return !((object)e1 == null && (object)e2 == null);
            }
            return e1.Feet != e2.Feet;
        }

        public override bool Equals(object obj)
        {
            Elevation e = obj as Elevation;
            return e != null && e == this;
        }

        public override int GetHashCode()
        {
            return Feet.GetHashCode();
        }

        public override string ToString()
        {
            return ToString(InputFormat);
        }

        public string ToString(ElevationFormat format)
        {
            if (!IsSpecified)
            {
                return string.Empty;
            }
            switch (format)
            {
                case ElevationFormat.Default:
                case ElevationFormat.DecimalFeet:
                    return string.Format("{0:0.0} ft", Feet);
                case ElevationFormat.DecimalMeters:
                    return string.Format("{0:0.00} m", Meters);
                case ElevationFormat.DecimalYards:
                    return string.Format("{0:0.00} yd", Yards);
                default:
                    return RawValue;
            }
        }

        public string ToString(Units units, bool useSubprefixPrecision = false)
        {
            if (!IsSpecified)
            {
                return string.Empty;
            }
            switch (units)
            {
                case Units.Default:
                case Units.Feet:
                    return string.Format("{0:0.0} ft", Feet);
                case Units.Meters:
                    return string.Format("{0:0.00} m", Meters);
                case Units.Yards:
                    return string.Format("{0:0.00} yd", Yards);
                default:
                    throw new NotImplementedException();
            }
        }

        #region IIsSpecified Members

        public bool IsSpecified
        {
            get { return InputFormat != ElevationFormat.Unspecified; }
        }

        #endregion

        private static Regex DecimalFeetFormat = new Regex("^\\s*(?<feet>[0-9]+(\\.[0-9]+)?)\\s*('|`|ft|feets?|foots?)?\\s*$", RegexOptions.Compiled);
        private static Regex DecimalMetersFormat = new Regex("^\\s*(?<meters>[0-9]+(\\.[0-9]+)?)\\s*(ms?|meters?|metres?)\\s*$", RegexOptions.Compiled);
        private static Regex DecimalYardsFormat = new Regex("^\\s*(?<yards>[0-9]+(\\.[0-9]+)?)\\s*(ys?|yds?|yards?)\\s*$", RegexOptions.Compiled);

        public static Elevation Create(string s)
        {
            Match match;
            float feet;
            ElevationFormat inputFormat;
            if (string.IsNullOrWhiteSpace(s))
            {
                feet = 0;
                inputFormat = ElevationFormat.Unspecified;
            }
            else if ((match = DecimalFeetFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["feet"].Value);
                inputFormat = ElevationFormat.DecimalFeet;
            }
            else if ((match = DecimalMetersFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["meters"].Value) * 3.2808399f;
                inputFormat = ElevationFormat.DecimalMeters;
            }
            else if ((match = DecimalYardsFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["yards"].Value) * 3f;
                inputFormat = ElevationFormat.DecimalYards;
            }
            else
            {
                feet = 0f;
                inputFormat = ElevationFormat.Invalid;
            }
            return new Elevation()
            {
                Feet = feet,
                InputFormat = inputFormat,
                RawValue = s
            };
        }

        public static Elevation Create(float feet)
        {
            return new Elevation()
            {
                Feet = feet,
                InputFormat = ElevationFormat.Default,
                RawValue = feet.ToString()
            };
        }

        public static Elevation Null()
        {
            return new Elevation()
            {
                Feet = 0f,
                InputFormat = ElevationFormat.Unspecified,
                RawValue = string.Empty
            };
        }
    }
}
