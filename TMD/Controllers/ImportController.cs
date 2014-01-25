using System.Web.Mvc;

namespace TMD.Controllers
{
    public class ImportController : ControllerBase
    {
        [HttpGet, Route("import")]
        public ActionResult Index()
        {
            return View();
        }
    }
}