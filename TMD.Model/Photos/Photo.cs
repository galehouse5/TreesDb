using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.IO;

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
        { }

        public virtual PhotoStoreBase Store { get; private set; }
        public virtual PhotoLinkBase Link { get; set; }
        public virtual Size Size { get; private set; }
        public virtual int Bytes { get; private set; }
        public virtual PhotoFormat Format { get; private set; }

        public virtual Bitmap Get()
        {
            return Store.Retrieve(this);
        }

        public virtual Bitmap Get(EPhotoSize size)
        {
            return new PhotoSizeFactory()
                .Create(size)
                .Normalize(Get());
        }

        public virtual void MigrateStoreTo(PhotoStoreBase store)
        {
            if (this.Store != store)
            {
                this.Store.MigrateTo(store, this);
                this.Store = store;
            }
        }

        public static Photo Create(Bitmap image)
        {
            var photo = new Photo { Store = Repositories.Photos.FindMemoryPhotoStore() };
            var info = photo.Store.Store(photo, image);
            photo.Size = info.Size;
            photo.Bytes = info.Bytes;
            photo.Format = info.Format;
            return photo;
        }
    }
}
