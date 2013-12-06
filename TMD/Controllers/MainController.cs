using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model;
using TMD.Models;

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

        [HttpGet]
        public virtual ActionResult Index()
        {
            return RedirectToAction("Index", "Map");
        }

        [HttpGet, DefaultReturnUrl]
        public virtual ActionResult About()
        {
            return View();
        }

        [HttpPost]
        public virtual ActionResult SetUnits(Units units, string returnUrl)
        {
            Response.Cookies.SetUnitsPreference(units);
            return Redirect(returnUrl);
        }
    }
}
