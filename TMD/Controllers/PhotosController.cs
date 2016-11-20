using AutoMapper;
using System.Drawing;
using System.IO;
using System.Web;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model;
using TMD.Models.Import;
using TMD.Model.Photos;
using TMD.Models;
using TMD.Model.Imports;

namespace TMD.Controllers
{
    public partial class PhotosController : ControllerBase
    {
        [OutputCache(CacheProfile = "Photos")]
        public virtual ActionResult Caption(int id)
        {
            PhotoReferenceBase reference = Repositories.Photos.FindReferenceById(id);
            if (!reference.IsAuthorizedToView(User)) { return new UnauthorizedResult(); }
            return PartialView("CaptionPartial", Mapper.Map<PhotoReferenceBase, PhotoCaptionModel>(reference));
        }

        [ActionName("View"), HttpGet, OutputCache(CacheProfile = "Photos")]
        public virtual ActionResult ViewPhoto(int id, PhotoSize size)
        {
            var photo = Repositories.Photos.FindById(id);
            if (!Repositories.Photos.ListAllReferencesByPhotoId(id).IsAuthorizedToView(User)) { return new UnauthorizedResult(); }
            using (Bitmap image = photo.Get(size))
            {
                Stream data = new MemoryStream();
                image.Save(data, photo.ImageFormat);
                data.Position = 0;
                return File(data, photo.ContentType);
            }
        }

        [HttpPost, UnitOfWork]
        public virtual ActionResult Remove(IUnitOfWork uow, int id)
        {
            var reference = Repositories.Photos.FindReferenceById(id);
            if (!reference.IsAuthorizedToRemove(User)) { return new UnauthorizedResult(); }
            Repositories.Photos.Remove(reference);
            uow.Persist();
            return PhotoRemoval(reference);
        }

        protected ActionResult PhotoRemoval(IPhoto photo)
        {
            return Json(new { Success = true });
        }

        public virtual ActionResult PhotoAdded(PhotoGalleryModel gallery)
        {
            return PartialView("EditPhotoGalleryPartial", gallery);
        }

        [HttpPost]
        public virtual ActionResult AddToImportTree(int id, int treeId, HttpPostedFileBase imageData)
        {
            using (var uow = UnitOfWork.Begin())
            {
                var trip = Repositories.Imports.FindById(id);
                var tree = trip.FindTreeById(treeId);
                using (imageData.InputStream)
                {
                    var photo = TemporaryPhoto.Create(imageData.InputStream);
                    tree.AddPhoto(photo);
                    this.ValidateMappedModel<TreeBase, PhotoGalleryModel>(tree);
                    if (ModelState.IsValid)
                    {
                        UnitOfWork.Flush();
                        if (!Repositories.Photos.ListAllReferencesByPhotoId(photo.StaticId).IsAuthorizedToAdd(User)) { return new UnauthorizedResult(); }
                        uow.Persist();
                    }
                    else { tree.RemovePhoto(photo); }
                    var photoGallery = Mapper.Map<TreeBase, ImportTreePhotoGalleryModel>(tree);
                    return PhotoAdded(photoGallery);
                }
            }
        }

        [HttpPost]
        public virtual ActionResult AddToImportSubsite(int id, int subsiteId, HttpPostedFileBase imageData)
        {
            using (var uow = UnitOfWork.Begin())
            {
                var trip = Repositories.Imports.FindById(id);
                var subsite = trip.FindSubsiteById(subsiteId);
                using (imageData.InputStream)
                {
                    var photo = TemporaryPhoto.Create(imageData.InputStream);
                    subsite.AddPhoto(photo);
                    this.ValidateMappedModel<Subsite, PhotoGalleryModel>(subsite);
                    if (ModelState.IsValid)
                    {
                        UnitOfWork.Flush();
                        if (!Repositories.Photos.ListAllReferencesByPhotoId(photo.StaticId).IsAuthorizedToAdd(User)) { return new UnauthorizedResult(); }
                        uow.Persist();
                    }
                    else { subsite.RemovePhoto(photo); }
                    var photoGallery = Mapper.Map<Subsite, ImportSubsitePhotoGalleryModel>(subsite);
                    return PhotoAdded(photoGallery);
                }
            }
        }
    }
}
