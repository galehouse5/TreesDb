using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trees;
using TMD.Model;
using NHibernate;
using TMD.Infrastructure.StringComparison;
using NHibernate.Criterion;
using TMD.Model.Extensions;

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
                tree.Measurements.RemoveAll(measurement => measurement.ImportingTrip.Equals(trip));
                if (tree.Measurements.Count < 1)
                {
                    Registry.Session.Delete(tree);
                }
            }
        }

        private StringComparisonExpression m_AcceptedSymbolRanker = StringComparisonExpression.Create("equality * 100");
        private StringComparisonExpression m_CommonNameRanker = StringComparisonExpression.Create("jaro * firstlength");
        private StringComparisonExpression m_ScientificNameRanker = StringComparisonExpression.Create("jarowinkler * firstlength");

        public IList<KnownSpecies> FindKnownSpeciesBySimilarCommonName(string commonName, int results)
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


        public IList<KnownSpecies> FindKnownSpeciesBySimilarScientificName(string scientificName, int results)
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

        public PagedList<Tree> ListAll(TreeBrowser browser)
        {
            return new PagedList<Tree>(browser)
            {
                Page = Registry.Session.CreateCriteria<Tree>()
                    .CreateAlias("Subsite", "subsite")
                    .CreateAlias("subsite.Site", "site")
                    .ApplyFilters(browser)
                    .ApplySorting(browser)
                    .ApplyPaging(browser)
                    .List<Tree>(),
                Count = Registry.Session.CreateCriteria<Tree>()
                    .CreateAlias("Subsite", "subsite")
                    .CreateAlias("subsite.Site", "site")
                    .ApplyFilters(browser)
                    .SetProjection(Projections.Count("Id"))
                    .UniqueResult<int>()
            };
        }
    }

    public static class TreeBrowserExtensions
    {
        public static ICriteria ApplyFilters(this ICriteria criteria, TreeBrowser browser)
        {
            if (!string.IsNullOrEmpty(browser.SiteFilter))
            {
                criteria.Add(Restrictions.Or(
                    Restrictions.Like("site.Name", browser.SiteFilter, MatchMode.Anywhere),
                    Restrictions.Like("subsite.Name", browser.SiteFilter, MatchMode.Anywhere)));
            }
            if (!string.IsNullOrEmpty(browser.SpeciesFilter))
            {
                criteria.Add(Restrictions.Like("ScientificName", browser.SpeciesFilter, MatchMode.Anywhere));
            }
            return criteria;
        }

        public static ICriteria ApplySorting(this ICriteria criteria, TreeBrowser browser)
        {
            if (browser.SortProperty.HasValue)
            {
                switch (browser.SortProperty.Value)
                {
                    case TreeBrowser.Property.Girth :
                        return criteria.AddOrder(new Order("Girth.Feet", browser.SortAscending));
                    case TreeBrowser.Property.Height :
                        return criteria.AddOrder(new Order("Height.Feet", browser.SortAscending));
                    case TreeBrowser.Property.Site :
                        return criteria.AddOrder(new Order("subsite.Name", browser.SortAscending))
                            .AddOrder(new Order("site.Name", browser.SortAscending));
                    case TreeBrowser.Property.Species :
                        return criteria.AddOrder(new Order("ScientificName", browser.SortAscending));
                    default: throw new NotImplementedException();
                }
            }
            return criteria;
        }
    }
}
