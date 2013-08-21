using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.IO;
using TMD.Model.Photos;
using TMD.UnitTests.Extensions;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Photos
    {
        [TestMethod]
        public void Stores()
        {
            Photo photo = TemporaryPhoto.Create("Medium.jpg".GetPhoto());

            using (Stream sourceData = photo.GetData())
            using (Stream destinationData = PhotoStoreProvider.Current.GetWriteStream(photo))
            {
                sourceData.CopyTo(destinationData);
            }
        }

        [TestMethod]
        public void NormalizesOriginalSize()
        {
            PhotoSizeBase size = new PhotoSizeFactory().Create(PhotoSize.Original);
            Assert.IsTrue("Original.jpg".GetPhoto().CompareByContent(size.Normalize("Original.jpg".GetPhoto())));
        }

        [TestMethod]
        public void NormalizesMediumSize()
        {
            PhotoSizeBase size = new PhotoSizeFactory().Create(PhotoSize.Medium);
            Assert.IsTrue("Medium.jpg".GetPhoto().CompareByContent(size.Normalize("Original.jpg".GetPhoto())));
        }

        [TestMethod]
        public void NormalizesSmallSize()
        {
            PhotoSizeBase size = new PhotoSizeFactory().Create(PhotoSize.Small);
            Assert.IsTrue("Small.jpg".GetPhoto().CompareByContent(size.Normalize("Original.jpg".GetPhoto())));
        }

        [TestMethod]
        public void NormalizesThumbnailSize()
        {
            PhotoSizeBase size = new PhotoSizeFactory().Create(PhotoSize.Thumbnail);
            Assert.IsTrue("Thumbnail.jpg".GetPhoto().CompareByContent(size.Normalize("Original.jpg".GetPhoto())));
        }

        [TestMethod]
        public void NormalizesSquareSize()
        {
            PhotoSizeBase size = new PhotoSizeFactory().Create(PhotoSize.Square);
            Assert.IsTrue("Square.jpg".GetPhoto().CompareByContent(size.Normalize("Original.jpg".GetPhoto())));
        }

        [TestMethod]
        public void NormalizesMiniSquareSize()
        {
            PhotoSizeBase size = new PhotoSizeFactory().Create(PhotoSize.MiniSquare);
            Assert.IsTrue("MiniSquare.jpg".GetPhoto().CompareByContent(size.Normalize("Original.jpg".GetPhoto())));
        }

        [TestMethod]
        public void NormalizesMapSquareSize()
        {
            PhotoSizeBase size = new PhotoSizeFactory().Create(PhotoSize.MapSquare);
            Assert.IsTrue("MapSquare.jpg".GetPhoto().CompareByContent(size.Normalize("Original.jpg".GetPhoto())));
        }

        [TestMethod]
        public void NormalizesMiniMapSquareSize()
        {
            PhotoSizeBase size = new PhotoSizeFactory().Create(PhotoSize.MiniMapSquare);
            Assert.IsTrue("MiniMapSquare.jpg".GetPhoto().CompareByContent(size.Normalize("Original.jpg".GetPhoto())));
        }
    }
}
