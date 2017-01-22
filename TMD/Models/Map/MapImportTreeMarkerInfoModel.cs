using System.Collections.Generic;
using System.ComponentModel;
using TMD.Model;
using TMD.Model.Photos;

namespace TMD.Models.Map
{
    public class MapImportTreeMarkerInfoModel
    {
        [DisplayName("Scientific name")]
        public string ScientificName { get; set; }
        [DisplayName("Common name")]
        public string CommonName { get; set; }
        public Distance Height { get; set; }
        public Distance Girth { get; set; }
        [DisplayName("Crown spread")]
        public Distance CrownSpread { get; set; }
        public IList<IPhoto> Photos { get; set; }
    }
}