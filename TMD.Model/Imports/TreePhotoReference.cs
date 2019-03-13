using System.Collections.Generic;
using TMD.Model.Photos;
using TMD.Model.Users;

namespace TMD.Model.Imports
{
    public class TreePhotoReference : PhotoReferenceBase
    {
        protected TreePhotoReference() { }

        protected internal TreePhotoReference(Photo photo, TreeBase tree)
            : base(photo)
        {
            this.Tree = tree;
        }

        public virtual TreeBase Tree { get; protected set; }
        public override bool IsAuthorizedToAdd(User user) => user.IsAuthorizedToEdit(Tree.Site.Trip);
        public override bool IsAuthorizedToView(User user) => user.IsAuthorizedToEdit(Tree.Site.Trip);
        public override bool IsAuthorizedToRemove(User user) => user.IsAuthorizedToEdit(Tree.Site.Trip);
        public override IList<Name> Photographers => Tree.Site.Trip.Measurers;
    }
}
