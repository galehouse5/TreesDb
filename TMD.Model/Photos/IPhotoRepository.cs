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
        void Save(Photo photo);
        void Remove(Photo photo);
        PhotoReferenceBase FindReferenceById(int id);
        Photo FindById(int id);
        PhotoStoreBase FindPermanentPhotoStore();
    }
}
