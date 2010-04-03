using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using TMD.Model.Validation;

namespace TMD.Model
{
    public class Longitude : ICloneable, IIsValid, IIsNull
    {
        public enum EInputFormat
        {
            Invalid,
            DegreesMinutesDecimalSeconds,
            DegreesDecimalMinutes,
            DecimalDegrees
        }

        private Longitude()
        {
            this.InputFormat = EInputFormat.DegreesDecimalMinutes;
        }

        private Longitude(float degrees)
        {
            this.TotalDegrees = degrees;
            this.InputFormat = EInputFormat.DegreesDecimalMinutes;
        }

        private Longitude(float degrees, EInputFormat inputFormat)
        {
            this.TotalDegrees = degrees;
            this.InputFormat = inputFormat;
        }

        public float TotalDegrees { get; private set; }
        public EInputFormat InputFormat { get; private set; }

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

        public override string ToString()
        {
            string s;
            switch (InputFormat)
            {
                case EInputFormat.DegreesMinutesDecimalSeconds:
                    s = string.Format("{0:000} {1:00} {2:00.0}", AbsoluteWholeDegrees * Sign, AbsoluteWholeMinutes, AbsoluteSeconds);
                    break;
                case EInputFormat.DegreesDecimalMinutes:
                    s = string.Format("{0:000} {1:00.000}", AbsoluteWholeDegrees * Sign, AbsoluteMinutes);
                    break;
                case EInputFormat.DecimalDegrees:
                    s = string.Format("{0:000.00000}", AbsoluteTotalDegrees);
                    break;
                default:
                    s = string.Empty;
                    break;
            }
            return s;
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


        #region ICloneable Members

        public object Clone()
        {
            return new Longitude(TotalDegrees, InputFormat);
        }

        #endregion

        #region IIsValid Members

        public bool IsValid
        {
            get { return InputFormat != EInputFormat.Invalid && AbsoluteTotalDegrees <= 90; }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            if (InputFormat == EInputFormat.Invalid)
            {
                errors.Add("Longitude must be in dd_mm_ss.s, dd_mm.mmm, or dd.ddddd format.");
            }
            if (AbsoluteTotalDegrees > 90)
            {
                errors.Add("Longitude must be in the range of -180 to +180 degrees.");
            }
            return errors;
        }

        #endregion

        #region IIsNull Members

        public bool IsNull
        {
            get { return TotalDegrees == 0f || TotalDegrees == float.MaxValue || TotalDegrees == float.MinValue; }
        }

        #endregion

        public static Regex DegreesMinutesSecondsFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3})\\s+(?<minutes>[0-9]{1,2})\\s+(?<seconds>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Regex DegreesDecimalMinutesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,3})\\s+(?<minutes>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Regex DecimalDegreesFormat = new Regex("^\\s*(?<sign>[-+]?(?<degrees>[0-9]{1,3}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);

        public static Longitude Create(string s)
        {
            Match match;
            float sign, degrees, minutes, seconds;
            EInputFormat inputFormat;
            if ((match = DegreesMinutesSecondsFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                degrees = float.Parse(match.Groups["degrees"].Value);
                minutes = float.Parse(match.Groups["minutes"].Value);
                seconds = float.Parse(match.Groups["seconds"].Value);
                inputFormat = EInputFormat.DegreesMinutesDecimalSeconds;
            }
            else if ((match = DegreesDecimalMinutesFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                degrees = float.Parse(match.Groups["degrees"].Value) * (match.Groups["sign"].Value == "-" ? -1f : 1f);
                minutes = float.Parse(match.Groups["minutes"].Value);
                seconds = 0f;
                inputFormat = EInputFormat.DegreesDecimalMinutes;
            }
            else if ((match = DecimalDegreesFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                degrees = float.Parse(match.Groups["degrees"].Value) * (match.Groups["sign"].Value == "-" ? -1f : 1f);
                minutes = 0f;
                seconds = 0f;
                inputFormat = EInputFormat.DecimalDegrees;
            }
            else
            {
                sign = 1f;
                degrees = 0f;
                minutes = 0f;
                seconds = 0f;
                inputFormat = EInputFormat.Invalid;
            }
            return new Longitude(sign * (degrees + (minutes / 60f) + (seconds / 3600f)), inputFormat);
        }

        public static Longitude Create(float longitude)
        {
            return new Longitude(longitude);
        }

        public static Longitude Null()
        {
            return new Longitude(0f);
        }
    }
}
