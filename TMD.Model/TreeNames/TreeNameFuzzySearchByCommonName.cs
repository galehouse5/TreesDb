using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;

namespace TMD.Model.TreeNames
{
    public class TreeNameFuzzySearchByCommonName : InMemoryFuzzySearch<TreeName>
    {
        private TreeNameFuzzySearchByCommonName()
        { }

        public IEnumerable<TreeName> SearchableTreeNames { get; private set; }

        public static TreeNameFuzzySearchByCommonName Create(IEnumerable<TreeName> treeNames)
        {
            TreeNameFuzzySearchByCommonName ftns = new TreeNameFuzzySearchByCommonName();
            ftns.SearchableTreeNames = treeNames;
            return ftns;
        }

        protected override string[] composeSearchableValues(TreeName item)
        {
            return new string[] { item.CommonName, item.AcceptedSymbol, item.ScientificName };
        }

        protected override int[] composeSearchableValueWeights(TreeName item)
        {
            return new int[] { 3, 2, 1 };
        }

        protected override IEnumerable<TreeName> getSearchableItems()
        {
            return SearchableTreeNames;
        }

        protected override int termExactMatchWeight
        {
            get { return 3; }
        }

        protected override int termContainsMatchWeight
        {
            get { return 1; }
        }

        protected override int termSeparatedValueExactMatchWeight
        {
            get { return 2; }
        }
    }
}
