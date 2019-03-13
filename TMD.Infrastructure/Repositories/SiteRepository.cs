using NHibernate;
using NHibernate.Criterion;
using NHibernate.Transform;
using System;
using System.Collections.Generic;
using System.Linq;
using TMD.Model;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Infrastructure.Repositories
{
    public class SiteRepository : ISiteRepository
    {
        public void Save(Site site)
        {
            Registry.Session.Save(site);
        }

        public Site FindById(int id)
        {
            return Registry.Session.Get<Site>(id);
        }

        public void Merge(Site site)
        {
            var candidateSites = ListByProximity(site.CalculatedCoordinates, Site.CoordinateMinutesEquivalenceProximity);
            foreach (var candidateSite in candidateSites)
            {
                if (candidateSite.ShouldMerge(site))
                {
                    candidateSite.Merge(site);
                    Registry.Session.Save(candidateSite);
                    return;
                }
            }
            Registry.Session.Save(site);
        }

        public IList<Site> ListByProximity(Coordinates coordinates, float minutesDistance)
        {
            return Registry.Session.CreateCriteria<Site>()
                .Add(Expression.Conjunction()
                    .Add(Expression.Le("CalculatedCoordinates.Latitude.TotalDegrees", coordinates.Latitude.AddMinutes(minutesDistance).TotalDegrees))
                    .Add(Expression.Ge("CalculatedCoordinates.Latitude.TotalDegrees", coordinates.Latitude.SubtractMinutes(minutesDistance).TotalDegrees))
                    .Add(Expression.Le("CalculatedCoordinates.Longitude.TotalDegrees", coordinates.Longitude.AddMinutes(minutesDistance).TotalDegrees))
                    .Add(Expression.Ge("CalculatedCoordinates.Longitude.TotalDegrees", coordinates.Longitude.SubtractMinutes(minutesDistance).TotalDegrees))
                ).List<Site>();
        }

        public IList<Site> ListAll()
        {
            return Registry.Session.CreateCriteria<Site>()
                .List<Site>();
        }

        public void RemoveVisitsByTrip(Model.Imports.Trip trip)
        {
            var sites = Registry.Session.CreateCriteria<Site>()
                .CreateAlias("Visits", "visit")
                .CreateAlias("visit.ImportingTrip", "importingTrip")
                .Add(Restrictions.Eq("importingTrip.Id", trip.Id))
                .List<Site>();
            foreach (var site in sites)
            {
                foreach (var visitToRemove in site.Visits
                    .Where(v => v.ImportingTrip.Equals(trip))
                    .ToArray())
                {
                    site.RemoveVisit(visitToRemove);
                }

                if (site.Visits.Count < 1)
                {
                    Registry.Session.Delete(site);
                }
            }
        }

        public IList<Site> ListAllForMap()
        {
            Registry.Session.CreateCriteria<Tree>()
                .SetFetchMode(nameof(Tree.Photos), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Tree>();
            Registry.Session.CreateCriteria<Site>()
                .SetFetchMode(nameof(Site.Trees), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Site>();
            Registry.Session.CreateCriteria<Site>()
                .SetFetchMode(nameof(Site.Photos), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Site>();

            return Registry.Session.CreateCriteria<Site>()
                .SetFetchMode(nameof(Site.State), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Site>().ToList();
        }

        public void Remove(Site site)
        {
            Registry.Session.Delete(site);
        }

        public EntityPage<Site> ListAllSites(SiteBrowser browser)
            => CriteriaExtensions.ListAllEntitiesByBrowser<Site>(
                browserAliaser: criteria => criteria.CreateAlias("State", "state"),
                browserFilterer: browser.HasFilters ? criteria => criteria.ApplyFilters(browser) : (Action<ICriteria>)null,
                browserSorter: criteria => criteria.ApplySorting(browser),
                browserPager: criteria => criteria.ApplyPaging(browser));

        public IList<Site> FindSitesByStateId(int stateId)
            => Registry.Session.CreateCriteria<Site>()
            .Add(Restrictions.Eq("State.Id", stateId))
            .AddOrder(Order.Asc("Name"))
            .List<Site>();

        public IEnumerable<Site> SearchSites(string expression, int maxResults)
            => Registry.Session.CreateSQLQuery(
@"select site.*
from dbo.SearchSites(:expression) rank
join Sites.Sites site
    on site.Id = rank.Id
order by rank.Rank desc")
            .AddEntity(typeof(Site))
            .SetParameter("expression", expression)
            .SetMaxResults(maxResults)
            .List<Site>();

        public IEnumerable<SiteVisit> ListRecentSiteVisits(int maxResults)
            => Registry.Session.CreateCriteria<SiteVisit>()
            .SetFetchMode(nameof(SiteVisit.State), FetchMode.Eager)
            .SetFetchMode(nameof(SiteVisit.Site), FetchMode.Eager)
            .SetFetchMode(nameof(SiteVisit.Visitors), FetchMode.Eager)
            .SetResultTransformer(Transformers.DistinctRootEntity)
            .AddOrder(Order.Desc(nameof(SiteVisit.Visited)))
            // Fetching visitors creates in a cross product, which inflates the row count. Doubling the row
            // count should accommodate this usually, as the average site visit has less than two visitors.
            .SetMaxResults(maxResults * 2)
            .List<SiteVisit>()
            .Take(maxResults);
    }
}
