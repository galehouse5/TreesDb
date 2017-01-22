using System;
using System.Text.RegularExpressions;
using TMD.Model.Validation;

namespace TMD.Model
{
    public class Latitude : ISpecified, ICloneable
    {
        private Latitude()
        {
            InputFormat = CoordinatesFormat.Default;
        }

        public string RawValue { get; private set; }

        [Within2(-90f, 90f, Inclusive = true, Message = "Latitude must be in the range of -90 to +90 degrees.", Tags = ValidationTag.Required)]
        public float TotalDegrees { get; private set; }

        [NotEqualsAttribute(CoordinatesFormat.Invalid, Message = "Latitude must be in dd_mm_ss.s, dd_mm.mmm, or dd.ddddd format.", Tags = ValidationTag.Required)]
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
                    return string.Format("{0:00} {1:00} {2:00.0}", AbsoluteWholeDegrees * Sign, AbsoluteWholeMinutes, AbsoluteSeconds);
                case CoordinatesFormat.Default:
                case CoordinatesFormat.DegreesDecimalMinutes:
                    return string.Format("{0:00} {1:00.000}", AbsoluteWholeDegrees * Sign, AbsoluteMinutes);
                case CoordinatesFormat.DecimalDegrees:
                    return string.Format("{0:00.00000}", AbsoluteTotalDegrees * Sign);
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
            var other = obj as Latitude;
            return other != null && this.TotalDegrees.Equals(other.TotalDegrees);
        }

        public override int GetHashCode()
        {
            return TotalDegrees.GetHashCode();
        }

        private static Regex DegreesMinutesSecondsFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2})\\s+(?<minutes>[0-9]{1,2})\\s+(?<seconds>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        private static Regex DegreesDecimalMinutesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2})\\s+(?<minutes>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        private static Regex DecimalDegreesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Latitude Create(string s)
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
            return new Latitude()
            {
                InputFormat = inputFormat,
                TotalDegrees = (float)Math.Round(sign * (degrees + (minutes / 60f) + (seconds / 3600f)), 5),
                RawValue = s
            };
        }

        public static Latitude Create(float degrees,
            CoordinatesFormat format = CoordinatesFormat.Default)
        {
            if (Math.Abs(degrees) > 180f)
                throw new ArgumentException("Degrees cannot exceed 180.", nameof(degrees));

            return new Latitude
            {
                InputFormat = format,
                TotalDegrees = degrees > 90f ? -180f + degrees
                    : degrees < -90f ? 180f + degrees
                    : degrees,
                RawValue = degrees.ToString()
            };
        }

        public static Latitude Null()
        {
            return new Latitude()
            {
                InputFormat = CoordinatesFormat.Unspecified,
                TotalDegrees = 0f,
                RawValue = string.Empty
            };
        }

        public object Clone()
        {
            return new Latitude
            {
                InputFormat = InputFormat,
                TotalDegrees = TotalDegrees,
                RawValue = RawValue
            };
        }

        public Latitude AddMinutes(float minutes)
        {
            return new Latitude
            {
                InputFormat = InputFormat,
                TotalDegrees = TotalDegrees + (float)Math.Round(minutes / 60f, 5),
                RawValue = RawValue
            };
        }

        public Latitude SubtractMinutes(float minutes)
        {
            return new Latitude
            {
                InputFormat = InputFormat,
                TotalDegrees = TotalDegrees - (float)Math.Round(minutes / 60f, 5),
                RawValue = RawValue
            };
        }
    }
}
