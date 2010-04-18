using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using TMD.Model.Validation;

namespace TMD.Model
{
    [Serializable]
    public class Elevation : ICloneable, IIsValid, IIsNull
    {
        public const int MaxElevationFeet = 17000;

        public enum EInputFormat
        {
            Invalid,
            DecimalFeet,
            DecimalMeters,
            DecimalYards
        }

        private Elevation()
        {
            InputFormat = EInputFormat.DecimalFeet;
        }

        private Elevation(float feet, EInputFormat inputFormat)
        {
            this.Feet = feet;
            this.InputFormat = inputFormat;
        }

        public float Feet { get; private set; }
        public EInputFormat InputFormat { get; private set; }

        public float Yards
        {
            get { return 3f * Feet; }
        }

        public float Meters
        {
            get { return Feet / 3.2808399f; }
        }

        public static bool operator ==(Elevation e1, Elevation e2)
        {
            if ((object)e1 == null || (object)e2 == null)
            {
                return (object)e1 == null && (object)e2 == null;
            }
            return e1.Feet == e2.Feet;
        }

        public static bool operator !=(Elevation e1, Elevation e2)
        {
            if ((object)e1 == null || (object)e2 == null)
            {
                return !((object)e1 == null && (object)e2 == null);
            }
            return e1.Feet != e2.Feet;
        }

        public override bool Equals(object obj)
        {
            Elevation e = obj as Elevation;
            return e != null && e == this;
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
                    s = string.Format("{0:0.0} ft", Feet);
                    break;
                case EInputFormat.DecimalMeters:
                    s = string.Format("{0:0.00} m", Meters);
                    break;
                case EInputFormat.DecimalYards:
                    s = string.Format("{0:0.00} yd", Yards);
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
            return new Elevation(Feet, InputFormat);
        }

        #endregion

        #region IIsValid Members

        public bool IsValid
        {
            get { return InputFormat != EInputFormat.Invalid && Feet >= 0f && Feet <= 17000; }
        }

        public IList<ValidationError> GetValidationErrors()
        {
            List<ValidationError> errors = new List<ValidationError>();
            if (InputFormat == EInputFormat.Invalid)
            {
                errors.Add(ValidationError.Create(this, "InputFormat", "Elevation must be in fffff ft or mmmmm m format."));
            }
            if (Feet < 0f)
            {
                errors.Add(ValidationError.Create(this, "Feet", "Elevation must be non-negative."));
            }
            if (Feet > MaxElevationFeet)
            {
                Elevation maxElevation = new Elevation(17000, InputFormat);
                errors.Add(ValidationError.Create(this, "Feet", string.Format("Elevation must not exceed {0}.", maxElevation.ToString())));
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

        private static Regex DecimalFeetFormat = new Regex("^\\s*(?<feet>[0-9]+(\\.[0-9]+)?)((\\s*'')|(\\s*ft)|(\\s*feet))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalMetersFormat = new Regex("^\\s*(?<meters>[0-9]+(\\.[0-9]+)?)((\\s*m)|(\\s*meters?))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalYardsFormat = new Regex("^\\s*(?<yards>[0-9]+(\\.[0-9]+)?)((\\s*yds?)|(\\s*yards?))\\s*$", RegexOptions.Compiled);

        public static Elevation Create(string s)
        {
            Match match;
            float feet;
            EInputFormat inputFormat;
            if ((match = DecimalFeetFormat.Match(s)).Success)
            {
                feet = float.Parse(match.Groups["feet"].Value);
                inputFormat = EInputFormat.DecimalFeet;
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
            return new Elevation(feet, inputFormat);
        }

        public static Elevation Null()
        {
            return new Elevation(0f, EInputFormat.DecimalFeet);
        }
    }
}
