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
        public PhotoSizeBase Create(EPhotoSize photoSize)
        {
            switch (photoSize)
            {
                case EPhotoSize.Original: return new OriginalPhotoSize();
                case EPhotoSize.Medium: return new MediumPhotoSize();
                case EPhotoSize.Small: return new SmallPhotoSize();
                case EPhotoSize.Thumbnail: return new ThumbnailPhotoSize();
                case EPhotoSize.SquareThumbnail: return new SquareThumbnailPhotoSize();
                case EPhotoSize.Square: return new SquarePhotoSize();
                case EPhotoSize.MiniSquare: return new MiniSquarePhotoSize();
                case EPhotoSize.MapSquare: return new MapSquarePhotoSize();
                case EPhotoSize.MiniMapSquare: return new MiniMapSquarePhotoSize();
                default: throw new NotImplementedException();
            }
        }
    }

    public class OriginalPhotoSize : PhotoSizeBase
    {
        internal OriginalPhotoSize() { }
        public override EPhotoSize Size { get { return EPhotoSize.Original; } }
        public override bool Square { get { return false; } }
        public override int MaxWidthOrHeight { get { return int.MaxValue; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
        public override Bitmap Normalize(Bitmap photo) { return new Bitmap(photo); }
    }

    public class MediumPhotoSize : PhotoSizeBase
    {
        internal MediumPhotoSize() { }
        public override EPhotoSize Size { get { return EPhotoSize.Medium; } }
        public override bool Square { get { return false; } }
        public override int MaxWidthOrHeight { get { return 500; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class SmallPhotoSize : PhotoSizeBase
    {
        internal SmallPhotoSize() { }
        public override EPhotoSize Size { get { return EPhotoSize.Small; } }
        public override bool Square { get { return false; } }
        public override int MaxWidthOrHeight { get { return 240; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class ThumbnailPhotoSize : PhotoSizeBase
    {
        internal ThumbnailPhotoSize() { }
        public override EPhotoSize Size { get { return EPhotoSize.Thumbnail; } }
        public override bool Square { get { return false; } }
        public override int MaxWidthOrHeight { get { return 100; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class SquareThumbnailPhotoSize : PhotoSizeBase
    {
        internal SquareThumbnailPhotoSize() { }
        public override EPhotoSize Size { get { return EPhotoSize.SquareThumbnail; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 100; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class SquarePhotoSize : PhotoSizeBase
    {
        internal SquarePhotoSize() { }
        public override EPhotoSize Size { get { return EPhotoSize.Square; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 60; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class MiniSquarePhotoSize : PhotoSizeBase
    {
        internal MiniSquarePhotoSize() { }
        public override EPhotoSize Size { get { return EPhotoSize.MiniSquare; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 32; } }
        public override int BorderWidth { get { return 0; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class MapSquarePhotoSize : PhotoSizeBase
    {
        internal MapSquarePhotoSize() { }
        public override EPhotoSize Size { get { return EPhotoSize.MapSquare; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 50; } }
        public override int BorderWidth { get { return 2; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public class MiniMapSquarePhotoSize : PhotoSizeBase
    {
        internal MiniMapSquarePhotoSize() { }
        public override EPhotoSize Size { get { return EPhotoSize.MiniMapSquare; } }
        public override bool Square { get { return true; } }
        public override int MaxWidthOrHeight { get { return 10; } }
        public override int BorderWidth { get { return 1; } }
        public override Color BorderColor { get { return Color.White; } }
    }

    public enum EPhotoSize
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

    public abstract class PhotoSizeBase
    {
        public abstract EPhotoSize Size { get; }
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
