using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Common.FuzzyStringMatching
{
    public interface IFuzzyStringMatchingStrategy
    {
        IList<string[]> MatchableTermsSet { get; }

        IList<int> WeighMatchableTermsSet(string[] searchTerms);
    }
}
