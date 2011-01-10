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
using TMD.Model.Imports;
using TMD.Models;
using TMD.Model.Validation;
using AutoMapper;
using TMD.Extensions;

namespace TMD.Controllers
{
    public class PhotosController : ControllerBase
    {
        [HttpGet, OutputCache(CacheProfile = "Photos")]
        public ActionResult View(int id, string size)
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

        [HttpPost, UnitOfWork]
        public ActionResult Remove(IUnitOfWork uow, int id)
        {
            Photo photo = Repositories.Photos.FindById(id);
            if (!photo.IsAuthorizedToRemove(User)) { return new UnauthorizedResult(); }
            Repositories.Photos.Remove(photo);
            uow.Persist();
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
            using (var uow = UnitOfWork.Begin())
            {
                var trip = Repositories.Imports.FindById(id);
                var tree = trip.FindTreeById(treeId);
                using (imageData.InputStream)
                {
                    var photo = new PhotoFactory().Create(imageData.InputStream);
                    tree.AddPhoto(photo);
                    if (!photo.IsAuthorizedToAdd(User)) { return new UnauthorizedResult(); }
                    this.ValidateMappedModel<TreeBase, PhotoGalleryModel>(tree);
                    if (ModelState.IsValid)
                    {
                        Repositories.Imports.Save(trip);
                        uow.Persist();
                    }
                    else
                    {
                        tree.RemovePhoto(photo);
                    }
                    var photoGallery = Mapper.Map<TreeBase, PhotoGalleryModel>(tree);
                    return PhotoAdded(photoGallery);
                }
            }
        }

        [HttpPost]
        public ActionResult AddToImportSubsite(int id, int subsiteId, HttpPostedFileBase imageData)
        {
            using (var uow = UnitOfWork.Begin())
            {
                var trip = Repositories.Imports.FindById(id);
                var subsite = trip.FindSubsiteById(subsiteId);
                using (imageData.InputStream)
                {
                    var photo = new PhotoFactory().Create(imageData.InputStream);
                    subsite.AddPhoto(photo);
                    if (!photo.IsAuthorizedToAdd(User)) { return new UnauthorizedResult(); }
                    this.ValidateMappedModel<Subsite, PhotoGalleryModel>(subsite);
                    if (ModelState.IsValid)
                    {
                        Repositories.Imports.Save(trip);
                        uow.Persist();
                    }
                    else
                    {
                        subsite.RemovePhoto(photo);
                    }
                    var photoGallery = Mapper.Map<Subsite, PhotoGalleryModel>(subsite);
                    return PhotoAdded(photoGallery);
                }
            }
        }
    }
}
