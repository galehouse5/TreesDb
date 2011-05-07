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
        PhotoStoreBase FindPermanentPhotoStore();
        PhotoReferenceBase FindReferenceById(int id);

        PhotoReferences ListAllReferencesByPhotoId(int photoId);
        IList<Photo> ListOrphaned();
        IList<Photo> ListAll();
        IList<IPhoto> ListRecentPublicPhotos(int number);
    }
}
