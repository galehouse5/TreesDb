using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Imports;
using System.Drawing;
using System.IO;

namespace TMD.Model.Photos
{
    public class PhotoFactory
    {
        public Photo Create(Bitmap image)
        {
            var photo = (Photo)new Photo
            {
                PermanentStore = Repositories.Photos.FindPermanentPhotoStore(),
                References = new List<PhotoReferenceBase>()
            }.RecordCreation();
            var info = photo.TemporaryStore.Store(photo, image);
            photo.Size = info.Size;
            photo.Bytes = info.Bytes;
            photo.Format = info.Format;
            return photo;
        }

        public Photo Create(Stream imageData)
        {
            try
            {
                using (var image = new Bitmap(imageData))
                {
                    return Create(image);
                }
            }
            catch (ArgumentException)
            {
                return Create((Bitmap)null);
            }
        }
    }
}
