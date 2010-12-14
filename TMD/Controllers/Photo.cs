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
        public ActionResult UploadForTrip(int id, HttpPostedFileBase data)
        {
            Trip trip = Repositories.Trips.FindById(id);
            using (Bitmap image = new Bitmap(data.InputStream))
            {
                var photo = new PhotoFactory().CreateForTrip(trip, image);
                if (!photo.IsAuthorizedToUpload(User)) { return new UnauthorizedResult(); }
                using (UnitOfWork.Begin()) { Repositories.Photos.Save(photo); UnitOfWork.Persist(); }
                return Json(new { id = photo.Id });
            }
        }
    }
}
