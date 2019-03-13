using System.Collections.Generic;
using System.Linq;

namespace TMD.Models.Import
{
    public class ImportSitesModel
    {
        public int Id { get; set; }
        public IList<ImportSiteModel> Sites { get; set; }
        public bool HasOptionalErrors { get; set; }

        public ImportSiteModel FindSiteById(int id)
            => Sites.First(s => id.Equals(s.Id));

        public ImportSiteModel AddSite()
        {
            var site = new ImportSiteModel();
            Sites.Add(site);
            return site;
        }

        public bool RemoveSite(ImportSiteModel site)
        {
            return Sites.Remove(site);
        }

        public void Initialize()
        {
            foreach (var site in Sites)
            {
                site.IsRemovable = Sites.Count > 1;
            }
        }
    }
}