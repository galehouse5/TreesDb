using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using TMD.Model.Validation;

namespace TMD.Model
{
    [Serializable]
    public class Latitude : ICloneable, IIsValid, IIsNull
    {
        public enum EInputFormat
        {
            Invalid,
            DegreesMinutesDecimalSeconds,
            DegreesDecimalMinutes,
            DecimalDegrees
        }

        private Latitude()
        {
            this.InputFormat = EInputFormat.DegreesDecimalMinutes;
        }

        private Latitude(float degrees)
        {
            this.TotalDegrees = degrees;
            this.InputFormat = EInputFormat.DegreesDecimalMinutes;
        }

        private Latitude(float degrees, EInputFormat inputFormat)
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
                case EInputFormat.DegreesMinutesDecimalSeconds :
                    s = string.Format("{0:00} {1:00} {2:00.0}", AbsoluteWholeDegrees * Sign, AbsoluteWholeMinutes, AbsoluteSeconds);
                    break;
                case EInputFormat.DegreesDecimalMinutes :
                    s = string.Format("{0:00} {1:00.000}", AbsoluteWholeDegrees * Sign, AbsoluteMinutes);
                    break;
                case EInputFormat.DecimalDegrees :
                    s = string.Format("{0:00.00000}", AbsoluteTotalDegrees);
                    break;
                default :
                    s = string.Empty;
                    break;
            }
            return s;
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

        #region ICloneable Members

        public object Clone()
        {
            return new Latitude(TotalDegrees, InputFormat);
        }

        #endregion

        #region IIsValid Members

        public bool IsValid
        {
            get { return InputFormat != EInputFormat.Invalid && AbsoluteTotalDegrees <= 90; }
        }

        public IList<ValidationError> GetValidationErrors()
        {
            List<ValidationError> errors = new List<ValidationError>();
            if (InputFormat == EInputFormat.Invalid)
            {
                errors.Add(ValidationError.Create(this, "InputFormat", "Latitude must be in dd_mm_ss.s, dd_mm.mmm, or dd.ddddd format."));
            }
            if (AbsoluteTotalDegrees > 90)
            {
                errors.Add(ValidationError.Create(this, "AbsoluteTotalDegrees", "Latitude must be in the range of -90 to +90 degrees."));
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

        public static Regex DegreesMinutesSecondsFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2})\\s+(?<minutes>[0-9]{1,2})\\s+(?<seconds>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Regex DegreesDecimalMinutesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2})\\s+(?<minutes>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Regex DecimalDegreesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);

        public static Latitude Create(string s)
        {
            Match match;
            float sign, degrees, minutes, seconds;
            EInputFormat inputFormat;
            if (string.IsNullOrWhiteSpace(s))
            {
                sign = 1f;
                degrees = 0f;
                minutes = 0f;
                seconds = 0f;
                inputFormat = EInputFormat.Invalid;
            }
            else if ((match = DegreesMinutesSecondsFormat.Match(s)).Success)
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
                degrees = float.Parse(match.Groups["degrees"].Value);
                minutes = float.Parse(match.Groups["minutes"].Value);
                seconds = 0f;
                inputFormat = EInputFormat.DegreesDecimalMinutes;
            }
            else if ((match = DecimalDegreesFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                degrees = float.Parse(match.Groups["degrees"].Value);
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
            return new Latitude(sign * (degrees + (minutes / 60f) + (seconds / 3600f)), inputFormat);
        }

        public static Latitude Create(float latitude)
        {
            return new Latitude(latitude);
        }

        public static Latitude Null()
        {
            return new Latitude(0f);
        }
    }
}
