using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace TMD.Model
{
    public class DirectedDistance : ICloneable, IIsValid, IIsNull
    {
        public enum EInputFormat
        {
            Invalid,
            FeetDecimalInches,
            DecimalFeet,
            DecimalInches,
            DecimalMeters,
            DecimalYards
        }

        private DirectedDistance()
        {
            InputFormat = EInputFormat.DecimalFeet;
        }

        private DirectedDistance(float feet, EInputFormat inputFormat)
        {
            this.Feet = feet;
            this.InputFormat = inputFormat;
        }

        public float Feet { get; private set; }
        public EInputFormat InputFormat { get; private set; }

        public int Sign
        {
            get { return Math.Sign(Feet); }
        }

        public float AbsoluteFeet
        {
            get { return Math.Abs(Feet); }
        }

        public int AbsoluteWholeFeet
        {
            get { return (int)Math.Floor(AbsoluteFeet); }
        }

        public float AbsoluteRemainderInches
        {
            get { return 12f * (AbsoluteFeet - AbsoluteWholeFeet); }
        }

        public float AbsoluteInches
        {
            get { return 12f * AbsoluteFeet; }
        }

        public float AbsoluteYards
        {
            get { return 3f * AbsoluteFeet; }
        }

        public float AbsoluteMeters
        {
            get { return AbsoluteFeet / 3.2808399f; }
        }

        public static bool operator ==(DirectedDistance d1, DirectedDistance d2)
        {
            return d1.Feet == d2.Feet;
        }

        public static bool operator !=(DirectedDistance d1, DirectedDistance d2)
        {
            return d1.Feet != d2.Feet;
        }

        public override bool Equals(object obj)
        {
            DirectedDistance d = obj as DirectedDistance;
            return d != null && d == this;
        }

        public override int GetHashCode()
        {
            return Feet.GetHashCode();
        }

        public override string ToString()
        {
            string s;
            switch (InputFormat)
            {
                case EInputFormat.DecimalFeet:
                    s = string.Format("{0}{1:0.0}'", (Sign < 0) ? "-" : "", AbsoluteFeet);
                    break;
                case EInputFormat.DecimalInches:
                    s = string.Format("{0}{1:0}''", (Sign < 0) ? "-" : "", AbsoluteInches);
                    break;
                case EInputFormat.DecimalMeters:
                    s = string.Format("{0}{1:0.00} m", (Sign < 0) ? "-" : "", AbsoluteMeters);
                    break;
                case EInputFormat.DecimalYards:
                    s = string.Format("{0}{1:0.00} yd", (Sign < 0) ? "-" : "", AbsoluteYards);
                    break;
                case EInputFormat.FeetDecimalInches:
                    s = string.Format("{0}{1:0}' {2:0}''", (Sign < 0) ? "-" : "", AbsoluteFeet, AbsoluteRemainderInches);
                    break;
                default:
                    s = string.Empty;
                    break;
            }
            return s;
        }

        #region ICloneable Members

        public object Clone()
        {
            return new DirectedDistance(Feet, InputFormat);
        }

        #endregion

        #region IIsValid Members

        public bool IsValid
        {
            get { return InputFormat != EInputFormat.Invalid; }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            if (InputFormat == EInputFormat.Invalid)
            {
                errors.Add("Distance correction must be in f.f', f' i'', i'', m.mm m, or y.yy yd format.");
            }
            return errors;
        }

        #endregion

        #region IIsNull Members

        public bool IsNull
        {
            get { return Feet != 0f; }
        }

        #endregion

        private static Regex FeetDecimalInchesFormat = new Regex("^\\s*(?<sign>[+-])?(?<feet>[0-9]+(\\.[0-9]+)?)((\\s*'')|(\\s*ft)|(\\s*feet))\\s+(?<inches>[0-9]+(\\.[0-9]+)?)((\\s*')|(\\s*in)|(\\s*inches?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalFeetFormat = new Regex("^\\s*(?<sign>[+-])?(?<feet>[0-9]+(\\.[0-9]+)?)((\\s*'')|(\\s*ft)|(\\s*feet))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalInchesFormat = new Regex("^\\s*(?<sign>[+-])?(?<inches>[0-9]+(\\.[0-9]+)?)((\\s*')|(\\s*in)|(\\s*inches?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalMetersFormat = new Regex("^\\s*(?<sign>[+-])?(?<meters>[0-9]+(\\.[0-9]+)?)((\\s*m)|(\\s*meters?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalYardsFormat = new Regex("^\\s*(?<sign>[+-])?(?<yards>[0-9]+(\\.[0-9]+)?)((\\s*yds?)|(\\s*yards?))\\s*$", RegexOptions.Compiled);

        public static DirectedDistance Create(string s)
        {
            Match match;
            float sign, feet;
            EInputFormat inputFormat;
            if ((match = FeetDecimalInchesFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["feet"].Value);
                feet += float.Parse(match.Groups["inches"].Value) * 12f;
                inputFormat = EInputFormat.FeetDecimalInches;
            }
            else if ((match = DecimalFeetFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["feet"].Value);
                inputFormat = EInputFormat.DecimalFeet;
            }
            else if ((match = DecimalInchesFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["inches"].Value) * 12f;
                inputFormat = EInputFormat.DecimalInches;
            }
            else if ((match = DecimalMetersFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["meters"].Value) * 3.2808399f;
                inputFormat = EInputFormat.DecimalMeters;
            }
            else if ((match = DecimalYardsFormat.Match(s)).Success)
            {
                sign = (match.Groups["sign"].Value == "-" ? -1f : 1f);
                feet = float.Parse(match.Groups["yards"].Value) * 3f;
                inputFormat = EInputFormat.DecimalYards;
            }
            else
            {
                sign = 1f;
                feet = 0f;
                inputFormat = EInputFormat.Invalid;
            }
            return new DirectedDistance(sign * feet, inputFormat);
        }
    }
}
