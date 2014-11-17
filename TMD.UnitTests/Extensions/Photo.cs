using System.IO;
using System.Reflection;

namespace TMD.UnitTests.Extensions
{
    public static class PhotoExtensions
    {
        public static Stream GetPhotoData(this string name)
        {
            return Assembly.GetExecutingAssembly().GetManifestResourceStream(string.Format("TMD.UnitTests.Photos.{0}", name));
        }
    }
}
