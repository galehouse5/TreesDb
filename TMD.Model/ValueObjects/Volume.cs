using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using TMD.Model.Validation;
using NHibernate.Validator.Constraints;

namespace TMD.Model
{
    public enum VolumeFormat
    {
        Invalid = 0,
        Unspecified = 1,
        Default = 2,
        DecimalCubicFeet = 3,
        DecimalCubicMeters = 4,
        DecimalCubicYards = 5
    }

    public class Volume : ISpecified
    {
        private Volume()
        { }

        public string RawValue { get; private set; }

        [Within2(0f, double.MaxValue, Inclusive = true, Message = "Volume must be non-negative.", Tags = ValidationTag.Screening)]
        public float CubicFeet { get; private set; }

        [NotEquals(VolumeFormat.Invalid, Message = "Volume must be in fffff ft^3 or mmmmm.mm m^3 format.", Tags = ValidationTag.Screening)]
        public VolumeFormat InputFormat { get; private set; }

        public float CubicMeters
        {
            get { return CubicFeet * 0.0283168466f; }
        }

        public float CubicYards
        {
            get { return CubicFeet * 0.037037037f; }
        }

        public static bool operator ==(Volume v1, Volume v2)
        {
            if ((object)v1 == null || (object)v2 == null)
            {
                return (object)v1 == null && (object)v2 == null;
            }
            return v1.CubicFeet == v2.CubicFeet;
        }

        public static bool operator !=(Volume v1, Volume v2)
        {
            if ((object)v1 == null || (object)v2 == null)
            {
                return (object)v1 == null && (object)v2 == null;
            }
            return v1.CubicFeet != v2.CubicFeet;
        }

        public override bool Equals(object obj)
        {
            Volume v = obj as Volume;
            return v != null && v == this;
        }

        public override int GetHashCode()
        {
            return CubicFeet.GetHashCode();
        }

        public string ToString(VolumeFormat format)
        {
            if (!IsSpecified)
            {
                return string.Empty;
            }
            switch (InputFormat)
            {
                case VolumeFormat.Default:
                case VolumeFormat.DecimalCubicFeet:
                    return string.Format("{0:0.0} ft³", CubicFeet);
                case VolumeFormat.DecimalCubicMeters:
                    return string.Format("{0:0.00} m³", CubicMeters);
                case VolumeFormat.DecimalCubicYards:
                    return string.Format("{0:0.00} yd³", CubicYards);
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
                    return string.Format("{0:0.0} ft³", CubicFeet);
                case Units.Meters:
                    return string.Format("{0:0.00} m³", CubicMeters);
                case Units.Yards:
                    return string.Format("{0:0.00} yd³", CubicYards);
                default:
                    throw new NotImplementedException();
            }
        }

        public override string ToString()
        {
            return ToString(InputFormat);
        }

        #region IIsSpecified Members

        public bool IsSpecified
        {
            get { return InputFormat != VolumeFormat.Unspecified; }
        }

        #endregion

        private static Regex DecimalCubicFeetFormat = new Regex("^\\s*(?<cubicFeet>[0-9]+(\\.[0-9]+)?)((\\s*cu ft)|(\\s*ft\\^3)|(\\s*cubic feet)|(\\s*cubic ft))?\\s*$", RegexOptions.Compiled);
        private static Regex DecimalCubicMetersFormat = new Regex("^\\s*(?<cubicMeters>[0-9]+(\\.[0-9]+)?)((\\s*cu m)|(\\s*m\\^3)|(\\s*cubic meters)|(\\s*cubic m))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalCubicYardsFormat = new Regex("^\\s*(?<cubicYards>[0-9]+(\\.[0-9]+)?)((\\s*cu yds)|(\\s*yds\\^3)|(\\s*cubic yards)|(\\s*cubic yds))\\s*$", RegexOptions.Compiled);

        public static Volume Create(string s)
        {
            Match match;
            float cubicFeet;
            VolumeFormat inputFormat;
            if (string.IsNullOrWhiteSpace(s))
            {
                cubicFeet = 0;
                inputFormat = VolumeFormat.Unspecified;
            }
            else if ((match = DecimalCubicFeetFormat.Match(s)).Success)
            {
                cubicFeet = float.Parse(match.Groups["cubicFeet"].Value);
                inputFormat = VolumeFormat.DecimalCubicFeet;
            }
            else if ((match = DecimalCubicMetersFormat.Match(s)).Success)
            {
                cubicFeet = float.Parse(match.Groups["cubicMeters"].Value) / 0.0283168466f;
                inputFormat = VolumeFormat.DecimalCubicMeters;
            }
            else if ((match = DecimalCubicYardsFormat.Match(s)).Success)
            {
                cubicFeet = float.Parse(match.Groups["cubicYards"].Value) / 0.037037037f;
                inputFormat = VolumeFormat.DecimalCubicYards;
            }
            else
            {
                cubicFeet = 0f;
                inputFormat = VolumeFormat.Invalid;
            }
            return new Volume()
            {
                CubicFeet = cubicFeet,
                InputFormat = inputFormat,
                RawValue = s
            };
        }

        public static Volume Create(float cubicFeet)
        {
            return new Volume()
            {
                CubicFeet = cubicFeet,
                InputFormat = VolumeFormat.Default,
                RawValue = cubicFeet.ToString()
            };
        }

        public static Volume Null()
        {
            return new Volume()
            {
                CubicFeet = 0f,
                InputFormat = VolumeFormat.Unspecified,
                RawValue = string.Empty
            };
        }

        public static Volume CalculateConical(double radiusFeet, double heightFeet)
        {
            double area = Math.Pow(radiusFeet, 2) * Math.PI;
            double volume = area * heightFeet / 3.0;
            return Create((float)volume);
        }
    }
}
