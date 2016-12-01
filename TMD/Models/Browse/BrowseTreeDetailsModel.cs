using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;
using TMD.Model;

namespace TMD.Models.Browse
{
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
        [DisplayName("General comments"), DisplayFormat(NullDisplayText = "(none)"), Emphasize(false), Classification("Comment")]
        public string GeneralComments { get; set; }
        [DisplayFormat(NullDisplayText = "(no data)")]
        public Distance Height { get; set; }
        [DisplayName("Height measurement method"), DisplayFormat(NullDisplayText = "(no data)"), UIHint("Enum")]
        public Model.Imports.TreeHeightMeasurementMethod HeightMeasurementMethod { get; set; }
        [DisplayFormat(DataFormatString = "SubprefixOnly", NullDisplayText = "(no data)")]
        public Distance Girth { get; set; }
        [DisplayName("Crown spread"), DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Distance CrownSpread { get; set; }
        [DisplayFormat(NullDisplayText = "(no data)")]
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
        [DisplayFormat(DataFormatString = "SubprefixOnly", NullDisplayText = "(no data)")]
        public Distance Diameter { get; private set; }
        [DisplayName("Conical volume"), DisplayFormat(NullDisplayText = "(no data)")]
        public Volume ConicalVolume { get; private set; }
        [UIHint("ConcatenatedNames"), Emphasize(false)]
        public IList<Name> Measurers { get; set; }
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime Measured { get; set; }
    }
}