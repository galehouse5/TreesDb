using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace TMD.Model.Photos
{
    public class TemporaryPhoto : Photo
    {
        private byte[] bytes;

        private TemporaryPhoto()
        {
            bytes = new byte[0];
        }

        private TemporaryPhoto(Stream data)
        {
            bytes = new byte[data.Length];
            data.Read(bytes, 0, (int)data.Length);
        }

        public override Stream GetData()
        {
            return new MemoryStream(bytes);
        }

        public static Photo Create(Stream data)
        {
            try
            {
                using (var image = new Bitmap(data))
                {
                    return Create(image);
                }
            }
            catch (ArgumentException)
            {
                return (Photo)new TemporaryPhoto
                {
                    Size = Size.Empty,
                    Format = PhotoFormat.NotSpecified
                }.RecordCreation();
            }
        }

        public static Photo Create(Bitmap image)
        {
            if (null == image)
                throw new ArgumentNullException("image");

            ImageFormat format = image.RawFormat.Equals(ImageFormat.Jpeg) ? ImageFormat.Jpeg
                : image.RawFormat.Equals(ImageFormat.Gif) ? ImageFormat.Gif
                : ImageFormat.Png;

            using (Stream data = new MemoryStream())
            {
                image.Save(data, format);
                data.Position = 0;

                return (Photo)new TemporaryPhoto(data)
                {
                    Size = image.Size,
                    Bytes = (int)data.Length,
                    Format = format.Equals(ImageFormat.Jpeg) ? PhotoFormat.Jpeg
                        : format.Equals(ImageFormat.Gif) ? PhotoFormat.Gif
                        : PhotoFormat.Png
                }.RecordCreation();
            }
        }
    }
}
