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

namespace TMD.Controllers
{
    public class PhotoController : ControllerBase
    {
        [HttpGet]
        public ActionResult Index(int id, string size = "Original")
        {
            Photo photo = Repositories.Photos.FindById(id);
            if (!photo.IsAuthorizedToView(User)) { return new UnauthorizedResult(); }
            using (Bitmap image = photo.Get(size.ParseEnum(EPhotoSize.Original)))
            {
                Stream s = new MemoryStream();
                image.Save(s, photo.ImageFormat);
                s.Position = 0;
                return File(s, photo.ContentType);
            }
        }
    }
}
