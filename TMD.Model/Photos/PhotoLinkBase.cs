using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;

namespace TMD.Model.Photos
{
    public abstract class PhotoLinkBase : IEntity
    {
        public virtual int Id { get; private set; }
        public virtual Photo Photo { get; protected internal set; }
        public virtual bool IsAuthorizedToView(Photo photo, User user) { return false; }
        public virtual bool IsAuthorizedToAdd(Photo photo, User user) { return false; }
        public virtual bool IsAuthorizedToRemove(Photo photo, User user) { return false; }
    }

    public class PublicPhotoLink : PhotoLinkBase
    {
        protected PublicPhotoLink()
        { }

        public override bool IsAuthorizedToView(Photo photo, User user) { return true; }
        public override bool IsAuthorizedToAdd(Photo photo, User user) { return false; }
        public override bool IsAuthorizedToRemove(Photo photo, User user) { return false; }

        internal static PublicPhotoLink Create()
        {
            return new PublicPhotoLink();
        }
    }

    public class ImportPhotoLink : PhotoLinkBase
    {
        protected ImportPhotoLink()
        { }

        public virtual Imports.Trip Trip { get; private set; }
        public override bool IsAuthorizedToView(Photo photo, User user) { return user.IsAuthorizedToEdit(Trip); }
        public override bool IsAuthorizedToAdd(Photo photo, User user) { return user.IsAuthorizedToEdit(Trip); }
        public override bool IsAuthorizedToRemove(Photo photo, User user) { return user.IsAuthorizedToEdit(Trip); }

        internal static ImportPhotoLink Create(Imports.Trip trip)
        {
            return new ImportPhotoLink
            {
                Trip = trip
            };
        }
    }

    public class SitePhotoLink : PhotoLinkBase
    {
        protected SitePhotoLink()
        { }

        public virtual Sites.Site Site { get; private set; }
        public override bool IsAuthorizedToView(Photo photo, User user) { return true; }
        public override bool IsAuthorizedToAdd(Photo photo, User user) { return false; }
        public override bool IsAuthorizedToRemove(Photo photo, User user) { return false; }

        internal static SitePhotoLink Create(Sites.Site site)
        {
            return new SitePhotoLink
            {
                Site = site
            };
        }
    }

    public class TreePhotoLink : PhotoLinkBase
    {
        protected TreePhotoLink()
        { }

        public virtual Trees.Tree Tree { get; private set; }
        public override bool IsAuthorizedToView(Photo photo, User user) { return true; }
        public override bool IsAuthorizedToAdd(Photo photo, User user) { return false; }
        public override bool IsAuthorizedToRemove(Photo photo, User user) { return false; }

        internal static TreePhotoLink Create(Trees.Tree tree)
        {
            return new TreePhotoLink
            {
                Tree = tree
            };
        }
    }
}
