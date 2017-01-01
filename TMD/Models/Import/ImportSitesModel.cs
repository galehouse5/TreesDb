using System.Collections.Generic;
using System.Linq;
using TMD.Model.Extensions;

namespace TMD.Models.Import
{
    public class ImportSitesModel
    {
        public int Id { get; set; }
        public IList<ImportSiteModel> Sites { get; set; }
        public bool HasOptionalErrors { get; set; }

        public ImportSiteModel FindSiteById(int id)
        {
            return Sites.First(s => id.Equals(s.Id));
        }

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

        public ImportSubsiteModel FindSubsiteById(int id)
        {
            var site = Sites.FirstOrDefault(s => s.FindSubsiteById(id) != null);
            return site == null ? null : site.FindSubsiteById(id);
        }

        public void Initialize()
        {
            if (Sites.Count == 1)
            {
                Sites.Single().IsSaveableAndRemovable = false;
            }
            else
            {
                Sites.ForEach(s => s.IsSaveableAndRemovable = true);
            }
        }
    }
}