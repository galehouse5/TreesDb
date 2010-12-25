﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using System.Drawing;
using TMD.Model.Photos;
using TMD.Model;
using TMD.Model.Extensions;
using System.Drawing.Imaging;
using TMD.Model.Trips;
using TMD.Models;

namespace TMD.Controllers
{
    public class PhotoController : ControllerBase
    {
        [HttpGet]
        public ActionResult View(int id, string size = "Original")
        {
            Photo photo = Repositories.Photos.FindById(id);
            if (!photo.IsAuthorizedToView(User)) { return new UnauthorizedResult(); }
            using (Bitmap image = photo.Get(size.ParseEnum(EPhotoSize.Original)))
            {
                Stream data = new MemoryStream();
                image.Save(data, photo.ImageFormat);
                data.Position = 0;
                return File(data, photo.ContentType);
            }
        }

        [HttpPost]
        public ActionResult Remove(int id)
        {
            Photo photo = Repositories.Photos.FindById(id);
            if (!photo.IsAuthorizedToRemove(User)) { return new UnauthorizedResult(); }
            using (UnitOfWork.Begin()) { Repositories.Photos.Remove(photo); UnitOfWork.Persist(); };
            return PhotoRemoval(photo);
        }

        protected ActionResult PhotoRemoval(Photo photo)
        {
            return Json(new { Success = true });
        }

        [HttpPost]
        public ActionResult AddToTripTree(int id, int treeId, HttpPostedFileBase imageData)
        {


            throw new NotImplementedException();
        }
    }
}
