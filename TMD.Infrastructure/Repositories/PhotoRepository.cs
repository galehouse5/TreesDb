using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Photos;
using TMD.Model.Trips;

namespace TMD.Infrastructure.Repositories
{
    public class PhotoRepository : IPhotoRepository
    {
        public void Save(Photo photo)
        {
            Registry.Session.Save(photo);
            Registry.Session.Flush();
            PhotoStoreBase activeStore = FindActivePhotoStore();
            photo.MigrateStoreTo(activeStore);
            Registry.Session.Save(photo);
        }

        public Photo FindById(int id)
        {
            return Registry.Session.Get<Photo>(id);
        }

        public IList<Photo> FindByTripId(int tripId)
        {
            return Registry.Session.CreateQuery(@"
                from Photo p
                where p.Link.Trip.Id = :tripId")
                .SetParameter("tripId", tripId)
                .List<Photo>();
        }

        public PhotoStoreBase FindActivePhotoStore()
        {
            return Registry.Session
                .CreateQuery("from PhotoStoreBase where IsActive = :isActive")
                .SetParameter("isActive", true)
                .UniqueResult<PhotoStoreBase>();
        }

        public void Remove(Photo photo)
        {
            Registry.Session.Delete(photo);
            Registry.Session.Flush();
            photo.Store.Remove(photo);
        }

        public PhotoStoreBase FindMemoryPhotoStore()
        {
            return Registry.Session
                .CreateQuery("from MemoryPhotoStore")
                .UniqueResult<MemoryPhotoStore>();
        }
    }
}
