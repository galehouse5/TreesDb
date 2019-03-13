using System.Collections.Generic;
using TMD.Model.Photos;
using TMD.Model.Users;

namespace TMD.Model.Sites
{
    public class SitePhotoReference : PhotoReferenceBase
    {
        protected SitePhotoReference()
        { }

        protected internal SitePhotoReference(Photo photo, Site site)
            : base(photo)
        {
            this.Site = site;
        }

        public virtual Site Site { get; protected set; }
        public override bool IsAuthorizedToView(User user) => true;
        public override IList<Name> Photographers => Site.Visitors;
    }
}
