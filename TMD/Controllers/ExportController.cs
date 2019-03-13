using System.Web.Mvc;
using TMD.ActionResults;
using TMD.Model;
using TMD.Model.Exports;
using TMD.Model.Extensions;
using TMD.Model.Locations;
using TMD.Model.Users;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public partial class ExportController : ControllerBase
    {
        // TODO: Inject these dependencies through the constructor.
        private TreeCsvExporter treesExporter = new TreeCsvExporter();
        private IExportRepository repository = Repositories.Exports;

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult Trees(int id)
        {
            var tree = Repositories.Trees.FindById(id);
            if (tree == null) return new NotFoundResult();

            var trees = repository.GetTrees(treeId: tree.Id);
            return new CsvFileResult(treesExporter.Export(trees),
                $"Tree-{tree.Id} ({UserSession.Units.Describe()}).csv");
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult Sites(int id)
        {
            var site = Repositories.Sites.FindById(id);
            if (site == null) return new NotFoundResult();

            var trees = repository.GetTrees(siteId: id);

            treesExporter.Identifiers["Site"] = site.Id.ToString();
            return new CsvFileResult(treesExporter.Export(trees), treesExporter.Filename);
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult SitesSpecies(int id, string botanicalName)
        {
            var site = Repositories.Sites.FindById(id);
            if (site == null) return new NotFoundResult();

            var trees = repository.GetTrees(siteId: site.Id, botanicalName: botanicalName);

            treesExporter.Identifiers["Site"] = site.Id.ToString();
            treesExporter.Identifiers["Species"] = botanicalName;
            return new CsvFileResult(treesExporter.Export(trees), treesExporter.Filename);
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult States(int id)
        {
            var state = Repositories.Locations.FindStateById(id);
            if (state == null) return new NotFoundResult();

            var trees = repository.GetTrees(stateId: state.Id);

            treesExporter.Identifiers["State"] = state.Code;
            return new CsvFileResult(treesExporter.Export(trees), treesExporter.Filename);
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult StatesSpecies(int id, string botanicalName)
        {
            State state = Repositories.Locations.FindStateById(id);
            if (state == null) return new NotFoundResult();

            var trees = repository.GetTrees(stateId: state.Id, botanicalName: botanicalName);

            treesExporter.Identifiers["State"] = state.Code;
            treesExporter.Identifiers["Species"] = botanicalName;
            return new CsvFileResult(treesExporter.Export(trees), treesExporter.Filename);
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult Species(string botanicalName, string commonName)
        {
            var trees = repository.GetTrees(botanicalName: botanicalName, commonName: commonName);

            treesExporter.Identifiers["Botanical Name"] = botanicalName;
            return new CsvFileResult(treesExporter.Export(trees), treesExporter.Filename);
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult SpeciesByFilters(string botanicalNameFilter, string commonNameFilter)
        {
            var trees = repository.GetTrees(botanicalNameFilter: botanicalNameFilter, commonNameFilter: commonNameFilter);

            treesExporter.Identifiers["Botanical Name"] = botanicalNameFilter;
            treesExporter.Identifiers["Common Name"] = commonNameFilter;
            return new CsvFileResult(treesExporter.Export(trees), treesExporter.Filename);
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult LocationsByFilters(string stateFilter, string countyFilter, string siteFilter)
        {
            var trees = repository.GetTrees(stateFilter: stateFilter, countyFilter: countyFilter, siteFilter: siteFilter);

            treesExporter.Identifiers["State"] = stateFilter;
            treesExporter.Identifiers["County"] = countyFilter;
            treesExporter.Identifiers["Site"] = siteFilter;
            return new CsvFileResult(treesExporter.Export(trees), treesExporter.Filename);
        }
    }
}
