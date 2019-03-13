using System.Collections.Generic;
using TMD.Model.Photos;
using TMD.Model.Users;

namespace TMD.Model.Imports
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
        public override bool IsAuthorizedToAdd(User user) => user.IsAuthorizedToEdit(Site.Trip);
        public override bool IsAuthorizedToView(User user) => user.IsAuthorizedToEdit(Site.Trip);
        public override bool IsAuthorizedToRemove(User user) => user.IsAuthorizedToEdit(Site.Trip);
        public override IList<Name> Photographers => Site.Trip.Measurers;
    }
}
