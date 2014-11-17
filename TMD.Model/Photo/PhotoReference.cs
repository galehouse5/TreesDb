using System.Collections.Generic;
using System.Drawing;
using TMD.Model.Users;

namespace TMD.Model.Photo
{
    public abstract class PhotoReference : IEntity
    {
        public int Id { get; private set; }
        public PhotoFile File { get; protected set; }
        public abstract string Caption { get; }
        public abstract IEnumerable<string> Photographers { get; }

        public string Filename
        {
            get { return File.Filename; }
        }

        public int Size
        {
            get { return File.Size; }
        }

        public abstract bool CanView(User user);

        public Bitmap GetImage()
        {
            return File.GetImage();
        }

        public Bitmap GetImage(ImageSize size)
        {
            return File.GetImage(size);
        }
    }
}
