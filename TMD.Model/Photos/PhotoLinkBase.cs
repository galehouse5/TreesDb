using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Imports;
using TMD.Model.Users;

namespace TMD.Model.Photos
{
    public abstract class PhotoLinkBase : IEntity
    {
        public virtual int Id { get; private set; }
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
        public override bool IsAuthorizedToRemove(Photo photo, User user) { return user == photo.Creator; }

        internal static PublicPhotoLink Create()
        {
            return new PublicPhotoLink();
        }
    }

    public class ImportPhotoLink : PhotoLinkBase
    {
        protected ImportPhotoLink()
        { }

        public virtual Trip Trip { get; private set; }
        public override bool IsAuthorizedToView(Photo photo, User user) { return user.IsAuthorizedToEdit(Trip); }
        public override bool IsAuthorizedToAdd(Photo photo, User user) { return user.IsAuthorizedToEdit(Trip); }
        public override bool IsAuthorizedToRemove(Photo photo, User user) { return user.IsAuthorizedToEdit(Trip); }

        internal static ImportPhotoLink Create(Trip trip)
        {
            return new ImportPhotoLink
            {
                Trip = trip
            };
        }
    }
}
