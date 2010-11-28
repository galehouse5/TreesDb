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

        [DefaultReturnUrl]
        public ActionResult Index()
        {
            return View(new ModelBase { IsMapping = true, RequiresJavascript = true }.InitializeFor(User));
        }
    }
}
