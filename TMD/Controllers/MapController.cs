using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Model.Trips;
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

        private object renderImportSiteMarker(SiteVisit site)
        {
            if (site.SubsiteVisits.Count == 1)
            {
                return new
                {
                    Title = site.SubsiteVisits[0].Name,
                    Coordinates = new {
                        Latitude = site.SubsiteVisits[0].Coordinates.Latitude.TotalDegrees,
                        Longitude = site.SubsiteVisits[0].Coordinates.Longitude.TotalDegrees
                    },
                    Icon = site.SubsiteVisits[0].Photos.Count > 0 ?
                        Url.Action("View", "Photo", new { id = site.SubsiteVisits[0].Photos[0].Id, size = EPhotoSize.MiniSquare })
                        : "/images/icons/Subsite32.png",
                    Info = RenderPartialViewToString("ImportSubsiteMarkerInfoPartial", site.SubsiteVisits[0])
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

        private object renderImportSubsiteMarker(SubsiteVisit subsite)
        {
            return new
            {
                Title = subsite.Name,
                Coordinates = new {
                    Latitude = subsite.Coordinates.Latitude.TotalDegrees,
                    Longitude = subsite.Coordinates.Longitude.TotalDegrees
                },
                Icon = subsite.Photos.Count > 0 ?
                    Url.Action("View", "Photo", new { id = subsite.Photos[0].Id, size = EPhotoSize.MiniSquare }) 
                    : "/images/icons/Subsite32.png",
                Info = RenderPartialViewToString("ImportSubsiteMarkerInfoPartial", subsite)
            };
        }

        private object renderImportTreeMarker(TreeMeasurementBase tree)
        {
            return new
            {
                Title = tree.ScientificName,
                Coordinates = new {
                    Latitude = tree.Coordinates.Latitude.TotalDegrees,
                    Longitude = tree.Coordinates.Longitude.TotalDegrees
                },
                Icon = tree.Photos.Count > 0 ? 
                    Url.Action("View", "Photo", new { id = tree.Photos[0].Id, size = EPhotoSize.MiniSquare }) 
                    : "/images/icons/SingleTrunkTree32.png",
                Info = RenderPartialViewToString("ImportTreeMarkerInfoPartial", tree)
            };
        }

        public ActionResult ViewMarkersForImportSite(int id, int siteId)
        {
            var trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var renderedMarkers = new List<object>();
            renderedMarkers.AddRange(from sv in trip.SiteVisits
                where sv.Coordinates.IsValidAndSpecified() && sv.Id != siteId
                select renderImportSiteMarker(sv));
            renderedMarkers.AddRange(from sv in trip.SiteVisits
                where sv.SubsiteVisits.Count != 1
                from ssv in sv.SubsiteVisits
                where ssv.Coordinates.IsValidAndSpecified()
                select renderImportSubsiteMarker(ssv));
            renderedMarkers.AddRange(from sv in trip.SiteVisits
                from ssv in sv.SubsiteVisits
                from tm in ssv.TreeMeasurements
                where tm.Coordinates.IsValidAndSpecified()
                select renderImportTreeMarker(tm));
            var calculatedCoordinates = trip.FindSiteVisitById(siteId).CalculateCoordinates();
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
            var trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var renderedMarkers = new List<object>();
            renderedMarkers.AddRange(from sv in trip.SiteVisits
                where sv.Coordinates.IsValidAndSpecified() && (sv.SubsiteVisits.Count != 1 || sv.SubsiteVisits[0].Id != subsiteId)
                select renderImportSiteMarker(sv));
            renderedMarkers.AddRange(from sv in trip.SiteVisits
                where sv.SubsiteVisits.Count != 1
                from ssv in sv.SubsiteVisits
                where ssv.Coordinates.IsValidAndSpecified() && ssv.Id != subsiteId
                select renderImportSubsiteMarker(ssv));
            renderedMarkers.AddRange(from sv in trip.SiteVisits
                from ssv in sv.SubsiteVisits
                from tm in ssv.TreeMeasurements
                where tm.Coordinates.IsValidAndSpecified()
                select renderImportTreeMarker(tm));
            var calculatedCoordinates = trip.FindSubsiteVisitById(subsiteId).CalculateCoordinates();
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
            var trip = Repositories.Trips.FindById(id);
            if (!User.IsAuthorizedToEdit(trip)) { return new UnauthorizedResult(); }
            var renderedMarkers = new List<object>();
            renderedMarkers.AddRange(from sv in trip.SiteVisits
                where sv.Coordinates.IsValidAndSpecified()
                select renderImportSiteMarker(sv));
            renderedMarkers.AddRange(from sv in trip.SiteVisits
                where sv.SubsiteVisits.Count != 1
                from ssv in sv.SubsiteVisits
                where ssv.Coordinates.IsValidAndSpecified()
                select renderImportSubsiteMarker(ssv));
            renderedMarkers.AddRange(from sv in trip.SiteVisits
                from ssv in sv.SubsiteVisits
                from tm in ssv.TreeMeasurements
                where tm.Coordinates.IsValidAndSpecified() && tm.Id != treeId
                select renderImportTreeMarker(tm));
            var calculatedCoordinates = trip.FindTreeMeasurementById(treeId).CalculateCoordinates();
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
