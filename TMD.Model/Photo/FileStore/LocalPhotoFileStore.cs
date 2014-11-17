using System.IO;
using System.Reflection;

namespace TMD.Model.Photo.FileStore
{
    public class LocalPhotoFileStore : IPhotoFileStore
    {
        private string rootPath;

        public LocalPhotoFileStore(string rootPath)
        {
            this.rootPath = rootPath;
        }

        public void Initialize()
        {
            if (!Directory.Exists(rootPath))
            {
                Directory.CreateDirectory(rootPath);
            }
        }

        protected string GetPath(int photoId)
        {
            return Path.Combine(rootPath, photoId.ToString());
        }

        public Stream ReadPhotoFile(int photoId)
        {
            if (!File.Exists(GetPath(photoId)))
                return Assembly.GetExecutingAssembly().GetManifestResourceStream("TMD.Model.Photo.FileStore.logo-sm.png");

            return new FileStream(GetPath(photoId), FileMode.OpenOrCreate, FileAccess.Read);
        }

        public Stream WritePhotoFile(int photoId)
        {
            return new FileStream(GetPath(photoId), FileMode.Create, FileAccess.Write);
        }

        public void DeletePhotoFile(int photoId)
        {
            if (File.Exists(GetPath(photoId)))
            {
                File.Delete(GetPath(photoId));
            }
        }
    }
}
