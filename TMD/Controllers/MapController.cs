using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public class MapController : ControllerBase
    {
        [ChildActionOnly]
        public ActionResult GoogleMapsScript()
        {
            return PartialView((object)WebApplicationRegistry.Settings.GoogleApiKey);
        }

        [ChildActionOnly]
        public ActionResult MenuWidget(bool isSelected)
        {
            return PartialView(new MapMenuWidgetModel
            {
                IsSelected = isSelected
            });
        }

        [DefaultReturnUrl]
        public ActionResult Index()
        {
            ViewData.JavascriptRequired = true;
            return View();
        }
    }
}
