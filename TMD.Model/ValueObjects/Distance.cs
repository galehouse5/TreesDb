using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;

namespace TMD.Model
{
    public enum DistanceFormat
    {
        Invalid = 0,
        Unspecified = 1,
        Default = 2,
        FeetDecimalInches = 3,
        DecimalFeet = 4,
        DecimalInches = 5,
        DecimalMeters = 6,
        DecimalYards = 7
    }

    [Serializable]
    public class Distance : IIsSpecified
    {
        private Distance()
        { }

        [RangeValidator(0f, RangeBoundaryType.Inclusive, float.MaxValue, RangeBoundaryType.Inclusive, MessageTemplate = "Distance must be non-negative.")]
        public float Feet { get; private set; }

        [ObjectEqualityValidator(DistanceFormat.Invalid, Negated = true, MessageTemplate = "Distance must be in fff.f', fff' ii'', mmm.mm m, or yyy.yy yd format.", Ruleset = "Screening")]
        public DistanceFormat InputFormat { get; private set; }

        public int WholeFeet
        {
            get { return (int)Math.Floor(Feet); }
        }

        public float RemainderInches
        {
            get { return 12f * (Feet - WholeFeet); }
        }

        public float Inches
        {
            get { return 12f * Feet; }
        }

        public float Yards
        {
            get { return 3f * Feet; }
        }

        public float Meters
        {
            get { return Feet / 3.2808399f; }
        }

        public static bool operator ==(Distance d1, Distance d2)
        {
            if ((object)d1 == null || (object)d2 == null)
            {
                return (object)d1 == null && (object)d2 == null;
            }
            return d1.Feet == d2.Feet;
        }

        public static bool operator !=(Distance d1, Distance d2)
        {
            if ((object)d1 == null || (object)d2 == null)
            {
                return !((object)d1 == null && (object)d2 == null);
            }
            return d1.Feet != d2.Feet;
        }

        public override bool Equals(object obj)
        {
            Distance d = obj as Distance;
            return d != null && d == this;
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
                case DistanceFormat.Default:
                case DistanceFormat.DecimalFeet:
                    s = string.Format("{0:0.0}'", Feet);
                    break;
                case DistanceFormat.DecimalInches:
                    s = string.Format("{0:0}''", Inches);
                    break;
                case DistanceFormat.DecimalMeters:
                    s = string.Format("{0:0.00} m", Meters);
                    break;
                case DistanceFormat.DecimalYards:
                    s = string.Format("{0:0.00} yd", Yards);
                    break;
                case DistanceFormat.FeetDecimalInches:
                    s = string.Format("{0:0}' {1:0}''", WholeFeet, RemainderInches);
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
            get { return InputFormat != DistanceFormat.Unspecified; }
        }

        #endregion

        private static Regex FeetDecimalInchesFormat = new Regex("^\\s*(?<feet>[0-9]+(\\.[0-9]+)?)((\\s*')|(\\s*ft)|(\\s*feet))\\s+(?<inches>[0-9]+(\\.[0-9]+)?)((\\s*'')|(\\s*in)|(\\s*inches?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalFeetFormat = new Regex("^\\s*(?<feet>[0-9]+(\\.[0-9]+)?)((\\s*')|(\\s*ft)|(\\s*feet))?\\s*$", RegexOptions.Compiled);
        private static Regex DecimalInchesFormat = new Regex("^\\s*(?<inches>[0-9]+(\\.[0-9]+)?)((\\s*'')|(\\s*in)|(\\s*inches?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalMetersFormat = new Regex("^\\s*(?<meters>[0-9]+(\\.[0-9]+)?)((\\s*m)|(\\s*meters?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalYardsFormat = new Regex("^\\s*(?<yards>[0-9]+(\\.[0-9]+)?)((\\s*yds?)|(\\s*yards?))\\s*$", RegexOptions.Compiled);

        public static Distance Create(string s)
        {
            Match match;
            float feet;
            DistanceFormat inputFormat;
            if (string.IsNullOrWhiteSpace(s))
            {
                feet = 0;
                inputFormat = DistanceFormat.Unspecified;
            }
            else if ((match = FeetDecimalInchesFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["feet"].Value);
                feet += float.Parse(match.Groups["inches"].Value) / 12f;
                inputFormat = DistanceFormat.FeetDecimalInches;
            }
            else if ((match = DecimalFeetFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["feet"].Value);
                inputFormat = DistanceFormat.DecimalFeet;
            }
            else if ((match = DecimalInchesFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["inches"].Value) / 12f;
                inputFormat = DistanceFormat.DecimalInches;
            }
            else if ((match = DecimalMetersFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["meters"].Value) * 3.2808399f;
                inputFormat = DistanceFormat.DecimalMeters;
            }
            else if ((match = DecimalYardsFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["yards"].Value) * 3f;
                inputFormat = DistanceFormat.DecimalYards;
            }
            else
            {
                feet = 0f;
                inputFormat = DistanceFormat.Invalid;
            }
            return new Distance()
            {
                Feet = feet,
                InputFormat = inputFormat
            };
        }

        public static Distance Create(float feet)
        {
            return new Distance()
            {
                Feet = feet,
                InputFormat = DistanceFormat.Default
            };
        }

        public static Distance Null()
        {
            return new Distance()
            {
                Feet = 0f,
                InputFormat = DistanceFormat.Unspecified
            };
        }
    }
}
