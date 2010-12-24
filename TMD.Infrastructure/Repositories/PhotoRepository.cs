using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Photos;
using TMD.Model.Trips;
using NHibernate;
using NHibernate.Type;
using NHibernate.Event;
using NHibernate.Criterion;

namespace TMD.Infrastructure.Repositories
{
    public class PhotoRepository : IPhotoRepository
    {
        internal static void Configure(NHibernate.Cfg.Configuration config)
        {
            config.SetListener(ListenerType.PostInsert, new PhotoPostInsertEventListener());
            config.SetListener(ListenerType.PostDelete, new PhotoPostDeleteEventListener());
        }

        private class PhotoPostInsertEventListener : IPostInsertEventListener
        {
            public void OnPostInsert(PostInsertEvent @event)
            {
                var photo = @event.Entity as Photo;
                if (photo != null)
                {
                    if (!photo.IsStoredPermanently)
                    {
                        photo.TemporaryStore.MigrateTo(photo.PermanentStore, photo);
                    }
                }
            }
        }

        private class PhotoPostDeleteEventListener : IPostDeleteEventListener
        {
            public void OnPostDelete(PostDeleteEvent @event)
            {
                var photo = @event.Entity as Photo;
                if (photo != null)
                {
                    photo.PermanentStore.Remove(photo);
                }
            }
        }

        public void Save(Photo photo)
        {
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

        public PhotoStoreBase FindPermanentPhotoStore()
        {
            return Registry.Session.CreateCriteria<PhotoStoreBase>()
                .Add(Restrictions.Eq("IsActive", true))
                .UniqueResult<PhotoStoreBase>();
        }

        public void Remove(Photo photo)
        {
            Registry.Session.Delete(photo);
        }
    }
}
