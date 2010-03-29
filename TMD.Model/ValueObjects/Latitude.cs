using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace TMD.Model
{
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
            this.Degrees = degrees;
            this.InputFormat = EInputFormat.DegreesDecimalMinutes;
        }

        private Latitude(float degrees, EInputFormat inputFormat)
        {
            this.Degrees = degrees;
            this.InputFormat = inputFormat;
        }

        public float Degrees { get; private set; }
        public EInputFormat InputFormat { get; private set; }

        public int Sign 
        {
            get { return Math.Sign(Degrees); }
        }

        public float AbsoluteDegrees 
        {
            get { return Math.Abs(Degrees); }
        }

        public int AbsoluteWholeDegrees
        {
            get { return (int)Math.Floor(AbsoluteDegrees); }
        }

        public float AbsoluteMinutes
        {
            get { return 60f * (AbsoluteDegrees - AbsoluteWholeDegrees); }
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
                    s = string.Format("{0:00.00000}", AbsoluteDegrees);
                    break;
                default :
                    s = string.Empty;
                    break;
            }
            return s;
        }

        public static bool operator ==(Latitude l1, Latitude l2)
        {
            return l1.Degrees == l2.Degrees;
        }

        public static bool operator !=(Latitude l1, Latitude l2)
        {
            return l1.Degrees != l2.Degrees;
        }

        public override bool Equals(object obj)
        {
            Latitude l = obj as Latitude;
            return l != null && l == this;
        }

        public override int GetHashCode()
        {
            return Degrees.GetHashCode();
        }


        #region ICloneable Members

        public object Clone()
        {
            return new Latitude(Degrees, InputFormat);
        }

        #endregion

        #region IIsValid Members

        public bool IsValid
        {
            get { return InputFormat != EInputFormat.Invalid && AbsoluteDegrees <= 90; }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            if (InputFormat == EInputFormat.Invalid)
            {
                errors.Add("Latitude must be in dd_mm_ss.s, dd_mm.mmm, or dd.ddddd format.");
            }
            if (AbsoluteDegrees > 90)
            {
                errors.Add("Latitude must be in the range of -90 to +90 degrees.");
            }
            return errors;
        }

        #endregion

        #region IIsNull Members

        public bool IsNull
        {
            get { return Degrees == 0f; }
        }

        #endregion

        public static Regex DegreesMinutesSecondsFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2})\\s+(?<minutes>[0-9]{1,2})\\s+(?<seconds>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Regex DegreesDecimalMinutesFormat = new Regex("^\\s*(?<sign>[-+])?(?<degrees>[0-9]{1,2})\\s+(?<minutes>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);
        public static Regex DecimalDegreesFormat = new Regex("^\\s*(?<sign>[-+]?(?<degrees>[0-9]{1,2}(\\.[0-9]+)?)\\s*$", RegexOptions.Compiled);

        public static Latitude Create(string s)
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
            return new Latitude(sign * (degrees + (minutes / 60f) + (seconds / 3600f)), inputFormat);
        }

        public static Latitude Create(float latitude)
        {
            return new Latitude(latitude);
        }
    }
}
