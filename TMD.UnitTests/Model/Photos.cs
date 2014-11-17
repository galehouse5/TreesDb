using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Drawing;
using System.IO;
using TMD.Model.Photo;
using TMD.UnitTests.Extensions;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Photos
    {
        protected void Normalizes(ImageSize size)
        {
            using (Stream originalData = "Original.jpg".GetPhotoData())
            using (Bitmap originalImage = new Bitmap(originalData))
            using (Bitmap normalizedImage = size.Normalize(originalImage))
            using (Stream expectedData = string.Format("{0}.jpg", size).GetPhotoData())
            using (Bitmap expectedImage = new Bitmap(expectedData))
            {
                Assert.IsTrue(expectedImage.CompareByContent(normalizedImage));
            }
        }

        [TestMethod]
        public void NormalizesMediumSize()
        {
            Normalizes(ImageSize.Medium);
        }

        [TestMethod]
        public void NormalizesSmallSize()
        {
            Normalizes(ImageSize.Small);
        }

        [TestMethod]
        public void NormalizesThumbnailSize()
        {
            Normalizes(ImageSize.Thumbnail);
        }

        [TestMethod]
        public void NormalizesSquareSize()
        {
            Normalizes(ImageSize.Square);
        }

        [TestMethod]
        public void NormalizesMiniSquareSize()
        {
            Normalizes(ImageSize.MiniSquare);
        }

        [TestMethod]
        public void NormalizesMapSquareSize()
        {
            Normalizes(ImageSize.MapSquare);
        }

        [TestMethod]
        public void NormalizesMiniMapSquareSize()
        {
            Normalizes(ImageSize.MiniMapSquare);
        }
    }
}
