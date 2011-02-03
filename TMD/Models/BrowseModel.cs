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
using TMD.Model.Imports;

namespace TMD.Models
{
    public class BrowseMenuWidgetModel
    {
        public bool IsSelected { get; set; }
    }

    public class BrowseTreeModel
    {
        public BrowseTreeDetailsModel Details { get; set; }
        public IList<BrowseMeasurementSummaryModel> MeasurementSummaries { get; set; }
        public IList<BrowsePhotoSumaryModel> PhotoSummaries { get; set; }
    }

    public class BrowsePhotoSumaryModel
    {
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime Date { get; set; }
        public IList<IPhoto> Photos { get; set; }
        [UIHint("ConcatenatedNames")]
        public IList<Name> Photographers { get; set; }
    }

    public class BrowseMeasurementSummaryModel
    {
        [ScaffoldColumn(false)]
        public int Id { get; set; }
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")] 
        public DateTime Measured { get; set; }
        [UIHint("ConcatenatedNames")]
        public IList<Name> Measurers { get; set; }
        [DisplayName("General comments"), DisplayFormat(NullDisplayText = "(no general comments)")]
        public string GeneralComments { get; set; } 
    }

    public class BrowseTreeDetailsModel
    {
        [ScaffoldColumn(false)]
        public int Id { get; set; }
        [DisplayName("Scientific name")]
        public string ScientificName { get; set; }
        [DisplayName("Common name")]
        public string CommonName { get; set; }
        [DisplayName("General comments"), DisplayFormat(NullDisplayText = "(none)")]
        public string GeneralComments { get; set; } 
        [DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Distance Height { get; set; }
        [DisplayName("Height measurement method"), DisplayFormat(NullDisplayText = "(no data)"), UIHint("Enum")]
        public TreeHeightMeasurementMethod HeightMeasurementMethod { get; set; }
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
        public virtual Distance Diameter { get; private set; }
        [DisplayName("Conical volume"), DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public virtual Volume ConicalVolume { get; private set; }
    }
}