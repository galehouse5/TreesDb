using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Model.Imports;
using TMD.Model.Photos;
using TMD.Model;
using TMD.Model.Extensions;

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

        public ActionResult ViewMarkers()
        {
            var sites = Repositories.Sites.ListAll();
            var renderedMarkers = new List<object>();
            renderedMarkers.AddRange(from site in sites
                                     where site.ContainsTreesWithSpecifiedCoordinates
                                     select renderSiteMarker(site));
            renderedMarkers.AddRange(from site in sites
                                     where !site.ContainsSingleSubsite
                                     from subsite in site.Subsites
                                     where subsite.ContainsTreesWithSpecifiedCoordinates
                                     select renderSubsiteMarker(subsite));
            renderedMarkers.AddRange(from site in sites
                                     from subsite in site.Subsites
                                     where subsite.ContainsTreesWithSpecifiedCoordinates
                                     from tree in subsite.Trees
                                     where tree.Coordinates.IsSpecified
                                     select renderTreeMarker(tree));
            return Json(new
            {
                CoordinateBounds = new
                {
                    NECoordinates = new
                    {
                        Latitude = (from site in sites 
                                   where site.ContainsTreesWithSpecifiedCoordinates
                                   select site.CalculatedCoordinates.Latitude.TotalDegrees).Max(),
                        Longitude = (from site in sites 
                                   where site.ContainsTreesWithSpecifiedCoordinates
                                   select site.CalculatedCoordinates.Longitude.TotalDegrees).Max()
                    },
                    SWCoordinates = new 
                    {
                        Latitude = (from site in sites
                                    where site.ContainsTreesWithSpecifiedCoordinates
                                    select site.CalculatedCoordinates.Latitude.TotalDegrees).Min(),
                        Longitude = (from site in sites
                                     where site.ContainsTreesWithSpecifiedCoordinates
                                     select site.CalculatedCoordinates.Longitude.TotalDegrees).Min()
                    }
                },
                Markers = renderedMarkers.ToArray()
            }, JsonRequestBehavior.AllowGet);
        }

        public object renderSiteMarker(Model.Sites.Site site)
        {
            return new
            {
                Title = site.Name,
                Coordinates = new
                {
                    Latitude = site.CalculatedCoordinates.Latitude.TotalDegrees,
                    Longitude = site.CalculatedCoordinates.Longitude.TotalDegrees
                },
                Icon = "/images/icons/Site32.png",
                Info = RenderPartialViewToString("SiteMarkerInfoPartial", site),
                MinZoom = 0, MaxZoom = site.ContainsSingleSubsite ? 13 : 9
            };
        }

        public object renderSubsiteMarker(Model.Sites.Subsite subsite)
        {
            return new
            {
                Title = subsite.Name,
                Coordinates = new
                {
                    Latitude = subsite.CalculatedCoordinates.Latitude.TotalDegrees,
                    Longitude = subsite.CalculatedCoordinates.Longitude.TotalDegrees
                },
                Icon = "/images/icons/Subsite32.png",
                Info = RenderPartialViewToString("SubsiteMarkerInfoPartial", subsite),
                MinZoom = 10, MaxZoom = 13
            };
        }

        public object renderTreeMarker(Model.Trees.Tree tree)
        {
            return new
            {
                Title = tree.ScientificName,
                Coordinates = new
                {
                    Latitude = tree.CalculatedCoordinates.Latitude.TotalDegrees,
                    Longitude = tree.CalculatedCoordinates.Longitude.TotalDegrees
                },
                Icon = "/images/icons/SingleTrunkTree32.png",
                Info = RenderPartialViewToString("TreeMarkerInfoPartial", tree),
                MinZoom = 14, MaxZoom = 30
            };
        }

        private object renderImportSiteMarker(Site site)
        {
            if (site.Subsites.Count == 1)
            {
                return new
                {
                    Title = site.Subsites[0].Name,
                    Coordinates = new {
                        Latitude = site.Subsites[0].Coordinates.Latitude.TotalDegrees,
                        Longitude = site.Subsites[0].Coordinates.Longitude.TotalDegrees
                    },
                    Icon = site.Subsites[0].Photos.Count > 0 ?
                        Url.Action("View", "Photos", new { id = site.Subsites[0].Photos[0].Id, size = EPhotoSize.MiniSquare })
                        : "/images/icons/Subsite32.png",
                    Info = RenderPartialViewToString("ImportSubsiteMarkerInfoPartial", site.Subsites[0])
                };
            }
            return new
            {
                Title = site.Name,
                Coordinates = new {
                    Latitude = site.Coordinates.Latitude.TotalDegrees,
                    Longitude = site.Coordinates.Longitude.TotalDegrees
                },
                Icon = "/images/icons/Site32.png",
                Info = RenderPartialViewToString("ImportSiteMarkerInfoPartial", site)
            };
        }

        private object renderImportSubsiteMarker(Subsite subsite)
        {
            return new
            {
                Title = subsite.Name,
                Coordinates = new {
                    Latitude = subsite.Coordinates.Latitude.TotalDegrees,
                    Longitude = subsite.Coordinates.Longitude.TotalDegrees
                },
                Icon = subsite.Photos.Count > 0 ?
                    Url.Action("View", "Photos", new { id = subsite.Photos[0].Id, size = EPhotoSize.MiniSquare }) 
                    : "/images/icons/Subsite32.png",
                Info = RenderPartialViewToString("ImportSubsiteMarkerInfoPartial", subsite)
            };
        }

        private object renderImportTreeMarker(TreeBase tree)
        {
            return new
            {
                Title = tree.ScientificName,
                Coordinates = new {
                    Latitude = tree.Coordinates.Latitude.TotalDegrees,
                    Longitude = tree.Coordinates.Longitude.TotalDegrees
                },
                Icon = tree.Photos.Count > 0 ? 
                    Url.Action("View", "Photos", new { id = tree.Photos[0].Id, size = EPhotoSize.MiniSquare }) 
                    : "/images/icons/SingleTrunkTree32.png",
                Info = RenderPartialViewToString("ImportTreeMarkerInfoPartial", tree)
            };
        }

        public ActionResult ViewMarkersForImportSite(int id, int siteId)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var renderedMarkers = new List<object>();
            renderedMarkers.AddRange(from sv in trip.Sites
                where sv.Coordinates.IsValidAndSpecified() && sv.Id != siteId
                select renderImportSiteMarker(sv));
            renderedMarkers.AddRange(from sv in trip.Sites
                where sv.Subsites.Count != 1
                from ssv in sv.Subsites
                where ssv.Coordinates.IsValidAndSpecified()
                select renderImportSubsiteMarker(ssv));
            renderedMarkers.AddRange(from sv in trip.Sites
                from ssv in sv.Subsites
                from tm in ssv.Trees
                where tm.Coordinates.IsValidAndSpecified()
                select renderImportTreeMarker(tm));
            var calculatedCoordinates = trip.FindSiteById(siteId).CalculateCoordinates();
            if (calculatedCoordinates.IsValidAndSpecified())
            {
                return Json(new
                {
                    CalculatedCoordinates = new { Latitude = calculatedCoordinates.Latitude.TotalDegrees, Longitude = calculatedCoordinates.Longitude.TotalDegrees },
                    Markers = renderedMarkers.ToArray()
                }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { Markers = renderedMarkers.ToArray() }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ViewMarkersForImportSubsite(int id, int subsiteId)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var renderedMarkers = new List<object>();
            renderedMarkers.AddRange(from sv in trip.Sites
                where sv.Coordinates.IsValidAndSpecified() && (sv.Subsites.Count != 1 || sv.Subsites[0].Id != subsiteId)
                select renderImportSiteMarker(sv));
            renderedMarkers.AddRange(from sv in trip.Sites
                where sv.Subsites.Count != 1
                from ssv in sv.Subsites
                where ssv.Coordinates.IsValidAndSpecified() && ssv.Id != subsiteId
                select renderImportSubsiteMarker(ssv));
            renderedMarkers.AddRange(from sv in trip.Sites
                from ssv in sv.Subsites
                from tm in ssv.Trees
                where tm.Coordinates.IsValidAndSpecified()
                select renderImportTreeMarker(tm));
            var calculatedCoordinates = trip.FindSubsiteById(subsiteId).CalculateCoordinates();
            if (calculatedCoordinates.IsValidAndSpecified())
            {
                return Json(new
                {
                    CalculatedCoordinates = new { Latitude = calculatedCoordinates.Latitude.TotalDegrees, Longitude = calculatedCoordinates.Longitude.TotalDegrees },
                    Markers = renderedMarkers.ToArray()
                }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { Markers = renderedMarkers.ToArray() }, JsonRequestBehavior.AllowGet);
        }

        public ActionResult ViewMarkersForImportTree(int id, int treeId)
        {
            var trip = Repositories.Imports.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var renderedMarkers = new List<object>();
            renderedMarkers.AddRange(from sv in trip.Sites
                where sv.Coordinates.IsValidAndSpecified()
                select renderImportSiteMarker(sv));
            renderedMarkers.AddRange(from sv in trip.Sites
                where sv.Subsites.Count != 1
                from ssv in sv.Subsites
                where ssv.Coordinates.IsValidAndSpecified()
                select renderImportSubsiteMarker(ssv));
            renderedMarkers.AddRange(from sv in trip.Sites
                from ssv in sv.Subsites
                from tm in ssv.Trees
                where tm.Coordinates.IsValidAndSpecified() && tm.Id != treeId
                select renderImportTreeMarker(tm));
            var calculatedCoordinates = trip.FindTreeById(treeId).CalculateCoordinates();
            if (calculatedCoordinates.IsValidAndSpecified()) 
            {
                return Json(new
                {
                    CalculatedCoordinates = new { Latitude = calculatedCoordinates.Latitude.TotalDegrees, Longitude = calculatedCoordinates.Longitude.TotalDegrees },
                    Markers = renderedMarkers.ToArray()
                }, JsonRequestBehavior.AllowGet);
            }
            return Json(new { Markers = renderedMarkers.ToArray() }, JsonRequestBehavior.AllowGet);
        }
    }
}
