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
            => FindSiteContainingTreeWithId(id)
            ?.FindTreeById(id);

        public ImportSiteTreesModel FindSiteContainingTreeWithId(int id)
            => Sites.FirstOrDefault(s => s.FindTreeById(id) != null);

        public ImportSiteTreesModel FindSiteById(int id)
            => Sites.SingleOrDefault(s => s.Id == id);

        public void Initialize()
        {
            foreach (var site in Sites)
            {
                foreach (ImportTreeModel tree in site.Trees)
                {
                    tree.IsRemovable = site.Trees.Count() > 1;
                }
            }
        }
    }
}