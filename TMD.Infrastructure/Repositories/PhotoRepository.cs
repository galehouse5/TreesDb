﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Photos;
using TMD.Model.Imports;
using NHibernate;
using NHibernate.Type;
using NHibernate.Event;
using NHibernate.Criterion;
using TMD.Model.Extensions;
using System.Collections;

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
                    if (!photo.IsStoredPermanently)
                    {
                        photo.TemporaryStore.MigrateTo(photo.PermanentStore, photo);
                    }
                }
            }

            public void OnPostDelete(PostDeleteEvent @event)
            {
                var photo = @event.Entity as Photo;
                if (photo != null)
                {
                    photo.PermanentStore.Remove(photo);
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

        public PhotoStoreBase FindPermanentPhotoStore()
        {
            return Registry.Session.CreateCriteria<PhotoStoreBase>()
                .Add(Restrictions.Eq("IsActive", true))
                .UniqueResult<PhotoStoreBase>();
        }

        public IList<PhotoReferenceBase> FindReferencesById(int photoId)
        {
            return Registry.Session.CreateCriteria<PhotoReferenceBase>()
                .CreateAlias("Photo", "p")
                .Add(Restrictions.Eq("p.Id", photoId))
                .List<PhotoReferenceBase>();
        }


        public IList<Photo> FindOrphaned()
        {
            return Registry.Session.CreateCriteria<Photo>("photo")
                .Add(Subqueries.NotExists(
                    DetachedCriteria.For<PhotoReferenceBase>("reference")
                        .Add(Property.ForName("reference.PhotoId").EqProperty("photo.Id"))
                )).List<Photo>();
        }

        public IList<Photo> FindAll()
        {
            return Registry.Session.CreateCriteria<Photo>().List<Photo>();
        }
    }
}
