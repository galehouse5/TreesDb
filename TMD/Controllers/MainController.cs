using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public partial class MainController : ControllerBase
    {
        [ChildActionOnly]
        public virtual ActionResult MenuWidget(bool isSelected)
        {
            return PartialView(isSelected);
        }

        [HttpGet, Route("")]
        public virtual ActionResult Index()
        {
            return RedirectToAction("Index", "Map");
        }

        [HttpGet, Route("about"), DefaultReturnUrl]
        public virtual ActionResult About()
        {
            return View();
        }

        [HttpPost, Route("set-units")]
        public virtual ActionResult SetUnits(Units units, string returnUrl)
        {
            Response.Cookies.SetUnitsPreference(units);
            return Redirect(returnUrl);
        }
    }
}
