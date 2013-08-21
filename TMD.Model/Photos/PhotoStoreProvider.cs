using System;
using System.Collections.Generic;
using System.IO;

namespace TMD.Model.Photos
{
    public interface IPhotoStoreProvider
    {
        void Initialize();
        bool Contains(Photo photo);
        Stream GetWriteStream(Photo photo);
        Stream GetReadStream(Photo photo);
        void Remove(Photo photo);
        int RemoveOrphans(IEnumerable<IPhoto> allParantedPhotos);
    }

    public static class PhotoStoreProvider
    {
        private static IPhotoStoreProvider current = new DefaultPhotoStoreProvider("PhotoStore");

        public static IPhotoStoreProvider Current
        {
            get
            {
                current.Initialize();
                return current;
            }
            set
            {
                if (null == value) throw new ArgumentNullException("value");
                current = value;
            }
        }
    }
}
