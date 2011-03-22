using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using TMD.Model.Validation;
using NHibernate.Validator.Constraints;

namespace TMD.Model
{
    public enum CoordinatesFormat
    {
        Invalid = 0,
        Unspecified = 1,
        Default = 2,
        DegreesMinutesDecimalSeconds = 3,
        DegreesDecimalMinutes = 4,
        DecimalDegrees = 5
    }

    public class Coordinates : ISpecified, ICloneable
    {
        private Coordinates()
        { }

        [Valid] public Latitude Latitude { get; private set; }
        [Valid] public Longitude Longitude { get; private set; }
        public bool IsSpecified { get { return Latitude.IsSpecified || Longitude.IsSpecified; } }

        public CoordinatesFormat InputFormat
        {
            get 
            {
                if (Latitude.InputFormat == CoordinatesFormat.Invalid || Longitude.InputFormat == CoordinatesFormat.Invalid)
                {
                    return CoordinatesFormat.Invalid;
                }
                if (Latitude.InputFormat == CoordinatesFormat.Unspecified || Longitude.InputFormat == CoordinatesFormat.Unspecified)
                {
                    return CoordinatesFormat.Unspecified;
                }
                return Latitude.InputFormat; 
            }
        }

        public float CalculateDistanceInMinutesTo(Coordinates otherCoordinates)
        {
            float degrees = (float)Math.Sqrt(
                (Latitude.TotalDegrees - otherCoordinates.Latitude.TotalDegrees) * (Latitude.TotalDegrees - otherCoordinates.Latitude.TotalDegrees)
                + (Longitude.TotalDegrees - otherCoordinates.Longitude.TotalDegrees) * (Longitude.TotalDegrees - otherCoordinates.Longitude.TotalDegrees));
            return degrees * 60f;
        }

        public override string ToString()
        {
            if (IsSpecified)
            {
                if (InputFormat == CoordinatesFormat.Invalid)
                {
                    return string.Format("{0}{1}", Latitude, Longitude);
                }
                return string.Format("{0}, {1}", Latitude, Longitude);
            }
            return string.Empty;
        }

        public string ToString(CoordinatesFormat format)
        {
            if (IsSpecified)
            {
                if (InputFormat == CoordinatesFormat.Invalid)
                {
                    return string.Format("{0}{1}", Latitude.ToString(format), Longitude.ToString(format));
                }
                return string.Format("{0}, {1}", Latitude.ToString(format), Longitude.ToString(format));
            }
            return string.Empty;
        }

        public override bool Equals(object obj)
        {
            var other = obj as Coordinates;
            return other != null && this.Latitude.Equals(other.Latitude) && this.Longitude.Equals(other.Longitude);
        }

        public override int GetHashCode()
        {
            return Latitude.GetHashCode() ^ Longitude.GetHashCode();
        }

        public static Coordinates Create(Latitude latitude, Longitude longitude)
        {
            return new Coordinates()
            {
                Latitude = latitude,
                Longitude = longitude
            };
        }

        public static Coordinates Create(float latitude, float longitude)
        {
            return new Coordinates()
            {
                Latitude = Latitude.Create(latitude),
                Longitude = Longitude.Create(longitude)
            };
        }

        public static Coordinates Create(string latitude, string longitude)
        {
            return new Coordinates()
            {
                Latitude = Latitude.Create(latitude),
                Longitude = Longitude.Create(longitude)
            };
        }

        public static Coordinates Create(float latitude, float longitude, CoordinatesFormat format)
        {
            return new Coordinates()
            {
                Latitude = Latitude.Create(latitude, format),
                Longitude = Longitude.Create(longitude, format)
            };
        }

        public static Coordinates Create(string s)
        {
            if (string.IsNullOrWhiteSpace(s))
            {
                return Null();
            }
            string[] parts = s.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            Latitude latitude = Latitude.Create(parts[0]);
            Longitude longitude;
            if (parts.Length > 1)
            {
                longitude = Longitude.Create(parts[1]);
            }
            else
            {
                longitude = Longitude.Create(string.Empty);
            }
            return new Coordinates()
            {
                Latitude = latitude,
                Longitude = longitude
            };
        }
            
        public static Coordinates Null()
        {
            return new Coordinates()
            {
                Latitude = Latitude.Null(),
                Longitude = Longitude.Null()
            };
        }

        public object Clone()
        {
            return new Coordinates
            {
                Latitude = Latitude.Clone() as Latitude,
                Longitude = Longitude.Clone() as Longitude
            };
        }
    }

    public class Latitude : ISpecified, ICloneable
    {
        private Latitude()
        { }

        public string RawValue { get; private set; }

        [Within2(-90f, 90f, Inclusive = true, Message = "Latitude must be in the range of -90 to +90 degrees.", Tags = ValidationTag.Screening)]
        public float TotalDegrees { get; private set; }

        [NotEqualsAttribute(CoordinatesFormat.Invalid, Message = "Latitude must be in dd_mm_ss.s, dd_mm.mmm, or dd.ddddd format.", Tags = ValidationTag.Screening)]
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

        public static Latitude Create(float degrees)
        {
            return new Latitude()
            {
                InputFormat = CoordinatesFormat.Default,
                TotalDegrees = degrees,
                RawValue = degrees.ToString()
            };
        }

        public static Latitude Create(float degrees, CoordinatesFormat format)
        {
            return new Latitude()
            {
                InputFormat = format,
                TotalDegrees = degrees,
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

    public class Longitude : ISpecified, ICloneable
    {
        private Longitude()
        { }

        public string RawValue { get; private set; }

        [Within2(-180f, 180f, Inclusive = true, Message = "Longitude must be in the range of -180 to +180 degrees.", Tags = ValidationTag.Screening)]
        public float TotalDegrees { get; private set; }

        [NotEqualsAttribute(CoordinatesFormat.Invalid, Message = "Longitude must be in ddd_mm_ss.s, ddd_mm.mmm, or ddd.ddddd format.", Tags = ValidationTag.Screening)]
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

        public static Longitude Create(float degrees)
        {
            return new Longitude()
            {
                InputFormat = CoordinatesFormat.Default,
                TotalDegrees = degrees,
                RawValue = degrees.ToString()
            };
        }

        public static Longitude Create(float degrees, CoordinatesFormat format)
        {
            return new Longitude()
            {
                InputFormat = format,
                TotalDegrees = degrees,
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
