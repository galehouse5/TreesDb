using System.Collections.Generic;
using System.Linq;

namespace TMD.Models.Import
{
    public class ImportTreesModel
    {
        public int Id { get; set; }
        public IList<ImportSiteTreesModel> Sites { get; set; }
        public bool HasOptionalErrors { get; set; }

        public ImportTreeModel FindTreeById(int id)
        {
            var site = FindSiteContainingTreeWithId(id);
            return site == null ? null : site.FindTreeById(id);
        }

        public ImportSiteTreesModel FindSiteContainingTreeWithId(int id)
        {
            return Sites.FirstOrDefault(s => s.FindTreeById(id) != null);
        }

        public ImportSubsiteTreesModel FindSubsiteContainingTreeWithId(int id)
        {
            var site = Sites.FirstOrDefault(s => s.FindSubsiteContainingTreeWithId(id) != null);
            return site == null ? null : site.FindSubsiteContainingTreeWithId(id);
        }

        public ImportSubsiteTreesModel FindSubsiteById(int id)
        {
            var site = Sites.FirstOrDefault(s => s.FindSubsiteById(id) != null);
            return site == null ? null : site.FindSubsiteById(id);
        }

        public void Initialize()
        {
            foreach (ImportSubsiteTreesModel subsite in Sites
                .SelectMany(s => s.Subsites))
            {
                foreach (ImportTreeModel tree in subsite.Trees)
                {
                    tree.IsRemovable = subsite.Trees.Count() > 1;
                }
            }
        }
    }
}