using OfficeOpenXml;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.ExcelImport;
using TMD.Model.Users;
using TMD.Models.Import;

namespace TMD.Controllers
{
    [AuthorizeUser(Roles = UserRoles.Import)]
    public class ImportController : ControllerBase
    {
        private ExcelImportRepository repository;

        public ImportController(ExcelImportRepository repository)
        {
            this.repository = repository;
        }

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
            if (!ModelState.IsValid) return View();

            using (ExcelPackage package = new ExcelPackage(model.Database.InputStream))
            {
                ExcelImportDatabase database = repository.CreateDatabase(this.User(), package.Workbook);
                if (database.GetValidationErrors().Any())
                {
                    SetInvalidDataCookie(true);
                    database.HideValidationErrors(package.Workbook);
                    database.ShowValidationErrors(database.GetValidationErrors(), package.Workbook);

                    package.Save();
                    package.Stream.Position = 0;
                    return File(package.Stream, model.Database.ContentType, model.Database.FileName);
                }

                ExcelImportDatabase existingDatabase = repository.GetDatabase(this.User());

                using (var uow = UnitOfWork.Begin())
                {
                    repository.Delete(existingDatabase);
                    repository.Save(database);
                    uow.Persist();
                }

                return View("Success");
            }
        }

        [HttpGet, Route("TMD.xlsx")]
        public ActionResult Download()
        {
            using (Stream template = Assembly.GetExecutingAssembly().GetManifestResourceStream("TMD._TMD.xlsx"))
            using (ExcelPackage package = new ExcelPackage(template))
            {
                ExcelImportDatabase database = repository.GetDatabase(this.User());
                database.Fill(package.Workbook);

                package.Save();
                package.Stream.Position = 0;
                return File(package.Stream, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "TMD.xlsx");
            }
        }
    }
}