using System;
using System.Linq;
using System.Web.Mvc;
using TMD.Model.Import;
using TMD.Model.Users;
using TMD.Models.Import;

namespace TMD.Controllers
{
    [AuthorizeUser(Roles = UserRoles.Import)]
    public class ImportController : ControllerBase
    {
        [HttpGet, Route("import")]
        public ActionResult Index()
        {
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
                    import.AddValidationErrors();
                    return File(import.Save(), model.Database.ContentType, model.Database.FileName);
                }

                throw new NotImplementedException();
            }
        }
    }
}