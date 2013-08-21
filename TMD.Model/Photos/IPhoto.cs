using System.Drawing;
using System.Drawing.Imaging;

namespace TMD.Model.Photos
{
    public enum PhotoFormat
    {
        NotSpecified = 0,
        Jpeg = 1,
        Gif = 2,
        Png = 3
    }

    public interface IPhoto
    {
        int Id { get; }
        int StaticId { get; }
        int CaptionId { get; }
        bool HasCaption { get; }
        Size Size { get; }
        int Bytes { get; }
        PhotoFormat Format { get; }
        string ContentType { get; }
        ImageFormat ImageFormat { get; }
        Bitmap Get();
        Bitmap Get(PhotoSize size);
        bool EqualsPhoto(IPhoto photo);
        Photo ToPhoto();
    }
}
