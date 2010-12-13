using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trips;

namespace TMD.Model.Photos
{
    public abstract class PhotoLinkBase : IEntity
    {
        public virtual int Id { get; private set; }
    }

    public class TripPhotoLink : PhotoLinkBase
    {
        public virtual Trip Trip { get; private set; }

        internal static TripPhotoLink Create(Trip trip)
        {
            return new TripPhotoLink
            {
                Trip = trip
            };
        }
    }
}
