using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Locations;
using TMD.Model.Photo;

namespace TMD.Models
{
    public class MapMenuWidgetModel
    {
        public bool IsSelected { get; set; }
    }

    public class ActionLoader
    {
        public ActionLoader(string actionName, string controllerName = null, object routeValues = null)
        {
            this.ActionName = actionName;
            this.ControllerName = controllerName;
            this.RouteValues = routeValues;
        }

        public string ActionName { get; private set; }
        public string ControllerName { get; private set; }
        public object RouteValues { get; private set; }

        public string ToUrl(UrlHelper url)
        {
            return url.Action(ActionName, ControllerName, RouteValues);
        }
    }

    public class MapModel
    {
        public int Zoom { get; set; }
        public Coordinates Center { get; set; }
        public CoordinateBounds Bounds { get; set; }
        public ActionLoader MarkerLoader { get; set; }
    }

    public class MapMarkerModel
    {
        public string Title { get; set; }
        public Coordinates Position { get; set; }
        public ActionLoader InfoLoader { get; set; }
        public int? MinZoom { get; set; }
        public int? MaxZoom { get; set; }
        public string DefaultIconUrl { get; set; }
        public ActionLoader IconLoader { get; set; }

        public object ToJson(UrlHelper url)
        {
            return new
            {
                Title, MinZoom, MaxZoom,
                Latitude = Position.Latitude.TotalDegrees, Longitude = Position.Longitude.TotalDegrees,
                InfoLoaderUrl = InfoLoader.ToUrl(url),
                IconUrl = IconLoader == null ? url.ManagedContent(DefaultIconUrl) : IconLoader.ToUrl(url)
            };
        }
    }

    public class MapSiteMarkerInfoModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")] 
        public string OwnershipType { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RHI5 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RHI10 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RHI20 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RGI5 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RGI10 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RGI20 { get; set; }
        [DisplayName("Trees")] 
        public int TreesMeasured { get; set; }
        [DisplayName("Subsites")] 
        public int SubsitesCount { get; set; }
        public IList<PhotoReference> Photos { get; set; }
        [DisplayName("Visited"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")] 
        public DateTime LastVisited { get; set; }
    }

    public class MapSubsiteMarkerInfoModel
    {
        public int SiteId { get; set; }
        public int Id { get; set; }
        public string Name { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")] 
        public string OwnershipType { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RHI5 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RHI10 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RHI20 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RGI5 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RGI10 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? RGI20 { get; set; }
        [DisplayName("Trees")] 
        public int TreesCount { get; set; }
        public IList<PhotoReference> Photos { get; set; }
        [DisplayName("Visited"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")] 
        public DateTime LastVisited { get; set; }
    }

    public class MapTreeMarkerInfoModel
    {
        public int Id { get; set; }
        [DisplayName("Common name")] public string CommonName { get; set; }
        [DisplayName("Botanical name")] public string ScientificName { get; set; }
        public Distance Height { get; set; }
        [DisplayFormat(DataFormatString = "SubprefixOnly")] 
        public Distance Girth { get; set; }
        [DisplayName("Crown spread")] 
        public Distance CrownSpread { get; set; }
        public Elevation Elevation { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? TDI3 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? TDI2 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? ENTSPTS2 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? ENTSPTS { get; set; }
        [DisplayName("Champion points"), DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? ChampionPoints { get; set; }
        [DisplayName("Champion points (abbreviated)"), DisplayFormat(DataFormatString = "{0:0.00}")] 
        public float? AbbreviatedChampionPoints { get; set; }
        public IList<PhotoReference> Photos { get; set; }
        [DisplayName("Measured"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")] 
        public DateTime LastMeasured { get; set; }
    }
}