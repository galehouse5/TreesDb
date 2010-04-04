using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    [Serializable]
    public class CoordinateDistance
    {
        private CoordinateDistance(float degrees)
        {
            TotalDegrees = degrees;
        }

        public float TotalDegrees { get; private set; }
        
        public float TotalMinutes
        {
            get { return 60f * TotalDegrees; }
        }

        public float TotalSeconds
        {
            get { return 3600f * TotalDegrees; }
        }

        public static CoordinateDistance Calculate(Coordinates c1, Coordinates c2)
        {
            double a = c1.Latitude.TotalDegrees - c2.Latitude.TotalDegrees;
            double b = c1.Longitude.TotalDegrees - c2.Longitude.TotalDegrees;
            double d = Math.Sqrt(a * a + b * b);
            return new CoordinateDistance((float)d);
        }

        public static bool operator ==(CoordinateDistance cd1, CoordinateDistance cd2)
        {
            if ((object)cd1 == (object)null || (object)cd2 == (object)null)
            {
                return (object)cd1 == (object)null && (object)cd2 == (object)null;
            }
            return cd1.TotalDegrees == cd2.TotalDegrees;
        }

        public static bool operator !=(CoordinateDistance cd1, CoordinateDistance cd2)
        {
            if ((object)cd1 == (object)null || (object)cd2 == (object)null)
            {
                return !((object)cd1 == (object)null && (object)cd2 == (object)null);
            }
            return cd1.TotalDegrees != cd2.TotalDegrees;
        }

        public override bool Equals(object obj)
        {
            CoordinateDistance cd = obj as CoordinateDistance;
            return cd != null && cd.TotalDegrees == TotalDegrees;
        }

        public override int GetHashCode()
        {
            return TotalDegrees.GetHashCode();
        }
    }
}
