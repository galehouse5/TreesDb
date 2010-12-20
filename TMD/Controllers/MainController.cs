using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Models;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public class MainController : ControllerBase
    {
        [ChildActionOnly]
        public ActionResult MenuWidget(bool isSelected)
        {
            return PartialView(new MainMenuWidgetModel
            {
                IsSelected = isSelected
            });
        }

        [DefaultReturnUrl]
        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }
    }
}
