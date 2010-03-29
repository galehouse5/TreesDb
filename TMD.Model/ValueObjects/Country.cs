using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;

namespace TMD.Model
{
    public class Country : ICloneable
    {
        private string m_Code;
        private string m_Name;
        private bool m_LoadOnPropertySet;

        private Country() 
        {
            m_LoadOnPropertySet = true;
        }

        private Country(string code, string name, CoordinateBounds coordinateBounds)
        {
            m_LoadOnPropertySet = false;
            this.Code = code;
            this.Name = name;
        }

        public string Code 
        {
            get { return m_Code; }
            private set
            {
                m_Code = value.Trim().ToUpper();
                if (m_LoadOnPropertySet)
                {
                    m_LoadOnPropertySet = false;
                    foreach (Country c in Countries)
                    {
                        if (c.Code == m_Code)
                        {
                            Name = c.Name;
                            CoordinateBounds = (CoordinateBounds)c.CoordinateBounds.Clone();
                            return;
                        }
                    }
                    m_LoadOnPropertySet = true;
                    throw new ApplicationException(string.Format("Unknown country '{0}'.", value));
                }
                
            }
        }

        public string Name 
        {
            get { return m_Name; }
            private set
            {
                m_Name = value.Trim().ToTitleCase();
                if (m_LoadOnPropertySet)
                {
                    m_LoadOnPropertySet = false;
                    foreach (Country c in Countries)
                    {
                        if (c.Name == m_Name)
                        {
                            Code = c.Code;
                            CoordinateBounds = (CoordinateBounds)c.CoordinateBounds.Clone();
                            return;
                        }
                    }
                    m_LoadOnPropertySet = true;
                    throw new ApplicationException(string.Format("Unknown country '{0}'.", value));
                }

            }
        }

        public CoordinateBounds CoordinateBounds { get; private set; }

        public static bool operator ==(Country c1, Country c2)
        {
            return c1.Code == c2.Code;
        }

        public static bool operator !=(Country c1, Country c2)
        {
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

        private static List<Country> s_Countries;
        private static List<Country> Countries
        {
            get
            {
                if (s_Countries == null)
                {
                    s_Countries = new List<Country>();
                    foreach (CountryElement ce in ModelRegistry.ModelSettings.Countries)
                    {
                        Country c = new Country(ce.Code.Trim().ToUpper(),
                            ce.Name.Trim().ToTitleCase(),
                            CoordinateBounds.Create(Coordinates.Create(ce.NECoordinates), 
                            Coordinates.Create(ce.SWCoordinates)));
                        s_Countries.Add(c);
                    }
                }
                return s_Countries;
            }
        }

        public static Country Create(string s)
        {
            string code = s.Trim().ToUpper();
            string name = s.Trim().ToTitleCase();
            foreach (Country c in Countries)
            {
                if (c.Code == code || c.Name == name)
                {
                    return (Country)c.Clone();
                }
            }
            throw new ApplicationException(string.Format("Unknown country '{0}'.", s));
        }

        #region ICloneable Members

        public object Clone()
        {
            return new Country(Code, Name, (CoordinateBounds)CoordinateBounds.Clone());
        }

        #endregion
    }
}
