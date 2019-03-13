using System.Collections.Generic;
using TMD.Model.Photos;
using TMD.Model.Users;

namespace TMD.Model.Sites
{
    public class SiteVisitPhotoReference : PhotoReferenceBase
    {
        protected SiteVisitPhotoReference() { }
        protected internal SiteVisitPhotoReference(Photo photo, SiteVisit siteVisit)
            : base(photo)
        {
            this.SiteVisit = siteVisit;
        }

        public virtual SiteVisit SiteVisit { get; protected set; }
        public override bool IsAuthorizedToView(User user) => true;
        public override IList<Name> Photographers => SiteVisit.ImportingTrip.Measurers;
    }
}
