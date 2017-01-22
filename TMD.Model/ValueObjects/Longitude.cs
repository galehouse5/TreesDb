using System;
using System.Text.RegularExpressions;
using TMD.Model.Validation;

namespace TMD.Model
{
    public class Longitude : ISpecified, ICloneable
    {
        private Longitude()
        {
            InputFormat = CoordinatesFormat.Default;
        }

        public string RawValue { get; private set; }

        [Within2(-180f, 180f, Inclusive = true, Message = "Longitude must be in the range of -180 to +180 degrees.", Tags = ValidationTag.Required)]
        public float TotalDegrees { get; private set; }

        [NotEqualsAttribute(CoordinatesFormat.Invalid, Message = "Longitude must be in ddd_mm_ss.s, ddd_mm.mmm, or ddd.ddddd format.", Tags = ValidationTag.Required)]
        public CoordinatesFormat InputFormat { get; private set; }

        public int Sign { get { return Math.Sign(TotalDegrees); } }
        public float AbsoluteTotalDegrees { get { return Math.Abs(TotalDegrees); } }
        public int AbsoluteWholeDegrees { get { return (int)Math.Floor(AbsoluteTotalDegrees); } }
        public float AbsoluteMinutes { get { return 60f * (AbsoluteTotalDegrees - AbsoluteWholeDegrees); } }
        public int AbsoluteWholeMinutes { get { return (int)Math.Floor(AbsoluteMinutes); } }
        public float AbsoluteSeconds { get { return 60f * (AbsoluteMinutes - AbsoluteWholeMinutes); } }
        public bool IsSpecified { get { return InputFormat != CoordinatesFormat.Unspecified; } }

        public string ToString(CoordinatesFormat format)
        {
            if (!IsSpecified)
            {
                return string.Empty;
            }
            switch (format)
            {
                case CoordinatesFormat.DegreesMinutesDecimalSeconds:
                    return string.Format("{0:000} {1:00} {2:00.0}", AbsoluteWholeDegrees * Sign, AbsoluteWholeMinutes, AbsoluteSeconds);
                case CoordinatesFormat.Default:
                case CoordinatesFormat.DegreesDecimalMinutes:
                    return string.Format("{0:000} {1:00.000}", AbsoluteWholeDegrees * Sign, AbsoluteMinutes);
                case CoordinatesFormat.DecimalDegrees:
                    return string.Format("{0:000.00000}", AbsoluteTotalDegrees * Sign);
                default:
                    return RawValue;
            }
        }

        public override string ToString()
        {
            return ToString(InputFormat);
        }

        public override bool Equals(object obj)
        {
            var other = obj as Longitude;
            return other != null && this.TotalDegrees.Equals(other.TotalDegrees);
        }

        public override int GetHashCode()
        {
            return TotalDegrees.GetHashCode();
        }

        private static Regex DegreesMinutesSecondsFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3})\\s+(?<minutes>[0-9]{1,2})\\s+(?<seconds>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        private static Regex DegreesDecimalMinutesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3})\\s+(?<minutes>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        private static Regex DecimalDegreesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Longitude Create(string s)
        {
            Match match;
            float sign, degrees, minutes, seconds;
            CoordinatesFormat inputFormat;
            if (string.IsNullOrWhiteSpace(s))
            {
                sign = 1f;
                degrees = 0f;
                minutes = 0f;
                seconds = 0f;
                inputFormat = CoordinatesFormat.Unspecified;
            }
            else if ((match = DegreesMinutesSecondsFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                degrees = float.Parse(match.Groups["degrees"].Value);
                minutes = float.Parse(match.Groups["minutes"].Value);
                seconds = float.Parse(match.Groups["seconds"].Value);
                inputFormat = CoordinatesFormat.DegreesMinutesDecimalSeconds;
            }
            else if ((match = DegreesDecimalMinutesFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                degrees = float.Parse(match.Groups["degrees"].Value);
                minutes = float.Parse(match.Groups["minutes"].Value);
                seconds = 0f;
                inputFormat = CoordinatesFormat.DegreesDecimalMinutes;
            }
            else if ((match = DecimalDegreesFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                degrees = float.Parse(match.Groups["degrees"].Value);
                minutes = 0f;
                seconds = 0f;
                inputFormat = CoordinatesFormat.DecimalDegrees;
            }
            else
            {
                sign = 1f;
                degrees = 0f;
                minutes = 0f;
                seconds = 0f;
                inputFormat = CoordinatesFormat.Invalid;
            }
            return new Longitude()
            {
                InputFormat = inputFormat,
                TotalDegrees = (float)Math.Round(sign * (degrees + (minutes / 60f) + (seconds / 3600f)), 5),
                RawValue = s
            };
        }

        public static Longitude Create(float degrees,
            CoordinatesFormat format = CoordinatesFormat.Default)
        {
            if (Math.Abs(degrees) > 360f)
                throw new ArgumentException("Degrees cannot exceed 360.", nameof(degrees));

            return new Longitude
            {
                InputFormat = format,
                TotalDegrees = degrees > 180f ? -360f + degrees
                    : degrees < -180f ? 360f + degrees
                    : degrees,
                RawValue = degrees.ToString()
            };
        }

        public static Longitude Null()
        {
            return new Longitude()
            {
                InputFormat = CoordinatesFormat.Unspecified,
                TotalDegrees = 0f,
                RawValue = string.Empty
            };
        }

        public object Clone()
        {
            return new Longitude
            {
                InputFormat = InputFormat,
                TotalDegrees = TotalDegrees,
                RawValue = RawValue
            };
        }

        public Longitude AddMinutes(float minutes)
        {
            return new Longitude
            {
                InputFormat = InputFormat,
                TotalDegrees = TotalDegrees + (float)Math.Round(minutes / 60f, 5),
                RawValue = RawValue
            };
        }

        public Longitude SubtractMinutes(float minutes)
        {
            return new Longitude
            {
                InputFormat = InputFormat,
                TotalDegrees = TotalDegrees - (float)Math.Round(minutes / 60f, 5),
                RawValue = RawValue
            };
        }
    }
}
