using System.Collections.Generic;
using System.Linq;
using TMD.Model.Photo;
using TMD.Model.Users;

namespace TMD.Model.Sites
{
    public class SubsitePhotoReference : PhotoReference
    {
        protected SubsitePhotoReference()
        { }

        protected internal SubsitePhotoReference(PhotoFile file, Subsite subsite)
        {
            this.File = file;
            this.Subsite = subsite;
        }

        public virtual Subsite Subsite { get; protected set; }

        public override string Caption
        {
            get { return string.Empty; }
        }

        public override IEnumerable<string> Photographers
        {
            get { return Subsite.Visitors.Select(v => v.ToString()); }
        }

        public override bool CanView(User user)
        {
            return true;
        }
    }
}
