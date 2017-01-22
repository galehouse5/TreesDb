using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model;
using TMD.Model.Photos;

namespace TMD.Models.Map
{
    public class MapTreeMarkerInfoModel
    {
        public int Id { get; set; }
        [DisplayName("Common name")]
        public string CommonName { get; set; }
        [DisplayName("Botanical name")]
        public string ScientificName { get; set; }
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
        public IList<IPhoto> Photos { get; set; }
        [DisplayName("Measured"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime LastMeasured { get; set; }
    }
}