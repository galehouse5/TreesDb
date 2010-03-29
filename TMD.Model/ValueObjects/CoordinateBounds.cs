using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public class CoordinateBounds : ICloneable, IIsValid, IIsNull
    {
        private CoordinateBounds() { }

        private CoordinateBounds(Coordinates ne, Coordinates sw)
        {
            this.NE = ne;
            this.SW = sw;
            this.Center = Coordinates.Create(
                (ne.Latitude.Degrees - sw.Latitude.Degrees) / 2f + sw.Latitude.Degrees,
                (ne.Longitude.Degrees - sw.Longitude.Degrees) / 2f + sw.Longitude.Degrees);
        }

        public Coordinates NE { get; private set; }
        public Coordinates SW { get; private set; }
        public Coordinates Center { get; private set; }

        public static bool operator ==(CoordinateBounds cb1, CoordinateBounds cb2)
        {
            return cb1.NE == cb2.NE
                && cb1.SW == cb2.SW;
        }

        public static bool operator !=(CoordinateBounds cb1, CoordinateBounds cb2)
        {
            return cb1.NE != cb2.NE
                || cb1.SW != cb2.SW;
        }

        public override bool Equals(object obj)
        {
            CoordinateBounds cb = obj as CoordinateBounds;
            return cb != null && cb == this;
        }

        public override int GetHashCode()
        {
            return NE.GetHashCode()
                ^ SW.GetHashCode();
        }

        public static CoordinateBounds Create(Coordinates ne, Coordinates sw)
        {
            return new CoordinateBounds(ne, sw);
        }

        public static CoordinateBounds Create(IEnumerable<Coordinates> coordsEnumeration)
        {
            float maxLatitude = float.MinValue, maxLongitude = float.MinValue, minLatitude = float.MaxValue, minLongitude = float.MaxValue;
            foreach (Coordinates coords in coordsEnumeration)
            {
                maxLatitude = Math.Max(maxLatitude, coords.Latitude.Degrees);
                maxLongitude = Math.Max(maxLongitude, coords.Longitude.Degrees);
                minLatitude = Math.Min(minLatitude, coords.Latitude.Degrees);
                minLongitude = Math.Min(minLongitude, coords.Longitude.Degrees);
            }
            return new CoordinateBounds(Coordinates.Create(maxLatitude, maxLongitude), Coordinates.Create(minLatitude, minLongitude));
        }

        #region ICloneable Members

        public object Clone()
        {
            return new CoordinateBounds((Coordinates)NE.Clone(), (Coordinates)SW.Clone());
        }

        #endregion

        #region IIsValid Members

        bool IIsValid.IsValid
        {
            get { return NE.IsValid && SW.IsValid; }
        }

        IList<string> IIsValid.GetValidationErrors()
        {
            List<string> errors = new List<string>();
            errors.AddRange(NE.GetValidationErrors());
            errors.AddRange(SW.GetValidationErrors());
            return errors;
        }

        #endregion

        #region IIsNull Members

        public bool IsNull
        {
            get { return NE.IsNull || SW.IsNull; }
        }

        #endregion
    }
}
