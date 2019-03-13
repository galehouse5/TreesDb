using System.Collections.Generic;
using System.Linq;

namespace TMD.Models.Import
{
    public class ImportSiteTreesModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IList<ImportTreeModel> Trees { get; set; }

        public ImportTreeModel FindTreeById(int id)
            => Trees.FirstOrDefault(t => id.Equals(t.Id));

        public ImportTreeModel AddTree()
        {
            var tree = new ImportTreeModel();
            Trees.Add(tree);
            return tree;
        }

        public bool RemoveTree(ImportTreeModel tree)
            => Trees.Remove(tree);
    }
}