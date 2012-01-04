using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using TMD.Model.Validation;

namespace TMD.Model
{
    public enum DirectedDistanceFormat
    {
        Invalid = 0,
        Unspecified = 1,
        Default = 2,
        FeetDecimalInches = 3,
        DecimalFeet = 4,
        DecimalInches = 5,
        DecimalMeters = 6,
        DecimalYards = 7,
        DecimalCentimeters = 8
    }

    public class DirectedDistance : ISpecified
    {
        private DirectedDistance()
        { }

        public string RawValue { get; private set; }
        public float Feet { get; private set; }

        [NotEqualsAttribute(DirectedDistanceFormat.Invalid, Message = "Directed distance must be in +/-fff.f', +/-fff' ii'', +/-mmm.mm m, or +/-yyy.yy yd format.", Tags = ValidationTag.Screening)]
        public DirectedDistanceFormat InputFormat { get; private set; }

        public int Sign { get { return Math.Sign(Feet); } }
        public float AbsoluteFeet { get { return Math.Abs(Feet); } }
        public int AbsoluteWholeFeet { get { return (int)Math.Floor(AbsoluteFeet); } }
        public float AbsoluteRemainderInches { get { return 12f * (AbsoluteFeet - AbsoluteWholeFeet); } }
        public float AbsoluteInches { get { return 12f * AbsoluteFeet; } }
        public float AbsoluteYards { get { return 3f * AbsoluteFeet; } }
        public float AbsoluteMeters { get { return AbsoluteFeet / 3.2808399f; } }
        public float AbsoluteCentimeters { get { return AbsoluteMeters * 100f; } }
        public bool IsSpecified { get { return InputFormat != DirectedDistanceFormat.Unspecified; } }

        public override bool Equals(object obj)
        {
            var other = obj as DirectedDistance;
            return other != null && Feet.Equals(other.Feet);
        }

        public override int GetHashCode()
        {
            return Feet.GetHashCode();
        }

        public override string ToString()
        {
            switch (InputFormat)
            {
                case DirectedDistanceFormat.Default :
                case DirectedDistanceFormat.DecimalFeet:
                    return string.Format("{0}{1:0.0}'", (Sign < 0) ? "-" : "", AbsoluteFeet);
                case DirectedDistanceFormat.DecimalInches:
                    return string.Format("{0}{1:0}''", (Sign < 0) ? "-" : "", AbsoluteInches);
                case DirectedDistanceFormat.DecimalMeters:
                    return string.Format("{0}{1:0.00} m", (Sign < 0) ? "-" : "", AbsoluteMeters);
                case DirectedDistanceFormat.DecimalYards:
                    return string.Format("{0}{1:0.00} yd", (Sign < 0) ? "-" : "", AbsoluteYards);
                case DirectedDistanceFormat.FeetDecimalInches:
                    if (AbsoluteRemainderInches == 0f)
                    {
                        return string.Format("{0}{1:0}'", (Sign < 0) ? "-" : "", AbsoluteFeet, AbsoluteRemainderInches);
                    }
                    return string.Format("{0}{1:0}' {2:0}''", (Sign < 0) ? "-" : "", AbsoluteFeet, AbsoluteRemainderInches);
                case DirectedDistanceFormat.DecimalCentimeters:
                    return string.Format("{0}{1:0.0} cm", (Sign < 0) ? "-" : "", AbsoluteCentimeters);
                default:
                    return RawValue;
            }
        }

        public string ToString(Units units, UnitRenderMode renderMode = UnitRenderMode.Default)
        {
            if (!IsSpecified)
            {
                return string.Empty;
            }
            switch (units)
            {
                case Units.Default:
                case Units.Feet:
                    switch (renderMode)
                    {
                        case UnitRenderMode.Default:
                        case UnitRenderMode.PrefixOnly:
                            return string.Format("{0}{1:0.0}'", (Sign < 0) ? "-" : "", AbsoluteFeet);
                        case UnitRenderMode.SubprefixOnly:
                            return string.Format("{0}{1:0}''", (Sign < 0) ? "-" : "", AbsoluteInches);
                        default:
                            throw new NotImplementedException();
                    }
                case Units.Meters:
                    switch (renderMode)
                    {
                        case UnitRenderMode.Default:
                        case UnitRenderMode.PrefixOnly:
                            return string.Format("{0}{1:0.00} m", (Sign < 0) ? "-" : "", AbsoluteMeters);
                        case UnitRenderMode.SubprefixOnly:
                            return string.Format("{0}{1:0.0} cm", (Sign < 0) ? "-" : "", AbsoluteCentimeters);
                        default:
                            throw new NotImplementedException();
                    }                    
                case Units.Yards:
                    switch (renderMode)
                    {
                        case UnitRenderMode.Default:
                        case UnitRenderMode.PrefixOnly:
                            return string.Format("{0}{1:0.00} yd", (Sign < 0) ? "-" : "", AbsoluteYards);
                        case UnitRenderMode.SubprefixOnly:
                            return string.Format("{0}{1:0}''", (Sign < 0) ? "-" : "", AbsoluteInches);
                        default:
                            throw new NotImplementedException();
                    }
                default:
                    throw new NotImplementedException();
            }
        }

        private static Regex FeetDecimalInchesFormat = new Regex("^\\s*(?<sign>[+-])?\\s*(?<feet>[0-9]+(\\.[0-9]+)?)\\s*('|`|ft|feets?|foots?|\\s)\\s*(?<inches>[0-9]+(\\.[0-9]+)?)\\s*(\"|''|``|ins?|inchs?|inches?)?\\s*$", RegexOptions.Compiled);
        private static Regex DecimalFeetFormat = new Regex("^\\s*(?<sign>[+-])?\\s*(?<feet>[0-9]+(\\.[0-9]+)?)\\s*('|`|ft|feets?|foots?)?\\s*$", RegexOptions.Compiled);
        private static Regex DecimalInchesFormat = new Regex("^\\s*(?<sign>[+-])?\\s*(?<inches>[0-9]+(\\.[0-9]+)?)\\s*(\"|''|``|ins?|inchs?|inches?)\\s*$", RegexOptions.Compiled);
        private static Regex DecimalMetersFormat = new Regex("^\\s*(?<sign>[+-])?\\s*(?<meters>[0-9]+(\\.[0-9]+)?)\\s*(ms?|meters?|metres?)\\s*$", RegexOptions.Compiled);
        private static Regex DecimalYardsFormat = new Regex("^\\s*(?<sign>[+-])?\\s*(?<yards>[0-9]+(\\.[0-9]+)?)\\s*(ys?|yds?|yards?)\\s*$", RegexOptions.Compiled);
        private static Regex DecimalCentimetersFormat = new Regex("^\\s*(?<sign>[+-])?\\s*(?<centimeters>[0-9]+(\\.[0-9]+)?)\\s*(cms?|centimeters?)\\s*$", RegexOptions.Compiled);
        public static DirectedDistance Create(string s)
        {
            Match match;
            float sign, feet;
            DirectedDistanceFormat inputFormat;
            if (string.IsNullOrWhiteSpace(s))
            {
                sign = 1f;
                feet = 0;
                inputFormat = DirectedDistanceFormat.Unspecified;
            }
            else if ((match = FeetDecimalInchesFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["feet"].Value);
                feet += float.Parse(match.Groups["inches"].Value) / 12f;
                inputFormat = DirectedDistanceFormat.FeetDecimalInches;
            }
            else if ((match = DecimalFeetFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["feet"].Value);
                inputFormat = DirectedDistanceFormat.DecimalFeet;
            }
            else if ((match = DecimalInchesFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["inches"].Value) / 12f;
                inputFormat = DirectedDistanceFormat.DecimalInches;
            }
            else if ((match = DecimalMetersFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["meters"].Value) * 3.2808399f;
                inputFormat = DirectedDistanceFormat.DecimalMeters;
            }
            else if ((match = DecimalYardsFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["yards"].Value) * 3f;
                inputFormat = DirectedDistanceFormat.DecimalYards;
            }
            else if ((match = DecimalCentimetersFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["centimeters"].Value) * 3.2808399f * 100f;
                inputFormat = DirectedDistanceFormat.DecimalCentimeters;
            }
            else
            {
                sign = 1f;
                feet = 0f;
                inputFormat = DirectedDistanceFormat.Invalid;
            }
            return new DirectedDistance()
            {
                Feet = sign * feet,
                InputFormat = inputFormat,
                RawValue = s
            };
        }

        public static DirectedDistance Create(float feet)
        {

            return new DirectedDistance()
            {
                Feet = feet,
                InputFormat = DirectedDistanceFormat.Default,
                RawValue = feet.ToString()
            };
        }

        public static DirectedDistance Null()
        {
            return new DirectedDistance()
            {
                Feet = 0f,
                InputFormat = DirectedDistanceFormat.Unspecified,
                RawValue = string.Empty
            };
        }
    }
}
