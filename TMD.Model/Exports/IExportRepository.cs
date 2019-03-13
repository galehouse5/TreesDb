using System.Collections.Generic;
using TMD.Model.Trees;

namespace TMD.Model.Exports
{
    public interface IExportRepository
    {
        IReadOnlyCollection<Tree> GetTrees(
            string stateFilter = null,
            string countyFilter = null,
            string siteFilter = null,
            string botanicalNameFilter = null,
            string commonNameFilter = null,
            string botanicalName = null,
            string commonName = null,
            int? stateId = null,
            int? siteId = null,
            int? treeId = null);
    }
}
