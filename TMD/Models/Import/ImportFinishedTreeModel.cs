using System.ComponentModel;
using TMD.Model;

namespace TMD.Models.Import
{
    public class ImportFinishedTreeModel
    {
        [DisplayName("Common name")]
        public string CommonName { get; set; }
        [DisplayName("Scientific name")]
        public string ScientificName { get; set; }
        public Distance Height { get; set; }
        public Distance Girth { get; set; }
        [DisplayName("Crown spread")]
        public Distance CrownSpread { get; set; }
        public PhotoGalleryModel Photos { get; set; }
    }
}