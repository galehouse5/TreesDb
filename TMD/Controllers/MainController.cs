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

        [ChildActionOnly]
        public virtual ActionResult SuggestionsMenuWidget()
        {
            return PartialView((object)WebApplicationRegistry.Settings.SuggestionsUrl);
        }

        [HttpGet]
        public virtual ActionResult Index()
        {
            return RedirectToAction("Index", "Map");
        }

        [DefaultReturnUrl]
        [HttpGet]
        public virtual ActionResult About()
        {
            var model = new MainModel
            {
                RecentPhotos = Repositories.Photos.ListRecentPublicPhotos(10)
            };
            return View(model);
        }

        [HttpPost]
        public virtual ActionResult SetUnits(Units units, string returnUrl)
        {
            Response.Cookies.SetUnitsPreference(units);
            return Redirect(returnUrl);
        }
    }
}
