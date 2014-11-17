using System.IO;

namespace TMD.Model.Photo.FileStore
{
    public interface IPhotoFileStore
    {
        void Initialize();
        Stream ReadPhotoFile(int photoId);
        Stream WritePhotoFile(int photoId);
        void DeletePhotoFile(int photoId);
    }
}
