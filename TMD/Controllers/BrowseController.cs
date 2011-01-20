using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Model;

namespace TMD.Controllers
{
    public class BrowseController : ControllerBase
    {
        [ChildActionOnly]
        public ActionResult MenuWidget(bool isSelected)
        {
            return PartialView(new BrowseMenuWidgetModel
            {
                IsSelected = isSelected
            });
        }

        public ActionResult Index()
        {
            return View();
        }

        [DefaultReturnUrl]
        public ActionResult TreeDetails(int id)
        {
            return View(Repositories.Trees.FindById(id));
        }
    }
}
