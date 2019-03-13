using NHibernate;
using NHibernate.Criterion;
using NHibernate.Transform;
using System.Collections.Generic;
using System.Linq;
using TMD.Model.Exports;
using TMD.Model.Locations;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Infrastructure.Repositories
{
    public class ExportRepository : IExportRepository
    {
        // TODO: Inject this dependency through the constructor.
        private ISession session => Registry.Session;

        protected DetachedCriteria CreateTreeCriteria(
            string botanicalNameFilter, string commonNameFilter, string botanicalName, string commonName, int? treeId)
        {
            DetachedCriteria criteria = DetachedCriteria.For<Tree>("tree");
            if (!string.IsNullOrEmpty(botanicalNameFilter)) { criteria.Add(Restrictions.Like(nameof(Tree.ScientificName), botanicalNameFilter, MatchMode.Anywhere)); }
            if (!string.IsNullOrEmpty(commonNameFilter)) { criteria.Add(Restrictions.Like(nameof(Tree.CommonName), commonNameFilter, MatchMode.Anywhere)); }
            if (!string.IsNullOrEmpty(botanicalName)) { criteria.Add(Restrictions.Eq(nameof(Tree.ScientificName), botanicalName)); }
            if (!string.IsNullOrEmpty(commonName)) { criteria.Add(Restrictions.Eq(nameof(Tree.CommonName), commonName)); }
            if (treeId.HasValue) { criteria.Add(Restrictions.Eq(nameof(Tree.Id), treeId)); }
            return criteria;
        }

        protected DetachedCriteria CreateSiteCriteria(
            string stateFilter, string countyFilter, int? stateId, string siteFilter, int? siteId)
        {
            DetachedCriteria criteria = DetachedCriteria.For<Site>("site")
                .CreateAlias(nameof(Site.State), "state");
            if (!string.IsNullOrEmpty(stateFilter)) { criteria.Add(Restrictions.Like($"state.{nameof(State.Name)}", stateFilter, MatchMode.Anywhere)); }
            if (!string.IsNullOrEmpty(countyFilter)) { criteria.Add(Restrictions.Like(nameof(Site.County), countyFilter, MatchMode.Anywhere)); }
            if (stateId.HasValue) { criteria.Add(Restrictions.Eq($"state.{nameof(State.Id)}", stateId)); }
            if (!string.IsNullOrEmpty(siteFilter)) { criteria.Add(Restrictions.Like(nameof(Site.Name), siteFilter, MatchMode.Anywhere)); }
            if (siteId.HasValue) { criteria.Add(Restrictions.Eq(nameof(Site.Id), siteId)); }
            return criteria;
        }

        protected DetachedCriteria CreateCompositeTreeCriteria(
            string stateFilter, string countyFilter, string siteFilter, string botanicalNameFilter, string commonNameFilter, string botanicalName, string commonName, int? stateId, int? siteId, int? treeId)
            => CreateTreeCriteria(botanicalNameFilter, commonNameFilter, botanicalName, commonName, treeId)
            .Add(Subqueries.Exists(CreateSiteCriteria(stateFilter, countyFilter, stateId, siteFilter, siteId)
                .Add(Restrictions.EqProperty($"site.{nameof(Site.Id)}", $"tree.{nameof(Tree.Site)}.{nameof(Site.Id)}"))
                .SetProjection(Projections.Id())));

        protected DetachedCriteria CreateCompositeSiteCriteria(
            string stateFilter, string countyFilter, string siteFilter, string botanicalNameFilter, string commonNameFilter, string botanicalName, string commonName, int? stateId, int? siteId, int? treeId)
            => CreateSiteCriteria(stateFilter, countyFilter, stateId, siteFilter, siteId)
            .Add(Subqueries.Exists(CreateTreeCriteria(botanicalNameFilter, commonNameFilter, botanicalName, commonName, treeId)
                .Add(Restrictions.EqProperty($"tree.{nameof(Tree.Site)}.{nameof(Site.Id)}", $"site.{nameof(Site.Id)}"))
                .SetProjection(Projections.Id())));

        // See guidelines for eager loading data with NHibernate here: https://ayende.com/blog/4367/eagerly-loading-entity-associations-efficiently-with-nhibernate
        public IReadOnlyCollection<Tree> GetTrees(
            string stateFilter, string countyFilter, string siteFilter, string botanicalNameFilter, string commonNameFilter, string botanicalName, string commonName, int? stateId, int? siteId, int? treeId)
        {
            CreateCompositeSiteCriteria(stateFilter, countyFilter, siteFilter, botanicalNameFilter, commonNameFilter, botanicalName, commonName, stateId, siteId, treeId)
                .GetExecutableCriteria(session)
                .SetFetchMode(nameof(Site.Visits), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Site>();

            CreateCompositeSiteCriteria(stateFilter, countyFilter, siteFilter, botanicalNameFilter, commonNameFilter, botanicalName, commonName, stateId, siteId, treeId)
                .GetExecutableCriteria(session)
                .SetFetchMode(nameof(Site.Visits), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Site>();

            CreateCompositeSiteCriteria(stateFilter, countyFilter, siteFilter, botanicalNameFilter, commonNameFilter, botanicalName, commonName, stateId, siteId, treeId)
                .GetExecutableCriteria(session)
                .SetFetchMode(nameof(Site.State), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Site>();

            CreateCompositeTreeCriteria(stateFilter, countyFilter, siteFilter, botanicalNameFilter, commonNameFilter, botanicalName, commonName, stateId, siteId, treeId)
                .GetExecutableCriteria(session)
                .SetFetchMode(nameof(Tree.Measurers), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Tree>();

            CreateCompositeTreeCriteria(stateFilter, countyFilter, siteFilter, botanicalNameFilter, commonNameFilter, botanicalName, commonName, stateId, siteId, treeId)
                .GetExecutableCriteria(session)
                .SetFetchMode(nameof(Tree.Photos), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Tree>();

            var trees = CreateCompositeTreeCriteria(stateFilter, countyFilter, siteFilter, botanicalNameFilter, commonNameFilter, botanicalName, commonName, stateId, siteId, treeId)
                .GetExecutableCriteria(session)
                .SetFetchMode(nameof(Tree.Measurements), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Tree>();

            return trees
                .OrderBy(t => t.Site.State.Code)
                .ThenBy(t => t.Site.County)
                .ThenBy(t => t.Site.Name)
                .ThenBy(t => t.CommonName)
                .ThenBy(t => t.ScientificName)
                .ThenBy(t => t.Height.Feet)
                .ToArray();
        }
    }
}
