using AutoMapper;
using System.Drawing;
using System.IO;
using System.Web.Mvc;
using TMD.Model;
using TMD.Model.Photos;
using TMD.Models;

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
    }
}
