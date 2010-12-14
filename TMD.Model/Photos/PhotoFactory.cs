using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trips;
using System.Drawing;

namespace TMD.Model.Photos
{
    public class PhotoFactory
    {
        public Photo CreateForPublic(Bitmap image)
        {
            Photo p = Photo.Create(image);
            p.Link = PublicPhotoLink.Create();
            return p;
        }

        public Photo CreateForTrip(Trip trip, Bitmap image)
        {
            Photo p = Photo.Create(image);
            p.Link = TripPhotoLink.Create(trip);
            return p;
        }
    }
}
