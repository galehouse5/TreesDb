using System.Collections.Generic;
using System.ComponentModel;
using TMD.Model.Locations;
using TMD.Model.Photos;

namespace TMD.Models.Map
{
    public class MapImportSubsiteMarkerInfoModel
    {
        public string Name { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")]
        public string OwnershipType { get; set; }
        public IList<IPhoto> Photos { get; set; }
    }
}