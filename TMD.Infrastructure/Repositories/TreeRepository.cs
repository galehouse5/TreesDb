using NHibernate;
using NHibernate.Criterion;
using System;
using System.Collections.Generic;
using System.Linq;
using TMD.Infrastructure.StringComparison;
using TMD.Model;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Infrastructure.Repositories
{
    public class TreeRepository : ITreeRepository
    {
        public Tree FindById(int id)
        {
            return Registry.Session.Get<Tree>(id);
        }

        public void Save(Tree tree)
        {
            Registry.Session.Save(tree);
        }

        public void RemoveMeasurementsByTrip(Model.Imports.Trip trip)
        {
            var trees = Registry.Session.CreateCriteria<Tree>()
                .CreateAlias("Measurements", "measurement")
                .CreateAlias("measurement.ImportingTrip", "importingTrip")
                .Add(Restrictions.Eq("importingTrip.Id", trip.Id))
                .List<Tree>();
            foreach (var tree in trees)
            {
                // evaluate where clause immediately by calling ToList() to avoid modification of collection during enumeration
                foreach (var measurementToRemove in tree.Measurements.Where(measurement => measurement.ImportingTrip.Equals(trip)).ToList())
                {
                    tree.RemoveMeasurement(measurementToRemove);
                }
                if (tree.Measurements.Count < 1)
                {
                    Registry.Session.Delete(tree);
                }
            }
        }

        private StringComparisonExpression m_AcceptedSymbolRanker = StringComparisonExpression.Create("equality * 100");
        private StringComparisonExpression m_CommonNameRanker = StringComparisonExpression.Create("jaro * firstlength");
        private StringComparisonExpression m_ScientificNameRanker = StringComparisonExpression.Create("jarowinkler * firstlength");

        public IList<KnownSpecies> ListKnownSpeciesBySimilarCommonName(string commonName, int results)
        {
            var all = Registry.Session.CreateCriteria<KnownSpecies>().List<KnownSpecies>();
            var ranked = from tree in all
                         select new {
                             Rank = m_AcceptedSymbolRanker.RateWordSimilarity(commonName, tree.AcceptedSymbol)
                                + m_CommonNameRanker.RateSentenceSimilarity(commonName, tree.CommonName) * 4
                                + m_ScientificNameRanker.RateSentenceSimilarity(commonName, tree.ScientificName),    
                            Tree = tree
                         };
            var sorted = from tree in ranked
                         orderby tree.Rank descending
                         where tree.Rank >= tree.Tree.CommonName.Length
                         select tree.Tree;
            return sorted.Take(results).ToList();
        }


        public IList<KnownSpecies> ListKnownSpeciesBySimilarScientificName(string scientificName, int results)
        {
            var all = Registry.Session.CreateCriteria<KnownSpecies>().List<KnownSpecies>();
            var ranked = from tree in all
                         select new
                         {
                             Rank = m_AcceptedSymbolRanker.RateWordSimilarity(scientificName, tree.AcceptedSymbol)
                                + m_CommonNameRanker.RateSentenceSimilarity(scientificName, tree.CommonName)
                                + m_ScientificNameRanker.RateSentenceSimilarity(scientificName, tree.ScientificName) * 4,
                             Tree = tree
                         };
            var sorted = from tree in ranked
                         orderby tree.Rank descending
                         where tree.Rank >= tree.Tree.CommonName.Length
                         select tree.Tree;
            return sorted.Take(results).ToList();
        }

        public IList<Tree> ListAll()
        {
            return Registry.Session.CreateCriteria<Tree>().List<Tree>();
        }

        public EntityPage<T> ListAllMeasuredSpecies<T>(SpeciesBrowser browser) where T : MeasuredSpecies
        {
            return CriteriaExtensions.ListAllEntitiesByBrowser<T>(
                browserFilterer: browser.HasFilters ? criteria => criteria.ApplyFilters(browser) : (Action<ICriteria>)null,
                browserSorter: criteria => criteria.ApplySorting(browser),
                browserPager: criteria => criteria.ApplyPaging(browser));
        }

        public IList<StateMeasuredSpecies> ListMeasuredSpeciesForStatesByName(string botanicalName, string commonName)
        {
            return Registry.Session.CreateCriteria<StateMeasuredSpecies>()
                .CreateAlias("State", "state")
                .Add(Restrictions.Eq("ScientificName", botanicalName) 
                    & Restrictions.Eq("CommonName", commonName))
                .AddOrder(Order.Asc("state.Name"))
                .List<StateMeasuredSpecies>();
        }

        public IList<SubsiteMeasuredSpecies> ListMeasuredSpeciesBySubsiteId(int id)
        {
            return Registry.Session.CreateCriteria<SubsiteMeasuredSpecies>()
                .Add(Restrictions.Eq("Subsite.Id", id))
                .AddOrder(Order.Asc("ScientificName"))
                .List<SubsiteMeasuredSpecies>();
        }

        public IList<StateMeasuredSpecies> ListMeasuredSpeciesByStateId(int id)
        {
            return Registry.Session.CreateCriteria<StateMeasuredSpecies>()
                .Add(Restrictions.Eq("State.Id", id))
                .AddOrder(Order.Asc("ScientificName"))
                .List<StateMeasuredSpecies>();
        }

        public GlobalMeasuredSpecies FindMeasuredSpeciesByName(string botanicalName, string commonName)
        {
            return Registry.Session.CreateCriteria<GlobalMeasuredSpecies>()
                .Add(Restrictions.Eq("ScientificName", botanicalName)
                    & Restrictions.Eq("CommonName", commonName))
                .UniqueResult<GlobalMeasuredSpecies>();
        }

        public StateMeasuredSpecies FindMeasuredSpeciesByNameAndStateId(string botanicalName, string commonName, int stateId)
        {
            return Registry.Session.CreateCriteria<StateMeasuredSpecies>()
                .Add(Restrictions.Eq("ScientificName", botanicalName)
                    & Restrictions.Eq("CommonName", commonName)
                    & Restrictions.Eq("State.Id", stateId))
                .UniqueResult<StateMeasuredSpecies>();
        }

        public SiteMeasuredSpecies FindMeasuredSpeciesByNameAndSiteId(string botanicalName, string commonName, int siteId)
        {
            return Registry.Session.CreateCriteria<SiteMeasuredSpecies>()
                .Add(Restrictions.Eq("ScientificName", botanicalName)
                    & Restrictions.Eq("CommonName", commonName)
                    & Restrictions.Eq("Site.Id", siteId))
                .UniqueResult<SiteMeasuredSpecies>();
        }

        public SubsiteMeasuredSpecies FindMeasuredSpeciesByNameAndSubsiteId(string botanicalName, string commonName, int subsiteId)
        {
            return Registry.Session.CreateCriteria<SubsiteMeasuredSpecies>()
                .Add(Restrictions.Eq("ScientificName", botanicalName)
                    & Restrictions.Eq("CommonName", commonName)
                    & Restrictions.Eq("Subsite.Id", subsiteId))
                .UniqueResult<SubsiteMeasuredSpecies>();
        }

        public IList<SiteMeasuredSpecies> ListMeasuredSpeciesForSitesByNameAndStateId(string botanicalName, string commonName, int stateId)
        {
            var subquery = DetachedCriteria.For<Subsite>("subsite")
                .Add(Restrictions.Eq("subsite.State.Id", stateId)
                    & Restrictions.EqProperty("subsite.Site.Id", "site.Id"))
                .SetProjection(Projections.Property("Id"));
            return Registry.Session.CreateCriteria<SiteMeasuredSpecies>()
                .CreateAlias("Site", "site")
                .Add(Restrictions.Eq("ScientificName", botanicalName)
                    & Restrictions.Eq("CommonName", commonName)
                    & Subqueries.Exists(subquery))
                .AddOrder(Order.Asc("site.Name"))
                    .List<SiteMeasuredSpecies>();
        }

        public IList<Tree> ListByNameAndSiteId(string botanicalName, string commonName, int siteId)
        {
            return Registry.Session.CreateCriteria<Tree>()
                .CreateAlias("Subsite", "subsite")
                .Add(Restrictions.Eq("ScientificName", botanicalName) 
                    & Restrictions.Eq("CommonName", commonName)
                    & Restrictions.Eq("subsite.Site.Id", siteId))
                .AddOrder(Order.Desc("Height.Feet"))
                .List<Tree>();
        }

        public IList<Tree> ListByState(int stateId)
        {
            return Registry.Session.CreateCriteria<Tree>()
                .CreateAlias("Subsite", "subsite")
                .CreateAlias("subsite.Site", "site")
                .CreateAlias("subsite.State", "state")
                .Add(Restrictions.Eq("subsite.State.Id", stateId))
                .List<Tree>();
        }

        public IList<Tree> ListByName(string botanicalName, string commonName)
        {
            return Registry.Session.CreateCriteria<Tree>()
                .CreateAlias("Subsite", "subsite")
                .CreateAlias("subsite.Site", "site")
                .CreateAlias("subsite.State", "state")
                .Add(Restrictions.Eq("ScientificName", botanicalName) & Restrictions.Eq("CommonName", commonName))
                .List<Tree>();
        }

        public IList<Tree> ListByNameFilters(string botanicalName, string commonName)
        {
            return Registry.Session.CreateCriteria<Tree>()
                .CreateAlias("Subsite", "subsite")
                .CreateAlias("subsite.Site", "site")
                .CreateAlias("subsite.State", "state")
                .Add(Restrictions.Like("ScientificName", botanicalName, MatchMode.Anywhere)
                    && Restrictions.Like("CommonName", commonName, MatchMode.Anywhere))
                .List<Tree>();
        }

        public IList<Tree> ListByStateSiteAndSubsiteFilters(string state, string site, string subsite)
        {
            return Registry.Session.CreateCriteria<Tree>()
                .CreateAlias("Subsite", "subsite")
                .CreateAlias("subsite.Site", "site")
                .CreateAlias("subsite.State", "state")
                .Add(Restrictions.Like("state.Name", state, MatchMode.Anywhere)
                    && Restrictions.Like("site.Name", site, MatchMode.Anywhere)
                    && Restrictions.Like("subsite.Name", subsite, MatchMode.Anywhere))
                .List<Tree>();
        }

        public IEnumerable<GlobalMeasuredSpecies> SearchMeasuredSpecies(string expression, int maxResults)
        {
            return Registry.Session.CreateSQLQuery(
@"select species.*
from dbo.SearchMeasuredSpecies(:expression) rank
join Trees.MeasuredSpecies species
    on species.Id = rank.Id
order by rank.Rank desc")
                .AddEntity(typeof(GlobalMeasuredSpecies))
                .SetParameter("expression", expression)
                .SetMaxResults(maxResults)
                .List<GlobalMeasuredSpecies>();
        }

        public IList<MeasurerActivity> ListMostActiveMeasurers(int maxResults)
            => Registry.Session.CreateCriteria<MeasurerActivity>()
            .AddOrder(Order.Desc(nameof(MeasurerActivity.TreesMeasuredCount)))
            .SetMaxResults(maxResults)
            .List<MeasurerActivity>();
    }

    public static class SpeciesBrowserExtensions
    {
        public static ICriteria ApplyFilters(this ICriteria criteria, SpeciesBrowser browser)
        {
            if (!string.IsNullOrEmpty(browser.BotanicalNameFilter))
            {
                criteria.Add(Restrictions.Like("ScientificName", browser.BotanicalNameFilter, MatchMode.Anywhere));
            }
            if (!string.IsNullOrEmpty(browser.CommonNameFilter))
            {
                criteria.Add(Restrictions.Like("CommonName", browser.CommonNameFilter, MatchMode.Anywhere));
            }
            return criteria;
        }

        public static ICriteria ApplySorting(this ICriteria criteria, SpeciesBrowser browser)
        {
            if (browser.SortProperty.HasValue)
            {
                switch (browser.SortProperty.Value)
                {
                    case SpeciesBrowser.Property.BotanicalName :
                        return criteria.AddOrder(new Order("ScientificName", browser.SortAscending));
                    case SpeciesBrowser.Property.CommonName :
                        return criteria.AddOrder(new Order("CommonName", browser.SortAscending));
                    case SpeciesBrowser.Property.MaxHeight:
                        return criteria.AddOrder(new Order("MaxHeight", browser.SortAscending));
                    case SpeciesBrowser.Property.MaxGirth :
                        return criteria.AddOrder(new Order("MaxGirth", browser.SortAscending));
                    case SpeciesBrowser.Property.MaxCrownSpread:
                        return criteria.AddOrder(new Order("MaxCrownSpread", browser.SortAscending));
                    default: throw new NotImplementedException();
                }
            }
            return criteria;
        }
    }
}
