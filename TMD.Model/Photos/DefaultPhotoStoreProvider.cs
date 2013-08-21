using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;

namespace TMD.Model.Photos
{
    public class DefaultPhotoStoreProvider : IPhotoStoreProvider
    {
        private string rootPath;

        public DefaultPhotoStoreProvider(string rootPath)
        {
            this.rootPath = rootPath;
        }

        private string getPath(Photo photo)
        {
            return Path.Combine(rootPath, photo.Id.ToString());
        }

        public void Initialize()
        {
            if (!Directory.Exists(rootPath))
            {
                Directory.CreateDirectory(rootPath);
            }
        }

        public bool Contains(Photo photo)
        {
            return true;
        }

        public Stream GetWriteStream(Photo photo)
        {
            return new FileStream(getPath(photo), FileMode.OpenOrCreate, FileAccess.Write);
        }

        public Stream GetReadStream(Photo photo)
        {
            FileInfo file = new FileInfo(getPath(photo));
            if (!file.Exists)
                return Assembly.GetExecutingAssembly().GetManifestResourceStream("TMD.Model.Photos.icon.png");

            return new FileStream(getPath(photo), FileMode.Open, FileAccess.Read);
        }

        public void Remove(Photo photo)
        {
            FileInfo file = new FileInfo(getPath(photo));
            if (!file.Exists) return;

            file.Delete();
        }

        public int RemoveOrphans(IEnumerable<IPhoto> allParantedPhotos)
        {
            throw new NotImplementedException();
        }
    }
}
