using System.Collections.Generic;
using System.Linq;
using TMD.Model.Photo;
using TMD.Model.Users;

namespace TMD.Model.Sites
{
    public class SubsiteVisitPhotoReference : PhotoReference
    {
        protected SubsiteVisitPhotoReference()
        { }

        protected internal SubsiteVisitPhotoReference(PhotoFile file, SubsiteVisit subsiteVisit)
        {
            this.File = file;
            this.SubsiteVisit = subsiteVisit;
        }

        public virtual SubsiteVisit SubsiteVisit { get; protected set; }

        public override string Caption
        {
            get { return string.Empty; }
        }

        public override IEnumerable<string> Photographers
        {
            get { return SubsiteVisit.Visitors.Select(v => v.ToString()); }
        }

        public override bool CanView(User user)
        {
            return true;
        }
    }
}
