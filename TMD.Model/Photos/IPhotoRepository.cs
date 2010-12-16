using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.IO;
using TMD.Model.Trips;

namespace TMD.Model.Photos
{
    public interface IPhotoRepository
    {
        void Save(Photo photo);
        void Remove(Photo photo);
        Photo FindById(int id);
        IList<Photo> FindByTripId(int tripId);
        PhotoStoreBase FindActivePhotoStore();
        PhotoStoreBase FindMemoryPhotoStore();
    }
}
