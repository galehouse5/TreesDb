using NHibernate.Criterion;
using NHibernate.Event;
using System.Collections.Generic;
using System.IO;
using TMD.Model.Photos;

namespace TMD.Infrastructure.Repositories
{
    public class PhotoRepository : Model.Photos.IPhotoRepository
    {
        internal static void Configure(NHibernate.Cfg.Configuration config)
        {
            config.SetListener(ListenerType.PostInsert, new PhotoEventListener());
            config.SetListener(ListenerType.PostDelete, new PhotoEventListener());
        }

        private class PhotoEventListener : IPostInsertEventListener, IPostDeleteEventListener
        {
            public void OnPostInsert(PostInsertEvent @event)
            {
                var photo = @event.Entity as Photo;
                if (photo != null)
                {
                    if (photo is TemporaryPhoto)
                    {
                        using (Stream sourceData = photo.GetData())
                        using (Stream destinationData = PhotoStoreProvider.Current.GetWriteStream(photo))
                        {
                            sourceData.CopyTo(destinationData);
                        }
                    }
                }
            }

            public void OnPostDelete(PostDeleteEvent @event)
            {
                var photo = @event.Entity as Photo;
                if (photo != null)
                {
                    PhotoStoreProvider.Current.Remove(photo);
                }
            }
        }

        public void Save(IPhoto photo)
        {
            Registry.Session.Save(photo);
        }

        public Photo FindById(int id)
        {
            return Registry.Session.Get<Photo>(id);
        }

        public PhotoReferenceBase FindReferenceById(int id)
        {
            return Registry.Session.Get<PhotoReferenceBase>(id);
        }

        public void Remove(IPhoto photo)
        {
            Registry.Session.Delete(photo);
        }

        public IList<Photo> ListOrphaned()
        {
            return Registry.Session.CreateCriteria<Photo>("photo")
                .Add(Subqueries.NotExists(
                    DetachedCriteria.For<PhotoReferenceBase>("reference")
                        .SetProjection(Projections.Id())
                        .Add(Property.ForName("reference.Photo.Id").EqProperty("photo.Id"))
                )).List<Photo>();
        }

        public IList<Photo> ListAll()
        {
            return Registry.Session.CreateCriteria<Photo>().List<Photo>();
        }

        public IList<IPhoto> ListRecentPublicPhotos(int number)
            => Registry.Session
            .CreateCriteria<PhotoReferenceBase>("reference")
            .CreateAlias("reference.Photo", "photo")
            .Add(Restrictions.Eq("class", typeof(Model.Sites.SiteVisitPhotoReference))
                | Restrictions.Eq("class", typeof(Model.Trees.TreeMeasurementPhotoReference)))
            .AddOrder(Order.Desc("photo.Created"))
            .SetMaxResults(number).List<IPhoto>();

        public PhotoReferences ListAllReferencesByPhotoId(int photoId)
        {
            var references = new PhotoReferences();
            references.AddRange(Registry.Session.CreateCriteria<PhotoReferenceBase>()
                .CreateAlias("Photo", "p")
                .Add(Restrictions.Eq("p.Id", photoId))
                .List<PhotoReferenceBase>());
            return references;
        }
    }
}
