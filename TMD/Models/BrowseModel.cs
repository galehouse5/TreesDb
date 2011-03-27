using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;
using TMD.Model.Trees;
using System.ComponentModel;
using TMD.Model.Sites;
using TMD.Model.Photos;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;
using TMD.Model.Locations;
using System.Web.Mvc;

namespace TMD.Models
{
    public class BrowseMenuWidgetModel
    {
        public bool IsSelected { get; set; }
    }

    public class BrowseTreeModel
    {
        public BrowseTreeDetailsModel Details { get; set; }
        public IList<BrowseTreeDetailsModel> MeasurementDetails { get; set; }
        public IList<BrowsePhotoSumaryModel> PhotoSummaries { get; set; }
        public BrowseTreeLocationModel Location { get; set; }
    }

    public class BrowsePhotoSumaryModel
    {
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime Date { get; set; }
        public IList<IPhoto> Photos { get; set; }
        [UIHint("ConcatenatedNames")]
        public IList<Name> Photographers { get; set; }
    }

    public class BrowseTreeDetailsModel
    {
        [ScaffoldColumn(false)]
        public int Id { get; set; }
        [ScaffoldColumn(false)]
        public int SiteId { get; set; }
        [DisplayName("Botanical name")]
        public string ScientificName { get; set; }
        [DisplayName("Common name")]
        public string CommonName { get; set; }
        [ScaffoldColumn(false)]
        public int SpeciesId { get; set; }
        [DisplayName("General comments"), DisplayFormat(NullDisplayText = "(none)"), Emphasize(false)]
        public string GeneralComments { get; set; } 
        [DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Distance Height { get; set; }
        [DisplayName("Height measurement method"), DisplayFormat(NullDisplayText = "(no data)"), UIHint("Enum")]
        public TMD.Model.Imports.TreeHeightMeasurementMethod HeightMeasurementMethod { get; set; }
        [DisplayFormat(DataFormatString = "FeetDecimalInches", NullDisplayText = "(no data)")]
        public Distance Girth { get; set; }
        [DisplayName("Crown spread"), DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Distance CrownSpread { get; set; }
        [DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Elevation Elevation { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}", NullDisplayText = "(not enough data)")]
        public float? TDI3 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}", NullDisplayText = "(not enough data)")]
        public float? TDI2 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}", NullDisplayText = "(not enough data)")]
        public float? ENTSPTS2 { get; set; }
        [DisplayFormat(DataFormatString = "{0:0.00}", NullDisplayText = "(not enough data)")]
        public float? ENTSPTS { get; set; }
        [DisplayName("Champion points"), DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? ChampionPoints { get; set; }
        [DisplayName("Champion points (abbreviated)"), DisplayFormat(DataFormatString = "{0:0.00}")]
        public float? AbbreviatedChampionPoints { get; set; }
        [DisplayFormat(DataFormatString = "FeetDecimalInches", NullDisplayText = "(no data)")]
        public Distance Diameter { get; private set; }
        [DisplayName("Conical volume"), DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Volume ConicalVolume { get; private set; }
        [UIHint("ConcatenatedNames"), Emphasize(false)]
        public IList<Name> Measurers { get; set; }
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime Measured { get; set; }
    }

    public class BrowseTreeLocationModel
    {
        [DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Coordinates Coordinates { get; set; }
        [DisplayName("Coordinates (calculated)"), DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Coordinates CalculatedCoordinates { get; set; }
        [ScaffoldColumn(false)]
        public int Id { get; set; }
        [ScaffoldColumn(false)]
        public int SiteId { get; set; }
        [DisplayName("Site")]
        public string SiteName { get; set; }
        public int SiteSubsitesCount { get; set; }
        [ScaffoldColumn(false)]
        public int SubsiteId { get; set; }
        [DisplayName("Subsite")]
        public string SubsiteName { get; set; }
        [DisplayName("Ownership type")]
        public string OwnershipType { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [Emphasize(false)]
        public MapModel Map { get; set; }
    }

    public class BrowseSpeciesDetailsModel
    {
        [DisplayName("Botanical name")]
        public string ScientificName { get; set; }
        [DisplayName("Common name")]
        public string CommonName { get; set; }
        [DisplayName("Max height"), DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Distance MaxHeight { get; set; }
        [ScaffoldColumn(false)]
        public int MaxHeightTreeId { get; set; }
        [DisplayName("Max girth"), DisplayFormat(DataFormatString = "FeetDecimalInches", NullDisplayText = "(no data)")]
        public Distance MaxGirth { get; set; }
        [ScaffoldColumn(false)]
        public int MaxGirthTreeId { get; set; }
        [DisplayName("Max crown spread"), DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Distance MaxCrownSpread { get; set; }
        [ScaffoldColumn(false)]
        public int MaxCrownSpreadTreeId { get; set; }
    }

    public class BrowseSpeciesStateDetailsModel : BrowseSpeciesDetailsModel
    {
        public State State { get; set; }
    }

    public class BrowseSpeciesSiteDetailsModel : BrowseSpeciesDetailsModel
    {
        [ScaffoldColumn(false)]
        public int SiteId { get; set; }
        [DisplayName("Site")]
        public string SiteName { get; set; }
        [DisplayName("Ownership type")]
        public string OwnershipType { get; set; }
        public string County { get; set; }
    }

    public class BrowseSpeciesModel
    {
        public BrowseSpeciesDetailsModel GlobalDetails { get; set; }
        public IList<StateMeasuredSpecies> StatesContainingSpecies { get; set; }
        public BrowseSpeciesStateDetailsModel StateDetails { get; set; }
        public IList<SiteMeasuredSpecies> SitesInStateContainingSpecies { get; set; }
        public BrowseSpeciesSiteDetailsModel SiteDetails { get; set; }
        public IList<Tree> TreesOfSpeciesContainedBySite { get; set; }
    }

    public class BrowseSiteModel
    {
        public int Id { get; set; }
        public BrowseSubsiteDetailsModel Details { get; set; }
        public IList<BrowsePhotoSumaryModel> PhotoSummaries { get; set; }
        public BrowseSubsiteLocationModel Location { get; set; }
        public IList<SubsiteMeasuredSpecies> Species { get; set; }
        public IList<BrowseSiteVisitModel> Visits { get; set; }
    }

    public class BrowseSiteVisitModel
    {
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime Visited { get; set; }
        [DataType(DataType.Url), DisplayName("Trip report url"), DisplayFormat(NullDisplayText = "(none)"), Emphasize(false)]
        public string TripReportUrl { get; set; }
        [UIHint("ConcatenatedNames"), Emphasize(false)]
        public IList<Name> Visitors { get; set; }
        [DisplayName("General comments"), DisplayFormat(NullDisplayText = "(none)"), Emphasize(false)]
        public string Comments { get; set; }
    }

    public class BrowseSubsiteDetailsModel
    {
        [ScaffoldColumn(false)]
        public int Id { get; set; }
        public string Name { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RHI5 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RHI10 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RHI20 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RGI5 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RGI10 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RGI20 { get; set; }
        [DisplayName("Ownership contact"), DisplayFormat(NullDisplayText = "(no data)")]
        public string OwnershipContactInfo { get; set; }
        [ScaffoldColumn(false)]
        public bool MakeOwnershipContactInfoPublic { get; set; }
        [DisplayName("Last visit"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime LastVisited { get; set; }
        [DisplayName("General comments"), DisplayFormat(NullDisplayText = "(none)"), Emphasize(false)]
        public string LastVisitComments { get; set; }
    }

    public class BrowseSubsiteLocationModel
    {
        [DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Coordinates Coordinates { get; set; }
        [DisplayName("Coordinates (calculated)"), DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Coordinates CalculatedCoordinates { get; set; }
        [ScaffoldColumn(false)]
        public int Id { get; set; }
        [DisplayName("Ownership type")]
        public string OwnershipType { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [Emphasize(false)]
        public MapModel Map { get; set; }
    }

    public class BrowseStateModel
    {
        public int Id { get; set; }
        public Country Country { get; set; }
        public string Name { get; set; }
        public string Code { get; private set; }
        [DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Coordinates Coordinates { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RHI5 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RHI10 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RHI20 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RGI5 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RGI10 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RGI20 { get; set; }
        public IList<StateMeasuredSpecies> Species { get; set; }
        public IList<Subsite> Subsites { get; set; }
    }
}