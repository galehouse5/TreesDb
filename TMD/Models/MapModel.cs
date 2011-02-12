using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;
using System.Web.Mvc;
using TMD.Model.Locations;
using System.ComponentModel;
using TMD.Model.Photos;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;

namespace TMD.Models
{
    public class MapMenuWidgetModel
    {
        public bool IsSelected { get; set; }
    }

    public class CoordinatePickerModel
    {
        public Coordinates Coordinates { get; set; }
        public ActionResult MarkerLoaderAction { get; set; }
    }

    public class MapViewportModel
    {
        public int Zoom { get; set; }
        public Coordinates Center { get; set; }
        public CoordinateBounds Bounds { get; set; }
        public ActionResult MarkerLoaderAction { get; set; }
    }

    public class MapMarkerModel
    {
        public string Title { get; set; }
        public Coordinates Position { get; set; }
        public ActionResult InfoLoaderAction { get; set; }
        public int? MinZoom { get; set; }
        public int? MaxZoom { get; set; }
        public string DefaultIconUrl { get; set; }
        public IEnumerable<MapMarkerIconModel> DynamicIcons { get; set; }

        public object ToJson(UrlHelper url)
        {
            return new
            {
                Title, MinZoom, MaxZoom,
                Latitude = Position.Latitude.TotalDegrees, Longitude = Position.Longitude.TotalDegrees,
                InfoLoaderUrl = url.Action(InfoLoaderAction),
                DefaultIconUrl,
                DynamicIcons = DynamicIcons == null ? new object [0]
                    : DynamicIcons.Select(di => di.ToJson(url)).ToArray()
            };
        }
    }

    public class MapMarkerIconModel
    {
        public int MinZoom { get; set; }
        public int MaxZoom { get; set; }
        public ActionResult IconLoaderAction { get; set; }

        public object ToJson(UrlHelper url)
        {
            return new 
            { 
                MinZoom, MaxZoom, 
                IconLoaderUrl = url.Action(IconLoaderAction) 
            };
        }
    }

    public class MapImportSiteMarkerInfoModel
    {
        public string Name { get; set; }
        public int SubsitesCount { get; set; }
        public IList<MapImportSubsiteMarkerInfoModel> Subsites { get; set; }
    }

    public class MapImportSubsiteMarkerInfoModel
    {
        public string Name { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")] 
        public string OwnershipType { get; set; }
        public IList<IPhoto> Photos { get; set; }
    }

    public class MapImportTreeMarkerInfoModel
    {
        [DisplayName("Scientific name")]
        public string ScientificName { get; set; }
        [DisplayName("Common name")]
        public string CommonName { get; set; }
        public Distance Height { get; set; }
        public Distance Girth { get; set; }
        [DisplayName("Crown spread")]
        public Distance CrownSpread { get; set; }
        public IList<IPhoto> Photos { get; set; }
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
        public IList<IPhoto> Photos { get; set; }
        [DisplayName("Visited"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")] 
        public DateTime LastVisited { get; set; }
    }

    public class MapSubsiteMarkerInfoModel
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
        public int TreesCount { get; set; }
        public IList<IPhoto> Photos { get; set; }
        [DisplayName("Visited"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")] 
        public DateTime LastVisited { get; set; }
    }

    public class MapTreeMarkerInfoModel
    {
        public int Id { get; set; }
        [DisplayName("Common name")] public string CommonName { get; set; }
        [DisplayName("Scientific name")] public string ScientificName { get; set; }
        [DisplayFormat(DataFormatString = "Default")] 
        public Distance Height { get; set; }
        [DisplayFormat(DataFormatString = "FeetDecimalInches")] 
        public Distance Girth { get; set; }
        [DisplayName("Crown spread"), DisplayFormat(DataFormatString = "Default")] 
        public Distance CrownSpread { get; set; }
        [DisplayFormat(DataFormatString = "Default")] 
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
        public IList<IPhoto> Photos { get; set; }
        [DisplayName("Measured"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")] 
        public DateTime LastMeasured { get; set; }
    }
}