using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model;
using TMD.Model.Photos;
using TMD.UnitTests.Extensions;

namespace TMD.UnitTests.Infrastructure
{
    [TestClass]
    public class PhotosRepository
    {
        [TestMethod]
        public void SavesAndFindsPhoto()
        {
            IPhoto photo = new PublicPhotoReference(TemporaryPhoto.Create("Original.jpg".GetPhoto()));
            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Photos.Save(photo);
                uow.Persist();
            }
            UnitOfWork.Dispose();
            using (var uow = UnitOfWork.Begin())
            {
                IPhoto found = Repositories.Photos.FindById(photo.StaticId);
                Assert.IsNotNull(found);
                Assert.IsTrue("Original.jpg".GetPhoto().CompareByContent(found.Get()));
                Repositories.Photos.Remove(found);
                uow.Persist();
            }
        }
    }
}
