using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace TMD.Model
{
    public class Distance : ICloneable, IIsValid, IIsNull
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

        private Distance() 
        { 
            InputFormat = EInputFormat.DecimalFeet;
        }

        private Distance(float feet)
        {
            this.Feet = feet;
            InputFormat = EInputFormat.DecimalFeet;
        }

        private Distance(float feet, EInputFormat inputFormat)
        {
            this.Feet = feet;
            this.InputFormat = inputFormat;
        }

        public float Feet { get; private set; }
        public EInputFormat InputFormat { get; private set; }

        public int WholeFeet
        {
            get { return (int)Math.Floor(Feet); }
        }

        public float RemainderInches
        {
            get { return 12f * (Feet - WholeFeet); }
        }

        public float Inches
        {
            get { return 12f * Feet; }
        }

        public float Yards
        {
            get { return 3f * Feet; }
        }

        public float Meters
        {
            get { return Feet / 3.2808399f; }
        }

        public static bool operator==(Distance d1, Distance d2)
        {
            return d1.Feet == d2.Feet;
        }

        public static bool operator !=(Distance d1, Distance d2)
        {
            return d1.Feet != d2.Feet;
        }

        public override bool Equals(object obj)
        {
            Distance d = obj as Distance;
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
                case EInputFormat.DecimalFeet :
                    s = string.Format("{0:0.0}'", Feet);
                    break;
                case EInputFormat.DecimalInches :
                    s = string.Format("{0:0}''", Inches);
                    break;
                case EInputFormat.DecimalMeters :
                    s = string.Format("{0:0.00} m", Meters);
                    break;
                case EInputFormat.DecimalYards :
                    s = string.Format("{0:0.00} yd", Yards);
                    break;
                case EInputFormat.FeetDecimalInches :
                    s = string.Format("{0:0}' {1:0}''", WholeFeet, RemainderInches);
                    break;
                default :
                    s = string.Empty;
                    break;
            }
            return s;
        }

        #region ICloneable Members

        public object Clone()
        {
            return new Distance(Feet, InputFormat);
        }

        #endregion

        #region IIsValid Members

        public bool IsValid
        {
            get { return InputFormat != EInputFormat.Invalid && Feet >= 0f; }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            if (InputFormat == EInputFormat.Invalid)
            {
                errors.Add("Distance must be in fff.f', fff' ii'', mmm.mm m, or yyy.yy yd format.");
            }
            if (Feet < 0f)
            {
                errors.Add("Distance must be non-negative.");
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

        private static Regex FeetDecimalInchesFormat = new Regex("^\\s*(?<feet>[0-9]+(\\.[0-9]+)?)((\\s*'')|(\\s*ft)|(\\s*feet))\\s+(?<inches>[0-9]+(\\.[0-9]+)?)((\\s*')|(\\s*in)|(\\s*inches?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalFeetFormat = new Regex("^\\s*(?<feet>[0-9]+(\\.[0-9]+)?)((\\s*'')|(\\s*ft)|(\\s*feet))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalInchesFormat = new Regex("^\\s*(?<inches>[0-9]+(\\.[0-9]+)?)((\\s*')|(\\s*in)|(\\s*inches?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalMetersFormat = new Regex("^\\s*(?<meters>[0-9]+(\\.[0-9]+)?)((\\s*m)|(\\s*meters?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalYardsFormat = new Regex("^\\s*(?<yards>[0-9]+(\\.[0-9]+)?)((\\s*yds?)|(\\s*yards?))\\s*$", RegexOptions.Compiled);

        public static Distance Create(string s)
        {
            Match match;
            float feet;
            EInputFormat inputFormat;
            if ((match = FeetDecimalInchesFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["feet"].Value);
                feet += float.Parse(match.Groups["inches"].Value) * 12f;
                inputFormat = EInputFormat.FeetDecimalInches;
            }
            else if ((match = DecimalFeetFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["feet"].Value);
                inputFormat = EInputFormat.DecimalFeet;
            }
            else if ((match = DecimalInchesFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["inches"].Value) * 12f;
                inputFormat = EInputFormat.DecimalInches;
            }
            else if ((match = DecimalMetersFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["meters"].Value) * 3.2808399f;
                inputFormat = EInputFormat.DecimalMeters;
            }
            else if ((match = DecimalYardsFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["yards"].Value) * 3f;
                inputFormat = EInputFormat.DecimalYards;
            }
            else
            {
                feet = 0f;
                inputFormat = EInputFormat.Invalid;
            }
            return new Distance(feet, inputFormat);
        }

        public static Distance Create(float feet)
        {
            return new Distance(feet);
        }
    }
}
