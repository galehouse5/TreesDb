using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model;
using TMD.Model.Locations;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Models.Browse
{
    public class BrowseStateModel : IGeoAreaMetricsModel
    {
        public int Id { get; set; }
        public Country Country { get; set; }
        public string Name { get; set; }
        public string Code { get; private set; }
        [DisplayFormat(DataFormatString = "Default", NullDisplayText = "(no data)")]
        public Coordinates Coordinates { get; set; }
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
        public EntityGridModel<StateMeasuredSpecies> StateSpeciesModel { get; set; }
        public EntityGridModel<Subsite> SitesModel { get; set; }
    }
}