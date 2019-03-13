using System.Collections.Generic;
using System.ComponentModel;
using TMD.Model.Locations;

namespace TMD.Models.Import
{
    public class ImportFinishedSiteModel
    {
        public string Name { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")]
        public string OwnershipType { get; set; }
        public IList<ImportFinishedTreeModel> Trees { get; set; }
        public PhotoGalleryModel Photos { get; set; }
    }
}