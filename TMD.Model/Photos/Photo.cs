using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.IO;
using System.Drawing.Imaging;
using TMD.Model.Users;

namespace TMD.Model.Photos
{
    public enum PhotoFormat
    {
        NotSpecified = 0,
        Jpeg = 1,
        Gif = 2,
        Png = 3
    }

    public class Photo : UserCreatedEntityBase
    {
        protected Photo()
        {
            TemporaryStore = new MemoryPhotoStore();
        }

        public virtual PhotoStoreBase TemporaryStore { get; private set; }
        public virtual PhotoStoreBase PermanentStore { get; private set; }
        public virtual PhotoLinkBase Link { get; set; }
        public virtual Size Size { get; private set; }
        public virtual int Bytes { get; private set; }
        public virtual PhotoFormat Format { get; private set; }

        public virtual bool IsStoredPermanently
        {
            get { return PermanentStore.Contains(this); }
        }

        public virtual string ContentType
        {
            get
            {
                switch (Format)
                {
                    case PhotoFormat.Jpeg: return "image/jpeg";
                    case PhotoFormat.Gif: return "image/gif";
                    case PhotoFormat.Png: return "image/png";
                    default: throw new NotImplementedException();
                }
            }
        }

        public virtual ImageFormat ImageFormat
        {
            get
            {
                switch (Format)
                {
                    case PhotoFormat.Jpeg: return ImageFormat.Jpeg;
                    case PhotoFormat.Gif: return ImageFormat.Gif;
                    case PhotoFormat.Png: return ImageFormat.Png;
                    default: throw new NotImplementedException();
                }
            }
        }

        public virtual bool IsAuthorizedToView(User user)
        {
            return Link.IsAuthorizedToView(this, user);
        }

        public virtual bool IsAuthorizedToAdd(User user)
        {
            return Link.IsAuthorizedToAdd(this, user);
        }

        public virtual bool IsAuthorizedToRemove(User user)
        {
            return Link.IsAuthorizedToRemove(this, user);
        }

        public virtual Bitmap Get()
        {
            if (TemporaryStore.Contains(this))
            {
                return TemporaryStore.Retrieve(this);
            }
            if (PermanentStore.Contains(this))
            {
                return PermanentStore.Retrieve(this);
            }
            throw new InvalidEntityStateException(this);
        }

        public virtual Bitmap Get(EPhotoSize size)
        {
            using (Bitmap image = Get())
            {
                return new PhotoSizeFactory()
                    .Create(size).Normalize(image);
            }
        }

        internal static Photo Create(Bitmap image)
        {
            var photo = (Photo)new Photo 
            { 
                PermanentStore = Repositories.Photos.FindPermanentPhotoStore(),
                Link = PublicPhotoLink.Create()
            }.RecordCreation();
            var info = photo.TemporaryStore.Store(photo, image);
            photo.Size = info.Size;
            photo.Bytes = info.Bytes;
            photo.Format = info.Format;
            return photo;
        }
    }
}
