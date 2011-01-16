﻿using System;
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
        public void FindsPermanenetPhotoStore()
        {
            PhotoStoreBase store = Repositories.Photos.FindPermanentPhotoStore();
            Assert.IsNotNull(store);
        }

        [TestMethod]
        public void SavesAndFindsPhoto()
        {
            Photo photo = new PhotoFactory().Create("Original.jpg".GetPhoto());
            photo.AddReference(new PublicPhotoReference());
            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Photos.Save(photo);
                uow.Persist();
            }
            UnitOfWork.Dispose();
            using (var uow = UnitOfWork.Begin())
            {
                Photo found = Repositories.Photos.FindById(photo.Id);
                Assert.IsNotNull(found);
                Assert.IsTrue("Original.jpg".GetPhoto().CompareByContent(found.Get()));
                Repositories.Photos.Remove(found);
                uow.Persist();
            }
        }
    }
}
