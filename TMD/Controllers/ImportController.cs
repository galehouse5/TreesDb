using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Import;
using TMD.Model.Users;
using TMD.Models.Import;

namespace TMD.Controllers
{
    [AuthorizeUser(Roles = UserRoles.Import)]
    public class ImportController : ControllerBase
    {
        public void SetInvalidDataCookie(bool value)
        {
            Response.SetCookie(new HttpCookie("invalid-data", value.ToString()) { Path = Url.Action("Index") });
        }

        [HttpGet, Route("import")]
        public ActionResult Index()
        {
            SetInvalidDataCookie(false);
            return View();
        }

        [HttpPost, Route("import"), DefaultReturnUrl]
        public ActionResult Index(ImportModel model)
        {
            if (!ModelState.IsValid)
                return View();

            using (ExcelImport import = new ExcelImport(model.Database.InputStream))
            {
                if (import.GetValidationErrors().Any())
                {
                    SetInvalidDataCookie(true);
                    import.AddValidationErrors();
                    return File(import.Save(), model.Database.ContentType, model.Database.FileName);
                }

                throw new NotImplementedException();
            }
        }
    }
}