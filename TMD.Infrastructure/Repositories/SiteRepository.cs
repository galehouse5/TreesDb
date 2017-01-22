﻿using NHibernate;
using NHibernate.Criterion;
using NHibernate.Transform;
using System;
using System.Collections.Generic;
using System.Linq;
using TMD.Model;
using TMD.Model.Extensions;
using TMD.Model.Locations;
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
            Registry.Session.CreateCriteria<Tree>()
                .SetFetchMode(nameof(Tree.Photos), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Tree>();
            Registry.Session.CreateCriteria<Subsite>()
                .SetFetchMode(nameof(Subsite.Trees), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Subsite>();
            Registry.Session.CreateCriteria<Subsite>()
                .SetFetchMode(nameof(Subsite.State), FetchMode.Eager)
                .SetFetchMode(nameof(Subsite.Photos), FetchMode.Eager)
                .SetResultTransformer(Transformers.DistinctRootEntity)
                .Future<Subsite>();
            return Registry.Session.CreateCriteria<Site>()
                .SetFetchMode(nameof(Site.Subsites), FetchMode.Eager)
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

        public IEnumerable<Subsite> SearchSubsites(string expression, int maxResults)
        {
            return Registry.Session.CreateSQLQuery(
@"select subsite.*
from dbo.SearchSubsites(:expression) rank
join Sites.Subsites subsite
    on subsite.Id = rank.Id
order by rank.Rank desc")
                .AddEntity(typeof(Subsite))
                .SetParameter("expression", expression)
                .SetMaxResults(maxResults)
                .List<Subsite>();
        }

        public IEnumerable<SubsiteVisit> ListRecentSubsiteVisits(int maxResults)
            => Registry.Session.CreateCriteria<SubsiteVisit>()
            .SetFetchMode(nameof(SubsiteVisit.State), FetchMode.Eager)
            .SetFetchMode(nameof(SubsiteVisit.Subsite), FetchMode.Eager)
            .SetFetchMode($"{nameof(SubsiteVisit.Subsite)}.{nameof(Subsite.Site)}", FetchMode.Eager)
            .SetFetchMode(nameof(SiteVisit.Visitors), FetchMode.Eager)
            .SetResultTransformer(Transformers.DistinctRootEntity)
            .AddOrder(Order.Desc(nameof(SubsiteVisit.Visited)))
            // Fetching visitors creates in a cross product, which inflates the row count.  Doubling the row
            // count should accommodate this usually, as the average subsite visit has less than two visitors.
            .SetMaxResults(maxResults * 2)
            .List<SubsiteVisit>()
            .Take(maxResults);
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
            if (!string.IsNullOrEmpty(browser.CountyFilter))
            {
                criteria.Add(Restrictions.Like(nameof(Subsite.County), browser.CountyFilter, MatchMode.Anywhere));
            }
            return criteria;
        }

        public static ICriteria ApplySorting(this ICriteria criteria, SubsiteBrowser browser)
        {
            switch (browser.SortProperty)
            {
                case SubsiteBrowser.Property.Site:
                    return criteria.AddOrder(new Order($"site.{nameof(Site.Name)}", browser.SortAscending));
                case SubsiteBrowser.Property.State:
                    return criteria.AddOrder(new Order($"state.{nameof(State.Name)}", browser.SortAscending));
                case SubsiteBrowser.Property.County:
                    return criteria.AddOrder(new Order(nameof(Subsite.County), browser.SortAscending));
                case SubsiteBrowser.Property.RHI5:
                    return criteria.AddOrder(new Order(nameof(Subsite.ComputedRHI5), browser.SortAscending));
                case SubsiteBrowser.Property.RHI10:
                    return criteria.AddOrder(new Order(nameof(Subsite.ComputedRHI10), browser.SortAscending));
                case SubsiteBrowser.Property.RGI5:
                    return criteria.AddOrder(new Order(nameof(Subsite.ComputedRGI5), browser.SortAscending));
                case SubsiteBrowser.Property.RGI10:
                    return criteria.AddOrder(new Order(nameof(Subsite.ComputedRGI10), browser.SortAscending));
                case SubsiteBrowser.Property.LastMeasurement:
                    return criteria.AddOrder(new Order(nameof(Subsite.ComputedLastMeasurementDate), browser.SortAscending));
                default:
                    return criteria.AddOrder(new Order(nameof(Subsite.ComputedLastMeasurementDate), ascending: false));
            }
        }
    }
}
