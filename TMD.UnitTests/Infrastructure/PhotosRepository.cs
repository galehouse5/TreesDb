using Microsoft.VisualStudio.TestTools.UnitTesting;
using StructureMap;
using System.Drawing;
using System.IO;
using TMD.Model;
using TMD.Model.Photo;
using TMD.UnitTests.Extensions;

namespace TMD.UnitTests.Infrastructure
{
    [TestClass]
    public class PhotosRepository
    {
        private PhotoRepository repository = ObjectFactory.GetInstance<PhotoRepository>();

        [TestMethod]
        public void SavesAndFindsPhoto()
        {
            using (Stream data = "Original.jpg".GetPhotoData())
            using (Bitmap image = new Bitmap(data))
            {
                PhotoFile file = new PhotoFile("Original.jpg", image, (int)data.Length);

                using (var uow = UnitOfWork.Begin())
                {
                    repository.Save(file);
                    uow.Persist();
                }

                UnitOfWork.Evict(file);

                using (var uow = UnitOfWork.Begin())
                {
                    PhotoFile persistedFile = repository.Get(file.Id);

                    Assert.IsNotNull(persistedFile);
                    Assert.AreEqual(file.Filename, persistedFile.Filename);
                    Assert.AreEqual(file.Format, persistedFile.Format);
                    Assert.AreEqual(file.Width, persistedFile.Width);
                    Assert.AreEqual(file.Height, persistedFile.Height);
                    Assert.AreEqual(file.Size, persistedFile.Size);

                    using (Bitmap persistedImage = persistedFile.GetImage())
                    {
                        Assert.IsTrue(persistedImage.CompareByContent(image));
                    }

                    repository.Delete(persistedFile);
                    uow.Persist();
                }
            }
        }
    }
}

