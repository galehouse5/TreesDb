using System.Collections.Generic;

namespace TMD.Models.Import
{
    public class ImportFinishedSiteModel
    {
        public string Name { get; set; }
        public IList<ImportFinishedSubsiteModel> Subsites { get; set; }
    }
}