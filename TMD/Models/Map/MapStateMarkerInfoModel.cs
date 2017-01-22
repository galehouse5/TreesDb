using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model.Locations;

namespace TMD.Models.Map
{
    public class MapStateMarkerInfoModel : IGeoAreaMetricsModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Country Country { get; set; }
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
        [DisplayName("Trees measured")]
        public int? TreesMeasuredCount { get; set; }
        [DisplayName("Last measurement date"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime? LastMeasurementDate { get; set; }
        public bool? ContainsEntityWithCoordinates { get; set; }
    }
}