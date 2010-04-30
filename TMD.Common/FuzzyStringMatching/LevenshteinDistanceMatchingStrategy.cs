using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Common.FuzzyStringMatching
{
    public class LevenshteinDistanceMatchingStrategy : IFuzzyStringMatchingStrategy
    {
        private LevenshteinDistanceMatchingStrategy(IList<string[]> matchableTermsSet)
        {
            this.MatchableTermsSet = matchableTermsSet;
        }

        #region IStringMatchingStrategy Members

        public IList<string[]> MatchableTermsSet { get; private set; }

        public IList<int> WeighMatchableTermsSet(string[] searchTerms)
        {
            List<int> weights = new List<int>(MatchableTermsSet.Count);
            for (int i = 0; i < MatchableTermsSet.Count; i++)
            {
                int distance = 0;
                foreach (string searchTerm in searchTerms)
                {
                    int minDistance = int.MaxValue;
                    foreach (string matchableTerm in MatchableTermsSet[i])
                    {
                        int pairDistance = LevenshteinDistance.Compute(searchTerm, matchableTerm);
                        minDistance = Math.Min(pairDistance, minDistance);
                    }
                    distance += minDistance;
                }
                weights.Add(-distance);
            }
            return weights;
        }

        #endregion
    }
}
