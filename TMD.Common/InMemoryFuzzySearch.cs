using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Common
{
    public abstract class InMemoryFuzzySearch<T>
    {
        public class SearchItem : IComparable
        {
            public SearchItem(T item, int weight)
            {
                this.Item = item;
                this.Weight = weight;
            }

            public T Item;
            public int Weight;

            public int CompareTo(object obj)
            {
                return ((SearchItem)obj).Weight
                    .CompareTo(this.Weight);
            }
        }

        private static readonly string[] DefaultSearchExpressionTermSeparators = new string[] { ",", " " };

        public virtual string[] SearchExpressionTermSeparators
        {
            get { return DefaultSearchExpressionTermSeparators; }
        }

        protected abstract string[] composeSearchableValues(T item);
        protected abstract int[] composeSearchableValueWeights(T item);
        protected abstract IEnumerable<T> getSearchableItems();
        protected abstract int termExactMatchWeight { get; }
        protected abstract int termSeparatedValueExactMatchWeight { get; }
        protected abstract int termContainsMatchWeight { get; }

        public IList<SearchItem> Search(string expression, int results)
        {
            string[] terms = getTerms(expression);
            List<SearchItem> searchItems = new List<SearchItem>();
            foreach (T item in getSearchableItems())
            {
                string[] values = composeAndFilterSearchableValues(item);
                int[] valueWeights = composeSearchableValueWeights(item);
                int weight = calculateItemWeight(values, valueWeights, terms);
                if (weight > 0)
                {
                    searchItems.Add(new SearchItem(item, weight));
                }
            }
            searchItems.Sort();
            while (searchItems.Count > results)
            {
                searchItems.RemoveAt(searchItems.Count - 1);
            }
            return searchItems;
        }

        private int calculateItemWeight(string[] values, int[] valueWeights, string[] terms)
        {
            int weight = 0;
            foreach (string term in terms)
            {
                for (int i = 0; i < values.Length; i++)
                {
                    if (values[i] == term)
                    {
                        weight += termExactMatchWeight * term.Length * valueWeights[i];
                    }
                    else if (values[i].Contains(term))
                    {
                        string[] separatedValues = values[i].Split(SearchExpressionTermSeparators, StringSplitOptions.RemoveEmptyEntries);
                        bool containsSeparatedValueExactMatch = false;
                        foreach (string separatedValue in separatedValues)
                        {
                            if (separatedValue == term)
                            {
                                containsSeparatedValueExactMatch = true;
                            }
                        }
                        if (containsSeparatedValueExactMatch)
                        {
                            weight += termSeparatedValueExactMatchWeight * term.Length * valueWeights[i];
                        }
                        else
                        {
                            weight += termContainsMatchWeight * term.Length * valueWeights[i];
                        }
                    }
                }
            }
            return weight;
        }

        private string[] composeAndFilterSearchableValues(T item)
        {
            string[] values = composeSearchableValues(item);
            for (int i = 0; i < values.Length; i++)
            {
                values[i] = values[i].Trim().ToLower();
            }
            return values;
        }

        private string[] getTerms(string expression)
        {
            string[] terms = expression.Split(SearchExpressionTermSeparators, StringSplitOptions.RemoveEmptyEntries);
            for (int i = 0; i < terms.Length; i++)
            {
                terms[i] = terms[i].Trim().ToLower();
            }
            return terms;
        }
    }
}
