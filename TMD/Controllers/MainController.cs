using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Models;
using TMD.Model;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public partial class MainController : ControllerBase
    {
        [ChildActionOnly]
        public virtual ActionResult MenuWidget(bool isSelected)
        {
            return PartialView(new MainMenuWidgetModel
            {
                IsSelected = isSelected
            });
        }

        [DefaultReturnUrl]
        [HttpGet]
        public virtual ActionResult Index()
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
