using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trips;
using TMD.Model.Users;

namespace TMD.Model.Photos
{
    public abstract class PhotoLinkBase : IEntity
    {
        public virtual int Id { get; private set; }
        public virtual bool IsAuthorizedToView(User user) { return false; } 
    }

    public class PublicPhotoLink : PhotoLinkBase
    {
        protected PublicPhotoLink()
        { }

        public override bool IsAuthorizedToView(User user) { return true; } 

        internal static PublicPhotoLink Create()
        {
            return new PublicPhotoLink();
        }
    }

    public class TripPhotoLink : PhotoLinkBase
    {
        protected TripPhotoLink()
        { }

        public virtual Trip Trip { get; private set; }
        public override bool IsAuthorizedToView(User user) { return user.IsAuthorizedToEdit(Trip); }

        internal static TripPhotoLink Create(Trip trip)
        {
            return new TripPhotoLink
            {
                Trip = trip
            };
        }
    }
}
