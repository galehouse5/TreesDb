using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model.Photos;
using System.Drawing;
using System.Runtime.InteropServices;
using System.Drawing.Imaging;
using TMD.UnitTests.Extensions;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Photos
    {
        private class StubPhoto : Photo
        {
            public override int Id { get { return 0; } }
        }

        private class MockMemoryPhotoStore : MemoryPhotoStore { }

        private class MockDiskPhotoStore : DiskPhotoStore
        {
            public override string RootPath { get { return @"\"; } }
        }

        [TestMethod]
        public void MigratesFromMemoryToDisk()
        {
            var photo = new StubPhoto();
            var memory = new MockMemoryPhotoStore();
            var disk = new MockDiskPhotoStore();
            memory.Store(photo, "Medium.jpg".GetPhoto());
            memory.MigrateTo(disk, photo);
            disk.Remove(photo);
        }

        private void StoresAndRetrieves(PhotoStoreBase store, Photo photo)
        {
            store.Store(photo, "Medium.jpg".GetPhoto());
            using (Bitmap image = store.Retrieve(photo))
            {
                Assert.IsTrue("Medium.jpg".GetPhoto().CompareByContent(image));
            }
            store.Store(photo, "Small.jpg".GetPhoto());
            using (Bitmap image = store.Retrieve(photo))
            {
                Assert.IsTrue("Small.jpg".GetPhoto().CompareByContent(image));
            }
            store.Remove(photo);
        }

        [TestMethod]
        public void StoresAndRetrievesFromMemory()
        {
            var photo = new StubPhoto();
            var store = new MockMemoryPhotoStore();
            StoresAndRetrieves(store, photo);
        }

        [TestMethod]
        public void StoresAndRetrievesFromDisk()
        {
            var photo = new StubPhoto();
            var store = new MockDiskPhotoStore();
            StoresAndRetrieves(store, photo);
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
