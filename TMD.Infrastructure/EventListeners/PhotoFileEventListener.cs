using NHibernate.Cfg;
using NHibernate.Event;
using TMD.Model.Photo;

namespace TMD.Infrastructure.EventListeners
{
    public class PhotoFileEventListener : IPostInsertEventListener, IPostDeleteEventListener
    {
        public void OnPostInsert(PostInsertEvent @event)
        {
            IPhotoFileInternals file = @event.Entity as IPhotoFileInternals;
            if (file != null && file.IsTransient)
            {
                file.SaveTransientImage();
            }
        }

        public void OnPostDelete(PostDeleteEvent @event)
        {
            IPhotoFileInternals file = @event.Entity as IPhotoFileInternals;
            if (file != null)
            {
                file.DeleteImage();
            }
        }

        public static void Configure(Configuration config)
        {
            PhotoFileEventListener listener = new PhotoFileEventListener();
            config.SetListener(ListenerType.PostInsert, listener);
            config.SetListener(ListenerType.PostDelete, listener);
        }
    }
}
