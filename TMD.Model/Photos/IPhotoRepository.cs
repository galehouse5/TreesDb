using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.IO;
using TMD.Model.Imports;

namespace TMD.Model.Photos
{
    public interface IPhotoRepository
    {
        void Save(IPhoto photo);
        void Remove(IPhoto photo);
        Photo FindById(int id);
        PhotoReferenceBase FindReferenceById(int id);
        PhotoReferences FindAllReferencesByPhotoId(int photoId);
        PhotoStoreBase FindPermanentPhotoStore();
        IList<Photo> FindOrphaned();
        IList<Photo> FindAll();

        IList<Photo> FindRecentPublicPhotos(int number);
    }
}
