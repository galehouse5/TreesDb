using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;

namespace TMD.Model.Photos
{
    public class SizeNormalizer
    {
        internal SizeNormalizer()
        { }

        public bool IsSquare { get; internal set; }
        public int MaxWidthOrHeight { get; internal set; }
        public int BorderWidth { get; internal set; }
        public Color BorderColor { get; internal set; }

        //public Bitmap Normalize(Bitmap b)
        //{





        //}
    }
}
