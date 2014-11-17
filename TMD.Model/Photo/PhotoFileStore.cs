using System;
using TMD.Model.Photo.FileStore;

namespace TMD.Model.Photo
{
    public static class PhotoFileStore
    {
        private static IPhotoFileStore current = new LocalPhotoFileStore("PhotoStore");

        public static IPhotoFileStore Current
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
