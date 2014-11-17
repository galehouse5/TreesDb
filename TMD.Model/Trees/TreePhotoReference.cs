using System.Collections.Generic;
using System.Linq;
using TMD.Model.Photo;
using TMD.Model.Users;

namespace TMD.Model.Trees
{
    public class TreePhotoReference : PhotoReference
    {
        protected TreePhotoReference()
        { }

        protected internal TreePhotoReference(PhotoFile file, Tree tree)
        {
            this.File = file;
            this.Tree = tree;
        }

        public virtual Tree Tree { get; protected set; }

        public override string Caption
        {
            get { return string.Empty; }
        }

        public override IEnumerable<string> Photographers
        {
            get { return Tree.Measurers.Select(m => m.ToString()); }
        }

        public override bool CanView(User user)
        {
            return true;
        }
    }
}
