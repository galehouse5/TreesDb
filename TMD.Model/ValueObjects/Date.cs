using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;

namespace TMD.Model
{
    [Serializable]
    public class Date : IIsValid, IIsNull, IComparable, IComparable<Date>
    {
        private Date()
        {
            IsValid = true;
        }

        public DateTime DateTime { get; private set; }

        #region IIsNull Members

        public bool IsNull
        {
            get { return DateTime == MinValue.DateTime; }
        }

        #endregion

        #region IIsValid Members

        public bool IsValid { get; private set; }

        public IList<ValidationError> GetValidationErrors()
        {
            List<ValidationError> errors = new List<ValidationError>();
            if (!IsValid)
            {
                errors.Add(ValidationError.Create(this, "DateTime", "Date must have a valid format."));
            }
            return errors;
        }

        #endregion

        public static bool operator ==(Date d1, Date d2)
        {
            if ((object)d1 == null || (object)d2 == null)
            {
                return (object)d1 == null && (object)d2 == null;
            }
            return d1.DateTime == d2.DateTime;
        }

        public static bool operator !=(Date d1, Date d2)
        {
            if ((object)d1 == null || (object)d2 == null)
            {
                return !((object)d1 == null && (object)d2 == null);
            }
            return d1.DateTime != d2.DateTime;
        }

        public static bool operator <=(Date d1, Date d2)
        {
            return d1.DateTime <= d2.DateTime;
        }

        public static bool operator <(Date d1, Date d2)
        {
            return d1.DateTime < d2.DateTime;
        }

        public static bool operator >=(Date d1, Date d2)
        {
            return d1.DateTime >= d2.DateTime;
        }

        public static bool operator >(Date d1, Date d2)
        {
            return d1.DateTime >= d2.DateTime;
        }

        public override bool Equals(object obj)
        {
            Date d = obj as Date;
            return d != null && d == this;
        }

        public override int GetHashCode()
        {
            return DateTime.GetHashCode();
        }

        public override string ToString()
        {
            if (IsNull)
            {
                return string.Empty;
            }
            return DateTime.ToString("MM/dd/yyyy");
        }

        public static Date Create(string s)
        {
            Date d = new Date();
            DateTime dt;
            if (DateTime.TryParse(s, out dt))
            {
                d.DateTime = dt;
                d.IsValid = true;
            }
            else
            {
                d.DateTime = MinValue.DateTime;
                d.IsValid = false;
            }
            return d;
        }

        public static Date Create(DateTime dt)
        {
            Date d = new Date();
            d.DateTime = dt;
            d.IsValid = true;
            return d;
        }

        public static readonly Date Null = Date.Create(new DateTime(1753, 1, 1));
        public static readonly Date MinValue = Date.Create(new DateTime(1753, 1, 1));
        public static readonly Date MaxValue = Date.Create(new DateTime(9999, 1, 1));

        public static Date Now
        {
            get { return Date.Create(DateTime.Now); }
        }

        public static implicit operator Date(string s)
        {
            return Date.Create(s);
        }

        public static implicit operator string(Date d)
        {
            return d.ToString();
        }

        public static implicit operator Date(DateTime dt)
        {
            return Date.Create(dt);
        }

        public static implicit operator DateTime(Date d)
        {
            return d.DateTime;
        }

        #region IComparable Members

        public int CompareTo(object obj)
        {
            Date d = obj as Date;
            if (d == null)
            {
                return -1;
            }
            return this.DateTime.CompareTo(d.DateTime);
        }

        #endregion

        #region IComparable<Date> Members

        public int CompareTo(Date other)
        {
            return this.DateTime.CompareTo(other.DateTime);
        }

        #endregion
    }
}
