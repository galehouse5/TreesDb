using System;
using System.Web;
using System.Web.Mvc;
using TMD.Models.Import;

namespace TMD.Controllers
{
    public class ImportController : ControllerBase
    {
        [HttpGet, Route("import")]
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost, Route("import")]
        public ActionResult Index(ImportModel model)
        {
            if (!ModelState.IsValid)
                return View();

            throw new NotImplementedException();
        }
    }
}