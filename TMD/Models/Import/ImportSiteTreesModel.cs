using System.Collections.Generic;
using System.Linq;

namespace TMD.Models.Import
{
    public class ImportSiteTreesModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IList<ImportSubsiteTreesModel> Subsites { get; set; }

        public ImportTreeModel FindTreeById(int id)
        {
            var subsite = FindSubsiteContainingTreeWithId(id);
            return subsite == null ? null : subsite.FindTreeById(id);
        }

        public ImportSubsiteTreesModel FindSubsiteContainingTreeWithId(int id)
        {
            return Subsites.FirstOrDefault(ss => ss.FindTreeById(id) != null);
        }

        public ImportSubsiteTreesModel FindSubsiteById(int id)
        {
            return Subsites.FirstOrDefault(ss => id.Equals(ss.Id));
        }
    }
}