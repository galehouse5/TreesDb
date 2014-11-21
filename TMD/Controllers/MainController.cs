using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public partial class MainController : ControllerBase
    {
        [HttpGet, Route("")]
        public virtual ActionResult Index()
        {
            return RedirectToAction("Index", "Map");
        }

        [HttpPost, Route("set-units")]
        public virtual ActionResult SetUnits(Units units, string returnUrl)
        {
            Response.Cookies.SetUnitsPreference(units);
            return Redirect(returnUrl);
        }
    }
}
