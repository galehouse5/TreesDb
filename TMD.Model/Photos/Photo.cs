using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.IO;

namespace TMD.Model.Photos
{
    public enum PhotoSize
    {
        Original,
        Medium,
        Small,
        Thumbnail,
        SquareThumbnail,
        Square,
        MiniSquare,
        MapSquare,
        MiniMapSquare
    }

    public class Photo : UserCreatedEntityBase
    {
        protected Photo() { }

        public Size Size { get; private set; }
        public int Bytes { get; private set; }

        //public Bitmap GetImage(PhotoSize size)
        //{



        //}

        //public Stream GetBytes()
        //{

        //}
    }
}
