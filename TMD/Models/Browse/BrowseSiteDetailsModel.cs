using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;
using TMD.Model;

namespace TMD.Models.Browse
{
    public class BrowseSiteDetailsModel : IGeoAreaMetricsModel
    {
        [ScaffoldColumn(false)]
        public int Id { get; set; }
        public string Name { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public RuckerIndex? RHI5 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public RuckerIndex? RHI10 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public RuckerIndex? RHI20 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public RuckerIndex? RGI5 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public RuckerIndex? RGI10 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public RuckerIndex? RGI20 { get; set; }
        [DisplayName("Trees measured")]
        public int? TreesMeasuredCount { get; set; }
        [DisplayName("Last measurement date"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime? LastMeasurementDate { get; set; }
        public bool? ContainsEntityWithCoordinates { get; set; }
        [DisplayName("Ownership contact"), DisplayFormat(NullDisplayText = "(no data)")]
        public string OwnershipContactInfo { get; set; }
        [ScaffoldColumn(false)]
        public bool MakeOwnershipContactInfoPublic { get; set; }
        [DisplayName("General comments"), DisplayFormat(NullDisplayText = "(none)"), Emphasize(false), Classification("Comment")]
        public string LastVisitComments { get; set; }
    }
}