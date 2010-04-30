using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common.FuzzyStringMatching;


namespace TMD.Model.TreeNames
{
    public class TreeNameFuzzySearchByCommonName
    {
        private TreeNameFuzzySearchByCommonName()
        { }

        private FuzzyStringMatcher<TreeName> Matcher { get; set; }
        public IList<TreeName> SearchableTreeNames { get; private set; }

        public IList<FuzzyStringMatch<TreeName>> Search(string expression, int results)
        {
            return Matcher.Search(expression, results);
        }

        public static TreeNameFuzzySearchByCommonName Create(IList<TreeName> treeNames)
        {
            TreeNameFuzzySearchByCommonName ftns = new TreeNameFuzzySearchByCommonName();
            ftns.SearchableTreeNames = treeNames;
            ftns.Matcher = FuzzyStringMatcher<TreeName>.Create(treeNames)
                .AddStrategy<LevenshteinDistanceMatchingStrategy>("CommonName", 3)
                .AddStrategy<ContainmentMatchingStrategy>("CommonName", 3)
                .AddStrategy<EqualityMatchingStrategy>("CommonName", 3)
                .AddStrategy<LevenshteinDistanceMatchingStrategy>("ScientificName", 2)
                .AddStrategy<ContainmentMatchingStrategy>("ScientificName", 2)
                .AddStrategy<EqualityMatchingStrategy>("ScientificName", 2)
                .AddStrategy<EqualityMatchingStrategy>("AcceptedSymbol", 4);
            return ftns;
        }
    }
}
