using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Photos;
using TMD.Model.Imports;
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
            config.SetListener(ListenerType.PreDelete, new PhotoLinkPreDeleteEventListener());
        }

        private class PhotoLinkPreDeleteEventListener : IPreDeleteEventListener
        {
            public bool OnPreDelete(PreDeleteEvent @event)
            {
                var link = @event.Entity as PhotoLinkBase;
                if (link != null)
                {
                    var photo = link.Photo;
                    link.Photo.RemoveLink(link);
                    if (photo.Links.Count == 0)
                    {
                        Registry.Session.Delete(photo);
                    }
                }
                return false;
            }
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
