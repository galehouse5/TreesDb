using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model;
using TMD.Model.Locations;
using TMD.Model.Photos;

namespace TMD.Models.Map
{
    public class MapSiteMarkerInfoModel : IGeoAreaMetricsModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")]
        public string OwnershipType { get; set; }
        public RuckerIndex? RHI5 { get; set; }
        public RuckerIndex? RHI10 { get; set; }
        public RuckerIndex? RHI20 { get; set; }
        public RuckerIndex? RGI5 { get; set; }
        public RuckerIndex? RGI10 { get; set; }
        public RuckerIndex? RGI20 { get; set; }
        [DisplayName("Trees measured")]
        public int? TreesMeasuredCount { get; set; }
        [DisplayName("Last measurement date"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime? LastMeasurementDate { get; set; }
        public bool? ContainsEntityWithCoordinates { get; set; }
        [DisplayName("Subsites")]
        public int SubsitesCount { get; set; }
        public IList<IPhoto> Photos { get; set; }
    }
}