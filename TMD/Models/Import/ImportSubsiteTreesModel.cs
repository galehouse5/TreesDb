using System.Collections.Generic;
using System.Linq;

namespace TMD.Models.Import
{
    public class ImportSubsiteTreesModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IList<ImportTreeModel> Trees { get; set; }

        public ImportTreeModel FindTreeById(int id)
        {
            return Trees.FirstOrDefault(t => id.Equals(t.Id));
        }

        public ImportTreeModel AddTree()
        {
            var tree = new ImportTreeModel();
            Trees.Add(tree);
            return tree;
        }

        public bool RemoveTree(ImportTreeModel tree)
        {
            return Trees.Remove(tree);
        }
    }
}