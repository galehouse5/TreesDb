using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Extensions;
using TMD.Models.Map;

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

        [OutputCache(Duration = int.MaxValue, VaryByCustom = "LastMetricsUpdateTimestamp")]
        public virtual ActionResult AllMarkers()
        {
            var sites = Repositories.Sites.ListAllForMap();

            var stateMarkers = sites
                .SelectMany(s => s.Subsites)
                .Where(ss => ss.State.ComputedTreesMeasuredCount > 0)
                .Select(ss => ss.State).Distinct()
                .Select(Mapper.Map<Model.Locations.State, MapMarkerModel>);
            var siteMarkers = sites
                .Where(s => s.CalculatedCoordinates.IsSpecified)
                .Select(Mapper.Map<Model.Sites.Site, MapMarkerModel>);
            var subsiteMarkers = sites
                .Where(s => !s.ContainsSingleSubsite)
                .SelectMany(s => s.Subsites)
                .Where(ss => ss.CalculatedCoordinates.IsSpecified)
                .Select(Mapper.Map<Model.Sites.Subsite, MapMarkerModel>);
            var treeMarkers = sites
                .SelectMany(s => s.Subsites)
                .SelectMany(ss => ss.Trees)
                .Where(t => t.Coordinates.IsSpecified)
                .Select(Mapper.Map<Model.Trees.Tree, MapMarkerModel>);

            return Json(
                new { Markers = stateMarkers.Concat(siteMarkers).Concat(subsiteMarkers).Concat(treeMarkers).Select(m => m.ToJson(Url)).ToArray() },
                JsonRequestBehavior.AllowGet);
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

        public virtual ActionResult ImportSiteMarkers(int id, int siteId)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            List<MapMarkerModel> markers = new List<MapMarkerModel>();
            markers.AddRange(from site in trip.Sites
                             where site.Coordinates.IsValidAndSpecified() && site.Subsites.Count > 1 && site.Id != siteId
                             select Mapper.Map<Model.Imports.Site, MapMarkerModel>(site));
            markers.AddRange(from site in trip.Sites
                             from subsite in site.Subsites
                             where subsite.Coordinates.IsValidAndSpecified()
                             select Mapper.Map<Model.Imports.Subsite, MapMarkerModel>(subsite));
            markers.AddRange(from site in trip.Sites
                             from subsite in site.Subsites
                             from tree in subsite.Trees
                             where tree.Coordinates.IsValidAndSpecified()
                             select Mapper.Map<Model.Imports.TreeBase, MapMarkerModel>(tree));
            Coordinates calculatedCoordinates = trip.FindSiteById(siteId).CalculateCoordinates();
            if (calculatedCoordinates.IsValidAndSpecified())
            {
                return Json(new {
                    CalculatedCoordinates = new { Latitude = calculatedCoordinates.Latitude.TotalDegrees, Longitude = calculatedCoordinates.Longitude.TotalDegrees },
                    Markers = markers.Select(m => m.ToJson(Url)).ToArray()
                }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { Markers = markers.Select(m => m.ToJson(Url)).ToArray() }, JsonRequestBehavior.AllowGet);
        }

        public virtual ActionResult ImportSubsiteMarkers(int id, int subsiteId)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            List<MapMarkerModel> markers = new List<MapMarkerModel>();
            markers.AddRange(from site in trip.Sites
                             where site.Coordinates.IsValidAndSpecified() && site.Subsites.Count > 1
                             select Mapper.Map<Model.Imports.Site, MapMarkerModel>(site));
            markers.AddRange(from site in trip.Sites
                             from subsite in site.Subsites
                             where subsite.Coordinates.IsValidAndSpecified() && subsite.Id != subsiteId
                             select Mapper.Map<Model.Imports.Subsite, MapMarkerModel>(subsite));
            markers.AddRange(from site in trip.Sites
                             from subsite in site.Subsites
                             from tree in subsite.Trees
                             where tree.Coordinates.IsValidAndSpecified()
                             select Mapper.Map<Model.Imports.TreeBase, MapMarkerModel>(tree));
            Coordinates calculatedCoordinates = trip.FindSubsiteById(subsiteId).CalculateCoordinates();
            if (calculatedCoordinates.IsValidAndSpecified())
            {
                return Json(new {
                    CalculatedCoordinates = new { Latitude = calculatedCoordinates.Latitude.TotalDegrees, Longitude = calculatedCoordinates.Longitude.TotalDegrees },
                    Markers = markers.Select(m => m.ToJson(Url)).ToArray()
                }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { Markers = markers.Select(m => m.ToJson(Url)).ToArray() }, JsonRequestBehavior.AllowGet);
        }

        public virtual ActionResult ImportTreeMarkers(int id, int treeId)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            List<MapMarkerModel> markers = new List<MapMarkerModel>();
            markers.AddRange(from site in trip.Sites
                             where site.Coordinates.IsValidAndSpecified() && site.Subsites.Count > 1
                             select Mapper.Map<Model.Imports.Site, MapMarkerModel>(site));
            markers.AddRange(from site in trip.Sites
                             from subsite in site.Subsites
                             where subsite.Coordinates.IsValidAndSpecified()
                             select Mapper.Map<Model.Imports.Subsite, MapMarkerModel>(subsite));
            markers.AddRange(from site in trip.Sites
                             from subsite in site.Subsites
                             from tree in subsite.Trees
                             where tree.Coordinates.IsValidAndSpecified() && tree.Id != treeId
                             select Mapper.Map<Model.Imports.TreeBase, MapMarkerModel>(tree));
            Coordinates calculatedCoordinates = trip.FindTreeById(treeId).CalculateCoordinates();
            if (calculatedCoordinates.IsValidAndSpecified())
            {
                return Json(new {
                    CalculatedCoordinates = new { Latitude = calculatedCoordinates.Latitude.TotalDegrees, Longitude = calculatedCoordinates.Longitude.TotalDegrees },
                    Markers = markers.Select(m => m.ToJson(Url)).ToArray()
                }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { Markers = markers.Select(m => m.ToJson(Url)).ToArray() }, JsonRequestBehavior.AllowGet);
        }

        public virtual ActionResult ImportTreeMarkerInfo(int id, int treeId)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var tree = trip.FindTreeById(treeId);
            var model = Mapper.Map<Model.Imports.TreeBase, MapImportTreeMarkerInfoModel>(tree);
            return PartialView(model);
        }

        public virtual ActionResult ImportSiteMarkerInfo(int id, int siteId)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var site = trip.FindSiteById(siteId);
            var model = Mapper.Map<Model.Imports.Site, MapImportSiteMarkerInfoModel>(site);
            return PartialView(model);
        }

        public virtual ActionResult ImportSubsiteMarkerInfo(int id, int subsiteId)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var subsite = trip.FindSubsiteById(subsiteId);
            var model = Mapper.Map<Model.Imports.Subsite, MapImportSubsiteMarkerInfoModel>(subsite);
            return PartialView(model);
        }

        public virtual ActionResult StateMarkerInfo(int id)
        {
            var state = Repositories.Locations.FindStateById(id);
            var model = Mapper.Map<Model.Locations.State, MapStateMarkerInfoModel>(state);
            return PartialView(model);
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
