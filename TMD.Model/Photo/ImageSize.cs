using System;
using System.Drawing;
using System.Drawing.Drawing2D;

namespace TMD.Model.Photo
{
    public class ImageSize
    {
        public static readonly ImageSize Large = new ImageSize("Large", 800);
        public static readonly ImageSize Medium = new ImageSize("Medium", 500);
        public static readonly ImageSize Small = new ImageSize("Small", 240);
        public static readonly ImageSize Thumbnail = new ImageSize("Thumbnail", 100);
        public static readonly ImageSize SquareThumbnail = new ImageSize("SquareThumbnail", 100) { IsSquare = true };
        public static readonly ImageSize Square = new ImageSize("Square", 60) { IsSquare = true };
        public static readonly ImageSize MiniSquare = new ImageSize("MiniSquare", 32) { IsSquare = true };
        public static readonly ImageSize MapSquare = new ImageSize("MapSquare", 60) { IsSquare = true, BorderWidth = 3 };
        public static readonly ImageSize SmallMapSquare = new ImageSize("SmallMapSquare", 30) { IsSquare = true, BorderWidth = 2 };
        public static readonly ImageSize MiniMapSquare = new ImageSize("MiniMapSquare", 15) { IsSquare = true, BorderWidth = 1 };

        public static readonly ImageSize[] All = new ImageSize[]
        {
            Large, Medium, Small, Thumbnail, SquareThumbnail, Square, MiniSquare, MapSquare, SmallMapSquare, MiniMapSquare
        };

        private ImageSize(string name, int maxWidthOrHeight)
        {
            this.Name = name;
            this.MaxWidthOrHeight = maxWidthOrHeight;
            BorderColor = Color.White;
        }

        public string Name { get; private set; }
        public bool IsSquare { get; private set; }
        public int MaxWidthOrHeight { get; private set; }
        public int BorderWidth { get; private set; }
        public Color BorderColor { get; private set; }

        protected Bitmap Normalize(Bitmap image, Size normalizedSize, RectangleF imagePlacement)
        {
            Bitmap normalizedImage = new Bitmap(normalizedSize.Width, normalizedSize.Height);

            using (Graphics g = Graphics.FromImage(normalizedImage))
            {
                g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g.SmoothingMode = SmoothingMode.HighQuality;
                g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                g.CompositingQuality = CompositingQuality.HighQuality;

                g.DrawImage(image, imagePlacement);

                if (BorderWidth > 0)
                {
                    SizeF borderSize = new SizeF(
                        normalizedSize.Width - BorderWidth,
                        normalizedSize.Height - BorderWidth);
                    PointF borderOrigin = new PointF(
                        BorderWidth / 2f,
                        BorderWidth / 2f);
                    g.DrawRectangle(new Pen(BorderColor, BorderWidth),
                        borderOrigin.X, borderOrigin.Y,
                        borderSize.Width, borderSize.Height);
                }
            }

            return normalizedImage;
        }

        protected Bitmap SquareNormalize(Bitmap image)
        {
            float adjustedMaxWidthOrHeight = MaxWidthOrHeight - (2 * BorderWidth);
            float sizeRatio = Math.Max(
                adjustedMaxWidthOrHeight / (float)image.Width,
                adjustedMaxWidthOrHeight / (float)image.Height);
            SizeF imageSize = new SizeF(
                sizeRatio * image.Width,
                sizeRatio * image.Height);
            PointF imageLocation = new PointF(
                -(((float)imageSize.Width - (float)MaxWidthOrHeight) / 2),
                -(((float)imageSize.Height - (float)MaxWidthOrHeight) / 2));

            return Normalize(image,
                new Size(MaxWidthOrHeight, MaxWidthOrHeight),
                new RectangleF(imageLocation, imageSize));
        }

        protected Bitmap RectangularNormalize(Bitmap image)
        {
            float adjustedMaxWidthOrHeight = MaxWidthOrHeight - BorderWidth;
            float sizeRatio = Math.Min(
                adjustedMaxWidthOrHeight / (float)image.Width,
                adjustedMaxWidthOrHeight / (float)image.Height);
            Size normalizedSize = new Size(
                (int)Math.Round(sizeRatio * image.Width) + BorderWidth,
                (int)Math.Round(sizeRatio * image.Height) + BorderWidth);

            RectangleF imagePlacement = new RectangleF(BorderWidth, BorderWidth,
                normalizedSize.Width - (2 * BorderWidth), normalizedSize.Height - (2 * BorderWidth));

            return Normalize(image, normalizedSize, imagePlacement);
        }

        public Bitmap Normalize(Bitmap image)
        {
            return IsSquare ? SquareNormalize(image) : RectangularNormalize(image);
        }

        public override string ToString()
        {
            return Name;
        }
    }
}
