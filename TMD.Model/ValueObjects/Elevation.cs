using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;

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

    [Serializable]
    public class Elevation : IIsSpecified
    {
        public const float MinTreeLineFeet = 0;
        public const float MaxTreeLineFeet = 17000;

        private Elevation()
        { }

        [RangeValidator(MinTreeLineFeet, RangeBoundaryType.Inclusive, float.MaxValue, RangeBoundaryType.Inclusive, MessageTemplate = "Elevation must not fall below min global tree line of {3} feet.", Ruleset = "Screening")]
        [RangeValidator(float.MinValue, RangeBoundaryType.Inclusive, MaxTreeLineFeet, RangeBoundaryType.Inclusive, MessageTemplate = "Elevation must not exceed max global tree line of {5} feet.", Ruleset = "Screening")]
        public float Feet { get; private set; }

        [ObjectEqualityValidator(ElevationFormat.Invalid, Negated = true, MessageTemplate = "Elevation must be in fffff ft or mmmmm m format.", Ruleset = "Screening")]
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
            string s;
            switch (InputFormat)
            {
                case ElevationFormat.Default:
                case ElevationFormat.DecimalFeet:
                    s = string.Format("{0:0.0} ft", Feet);
                    break;
                case ElevationFormat.DecimalMeters:
                    s = string.Format("{0:0.00} m", Meters);
                    break;
                case ElevationFormat.DecimalYards:
                    s = string.Format("{0:0.00} yd", Yards);
                    break;
                default:
                    s = string.Empty;
                    break;
            }
            return s;
        }

        #region IIsSpecified Members

        public bool IsSpecified
        {
            get { return InputFormat != ElevationFormat.Unspecified; }
        }

        #endregion

        private static Regex DecimalFeetFormat = new Regex("^\\s*(?<feet>[0-9]+(\\.[0-9]+)?)((\\s*'')|(\\s*ft)|(\\s*feet))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalMetersFormat = new Regex("^\\s*(?<meters>[0-9]+(\\.[0-9]+)?)((\\s*m)|(\\s*meters?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalYardsFormat = new Regex("^\\s*(?<yards>[0-9]+(\\.[0-9]+)?)((\\s*yds?)|(\\s*yards?))\\s*$", RegexOptions.Compiled);

        public static Elevation Create(string s)
        {
            Match match;
            float feet;
            ElevationFormat inputFormat;
            if ((match = DecimalFeetFormat.Match(s)).Success)
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
                InputFormat = inputFormat
            };
        }

        public static Elevation Create(float feet)
        {
            return new Elevation()
            {
                Feet = feet,
                InputFormat = ElevationFormat.Default
            };
        }

        public static Elevation Null()
        {
            return new Elevation()
            {
                Feet = 0f,
                InputFormat = ElevationFormat.Unspecified
            };
        }
    }
}
