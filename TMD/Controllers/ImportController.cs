using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Web;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Excel;
using TMD.Model.Excel.AsposeCells;
using TMD.Model.ExcelImport;
using TMD.Model.Extensions;
using TMD.Model.Locations;
using TMD.Model.Photo;
using TMD.Model.Sites;
using TMD.Model.Trees;
using TMD.Model.Users;
using TMD.Models.Import;

namespace TMD.Controllers
{
    [AuthorizeUser(Roles = UserRoles.Import)]
    public class ImportController : ControllerBase
    {
        private ExcelImportRepository importRepository;
        private PhotoRepository photoRepository;
        private ILocationRepository locationRepository;
        private ISiteRepository siteRepository;
        private ITreeRepository treeRepository;

        public ImportController(
            ExcelImportRepository importRepository,
            PhotoRepository photoRepository,
            ILocationRepository locationRepository,
            ISiteRepository siteRepository,
            ITreeRepository treeRepository)
        {
            this.importRepository = importRepository;
            this.photoRepository = photoRepository;
            this.locationRepository = locationRepository;
            this.siteRepository = siteRepository;
            this.treeRepository = treeRepository;
        }

        public void SetIsValidCookie(bool value)
        {
            Response.SetCookie(new HttpCookie("isValid", value.ToString()) { Path = Url.Action("Index") });
        }

        [HttpGet, Route("import"), DefaultReturnUrl]
        public ActionResult Index()
        {
            SetIsValidCookie(true);
            ImportModel model = new ImportModel();
            model.Initialize(this.User());

            return View(model);
        }

        protected IEnumerable<string> GetImportedPhotoFilenames(ExcelImportDatabase database)
        {
            IQueryable<PhotoFile> existingPhotos = photoRepository.GetFiles(this.User());
            return database.Photos.Select(p => p.Filename)
                .Except(existingPhotos.Select(p => p.Filename))
                .OrderBy(f => f);
        }

        protected ActionResult XlsxFile(IExcelWorkbook workbook, string filename)
        {
            Stream output = null;

            try
            {
                output = new TemporaryFileStream();
                workbook.Save(output);
                output.Position = 0;

                return File(output, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception)
            {
                if (output != null)
                {
                    output.Dispose();
                }

                throw;
            }
        }

        [HttpPost, Route("import"), ValidateAntiForgeryToken]
        public ActionResult Index(ImportModel model)
        {
            model.Initialize(this.User());

            if (!ModelState.IsValid) return View(model);

            IExcelWorkbook workbook = new AsposeCellsWorkbook(model.Database.InputStream);
            ExcelImportDatabase database = ExcelImportDatabase.Create(this.User(), workbook);

            if (database.GetErrors().Any())
            {
                SetIsValidCookie(false);
                database.HideErrors(workbook);
                database.ShowErrors(database.GetErrors(), workbook);

                string filename = string.Format("{0} (Proofed).xlsx", Path.GetFileNameWithoutExtension(model.Database.FileName));
                return XlsxFile(workbook, filename);
            }

            ExcelImportDatabase existingDatabase = importRepository.GetDatabase(this.User());

            using (var uow = UnitOfWork.Begin())
            {
                importRepository.Remove(existingDatabase);
                importRepository.Save(database);
                uow.Persist();
            }

            if (GetImportedPhotoFilenames(database).Any())
                return RedirectToAction("Photos");

            return RedirectToAction("Merge");
        }

        [HttpGet, Route("import/photos")]
        public ActionResult Photos()
        {
            ExcelImportDatabase database = importRepository.GetDatabase(this.User());
            IEnumerable<string> model = GetImportedPhotoFilenames(database);

            return View(model);
        }

        [HttpPost, Route("import/photos"), ValidateAntiForgeryToken]
        public ActionResult Photos(IEnumerable<HttpPostedFileBase> photos)
        {
            using (var uow = UnitOfWork.Begin())
            {
                foreach (HttpPostedFileBase photo in photos)
                {
                    using (Bitmap image = new Bitmap(photo.InputStream))
                    {
                        PhotoFile file = new PhotoFile(photo.FileName, image, photo.ContentLength);
                        photoRepository.Save(file);
                    }
                }
                uow.Persist();
            }

            return new EmptyResult();
        }

        [HttpGet, Route("import/merge")]
        public ActionResult Merge()
        {
            ExcelImportDatabase database = importRepository.GetDatabase(this.User());

            if (GetImportedPhotoFilenames(database).Any())
                return RedirectToAction("Photos");

            return View();
        }

        [HttpPost, Route("import/merge"), ValidateAntiForgeryToken]
        public ActionResult ProcessMerge()
        {
            ExcelImportDatabase database = importRepository.GetDatabase(this.User());

            if (GetImportedPhotoFilenames(database).Any())
                return RedirectToAction("Photos");

            using (var uow = UnitOfWork.Begin())
            {
                treeRepository.DeleteMeasurements(this.User());
                siteRepository.DeleteVisits(this.User());

                UnitOfWork.Flush();

                foreach (Site site in database.CreateSites(locationRepository.GetStates(), photoRepository))
                {
                    siteRepository.Merge(site);
                }

                UnitOfWork.Flush();

                foreach (PhotoFile photo in photoRepository.GetOrphanedFiles(this.User()))
                {
                    photoRepository.Delete(photo);
                }

                uow.Persist();
            }

            return RedirectToAction("Success");
        }

        [HttpGet, Route("import/success")]
        public ActionResult Success()
        {
            return View("Success");
        }

        [HttpGet, Route("TMD {userID}.xlsx")]
        public ActionResult Download(int userID)
        {
            User user = this.User();
            if (user.Id != userID)
                return new UnauthorizedResult();

            using (Stream template = Assembly.GetExecutingAssembly().GetManifestResourceStream("TMD.ExcelImportTemplate.xlsx"))
            {
                IExcelWorkbook workbook = new AsposeCellsWorkbook(template);
                ExcelImportDatabase database = importRepository.GetDatabase(user);

                database.Fill(workbook);

                string filename = string.Format("TMD {0}.xlsx", userID);
                return XlsxFile(workbook, filename);
            }
        }
    }
}