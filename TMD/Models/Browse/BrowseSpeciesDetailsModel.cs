using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model;
using TMD.Model.Locations;

namespace TMD.Models.Browse
{
    public class BrowseSpeciesDetailsModel
    {
        [DisplayName("Botanical name")]
        public string ScientificName { get; set; }
        [DisplayName("Common name")]
        public string CommonName { get; set; }
        [DisplayName("Max height"), DisplayFormat(NullDisplayText = "(no data)")]
        public Distance MaxHeight { get; set; }
        [ScaffoldColumn(false)]
        public int MaxHeightTreeId { get; set; }
        [DisplayName("Max girth"), DisplayFormat(DataFormatString = "SubprefixOnly", NullDisplayText = "(no data)")]
        public Distance MaxGirth { get; set; }
        [ScaffoldColumn(false)]
        public int MaxGirthTreeId { get; set; }
        [DisplayName("Max crown spread"), DisplayFormat(NullDisplayText = "(no data)")]
        public Distance MaxCrownSpread { get; set; }
        [ScaffoldColumn(false)]
        public int MaxCrownSpreadTreeId { get; set; }
    }

    public class BrowseSpeciesStateDetailsModel : BrowseSpeciesDetailsModel
    {
        public State State { get; set; }
    }

    public class BrowseSpeciesSiteDetailsModel : BrowseSpeciesDetailsModel
    {
        [ScaffoldColumn(false)]
        public int SiteId { get; set; }
        [DisplayName("Site")]
        public string SiteName { get; set; }
        [DisplayName("Ownership type")]
        public string OwnershipType { get; set; }
        public string County { get; set; }
    }
}