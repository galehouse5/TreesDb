using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using TMD.Model.Validation;

namespace TMD.Model.Photos
{
    public class Photo : UserCreatedEntityBase, IPhoto
    {
        public const int MaxBytes = 5 * 1024 * 1024;

        protected internal Photo()
        { }

        public virtual int StaticId { get { return Id; } }
        public virtual Size Size { get; protected internal set; }
        public virtual int CaptionId { get { return 0; } }
        public virtual bool HasCaption { get { return false; } }

        [Within2(0, MaxBytes, Inclusive = true, Message = "Photo must not be too large.", Tags = ValidationTag.Required)]
        public virtual int Bytes { get; protected internal set; }

        [NotEquals(PhotoFormat.NotSpecified, Message = "Photo must be in a proper format.", Tags = ValidationTag.Required)]
        public virtual PhotoFormat Format { get; protected internal set; }

        public virtual string ContentType
        {
            get
            {
                switch (Format)
                {
                    case PhotoFormat.Jpeg: return "image/jpeg";
                    case PhotoFormat.Gif: return "image/gif";
                    case PhotoFormat.Png: return "image/png";
                    default: throw new NotImplementedException();
                }
            }
        }

        public virtual ImageFormat ImageFormat
        {
            get
            {
                switch (Format)
                {
                    case PhotoFormat.Jpeg: return ImageFormat.Jpeg;
                    case PhotoFormat.Gif: return ImageFormat.Gif;
                    case PhotoFormat.Png: return ImageFormat.Png;
                    default: throw new NotImplementedException();
                }
            }
        }

        public virtual Stream GetData()
        {
            return PhotoStoreProvider.Current.GetReadStream(this);
        }

        public virtual Bitmap Get()
        {
            using (Stream data = GetData())
            {
                return new Bitmap(data);
            }
        }

        public virtual Bitmap Get(PhotoSize size)
        {
            using (Bitmap image = Get())
            {
                return new PhotoSizeFactory()
                    .Create(size).Normalize(image);
            }
        }

        public virtual bool EqualsPhoto(IPhoto photo)
        {
            return base.Equals(photo);
        }

        public virtual Photo ToPhoto()
        {
            return this;
        }
    }
}
