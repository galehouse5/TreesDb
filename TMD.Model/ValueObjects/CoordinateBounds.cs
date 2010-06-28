using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;

namespace TMD.Model
{
    [Serializable]
    public class CoordinateBounds : IIsSpecified
    {
        private CoordinateBounds() { }

        [ObjectValidator]
        public Coordinates NE { get; private set; }

        [ObjectValidator]
        public Coordinates SW { get; private set; }

        private Coordinates m_Center;
        public Coordinates Center 
        {
            get 
            {
                if (m_Center == null)
                {
                    m_Center = computeCenter(NE, SW);
                }
                return m_Center; 
            }
            private set { m_Center = value; }
        }

        public override string ToString()
        {
            return string.Format("{1} to {0}", NE, SW);
        }

        public static bool operator ==(CoordinateBounds cb1, CoordinateBounds cb2)
        {
            if ((object)cb1 == null || (object)cb2 == null)
            {
                return (object)cb1 == null && (object)cb2 == null;
            }
            return cb1.NE == cb2.NE
                && cb1.SW == cb2.SW;
        }

        public static bool operator !=(CoordinateBounds cb1, CoordinateBounds cb2)
        {
            return !(cb1 == cb2);
        }

        public override bool Equals(object obj)
        {
            CoordinateBounds cb = obj as CoordinateBounds;
            return cb != null && cb == this;
        }

        public override int GetHashCode()
        {
            return NE.GetHashCode() ^ SW.GetHashCode();
        }

        private static Coordinates computeCenter(Coordinates ne, Coordinates sw)
        {
            if (!ne.IsSpecified && !sw.IsSpecified)
            {
                return Coordinates.Null();
            }
            return Coordinates.Create(
                (ne.Latitude.TotalDegrees - sw.Latitude.TotalDegrees) / 2f + sw.Latitude.TotalDegrees,
                (ne.Longitude.TotalDegrees - sw.Longitude.TotalDegrees) / 2f + sw.Longitude.TotalDegrees);
        }

        public static CoordinateBounds Create(Coordinates ne, Coordinates sw)
        {
            CoordinateBounds cb = new CoordinateBounds();
            cb.NE = ne;
            cb.SW = sw;
            cb.Center = computeCenter(ne, sw);
            return cb;
        }

        public static CoordinateBounds Create(IEnumerable<Coordinates> coordsEnumeration)
        {
            float maxLatitude = float.MinValue, maxLongitude = float.MinValue, minLatitude = float.MaxValue, minLongitude = float.MaxValue;
            foreach (Coordinates coords in coordsEnumeration)
            {
                if (coords.IsSpecified)
                {
                    maxLatitude = Math.Max(maxLatitude, coords.Latitude.TotalDegrees);
                    maxLongitude = Math.Max(maxLongitude, coords.Longitude.TotalDegrees);
                    minLatitude = Math.Min(minLatitude, coords.Latitude.TotalDegrees);
                    minLongitude = Math.Min(minLongitude, coords.Longitude.TotalDegrees);
                }
            }
            Coordinates ne = maxLatitude == float.MinValue && maxLongitude == float.MinValue ? 
                Coordinates.Null() : Coordinates.Create(maxLatitude, maxLongitude);
            Coordinates sw = minLatitude == float.MaxValue && minLongitude == float.MaxValue ?
                Coordinates.Null() : Coordinates.Create(minLatitude, minLongitude);
            return Create(ne, sw);
        }

        public static CoordinateBounds Null()
        {
            CoordinateBounds cb = new CoordinateBounds();
            cb.NE = Coordinates.Null();
            cb.SW = Coordinates.Null();
            cb.Center = Coordinates.Null();
            return cb;
        }

        public bool IsSpecified
        {
            get { return NE.IsSpecified && SW.IsSpecified; }
        }
    }
}
