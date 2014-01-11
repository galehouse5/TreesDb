using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model;
using TMD.Models;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public partial class MapController : ControllerBase
    {
        [ChildActionOnly]
        public virtual ActionResult MenuWidget(bool isSelected)
        {
            return PartialView(new MapMenuWidgetModel
            {
                IsSelected = isSelected
            });
        }

        [DefaultReturnUrl]
        public virtual ActionResult Index()
        {
            ViewData.SetJavascriptRequired(true);
            ViewData.SetRenderFooter(false);
            var sites = Repositories.Sites.ListAll();
            var model = Mapper.Map<IList<Model.Sites.Site>, MapModel>(sites);
            return View(model);
        }

        public virtual ActionResult AllMarkers()
        {
            var sites = Repositories.Sites.ListAllForMap();
            List<MapMarkerModel> markers = new List<MapMarkerModel>();
            markers.AddRange(from site in sites
                             where site.TreesWithSpecifiedCoordinatesCount > 0
                             select Mapper.Map<Model.Sites.Site, MapMarkerModel>(site));
            markers.AddRange(from site in sites
                             where !site.ContainsSingleSubsite
                             from subsite in site.Subsites
                             where subsite.TreesWithSpecifiedCoordinatesCount > 0
                             select Mapper.Map<Model.Sites.Subsite, MapMarkerModel>(subsite));
            markers.AddRange(from site in sites
                             from subsite in site.Subsites
                             where subsite.TreesWithSpecifiedCoordinatesCount > 0
                             from tree in subsite.Trees
                             where tree.Coordinates.IsSpecified
                             select Mapper.Map<Model.Trees.Tree, MapMarkerModel>(tree));
            return Json(new { Markers = markers.Select(m => m.ToJson(Url)).ToArray() }, JsonRequestBehavior.AllowGet);
        }

        public virtual ActionResult TreeMarker(int id)
        {
            var tree = Repositories.Trees.FindById(id);
            var marker = Mapper.Map<Model.Trees.Tree, MapMarkerModel>(tree);
            return Json(new { Markers = new [] { marker.ToJson(Url) } }, JsonRequestBehavior.AllowGet);
        }

        public virtual ActionResult SubsiteMarker(int id, int subsiteId)
        {
            var site = Repositories.Sites.FindById(id);
            var subsite = site.Subsites.Where(ss => ss.Id == subsiteId).Single();
            var marker = Mapper.Map<Model.Sites.Subsite, MapMarkerModel>(subsite);
            return Json(new { Markers = new[] { marker.ToJson(Url) } }, JsonRequestBehavior.AllowGet);
        }

        public virtual ActionResult SiteMarker(int id)
        {
            var site = Repositories.Sites.FindById(id);
            var marker = Mapper.Map<Model.Sites.Site, MapMarkerModel>(site);
            return Json(new { Markers = new[] { marker.ToJson(Url) } }, JsonRequestBehavior.AllowGet);
        }

        public virtual ActionResult SiteMarkerInfo(int id)
        {
            var site = Repositories.Sites.FindById(id);
            var model = Mapper.Map<Model.Sites.Site, MapSiteMarkerInfoModel>(site);
            return PartialView(model);
        }

        public virtual ActionResult SubsiteMarkerInfo(int id, int subsiteId)
        {
            var site = Repositories.Sites.FindById(id);
            var subsite = site.Subsites.Where(ss => ss.Id == subsiteId).Single();
            var model = Mapper.Map<Model.Sites.Subsite, MapSubsiteMarkerInfoModel>(subsite);
            return PartialView(model);
        }

        public virtual ActionResult TreeMarkerInfo(int id)
        {
            var tree = Repositories.Trees.FindById(id);
            var model = Mapper.Map<Model.Trees.Tree, MapTreeMarkerInfoModel>(tree);
            return PartialView(model);
        }
    }
}
