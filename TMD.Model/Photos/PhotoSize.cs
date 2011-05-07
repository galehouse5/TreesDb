using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.Drawing.Drawing2D;

namespace TMD.Model.Photos
{
    public class PhotoSizeFactory
    {
        public PhotoSizeBase Create(PhotoSize photoSize)
        {
            switch (photoSize)
            {
                case PhotoSize.Original: return new OriginalPhotoSize();
                case PhotoSize.Large: return new LargePhotoSize();
                case PhotoSize.Medium: return new MediumPhotoSize();
                case PhotoSize.Small: return new SmallPhotoSize();
                case PhotoSize.Thumbnail: return new ThumbnailPhotoSize();
                case PhotoSize.SquareThumbnail: return new SquareThumbnailPhotoSize();
                case PhotoSize.Square: return new SquarePhotoSize();
                case PhotoSize.MiniSquare: return new MiniSquarePhotoSize();
                case PhotoSize.MapSquare: return new MapSquarePhotoSize();
                case PhotoSize.MiniMapSquare: return new MiniMapSquarePhotoSize();
                case PhotoSize.SmallMapSquare: return new SmallMapSquarePhotoSize();
                default: throw new NotImplementedException();
            }
        }
    }

    public class OriginalPhotoSize : PhotoSizeBase
    {
        internal OriginalPhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.Original; } }
        public override bool Square { get { return false; } }
        public override int MaxWidthOrHeight { get { return int.MaxValue; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
        public override Bitmap Normalize(Bitmap photo) { return new Bitmap(photo); }
    }

    public class LargePhotoSize : PhotoSizeBase
    {
        internal LargePhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.Large; } }
        public override bool Square { get { return false; } }
        public override int MaxWidthOrHeight { get { return 800; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class MediumPhotoSize : PhotoSizeBase
    {
        internal MediumPhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.Medium; } }
        public override bool Square { get { return false; } }
        public override int MaxWidthOrHeight { get { return 500; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class SmallPhotoSize : PhotoSizeBase
    {
        internal SmallPhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.Small; } }
        public override bool Square { get { return false; } }
        public override int MaxWidthOrHeight { get { return 240; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class ThumbnailPhotoSize : PhotoSizeBase
    {
        internal ThumbnailPhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.Thumbnail; } }
        public override bool Square { get { return false; } }
        public override int MaxWidthOrHeight { get { return 100; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class SquareThumbnailPhotoSize : PhotoSizeBase
    {
        internal SquareThumbnailPhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.SquareThumbnail; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 100; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class SquarePhotoSize : PhotoSizeBase
    {
        internal SquarePhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.Square; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 60; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class MiniSquarePhotoSize : PhotoSizeBase
    {
        internal MiniSquarePhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.MiniSquare; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 32; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class MapSquarePhotoSize : PhotoSizeBase
    {
        internal MapSquarePhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.MapSquare; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 60; } }
        public override int BorderWidth { get { return 3; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class SmallMapSquarePhotoSize : PhotoSizeBase
    {
        internal SmallMapSquarePhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.MapSquare; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 30; } }
        public override int BorderWidth { get { return 2; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class MiniMapSquarePhotoSize : PhotoSizeBase
    {
        internal MiniMapSquarePhotoSize() { }
        public override PhotoSize Size { get { return PhotoSize.MiniMapSquare; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 15; } }
        public override int BorderWidth { get { return 1; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public enum PhotoSize
    {
        Original,
        Large, Medium, Small, 
        Thumbnail, SquareThumbnail, 
        Square, MiniSquare,
        MapSquare, SmallMapSquare, MiniMapSquare
    }

    public abstract class PhotoSizeBase
    {
        public abstract PhotoSize Size { get; }
        public abstract bool Square { get; }
        public abstract int MaxWidthOrHeight { get; }
        public abstract int BorderWidth { get; }
        public abstract Color BorderColor { get; }

        public virtual Bitmap Normalize(Bitmap photo)
        {
            if (Square)
            {
                float adjustedMaxWidthOrHeight = MaxWidthOrHeight - (2 * BorderWidth);
                float sizeRatio = Math.Max(
                    adjustedMaxWidthOrHeight / (float)photo.Width,
                    adjustedMaxWidthOrHeight / (float)photo.Height);
                Bitmap normalizedPhoto = new Bitmap(
                    MaxWidthOrHeight,
                    MaxWidthOrHeight);
                SizeF newSize = new SizeF(
                    sizeRatio * photo.Width,
                    sizeRatio * photo.Height);
                PointF newOrigin = new PointF(
                    -(((float)newSize.Width - (float)MaxWidthOrHeight) / 2),
                    -(((float)newSize.Height - (float)MaxWidthOrHeight) / 2));
                using (Graphics g = Graphics.FromImage(normalizedPhoto))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;
                    g.DrawImage(photo, new RectangleF(newOrigin, newSize));
                    if (BorderWidth > 0)
                    {
                        SizeF borderSize = new SizeF(
                            normalizedPhoto.Width - BorderWidth,
                            normalizedPhoto.Height - BorderWidth);
                        PointF borderOrigin = new PointF(
                            BorderWidth / 2f,
                            BorderWidth / 2f);
                        g.DrawRectangle(new Pen(BorderColor, BorderWidth),
                            borderOrigin.X, borderOrigin.Y,
                            borderSize.Width, borderSize.Height);
                    }
                }
                return normalizedPhoto;
            }
            else
            {
                float adjustedMaxWidthOrHeight = MaxWidthOrHeight - BorderWidth;
                float sizeRatio = Math.Min(
                    adjustedMaxWidthOrHeight / (float)photo.Width,
                    adjustedMaxWidthOrHeight / (float)photo.Height);
                Bitmap normalizedPhoto = new Bitmap(
                    (int)Math.Round(sizeRatio * photo.Width) + BorderWidth,
                    (int)Math.Round(sizeRatio * photo.Height) + BorderWidth);
                using (Graphics g = Graphics.FromImage(normalizedPhoto))
                {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;
                    g.DrawImage(photo, BorderWidth, BorderWidth,
                        normalizedPhoto.Width - (2 * BorderWidth), normalizedPhoto.Height - (2 * BorderWidth));
                    if (BorderWidth > 0)
                    {
                        SizeF borderSize = new SizeF(
                            normalizedPhoto.Width - BorderWidth,
                            normalizedPhoto.Height - BorderWidth);
                        PointF borderOrigin = new PointF(
                            BorderWidth / 2f,
                            BorderWidth / 2f);
                        g.DrawRectangle(new Pen(BorderColor, BorderWidth),
                            borderOrigin.X, borderOrigin.Y,
                            borderSize.Width, borderSize.Height);
                    }
                }
                return normalizedPhoto;
            }
        }
    }
}
