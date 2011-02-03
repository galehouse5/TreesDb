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

    public abstract class CoordinatePickerModel
    {
        public Coordinates Coordinates { get; set; }
        public abstract string MapLoaderActionName { get; }
        public abstract object MapLoaderRouteValues { get; }
    }

    public class ImportTreeCoordinatePickerModel : CoordinatePickerModel
    {
        public int TripId { get; set; }
        public int TreeId { get; set; }
        public override string MapLoaderActionName { get { return "ViewMarkersForImportTree"; } }
        public override object MapLoaderRouteValues { get { return new { controller = "Map", id = TripId, treeId = TreeId }; } }
    }

    public class ImportSubsiteCoordinatePickerModel : CoordinatePickerModel
    {
        public int TripId { get; set; }
        public int SubsiteId { get; set; }
        public override string MapLoaderActionName { get { return "ViewMarkersForImportSubsite"; } }
        public override object MapLoaderRouteValues { get { return new { controller = "Map", id = TripId, subsiteId = SubsiteId }; } }
    }

    public class ImportSiteCoordinatePickerModel : CoordinatePickerModel
    {
        public int TripId { get; set; }
        public int SiteId { get; set; }
        public override string MapLoaderActionName { get { return "ViewMarkersForImportSite"; } }
        public override object MapLoaderRouteValues { get { return new { controller = "Map", id = TripId, siteId = SiteId }; } }
    }

    public class MapImportSiteMarkerModel
    {
        public string Name { get; set; }
        public int SubsitesCount { get; set; }
        public IList<MapImportSubsiteMarkerModel> Subsites { get; set; }
    }

    public class MapImportSubsiteMarkerModel
    {
        public string Name { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")] 
        public string OwnershipType { get; set; }
        public IList<IPhoto> Photos { get; set; }
    }

    public class MapImportTreeMarkerModel
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

    public class MapSiteMarkerModel
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

    public class MapSubsiteMarkerModel
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

    public class MapTreeMarkerModel
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