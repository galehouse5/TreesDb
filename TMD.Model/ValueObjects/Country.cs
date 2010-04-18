using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;
using TMD.Model.Validation;

namespace TMD.Model
{
    [Serializable]
    public class Country : ICloneable, IIsValid, IIsNull
    {
        private string m_Code;
        private bool m_IsKnown;

        private Country() 
        {
            m_IsKnown = false;
        }

        private Country(string code, string name, CoordinateBounds coordinateBounds, bool isKnown)
        {
            m_Code = code;
            this.Name = name;
            this.CoordinateBounds = coordinateBounds;
            m_IsKnown = isKnown;
        }

        public string Code 
        {
            get { return m_Code; }
            private set
            {
                m_Code = value.Trim().ToUpper();
                foreach (Country c in KnownCountries)
                {
                    if (c.Code == m_Code)
                    {
                        m_IsKnown = true;
                        this.Name = c.Name;
                        this.CoordinateBounds = (CoordinateBounds)c.CoordinateBounds.Clone();
                    }
                }                
            }
        }

        public string Name { get; private set; }
        public CoordinateBounds CoordinateBounds { get; private set; }

        public static bool operator ==(Country c1, Country c2)
        {
            if ((object)c1 == null || (object)c2 == null)
            {
                return (object)c1 == null && (object)c2 == null;
            }
            return c1.Code == c2.Code;
        }

        public static bool operator !=(Country c1, Country c2)
        {
            if ((object)c1 == null || (object)c2 == null)
            {
                return !((object)c1 == null && (object)c2 == null);
            }
            return c1.Code != c2.Code;
        }

        public override bool Equals(object obj)
        {
            Country c = obj as Country;
            return c.Code == this.Code;
        }

        public override int GetHashCode()
        {
            return Code.GetHashCode();
        }

        private static List<Country> s_KnownCountries;
        private static IList<Country> KnownCountries
        {
            get
            {
                if (s_KnownCountries == null)
                {
                    s_KnownCountries = new List<Country>();
                    foreach (CountryElement ce in ModelRegistry.ModelSettings.Countries)
                    {
                        Country c = new Country(
                            ce.Code.Trim().ToUpper(),
                            ce.Name.Trim().ToTitleCase(),
                            CoordinateBounds.Create(Coordinates.Create(ce.NECoordinates), Coordinates.Create(ce.SWCoordinates)),
                            true);
                        s_KnownCountries.Add(c);
                    }
                }
                return s_KnownCountries.AsReadOnly();
            }
        }

        public static Country Create(string code)
        {
            code = code.Trim().ToUpper();
            foreach (Country c in KnownCountries)
            {
                if (c.Code == code)
                {
                    return (Country)c.Clone();
                }
            }
            return new Country(code, string.Empty, CoordinateBounds.Null(), false);
        }

        public static Country Null()
        {
            return new Country(string.Empty, string.Empty, CoordinateBounds.Null(), true);
        }

        #region ICloneable Members

        public object Clone()
        {
            return new Country(Code, Name, (CoordinateBounds)CoordinateBounds.Clone(), m_IsKnown);
        }

        #endregion

        #region IIsValid Members

        public bool IsValid
        {
            get { return m_IsKnown; }
        }

        public IList<ValidationError> GetValidationErrors()
        {
            List<ValidationError> errors = new List<ValidationError>();
            if (!m_IsKnown)
            {
                errors.Add(ValidationError.Create(this, "Code", string.Format("Unknown country code '{0}'.", Code)));
            }
            return errors;
        }

        #endregion

        #region IIsNull Members

        public bool IsNull
        {
            get { return string.IsNullOrWhiteSpace(Code); }
        }

        #endregion
    }
}
