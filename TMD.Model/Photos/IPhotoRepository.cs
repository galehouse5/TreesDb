using System.Collections.Generic;

namespace TMD.Model.Photos
{
    public interface IPhotoRepository
    {
        void Save(IPhoto photo);
        void Remove(IPhoto photo);

        Photo FindById(int id);
        PhotoReferenceBase FindReferenceById(int id);

        PhotoReferences ListAllReferencesByPhotoId(int photoId);
        IList<Photo> ListOrphaned();
        IList<Photo> ListAll();
        IList<IPhoto> ListRecentPublicPhotos(int number);
    }
}
