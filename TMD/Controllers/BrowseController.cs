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
            var tree = Repositories.Trees.FindById(id);
            var site = Repositories.Sites.FindSiteContainingTree(id);
            return View(new TreeDetailsModel
            {
                Site = site,
                Subsite = (from subsite in site.Subsites where subsite.Trees.Contains(tree) select subsite).First(),
                Tree = tree,
                Measurements = (from measurement in tree.Measurements orderby measurement.Measured descending select measurement).ToList(),
                DatedPhotos = (from measurement in tree.Measurements 
                               orderby measurement.Measured descending 
                               select new DatedPhotosModel { Date = measurement.Measured, Photographers = measurement.Measurers, Photos = measurement.Photos })
                               .ToList()
            });
        }
    }
}
