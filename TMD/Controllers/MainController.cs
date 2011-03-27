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
                InterestingPhotos = Repositories.Photos.FindRecentPublicPhotos(5)
            };
            return View(model);
        }
    }
}
