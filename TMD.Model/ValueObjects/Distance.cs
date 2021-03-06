﻿using System;
using System.Text.RegularExpressions;
using TMD.Model.Validation;

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
        DecimalYards = 7,
        DecimalCentimeters = 8
    }

    public class Distance : ISpecified, IComparable
    {
        private Distance()
        { }

        public string RawValue { get; private set; }

        [Within2(0, float.MaxValue, Inclusive = true, Message = "Distance must be non-negative.", Tags = ValidationTag.Required)]
        public float Feet { get; private set; }

        [NotEqualsAttribute(DistanceFormat.Invalid, Message = "Distance must be in fff.f', fff' ii'', mmm.mm m, or yyy.yy yd format.", Tags = ValidationTag.Required)]
        public DistanceFormat InputFormat { get; private set; }

        public int WholeFeet { get { return (int)Math.Floor(Feet); } }
        public float RemainderInches { get { return 12f * (Feet - WholeFeet); } }
        public float Inches { get { return 12f * Feet; } }
        public float Yards { get { return Feet / 3f; } }
        public float Meters { get { return Feet / 3.2808399f; } }
        public float Centimeters { get { return Meters * 100f; } }
        public bool IsSpecified { get { return InputFormat != DistanceFormat.Unspecified; } }

        public override bool Equals(object obj)
        {
            var other = obj as Distance;
            return other != null && Feet.Equals(other.Feet);
        }

        public override int GetHashCode()
        {
            return Feet.GetHashCode();
        }

        public override string ToString()
        {
            return ToString(InputFormat);
        }

        public string ToString(DistanceFormat format)
        {
            if (!IsSpecified)
            {
                return string.Empty;
            }
            switch (format)
            {
                case DistanceFormat.Default:
                case DistanceFormat.DecimalFeet:
                    return string.Format("{0:0.0}'", Feet);
                case DistanceFormat.DecimalInches:
                    return string.Format("{0:0}''", Inches);
                case DistanceFormat.DecimalMeters:
                    return string.Format("{0:0.00} m", Meters);
                case DistanceFormat.DecimalYards:
                    return string.Format("{0:0.00} yd", Yards);
                case DistanceFormat.FeetDecimalInches:
                    if (RemainderInches == 0f)
                    {
                        return string.Format("{0:0}'", WholeFeet, RemainderInches);
                    }
                    return string.Format("{0:0}' {1:0}''", WholeFeet, RemainderInches);
                case DistanceFormat.DecimalCentimeters:
                    return string.Format("{0:0} cm", Centimeters);
                default:
                    return RawValue;
            }
        }

        public string ToString(Units units, UnitRenderMode renderMode = UnitRenderMode.Default)
        {
            if (!IsSpecified)
                return string.Empty;

            switch (units)
            {
                case Units.Default:
                case Units.Feet:
                    switch (renderMode)
                    {
                        case UnitRenderMode.Default:
                        case UnitRenderMode.PrefixOnly: return $"{Feet:0.0}'";
                        case UnitRenderMode.SubprefixOnly: return $"{Inches:0}''";
                        default: throw new NotImplementedException();
                    }
                case Units.Meters:
                    switch (renderMode)
                    {
                        case UnitRenderMode.Default:
                        case UnitRenderMode.PrefixOnly: return $"{Meters:0.00} m";
                        case UnitRenderMode.SubprefixOnly: return $"{Centimeters:0} cm";
                        default: throw new NotImplementedException();
                    }
                case Units.Yards:
                    switch (renderMode)
                    {
                        case UnitRenderMode.Default:
                        case UnitRenderMode.PrefixOnly: return $"{Yards:0.00} yd";
                        case UnitRenderMode.SubprefixOnly: return $"{Inches:0}''";
                        default: throw new NotImplementedException();
                    }
                default:
                    throw new NotImplementedException();
            }
        }

        private static Regex FeetDecimalInchesFormat = new Regex("^\\s*(?<feet>[0-9]+(\\.[0-9]+)?)\\s*('|`|ft|feets?|foots?|\\s)\\s*(?<inches>[0-9]+(\\.[0-9]+)?)\\s*(\"|''|``|ins?|inchs?|inches?)?\\s*$", RegexOptions.Compiled);
        private static Regex DecimalFeetFormat = new Regex("^\\s*(?<feet>[0-9]+(\\.[0-9]+)?)\\s*('|`|ft|feets?|foots?)?\\s*$", RegexOptions.Compiled);
        private static Regex DecimalInchesFormat = new Regex("^\\s*(?<inches>[0-9]+(\\.[0-9]+)?)\\s*(\"|''|``|ins?|inchs?|inches?)\\s*$", RegexOptions.Compiled);
        private static Regex DecimalMetersFormat = new Regex("^\\s*(?<meters>[0-9]+(\\.[0-9]+)?)\\s*(ms?|meters?|metres?)\\s*$", RegexOptions.Compiled);
        private static Regex DecimalYardsFormat = new Regex("^\\s*(?<yards>[0-9]+(\\.[0-9]+)?)\\s*(ys?|yds?|yards?)\\s*$", RegexOptions.Compiled);
        private static Regex DecimalCentimetersFormat = new Regex("^\\s*(?<meters>[0-9]+(\\.[0-9]+)?)\\s*(cms?|centimeters?)\\s*$", RegexOptions.Compiled);
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
            else if ((match = DecimalCentimetersFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["centimeters"].Value) * 3.2808399f;
                inputFormat = DistanceFormat.DecimalCentimeters;
            }
            else
            {
                feet = 0f;
                inputFormat = DistanceFormat.Invalid;
            }
            return new Distance()
            {
                Feet = feet,
                InputFormat = inputFormat,
                RawValue = s
            };
        }

        public static implicit operator Distance(float feet)
        {
            return Distance.Create(feet);
        }

        public static Distance Create(float feet)
        {
            return new Distance()
            {
                Feet = feet,
                InputFormat = DistanceFormat.Default,
                RawValue = feet.ToString()
            };
        }

        public static Distance Null()
        {
            return new Distance()
            {
                Feet = 0f,
                InputFormat = DistanceFormat.Unspecified,
                RawValue = string.Empty
            };
        }

        int IComparable.CompareTo(object obj)
        {
            Distance other = obj as Distance;
            if (other == null)
            {
                throw new NotImplementedException();
            }
            return Feet.CompareTo(other.Feet);
        }
    }
}
