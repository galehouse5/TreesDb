using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model;
using TMD.Model.Photos;
using System.Drawing;
using TMD.UnitTests.Extensions;

namespace TMD.UnitTests.Infrastructure
{
    [TestClass]
    public class PhotosRepository
    {
        [TestMethod]
        public void FindsActivePhotoStore()
        {
            PhotoStoreBase store = Repositories.Photos.FindActivePhotoStore();
            Assert.IsNotNull(store);
        }

        [TestMethod]
        public void SavesAndFindsPhoto()
        {
            Photo photo = Photo.Create("Original.jpg".GetPhoto());
            using (UnitOfWork.Begin()) { Repositories.Photos.Save(photo); UnitOfWork.Persist(); }
            UnitOfWork.Initialize();
            Photo found = Repositories.Photos.FindById(photo.Id);
            Assert.IsNotNull(found);
            Assert.IsTrue("Original.jpg".GetPhoto().CompareByContent(found.Get()));
            using (UnitOfWork.Begin()) { Repositories.Photos.Remove(found); UnitOfWork.Persist(); }
        }
    }
}
