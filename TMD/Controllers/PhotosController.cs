using AutoMapper;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Web.Mvc;
using TMD.Model;
using TMD.Model.Photo;
using TMD.Models;

namespace TMD.Controllers
{
    public partial class PhotosController : ControllerBase
    {
        private IRepository<PhotoReference> repository;

        public PhotosController(IRepository<PhotoReference> repository)
        {
            this.repository = repository;
        }

        [OutputCache(CacheProfile = "Photos")]
        public virtual ActionResult Caption(int id)
        {
            PhotoReference reference = repository.Get(id);
            if (!reference.CanView(User))
                return new UnauthorizedResult();

            return PartialView("CaptionPartial", Mapper.Map<PhotoReference, PhotoCaptionModel>(reference));
        }

        [HttpGet, OutputCache(CacheProfile = "Photos")]
        public virtual ActionResult View(int id, ImageSize size)
        {
            PhotoReference reference = repository.Get(id);

            if (!reference.CanView(User))
                return new UnauthorizedResult();

            using (Bitmap image = reference.GetImage(size))
            {
                Stream data = new MemoryStream();
                image.Save(data, ImageFormat.Jpeg);
                data.Position = 0;

                return File(data, "image/jpeg");
            }
        }
    }
}
