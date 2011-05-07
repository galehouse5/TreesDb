using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.IO;
using System.Reflection;

namespace TMD.UnitTests.Extensions
{
    public static class PhotoExtensions
    {
        public static Bitmap GetPhoto(this string name)
        {
            return new Bitmap(GetData(name));
        }

        public static Stream GetData(this string name)
        {
            return Assembly.GetExecutingAssembly().GetManifestResourceStream(string.Format("TMD.UnitTests.Photos.{0}", name));
        }
    }
}
