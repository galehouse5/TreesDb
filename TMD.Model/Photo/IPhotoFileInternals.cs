using System.Drawing;

namespace TMD.Model.Photo
{
    public interface IPhotoFileInternals
    {
        bool IsTransient { get; }

        void SaveTransientImage();
        void DeleteImage();
    }
}
