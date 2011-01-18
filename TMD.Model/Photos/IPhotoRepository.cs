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
        IPhoto FindById(int id);
        IList<PhotoReferenceBase> FindReferencesByPhoto(IPhoto photo);
        PhotoStoreBase FindPermanentPhotoStore();
    }
}
