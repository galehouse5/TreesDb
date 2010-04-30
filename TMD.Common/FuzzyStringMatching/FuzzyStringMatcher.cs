using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;

namespace TMD.Common.FuzzyStringMatching
{
    public class FuzzyStringMatch<T>
    {
        private FuzzyStringMatch()
        {}

        public int Weight { get; internal set; }
        public T Match { get; internal set; }

        public static implicit operator T(FuzzyStringMatch<T> fsm)
        {
            return fsm.Match;
        }

        public override string ToString()
        {
            return Match.ToString();
        }

        public override int GetHashCode()
        {
            return Match.GetHashCode();
        }

        public override bool Equals(object obj)
        {
            return Match.Equals(obj);
        }

        internal static FuzzyStringMatch<T> Create(T match, int weight)
        {
            FuzzyStringMatch<T> fsm = new FuzzyStringMatch<T>();
            fsm.Match = match;
            fsm.Weight = weight;
            return fsm;
        }
    }

    public class FuzzyStringMatcher<T>
    {
        private Dictionary<string, IList<string[]>> m_MatchableSets = new Dictionary<string, IList<string[]>>();

        protected FuzzyStringMatcher(IList<T> matchables)
        {
            this.Matchables = matchables;
            this.Strategies = new List<IFuzzyStringMatchingStrategy>();
            this.StrategyWeights = new List<int>();
        }

        public IList<T> Matchables { get; private set; }
        public IList<IFuzzyStringMatchingStrategy> Strategies { get; private set; }
        public IList<int> StrategyWeights { get; private set; }

        public FuzzyStringMatcher<T> AddStrategy<S>(string property, int weight)
            where S : IFuzzyStringMatchingStrategy
        {
            IList<string[]> matchableSet;
            if (!m_MatchableSets.TryGetValue(property, out matchableSet))
            {
                matchableSet = buildMatchableSet(property, Matchables);
                m_MatchableSets.Add(property, matchableSet);
            }
            ConstructorInfo ci = typeof(S).GetConstructor(
                BindingFlags.Instance | BindingFlags.NonPublic,
                null,
                new Type[] {  typeof(IList<string[]>) },
                null);
            IFuzzyStringMatchingStrategy strategy = (IFuzzyStringMatchingStrategy)ci.Invoke(new object[] { matchableSet });
            Strategies.Add(strategy);
            StrategyWeights.Add(weight);
            return this;
        }

        private static IList<string[]> buildMatchableSet(string property, IList<T> matchables)
        {
            List<string[]> matchableSet = new List<string[]>(matchables.Count);
            PropertyInfo pi = typeof(T).GetProperty(property);
            foreach (T matchable in matchables)
            {
                string value = pi.GetValue(matchable, null).ToString();
                string[] terms = value.ToTerms();
                matchableSet.Add(terms);
            }
            return matchableSet;
        }

        public IList<FuzzyStringMatch<T>> Search(string expression, int results)
        {
            List<int> matchableWeights = new List<int>(Matchables.Count);
            string[] searchTerms = expression.ToTerms();
            for (int i = 0; i < Strategies.Count; i++)
            {
                IList<int> weights = Strategies[i].WeighMatchableTermsSet(searchTerms);
                weights.Normalize(0, Matchables.Count);
                weights.Product(StrategyWeights[i]);
                matchableWeights.Sum(weights);
            }
            List<FuzzyStringMatch<T>> matches = new List<FuzzyStringMatch<T>>(Matchables.Count);
            for (int i = 0; i < Matchables.Count; i++)
            {
                matches.Add(FuzzyStringMatch<T>.Create(Matchables[i], matchableWeights[i]));
            }
            matches.Sort((a, b) => (-a.Weight.CompareTo(b.Weight)));
            if (matches.Count > results)
            {
                matches.RemoveRange(results, matches.Count - results);
            }
            return matches;
        }

        public static FuzzyStringMatcher<T> Create(IList<T> matchables)
        {
            return new FuzzyStringMatcher<T>(matchables);
        }
    }
}
