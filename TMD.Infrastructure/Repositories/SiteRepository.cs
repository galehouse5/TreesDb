using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Sites;
using TMD.Model;
using NHibernate.Criterion;
using TMD.Model.Extensions;
using NHibernate.Transform;
using NHibernate;

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
            var subsites = Registry.Session.CreateCriteria<Subsite>()
                .CreateAlias("Visits", "visit")
                .CreateAlias("visit.ImportingTrip", "importingTrip")
                .Add(Restrictions.Eq("importingTrip.Id", trip.Id))
                .List<Subsite>();
            foreach (var subsite in subsites)
            {
                // evaluate where clause immediately by calling ToList() to avoid modification of collection during enumeration
                foreach (var visitToRemove in subsite.Visits.Where(visit => visit.ImportingTrip.Equals(trip)).ToList())
                {
                    subsite.RemoveVisit(visitToRemove);
                }
                if (subsite.Visits.Count < 1)
                {
                    Registry.Session.Delete(subsite);
                }
            }
            var sites = Registry.Session.CreateCriteria<Site>()
                .CreateAlias("Visits", "visit")
                .CreateAlias("visit.ImportingTrip", "importingTrip")
                .Add(Restrictions.Eq("importingTrip.Id", trip.Id))
                .List<Site>();
            foreach (var site in sites)
            {
                site.Visits.RemoveAll(visit => visit.ImportingTrip.Equals(trip));
                if (site.Visits.Count < 1)
                {
                    Registry.Session.Delete(site);
                }
            }
        }

        public IList<Site> ListAllForMap()
        {
            Registry.Session.CreateCriteria<Model.Trees.Tree>()
                .SetFetchMode("Species", NHibernate.FetchMode.Eager)
                .SetFetchMode("Photos", NHibernate.FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Model.Trees.Tree>();
            Registry.Session.CreateCriteria<Subsite>()
                .SetFetchMode("Trees", NHibernate.FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Subsite>();
            Registry.Session.CreateCriteria<Subsite>()
                .SetFetchMode("Photos", NHibernate.FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Subsite>();
            return Registry.Session.CreateCriteria<Site>()
                .SetFetchMode("Subsites", NHibernate.FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Site>().ToList();
        }

        public void Remove(Site site)
        {
            Registry.Session.Delete(site);
        }

        public EntityPage<Subsite> ListAllSubsites(SubsiteBrowser browser)
        {
            return CriteriaExtensions.ListAllEntitiesByBrowser<Subsite>(
                browserAliaser: criteria => criteria
                    .CreateAlias("Site", "site")
                    .CreateAlias("State", "state"),
                browserFilterer: browser.HasFilters ? criteria => criteria.ApplyFilters(browser) : (Action<ICriteria>)null,
                browserSorter: criteria => criteria.ApplySorting(browser),
                browserPager: criteria => criteria.ApplyPaging(browser));
        }

        public IList<Subsite> FindSubsitesByStateId(int stateId)
        {
            return Registry.Session.CreateCriteria<Subsite>()
                .CreateAlias("Site", "site")
                .Add(Restrictions.Eq("State.Id", stateId))
                .AddOrder(Order.Asc("site.Name")).AddOrder(Order.Asc("Name"))
                .List<Subsite>();
        }
    }

    public static class SubsiteBrowserExtensions
    {
        public static ICriteria ApplyFilters(this ICriteria criteria, SubsiteBrowser browser)
        {
            if (!string.IsNullOrEmpty(browser.SiteFilter))
            {
                criteria.Add(Restrictions.Like("site.Name", browser.SiteFilter, MatchMode.Anywhere));
            }
            if (!string.IsNullOrEmpty(browser.SubsiteFilter))
            {
                criteria.Add(Restrictions.Like("Name", browser.SubsiteFilter, MatchMode.Anywhere));
            }
            if (!string.IsNullOrEmpty(browser.StateFilter))
            {
                criteria.Add(Restrictions.Like("state.Name", browser.StateFilter, MatchMode.Anywhere));
            }
            return criteria;
        }

        public static ICriteria ApplySorting(this ICriteria criteria, SubsiteBrowser browser)
        {
            if (browser.SortProperty.HasValue)
            {
                switch (browser.SortProperty.Value)
                {
                    case SubsiteBrowser.Property.Site :
                        return criteria.AddOrder(new Order("site.Name", browser.SortAscending));
                    case SubsiteBrowser.Property.State :
                        return criteria.AddOrder(new Order("state.Name", browser.SortAscending));
                    case SubsiteBrowser.Property.Subsite :
                        return criteria.AddOrder(new Order("Name", browser.SortAscending));
                    default: throw new NotImplementedException();
                }
            }
            return criteria;
        }
    }
}
