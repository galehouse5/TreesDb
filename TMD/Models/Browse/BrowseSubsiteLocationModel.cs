﻿using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Locations;
using TMD.Models.Map;

namespace TMD.Models.Browse
{
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
}