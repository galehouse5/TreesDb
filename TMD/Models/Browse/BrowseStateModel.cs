using System.ComponentModel.DataAnnotations;
using TMD.Model;
using TMD.Model.Locations;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Models.Browse
{
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
        public EntityGridModel<StateMeasuredSpecies> StateSpeciesModel { get; set; }
        public EntityGridModel<Subsite> SitesModel { get; set; }
    }
}