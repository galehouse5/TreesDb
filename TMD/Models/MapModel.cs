using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;
using System.Web.Mvc;

namespace TMD.Models
{
    public class MapMenuWidgetModel
    {
        public bool IsSelected { get; set; }
    }

    public class CoordinatePickerModel
    {
        public Coordinates Coordinates { get; set; }
        public CoordinatePickerMapLoaderModel MapLoader { get; set; }
    }

    public abstract class CoordinatePickerMapLoaderModel
    {
        public abstract string ActionName { get; }
        public abstract object RouteValues { get; }
    }

    public class ImportTreeCoordinatePickerMapLoaderModel : CoordinatePickerMapLoaderModel
    {
        public int TripId { get; set; }
        public int TreeId { get; set; }
        public override string ActionName { get { return "MarkersForImportTree"; } }
        public override object RouteValues { get { return new { controller = "Map", tripId = TripId, treeId = TreeId }; } }
    }

    public class ImportSubsiteCoordinatePickerMapLoaderModel : CoordinatePickerMapLoaderModel
    {
        public int TripId { get; set; }
        public int SubsiteId { get; set; }
        public override string ActionName { get { return "MarkersForImportSubsite"; } }
        public override object RouteValues { get { return new { controller = "Map", tripId = TripId, subsiteId = SubsiteId }; } }
    }

    public class ImportSiteCoordinatePickerMapLoaderModel : CoordinatePickerMapLoaderModel
    {
        public int TripId { get; set; }
        public int SiteId { get; set; }
        public override string ActionName { get { return "MarkersForImportSite"; } }
        public override object RouteValues { get { return new { controller = "Map", tripId = TripId, siteId = SiteId }; } }
    }
}