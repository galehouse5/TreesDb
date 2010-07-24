using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trees;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using TMD.Model;
using NHibernate;
using TMD.Infrastructure.StringComparison;

namespace TMD.Infrastructure.Repositories
{
    public class TreeRepository : ITreeRepository
    {
        private IList<KnownTree> m_AllKnownTrees;
        public IList<KnownTree> FindAllKnownTrees()
        {
            if (m_AllKnownTrees == null)
            {
                using (ISession session = InfrastructureRegistry.SessionFactory.OpenSession())
                {
                    m_AllKnownTrees = session.CreateQuery("from KnownTree kt").List<KnownTree>();
                }
            }
            return m_AllKnownTrees;
        }


        private StringComparisonExpression m_AcceptedSymbolComparisonExpression = StringComparisonExpression.Create(
            InfrastructureRegistry.RepositorySettings.KnownTreeAcceptedSymbolComparisonExpression);
        private StringComparisonExpression m_CommonNameComparisonExpression = StringComparisonExpression.Create(
            InfrastructureRegistry.RepositorySettings.KnownTreeCommonNameComparisonExpression);
        private StringComparisonExpression m_ScientificNameComparisonExpression = StringComparisonExpression.Create(
            InfrastructureRegistry.RepositorySettings.KnownTreeScientificNameComparisonExpression);
        public IList<KnownTree> FindTreesWithSimilarCommonName(string commonName, int results)
        {
            IList<KnownTree> allKnownTrees = FindAllKnownTrees();
            List<Tuple<double, KnownTree>> rankedKnownTrees = new List<Tuple<double, KnownTree>>(allKnownTrees.Count);
            foreach (KnownTree kt in allKnownTrees)
            {
                double rank = m_AcceptedSymbolComparisonExpression.RateWordSimilarity(commonName, kt.AcceptedSymbol)
                    + m_CommonNameComparisonExpression.RateSentenceSimilarity(commonName, kt.CommonName)
                    + m_CommonNameComparisonExpression.RateSentenceSimilarity(commonName, kt.ScientificName);
                rankedKnownTrees.Add(new Tuple<double,KnownTree>(rank, kt));
            }
            rankedKnownTrees.Sort((rkt1, rkt2) => -rkt1.Item1.CompareTo(rkt2.Item1));
            List<KnownTree> similarKnownTrees = new List<KnownTree>(results);
            for (int i = 0; i < results && i < rankedKnownTrees.Count; i++)
            {
                if ( rankedKnownTrees[i].Item1 < commonName.Length)
                {
                    break;
                }
                similarKnownTrees.Add(rankedKnownTrees[i].Item2);
            }
            return similarKnownTrees;
        }
    }
}
