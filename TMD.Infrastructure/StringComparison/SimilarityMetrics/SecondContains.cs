using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using SimMetricsApi;

namespace TMD.Infrastructure.StringComparison.SimilarityMetrics
{
    internal class SecondContains : IStringMetric
    {
        public double GetSimilarity(string firstWord, string secondWord)
        {
            double rank = 0d;
            if (secondWord.Contains(firstWord))
            {
                rank = 1d;
            }
            return rank;
        }

        public string GetSimilarityExplained(string firstWord, string secondWord)
        {
            throw new NotImplementedException();
        }

        public long GetSimilarityTimingActual(string firstWord, string secondWord)
        {
            throw new NotImplementedException();
        }

        public double GetSimilarityTimingEstimated(string firstWord, string secondWord)
        {
            throw new NotImplementedException();
        }

        public double GetUnnormalisedSimilarity(string firstWord, string secondWord)
        {
            throw new NotImplementedException();
        }

        public string LongDescriptionString
        {
            get { throw new NotImplementedException(); }
        }

        public string ShortDescriptionString
        {
            get { throw new NotImplementedException(); }
        }
    }
}
