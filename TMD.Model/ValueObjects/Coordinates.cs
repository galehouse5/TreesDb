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

    [Serializable]
    public class Coordinates : ISpecified
    {
        private Coordinates()
        { }

        [Valid]
        public Latitude Latitude { get; private set; }

        [Valid]
        public Longitude Longitude { get; private set; }

        public CoordinatesFormat InputFormat
        {
            get { return Latitude.InputFormat; }
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
                return string.Format("{0}, {1}", Latitude, Longitude);
            }
            return string.Empty;
        }

        public string ToString(CoordinatesFormat format)
        {
            if (IsSpecified)
            {
                return string.Format("{0}, {1}", Latitude.ToString(format), Longitude.ToString(format));
            }
            return string.Empty;
        }

        public static bool operator ==(Coordinates c1, Coordinates c2)
        {
            if ((object)c1 == null || (object)c2 == null)
            {
                return (object)c1 == null && (object)c2 == null;
            }
            return c1.Latitude == c2.Latitude
                && c1.Longitude == c2.Longitude;
        }

        public static bool operator !=(Coordinates c1, Coordinates c2)
        {
            if ((object)c1 == null || (object)c2 == null)
            {
                return !((object)c1 == null && (object)c2 == null);
            }
            return c1.Latitude != c2.Latitude
                || c1.Longitude != c2.Longitude;
        }

        public override bool Equals(object obj)
        {
            Coordinates c = obj as Coordinates;
            return c != null && c == this;
        }

        public override int GetHashCode()
        {
            return Latitude.GetHashCode()
                ^ Longitude.GetHashCode();
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

        #region IIsSpecified Members

        public bool IsSpecified
        {
            get { return Latitude.IsSpecified && Longitude.IsSpecified; }
        }

        #endregion
    }

    [Serializable]
    public class Latitude : ISpecified
    {
        private Latitude()
        { }

        public string RawValue { get; private set; }

        [Within(-90f, 90f, Message = "Latitude must be in the range of -90 to +90 degrees.", Tags = Tag.Screening)]
        public float TotalDegrees { get; private set; }

        [NotEqualsAttribute(CoordinatesFormat.Invalid, Message = "Latitude must be in dd_mm_ss.s, dd_mm.mmm, or dd.ddddd format.", Tags = Tag.Screening)]
        public CoordinatesFormat InputFormat { get; private set; }

        public int Sign
        {
            get { return Math.Sign(TotalDegrees); }
        }

        public float AbsoluteTotalDegrees
        {
            get { return Math.Abs(TotalDegrees); }
        }

        public int AbsoluteWholeDegrees
        {
            get { return (int)Math.Floor(AbsoluteTotalDegrees); }
        }

        public float AbsoluteMinutes
        {
            get { return 60f * (AbsoluteTotalDegrees - AbsoluteWholeDegrees); }
        }

        public int AbsoluteWholeMinutes
        {
            get { return (int)Math.Floor(AbsoluteMinutes); }
        }

        public float AbsoluteSeconds
        {
            get { return 60f * (AbsoluteMinutes - AbsoluteWholeMinutes); }
        }

        public string ToString(CoordinatesFormat format)
        {
            string s;
            switch (InputFormat)
            {
                case CoordinatesFormat.DegreesMinutesDecimalSeconds:
                    s = string.Format("{0:00} {1:00} {2:00.0}", AbsoluteWholeDegrees * Sign, AbsoluteWholeMinutes, AbsoluteSeconds);
                    break;
                case CoordinatesFormat.Default:
                case CoordinatesFormat.DegreesDecimalMinutes:
                    s = string.Format("{0:00} {1:00.000}", AbsoluteWholeDegrees * Sign, AbsoluteMinutes);
                    break;
                case CoordinatesFormat.DecimalDegrees:
                    s = string.Format("{0:00.00000}", AbsoluteTotalDegrees * Sign);
                    break;
                default:
                    s = RawValue;
                    break;
            }
            return s;
        }

        public override string ToString()
        {
            return ToString(InputFormat);
        }

        public static bool operator ==(Latitude l1, Latitude l2)
        {
            if ((object)l1 == null || (object)l2 == null)
            {
                return (object)l1 == null && (object)l2 == null;
            }
            return l1.TotalDegrees == l2.TotalDegrees;
        }

        public static bool operator !=(Latitude l1, Latitude l2)
        {
            if ((object)l1 == null || (object)l2 == null)
            {
                return !((object)l1 == null && (object)l2 == null);
            }
            return l1.TotalDegrees != l2.TotalDegrees;
        }

        public override bool Equals(object obj)
        {
            Latitude l = obj as Latitude;
            return l != null && l == this;
        }

        public override int GetHashCode()
        {
            return TotalDegrees.GetHashCode();
        }

        #region IIsSpecified Members

        public bool IsSpecified
        {
            get { return InputFormat != CoordinatesFormat.Unspecified; }
        }

        #endregion

        public static Regex DegreesMinutesSecondsFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2})\\s+(?<minutes>[0-9]{1,2})\\s+(?<seconds>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Regex DegreesDecimalMinutesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2})\\s+(?<minutes>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Regex DecimalDegreesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);

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
                TotalDegrees = sign * (degrees + (minutes / 60f) + (seconds / 3600f)),
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
    }

    [Serializable]
    public class Longitude : ISpecified
    {
        private Longitude()
        { }

        public string RawValue { get; private set; }

        [Within(-180f, 180f, Message = "Longitude must be in the range of -180 to +180 degrees.", Tags = Tag.Screening)]
        public float TotalDegrees { get; private set; }

        [NotEqualsAttribute(CoordinatesFormat.Invalid, Message = "Longitude must be in ddd_mm_ss.s, ddd_mm.mmm, or ddd.ddddd format.", Tags = Tag.Screening)]
        public CoordinatesFormat InputFormat { get; private set; }

        public int Sign
        {
            get { return Math.Sign(TotalDegrees); }
        }

        public float AbsoluteTotalDegrees
        {
            get { return Math.Abs(TotalDegrees); }
        }

        public int AbsoluteWholeDegrees
        {
            get { return (int)Math.Floor(AbsoluteTotalDegrees); }
        }

        public float AbsoluteMinutes
        {
            get { return 60f * (AbsoluteTotalDegrees - AbsoluteWholeDegrees); }
        }

        public int AbsoluteWholeMinutes
        {
            get { return (int)Math.Floor(AbsoluteMinutes); }
        }

        public float AbsoluteSeconds
        {
            get { return 60f * (AbsoluteMinutes - AbsoluteWholeMinutes); }
        }

        public string ToString(CoordinatesFormat format)
        {
            string s;
            switch (format)
            {
                case CoordinatesFormat.DegreesMinutesDecimalSeconds:
                    s = string.Format("{0:000} {1:00} {2:00.0}", AbsoluteWholeDegrees * Sign, AbsoluteWholeMinutes, AbsoluteSeconds);
                    break;
                case CoordinatesFormat.Default:
                case CoordinatesFormat.DegreesDecimalMinutes:
                    s = string.Format("{0:000} {1:00.000}", AbsoluteWholeDegrees * Sign, AbsoluteMinutes);
                    break;
                case CoordinatesFormat.DecimalDegrees:
                    s = string.Format("{0:000.00000}", AbsoluteTotalDegrees * Sign);
                    break;
                default:
                    s = RawValue;
                    break;
            }
            return s;
        }

        public override string ToString()
        {
            return ToString(InputFormat);
        }

        public static bool operator ==(Longitude l1, Longitude l2)
        {
            if ((object)l1 == null || (object)l2 == null)
            {
                return (object)l1 == null && (object)l2 == null;
            }
            return l1.TotalDegrees == l2.TotalDegrees;
        }

        public static bool operator !=(Longitude l1, Longitude l2)
        {
            if ((object)l1 == null || (object)l2 == null)
            {
                return !((object)l1 == null && (object)l2 == null);
            }
            return l1.TotalDegrees != l2.TotalDegrees;
        }

        public override bool Equals(object obj)
        {
            Longitude l = obj as Longitude;
            return l != null && l == this;
        }

        public override int GetHashCode()
        {
            return TotalDegrees.GetHashCode();
        }

        #region IIsSpecified Members

        public bool IsSpecified
        {
            get { return InputFormat != CoordinatesFormat.Unspecified; }
        }

        #endregion

        public static Regex DegreesMinutesSecondsFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3})\\s+(?<minutes>[0-9]{1,2})\\s+(?<seconds>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Regex DegreesDecimalMinutesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3})\\s+(?<minutes>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Regex DecimalDegreesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);

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
                TotalDegrees = sign * (degrees + (minutes / 60f) + (seconds / 3600f)),
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
    }
}
