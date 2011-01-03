using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trees;
using TMD.Model;
using NHibernate;
using TMD.Infrastructure.StringComparison;

namespace TMD.Infrastructure.Repositories
{
    public class TreeRepository : ITreeRepository
    {
        public IList<KnownTree> FindAllKnownTrees()
        {
            return Registry.Session.CreateCriteria<KnownTree>().List<KnownTree>();
        }

        private StringComparisonExpression m_AcceptedSymbolRanker = StringComparisonExpression.Create("equality * 100");
        private StringComparisonExpression m_CommonNameRanker = StringComparisonExpression.Create("jaro * firstlength");
        private StringComparisonExpression m_ScientificNameRanker = StringComparisonExpression.Create("jarowinkler * firstlength");

        public IList<KnownTree> FindTreesWithSimilarCommonName(string commonName, int results)
        {
            var all = FindAllKnownTrees();
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


        public IList<KnownTree> FindTreesWithSimilarScientificName(string scientificName, int results)
        {
            var all = FindAllKnownTrees();
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
    }
}
