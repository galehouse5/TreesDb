using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model;
using TMD.Model.Locations;

namespace TMD.Models.Map
{
    public class MapStateMarkerInfoModel : IGeoAreaMetricsModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Country Country { get; set; }
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
    }
}