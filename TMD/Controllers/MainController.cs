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
            return View();
        }
    }
}
