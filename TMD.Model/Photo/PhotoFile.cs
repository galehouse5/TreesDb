using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;

namespace TMD.Model.Photo
{
    public enum PhotoFileFormat
    {
        Unknown = 0, Jpeg = 1, Gif = 2, Png = 3
    }

    public class PhotoFile : UserCreatedEntityBase<PhotoFile>, IPhotoFileInternals
    {
        private Bitmap transientImage;

        protected PhotoFile()
        { }

        public PhotoFile(string filename, Bitmap image, int size)
            : base(recordCreationNow: true)
        {
            this.Filename = filename;
            this.transientImage = image;
            this.Size = size;
            this.Height = image.Height;
            this.Width = image.Width;
            this.Format = image.RawFormat == ImageFormat.Jpeg ? PhotoFileFormat.Jpeg
                : image.RawFormat == ImageFormat.Gif ? PhotoFileFormat.Gif
                : image.RawFormat == ImageFormat.Png ? PhotoFileFormat.Png
                : PhotoFileFormat.Unknown;
        }

        public string Filename { get; protected set; }
        public int Size { get; protected set; }
        public int Width { get; protected set; }
        public int Height { get; protected set; }
        public PhotoFileFormat Format { get; protected set; }
        public Bitmap InternalTransientImage { get; protected set; }

        public Bitmap GetImage()
        {
            using (Stream data = PhotoFileStore.Current.ReadPhotoFile(Id))
            {
                return new Bitmap(data);
            }
        }

        public Bitmap GetImage(ImageSize size)
        {
            using (Bitmap image = GetImage())
            {
                return size.Normalize(image);
            }
        }

        bool IPhotoFileInternals.IsTransient
        {
            get { return transientImage != null; }
        }

        void IPhotoFileInternals.SaveTransientImage()
        {
            if (Id == 0) throw new InvalidOperationException();

            using (Stream data = PhotoFileStore.Current.WritePhotoFile(Id))
            {
                transientImage.Save(data, transientImage.RawFormat);
            }
        }

        void IPhotoFileInternals.DeleteImage()
        {
            PhotoFileStore.Current.DeletePhotoFile(Id);
        }
    }
}
