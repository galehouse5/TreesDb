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
            int sumSearchTermLength = 0;
            for (int i = 0; i < searchTerms.Length; i++)
            {
                sumSearchTermLength += searchTerms[i].Length;
            }
            int distanceCutoff = sumSearchTermLength  - (int)Math.Sqrt(sumSearchTermLength);
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
                int weight = Math.Max(0, distanceCutoff - distance);
                weights.Add(weight);
            }
            return weights;
        }

        #endregion
    }
}
