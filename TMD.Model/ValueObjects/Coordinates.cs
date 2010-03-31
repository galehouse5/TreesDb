using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace TMD.Model
{
    public class Coordinates : ICloneable, IIsValid, IIsNull 
    {
        private Coordinates()
        { }

        private Coordinates(Latitude latitude, Longitude longitude) 
        {
            this.Latitude = latitude;
            this.Longitude = longitude;
        }

        public Latitude Latitude { get; private set; }
        public Longitude Longitude { get; private set; }

        public static bool operator ==(Coordinates c1, Coordinates c2)
        {
            if ((object)c1 == null || (object)c2 == null)
            {
                return (object)c1 == null && (object)c2 == null;
            }
            return c1.Latitude == c2.Latitude
                && c1.Longitude == c2.Longitude;
        }

        public static bool operator !=(Coordinates c1, Coordinates c2)
        {
            if ((object)c1 == null || (object)c2 == null)
            {
                return !((object)c1 == null && (object)c2 == null);
            }
            return c1.Latitude != c2.Latitude
                || c1.Longitude != c2.Longitude;
        }

        public override bool Equals(object obj)
        {
            Coordinates c = obj as Coordinates;
            return c != null && c == this;
        }

        public override int GetHashCode()
        {
            return Latitude.GetHashCode()
                ^ Longitude.GetHashCode();
        }

        public static Coordinates Create(Latitude latitude, Longitude longitude)
        {
            return new Coordinates(latitude, longitude);
        }

        public static Coordinates Create(float latitude, float longitude)
        {
            return new Coordinates(Latitude.Create(latitude), Longitude.Create(longitude));
        }

        public static Coordinates Create(string s)
        {
            string[] latLng = s.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            Latitude latitude = Latitude.Create(latLng[0]);
            Longitude longitude;
            if (latLng.Length > 1)
            {
                longitude = Longitude.Create(latLng[1]);
            }
            else
            {
                longitude = Longitude.Create(0f);
            }
            return new Coordinates(latitude, longitude);
        }

        public static Coordinates Null()
        {
            return new Coordinates(Latitude.Null(), Longitude.Null());
        }

        #region ICloneable Members

        public object Clone()
        {
            return new Coordinates((Latitude)Latitude.Clone(), (Longitude)Longitude.Clone());
        }

        #endregion

        #region IIsValid Members

        public bool IsValid
        {
            get { return Latitude.IsValid && Longitude.IsValid; }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            errors.AddRange(Latitude.GetValidationErrors());
            errors.AddRange(Longitude.GetValidationErrors());
            return errors;
        }

        #endregion

        #region IIsNull Members

        public bool IsNull
        {
            get { return Latitude.IsNull || Longitude.IsNull; }
        }

        #endregion
    }
}
