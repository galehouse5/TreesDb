using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using TMD.Model.Validation;

namespace TMD.Model
{
    [Serializable]
    public class Volume : ICloneable, IIsValid, IIsNull
    {
        public enum EInputFormat
        {
            Invalid,
            DecimalCubicFeet,
            DecimalCubicMeters,
            DecimalCubicYards
        }

        private Volume() 
        {
            this.InputFormat = EInputFormat.DecimalCubicFeet;
        }

        public Volume(float cubicFeet, EInputFormat inputFormat)
        {
            this.CubicFeet = cubicFeet;
            this.InputFormat = inputFormat;
        }

        public float CubicFeet { get; private set; }
        public EInputFormat InputFormat { get; private set; }

        public float CubicMeters
        {
            get { return CubicFeet * 0.0283168466f; }
        }

        public float CubicYards
        {
            get { return CubicFeet * 0.037037037f; }
        }

        public static bool operator ==(Volume v1, Volume v2)
        {
            if ((object)v1 == null || (object)v2 == null)
            {
                return (object)v1 == null && (object)v2 == null;
            }
            return v1.CubicFeet == v2.CubicFeet;
        }

        public static bool operator !=(Volume v1, Volume v2)
        {
            if ((object)v1 == null || (object)v2 == null)
            {
                return (object)v1 == null && (object)v2 == null;
            }
            return v1.CubicFeet != v2.CubicFeet;
        }

        public override bool Equals(object obj)
        {
            Volume v = obj as Volume;
            return v != null && v == this;
        }

        public override int GetHashCode()
        {
            return CubicFeet.GetHashCode();
        }

        public override string ToString()
        {
            string s;
            switch (InputFormat)
            {
                case EInputFormat.DecimalCubicFeet :
                    s = string.Format("{0:0} ft^3", CubicFeet);
                    break;
                case EInputFormat.DecimalCubicMeters :
                    s = string.Format("{0:0} m^3", CubicMeters);
                    break;
                case EInputFormat.DecimalCubicYards :
                    s = string.Format("{0:0} yd^3", CubicYards);
                    break;
                default :
                    s = string.Empty;
                    break;
            }
            return s;
        }

        #region IIsValid Members

        public bool IsValid
        {
            get { return InputFormat != EInputFormat.Invalid && CubicFeet >= 0f; }
        }

        public IList<ValidationError> GetValidationErrors()
        {
            List<ValidationError> errors = new List<ValidationError>();
            if (InputFormat == EInputFormat.Invalid)
            {
                errors.Add(ValidationError.Create(this, "InputFormat", "Volume must be in fffff ft^3 or mmmmm.mm m^3 format."));
            }
            if (CubicFeet < 0f)
            {
                errors.Add(ValidationError.Create(this, "CubicFeet", "Volume must be non-negative."));
            }
            return errors;
        }

        #endregion

        #region IIsNull Members

        public bool IsNull
        {
            get { return CubicFeet == 0f; }
        }

        #endregion

        #region ICloneable Members

        public object Clone()
        {
            return new Volume(CubicFeet, InputFormat);
        }

        #endregion

        private static Regex DecimalCubicFeetFormat = new Regex("^\\s*(?<cubicFeet>[0-9]+(\\.[0-9]+)?)((\\s*cu ft)|(\\s*ft^3)|(\\s*cubic feet)|(\\s*cubic ft))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalCubicMetersFormat = new Regex("^\\s*(?<cubicMeters>[0-9]+(\\.[0-9]+)?)((\\s*cu m)|(\\s*m^3)|(\\s*cubic meters)|(\\s*cubic m))\\s*$", RegexOptions.Compiled);
        private static Regex DecimalCubicYardsFormat = new Regex("^\\s*(?<cubicYards>[0-9]+(\\.[0-9]+)?)((\\s*cu yds)|(\\s*yds^3)|(\\s*cubic yards)|(\\s*cubic yds))\\s*$", RegexOptions.Compiled);

        public static Volume Create(string s)
        {
            Match match;
            float cubicFeet;
            EInputFormat inputFormat;
            if ((match = DecimalCubicFeetFormat.Match(s)).Success)
            {
                cubicFeet = float.Parse(match.Groups["cubicFeet"].Value);
                inputFormat = EInputFormat.DecimalCubicFeet;
            }
            else if ((match = DecimalCubicMetersFormat.Match(s)).Success)
            {
                cubicFeet = float.Parse(match.Groups["cubicMeters"].Value) / 0.0283168466f;
                inputFormat = EInputFormat.DecimalCubicMeters;
            }
            else if ((match = DecimalCubicYardsFormat.Match(s)).Success)
            {
                cubicFeet = float.Parse(match.Groups["cubicYards"].Value) / 0.037037037f;
                inputFormat = EInputFormat.DecimalCubicYards;
            }
            else
            {
                cubicFeet = 0f;
                inputFormat = EInputFormat.Invalid;
            }
            return new Volume(cubicFeet, inputFormat);
        }

        public static Volume Null()
        {
            return new Volume(0f, EInputFormat.DecimalCubicFeet);
        }
    }
}
