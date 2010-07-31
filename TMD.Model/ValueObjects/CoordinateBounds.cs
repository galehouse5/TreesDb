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
        private float m_MaxLatitude = float.MinValue,
            m_MaxLongitude = float.MinValue, 
            m_MinLatitude = float.MaxValue,
            m_MinLongitude = float.MaxValue;
        private bool m_NeedsRecompute = true;
        private CoordinatesFormat m_LastExtensionCoordinatesFormat = CoordinatesFormat.Default;

        private CoordinateBounds() { }

        private Coordinates m_NE;
        [ObjectValidator]
        public Coordinates NE 
        {
            get 
            {
                recomputeIfNeeded();
                return m_NE;
            }
            private set
            {
                if (value.IsSpecified)
                {
                    m_MaxLatitude = value.Latitude.TotalDegrees;
                    m_MaxLongitude = value.Longitude.TotalDegrees;
                    m_NeedsRecompute = true;
                }
            }
        }

        private Coordinates m_SW;
        [ObjectValidator]
        public Coordinates SW 
        {
            get
            {
                recomputeIfNeeded();
                return m_SW;
            }
            private set
            {
                if (value.IsSpecified)
                {
                    m_MinLatitude = value.Latitude.TotalDegrees;
                    m_MinLongitude = value.Longitude.TotalDegrees;
                    m_NeedsRecompute = true;
                }
            }
        }

        private Coordinates m_Center;
        public Coordinates Center
        {
            get
            {
                recomputeIfNeeded();
                return m_Center;
            }
            private set { }
        }

        public CoordinateBounds Extend(Coordinates c)
        {
            if (c.IsSpecified)
            {
                m_LastExtensionCoordinatesFormat = c.InputFormat;
                m_MaxLatitude = Math.Max(c.Latitude.TotalDegrees, m_MaxLatitude);
                m_MaxLongitude = Math.Max(c.Longitude.TotalDegrees, m_MaxLongitude);
                m_MinLatitude = Math.Min(c.Latitude.TotalDegrees, m_MinLatitude);
                m_MinLongitude = Math.Min(c.Longitude.TotalDegrees, m_MinLongitude);
                m_NeedsRecompute = true;
            }
            return this;
        }

        public bool Contains(Coordinates c)
        {
            if (c.IsSpecified)
            {
                if (m_MinLatitude <= c.Latitude.TotalDegrees && c.Latitude.TotalDegrees <= m_MinLatitude)
                {
                    if (m_MinLongitude <= c.Longitude.TotalDegrees && c.Longitude.TotalDegrees <= m_MinLongitude)
                    {
                        return true;
                    }
                }
            }
            return false;
        }

        private void recomputeIfNeeded()
        {
            if (m_NeedsRecompute)
            {
                if (m_MaxLatitude != float.MinValue
                    && m_MaxLongitude != float.MinValue
                    && m_MinLatitude != float.MaxValue
                    && m_MinLongitude != float.MaxValue)
                {
                    m_NE = Coordinates.Create(m_MaxLatitude, m_MaxLongitude, m_LastExtensionCoordinatesFormat);
                    m_SW = Coordinates.Create(m_MinLatitude, m_MinLongitude, m_LastExtensionCoordinatesFormat);
                    m_Center = Coordinates.Create(
                        (m_MaxLatitude - m_MinLatitude) / 2f + m_MinLatitude,
                        (m_MaxLongitude - m_MinLongitude) / 2f + m_MinLongitude,
                        m_LastExtensionCoordinatesFormat);
                }
                else
                {
                    m_NE = Coordinates.Null();
                    m_SW = Coordinates.Null();
                    m_Center = Coordinates.Null();
                }
                m_NeedsRecompute = false;
            }
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
            return cb1.m_MaxLatitude == cb2.m_MaxLatitude
                && cb1.m_MaxLongitude == cb2.m_MaxLongitude
                && cb1.m_MinLatitude == cb2.m_MinLatitude
                && cb1.m_MinLongitude == cb2.m_MinLongitude;
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

        public static CoordinateBounds Create(Coordinates ne, Coordinates sw)
        {
            CoordinateBounds cb = new CoordinateBounds();
            cb.NE = ne;
            cb.SW = sw;
            return cb;
        }

        public static CoordinateBounds Create(IEnumerable<Coordinates> coordsEnumeration)
        {
            CoordinateBounds cb = new CoordinateBounds();
            foreach (Coordinates c in coordsEnumeration)
            {
                cb.Extend(c);
            }
            return cb;
        }

        public static CoordinateBounds Null()
        {
            return new CoordinateBounds();
        }

        public bool IsSpecified
        {
            get { return NE.IsSpecified && SW.IsSpecified; }
        }
    }
}
