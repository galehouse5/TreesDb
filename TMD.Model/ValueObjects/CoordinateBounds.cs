using NHibernate.Validator.Constraints;
using System;
using System.Collections.Generic;
using TMD.Model.Extensions;

namespace TMD.Model
{
    public class CoordinateBounds : ISpecified
    {
        private float northLatitude = float.MinValue;
        private float eastLongitude = float.MinValue;
        private float southLatitude = float.MaxValue;
        private float westLongitude = float.MaxValue;
        private bool isComputationStale = true;
        private CoordinatesFormat lastExtensionCoordinatesFormat = CoordinatesFormat.Default;

        private CoordinateBounds() { }

        private Coordinates ne;
        [Valid]
        public Coordinates NE
        {
            get
            {
                recomputeIfNeeded();
                return ne;
            }
            private set
            {
                if (value.IsSpecified)
                {
                    northLatitude = value.Latitude.TotalDegrees;
                    eastLongitude = value.Longitude.TotalDegrees;
                    isComputationStale = true;
                }
            }
        }

        private Coordinates sw;
        [Valid]
        public Coordinates SW
        {
            get
            {
                recomputeIfNeeded();
                return sw;
            }
            private set
            {
                if (value.IsSpecified)
                {
                    southLatitude = value.Latitude.TotalDegrees;
                    westLongitude = value.Longitude.TotalDegrees;
                    isComputationStale = true;
                }
            }
        }

        private Coordinates center;
        public Coordinates Center
        {
            get
            {
                recomputeIfNeeded();
                return center;
            }
        }

        public CoordinateBounds Extend(Coordinates c)
        {
            if (c.IsValidAndSpecified())
            {
                lastExtensionCoordinatesFormat = c.InputFormat;
                northLatitude = Math.Max(c.Latitude.TotalDegrees, northLatitude);
                eastLongitude = Math.Max(c.Longitude.TotalDegrees, eastLongitude);
                southLatitude = Math.Min(c.Latitude.TotalDegrees, southLatitude);
                westLongitude = Math.Min(c.Longitude.TotalDegrees, westLongitude);
                isComputationStale = true;
            }
            return this;
        }

        public bool Contains(Coordinates c)
        {
            if (!c.IsSpecified)
                return false;

            return southLatitude <= c.Latitude.TotalDegrees && c.Latitude.TotalDegrees <= northLatitude
                && westLongitude <= c.Longitude.TotalDegrees && c.Longitude.TotalDegrees <= eastLongitude;
        }

        private void recomputeIfNeeded()
        {
            if (!isComputationStale)
                return;

            if (northLatitude != float.MinValue
                && eastLongitude != float.MinValue
                && southLatitude != float.MaxValue
                && westLongitude != float.MaxValue)
            {
                ne = Coordinates.Create(northLatitude, eastLongitude, lastExtensionCoordinatesFormat);
                sw = Coordinates.Create(southLatitude, westLongitude, lastExtensionCoordinatesFormat);
                center = Coordinates.Create(
                    (northLatitude + (northLatitude < southLatitude ? 360f : 0f) - southLatitude) / 2f + southLatitude,
                    (eastLongitude + (eastLongitude < westLongitude ? 360f : 0f) - westLongitude) / 2f + westLongitude,
                    lastExtensionCoordinatesFormat);
            }
            else
            {
                ne = Coordinates.Null();
                sw = Coordinates.Null();
                center = Coordinates.Null();
            }

            isComputationStale = false;
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
            return cb1.northLatitude == cb2.northLatitude
                && cb1.eastLongitude == cb2.eastLongitude
                && cb1.southLatitude == cb2.southLatitude
                && cb1.westLongitude == cb2.westLongitude;
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
            return new CoordinateBounds
            {
                NE = ne,
                SW = sw
            };
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
