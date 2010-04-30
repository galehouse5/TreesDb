﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Common.FuzzyStringMatching
{
    public class EqualityMatchingStrategy : IFuzzyStringMatchingStrategy
    {
        private EqualityMatchingStrategy(IList<string[]> matchableTermsSet)
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
                int weight = 0;
                foreach (string matchableTerm in MatchableTermsSet[i])
                {
                    foreach (string searchTerm in searchTerms)
                    {
                        if (matchableTerm == searchTerm)
                        {
                            weight++;
                        }
                    }
                }
                weights.Add(weight);
            }
            return weights;
        }

        #endregion
    }
}
