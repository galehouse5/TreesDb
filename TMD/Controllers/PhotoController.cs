using System;
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
using TMD.Model.Validation;
using AutoMapper;
using TMD.Extensions;

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

        public ActionResult PhotoAdded(PhotoGalleryModel gallery)
        {
            return PartialView("EditPhotoGalleryPartial", gallery);
        }

        [HttpPost]
        public ActionResult AddToImportTree(int id, int treeId, HttpPostedFileBase imageData)
        {
            var trip = Repositories.Trips.FindById(id);
            var tree = trip.FindTreeMeasurementById(treeId);
            using (imageData.InputStream)
            {
                var photo = new PhotoFactory().Create(imageData.InputStream);
                tree.AddPhoto(photo);
                if (!photo.IsAuthorizedToAdd(User)) { return new UnauthorizedResult(); }
                this.ValidateMappedModel<TreeMeasurementBase, PhotoGalleryModel>(tree);
                if (ModelState.IsValid)
                {
                    using (UnitOfWork.BeginAndPersist()) { Repositories.Trips.Save(trip); }
                }
                else
                {
                    tree.RemovePhoto(photo);
                }
                var photoGallery = Mapper.Map<TreeMeasurementBase, PhotoGalleryModel>(tree);
                return PhotoAdded(photoGallery);
            }
        }

        [HttpPost]
        public ActionResult AddToImportSubsite(int id, int subsiteId, HttpPostedFileBase imageData)
        {
            var trip = Repositories.Trips.FindById(id);
            var subsite = trip.FindSubsiteVisitById(subsiteId);
            using (imageData.InputStream)
            {
                var photo = new PhotoFactory().Create(imageData.InputStream);
                subsite.AddPhoto(photo);
                if (!photo.IsAuthorizedToAdd(User)) { return new UnauthorizedResult(); }
                this.ValidateMappedModel<SubsiteVisit, PhotoGalleryModel>(subsite);
                if (ModelState.IsValid)
                {
                    using (UnitOfWork.BeginAndPersist()) { Repositories.Trips.Save(trip); }
                }
                else
                {
                    subsite.RemovePhoto(photo);
                }
                var photoGallery = Mapper.Map<SubsiteVisit, PhotoGalleryModel>(subsite);
                return PhotoAdded(photoGallery);
            }
        }
    }
}
