using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public class Angle : ICloneable, IIsValid, IIsNull
    {
        public enum EInputFormat
        {
            Invalid,
            Decimal
        }

        private Angle()
        {
            this.InputFormat = EInputFormat.Decimal;
        }

        private Angle(float degrees, EInputFormat inputFormat) 
        {
            this.Degrees = degrees;
            this.InputFormat = inputFormat;
        }

        public float Degrees { get; private set; }
        public EInputFormat InputFormat { get; private set; }

        public override string ToString()
        {
            string s;
            switch (InputFormat)
            {
                case EInputFormat.Decimal :
                    s = Degrees.ToString();
                    break;
                default :
                    s = string.Empty;
                    break;
            }
            return s;
        }

        public static bool operator ==(Angle a1, Angle a2)
        {
            if ((object)a1 == null || (object)a2 == null)
            {
                return (object)a1 == null && (object)a2 == null;
            }
            return a1.Degrees == a2.Degrees;
        }

        public static bool operator !=(Angle a1, Angle a2)
        {
            if ((object)a1 == null || (object)a2 == null)
            {
                return !((object)a1 == null && (object)a2 == null);
            }
            return a1.Degrees != a2.Degrees;
        }

        public override bool Equals(object obj)
        {
            Angle a = obj as Angle;
            return a != null && a == this;
        }

        public override int GetHashCode()
        {
            return Degrees.GetHashCode();
        }

        public static Angle Create(string s)
        {
            float degrees;
            if (float.TryParse(s.Trim(), out degrees))
            {
                return new Angle(degrees, EInputFormat.Decimal);
            }
            return new Angle(0f, EInputFormat.Invalid);
        }

        #region ICloneable Members

        public object Clone()
        {
            return new Angle(this.Degrees, this.InputFormat);
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
                errors.Add("Angle must be in decimal format.");
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
    }
}
