using NHibernate.Validator.Constraints;
using System;

namespace TMD.Model
{
    public enum CoordinatesFormat
    {
        Invalid = 0,
        Unspecified = 1,
        Default = 2,
        DegreesMinutesDecimalSeconds = 3,
        DegreesDecimalMinutes = 4,
        DecimalDegrees = 5
    }

    public class Coordinates : ISpecified, ICloneable
    {
        private Coordinates()
        { }

        [Valid] public Latitude Latitude { get; private set; }
        [Valid] public Longitude Longitude { get; private set; }
        public bool IsSpecified { get { return Latitude.IsSpecified || Longitude.IsSpecified; } }

        public CoordinatesFormat InputFormat
        {
            get 
            {
                if (Latitude.InputFormat == CoordinatesFormat.Invalid || Longitude.InputFormat == CoordinatesFormat.Invalid)
                {
                    return CoordinatesFormat.Invalid;
                }
                if (Latitude.InputFormat == CoordinatesFormat.Unspecified || Longitude.InputFormat == CoordinatesFormat.Unspecified)
                {
                    return CoordinatesFormat.Unspecified;
                }
                return Latitude.InputFormat; 
            }
        }

        public float CalculateDistanceInMinutesTo(Coordinates otherCoordinates)
        {
            float degrees = (float)Math.Sqrt(
                (Latitude.TotalDegrees - otherCoordinates.Latitude.TotalDegrees) * (Latitude.TotalDegrees - otherCoordinates.Latitude.TotalDegrees)
                + (Longitude.TotalDegrees - otherCoordinates.Longitude.TotalDegrees) * (Longitude.TotalDegrees - otherCoordinates.Longitude.TotalDegrees));
            return degrees * 60f;
        }

        public override string ToString()
        {
            if (IsSpecified)
            {
                if (InputFormat == CoordinatesFormat.Invalid)
                {
                    return string.Format("{0}{1}", Latitude, Longitude);
                }
                return string.Format("{0}, {1}", Latitude, Longitude);
            }
            return string.Empty;
        }

        public string ToString(CoordinatesFormat format)
        {
            if (IsSpecified)
            {
                if (InputFormat == CoordinatesFormat.Invalid)
                {
                    return string.Format("{0}{1}", Latitude.ToString(format), Longitude.ToString(format));
                }
                return string.Format("{0}, {1}", Latitude.ToString(format), Longitude.ToString(format));
            }
            return string.Empty;
        }

        public override bool Equals(object obj)
        {
            var other = obj as Coordinates;
            return other != null && this.Latitude.Equals(other.Latitude) && this.Longitude.Equals(other.Longitude);
        }

        public override int GetHashCode()
        {
            return Latitude.GetHashCode() ^ Longitude.GetHashCode();
        }

        public static Coordinates Create(Latitude latitude, Longitude longitude)
        {
            return new Coordinates()
            {
                Latitude = latitude,
                Longitude = longitude
            };
        }

        public static Coordinates Create(float latitude, float longitude)
        {
            return new Coordinates()
            {
                Latitude = Latitude.Create(latitude),
                Longitude = Longitude.Create(longitude)
            };
        }

        public static Coordinates Create(string latitude, string longitude)
        {
            return new Coordinates()
            {
                Latitude = Latitude.Create(latitude),
                Longitude = Longitude.Create(longitude)
            };
        }

        public static Coordinates Create(float latitude, float longitude, CoordinatesFormat format)
        {
            return new Coordinates()
            {
                Latitude = Latitude.Create(latitude, format),
                Longitude = Longitude.Create(longitude, format)
            };
        }

        public static Coordinates Create(string s)
        {
            if (string.IsNullOrWhiteSpace(s))
            {
                return Null();
            }
            string[] parts = s.Split(new char[] { ',' }, StringSplitOptions.RemoveEmptyEntries);
            Latitude latitude = Latitude.Create(parts[0]);
            Longitude longitude;
            if (parts.Length > 1)
            {
                longitude = Longitude.Create(parts[1]);
            }
            else
            {
                longitude = Longitude.Create(string.Empty);
            }
            return new Coordinates()
            {
                Latitude = latitude,
                Longitude = longitude
            };
        }
            
        public static Coordinates Null()
        {
            return new Coordinates()
            {
                Latitude = Latitude.Null(),
                Longitude = Longitude.Null()
            };
        }

        public object Clone()
        {
            return new Coordinates
            {
                Latitude = Latitude.Clone() as Latitude,
                Longitude = Longitude.Clone() as Longitude
            };
        }
    }
}
