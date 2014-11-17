using System.Collections.Generic;
using System.Linq;
using TMD.Model.Photo;
using TMD.Model.Users;

namespace TMD.Model.Trees
{
    public class TreeMeasurementPhotoReference : PhotoReference
    {
        protected TreeMeasurementPhotoReference()
        { }

        protected internal TreeMeasurementPhotoReference(PhotoFile file, Measurement measurement)
        {
            this.File = file;
            this.Measurement = measurement;
        }

        public virtual Measurement Measurement { get; protected set; }

        public override string Caption
        {
            get { return string.Empty; }
        }

        public override IEnumerable<string> Photographers
        {
            get { return Measurement.Measurers.Select(m => m.ToString()); }
        }

        public override bool CanView(User user)
        {
            return true;
        }
    }
}
