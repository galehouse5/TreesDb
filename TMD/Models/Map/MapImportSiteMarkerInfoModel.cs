using System.Collections.Generic;

namespace TMD.Models.Map
{
    public class MapImportSiteMarkerInfoModel
    {
        public string Name { get; set; }
        public int SubsitesCount { get; set; }
        public IList<MapImportSubsiteMarkerInfoModel> Subsites { get; set; }
    }
}