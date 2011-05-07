using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.SqlTypes;
using SimMetricsMetricUtilities;
using SimMetricsApi;
using Microsoft.SqlServer.Server;

namespace TMD.Infrastructure.StringComparison
{
    public static class StringComparison
    {
        private class SentenceWordComparisonRank : IComparable<SentenceWordComparisonRank>
        {
            public SentenceWordComparisonRank(int firstSentenceWordIndex, int secondSentenceWordIndex, double rank)
            {
                this.FirstSentenceWordIndex = firstSentenceWordIndex;
                this.SecondSentenceWordIndex = secondSentenceWordIndex;
                this.Rank = rank;
            }

            public readonly int FirstSentenceWordIndex;
            public readonly int SecondSentenceWordIndex;
            public readonly double Rank;

            public int CompareTo(SentenceWordComparisonRank other)
            {
                // descending order
                return -Rank.CompareTo(other.Rank);
            }
        }

        private static readonly string[] s_SentenceSeperators = new string[] { " ", ".", ",", "-", "!", "?" };
        public static double RateSentenceSimilarity(this StringComparisonExpression expression, string firstSentence, string secondSentence)
        {
            if (string.IsNullOrWhiteSpace(firstSentence) || string.IsNullOrWhiteSpace(secondSentence))
            {
                return 0d;
            }

            string normalizedFirstSentence = firstSentence.Trim().ToLower();
            string normalizedSecondSentence = secondSentence.Trim().ToLower();
            string[] normalizedFirstSentenceWords = normalizedFirstSentence.Split(s_SentenceSeperators, StringSplitOptions.RemoveEmptyEntries);
            string[] normalizedSecondSentenceWords = normalizedSecondSentence.Split(s_SentenceSeperators, StringSplitOptions.RemoveEmptyEntries);

            List<SentenceWordComparisonRank> sentenceWordComparisonRanks = new List<SentenceWordComparisonRank>(normalizedFirstSentenceWords.Length * normalizedSecondSentenceWords.Length);
            for (int firstSentenceWordIndex = 0; firstSentenceWordIndex < normalizedFirstSentenceWords.Length; firstSentenceWordIndex++)
            {
                for (int secondSentenceWordIndex = 0; secondSentenceWordIndex < normalizedSecondSentenceWords.Length; secondSentenceWordIndex++)
                {
                    SentenceWordComparisonRank sentenceWordComparisonRank = new SentenceWordComparisonRank(
                        firstSentenceWordIndex,
                        secondSentenceWordIndex,
                        expression.Evaluate(normalizedFirstSentenceWords[firstSentenceWordIndex], normalizedSecondSentenceWords[secondSentenceWordIndex]));
                    sentenceWordComparisonRanks.Add(sentenceWordComparisonRank);
                }
            }

            sentenceWordComparisonRanks.Sort();

            double sentenceRank = 0;
            List<int> usedFirstSentenceWordIndexes = new List<int>(normalizedFirstSentenceWords.Length);
            List<int> usedSecondSentenceWordIndexes = new List<int>(normalizedSecondSentenceWords.Length);
            int numberOfWordComparisons = 0;
            int numberOfSignificantWordComparisons = Math.Min(normalizedFirstSentenceWords.Length, normalizedSecondSentenceWords.Length);
            foreach (SentenceWordComparisonRank sentenceWordComparisonRank in sentenceWordComparisonRanks)
            {
                if (!usedFirstSentenceWordIndexes.Contains(sentenceWordComparisonRank.FirstSentenceWordIndex)
                    && !usedSecondSentenceWordIndexes.Contains(sentenceWordComparisonRank.SecondSentenceWordIndex))
                {
                    sentenceRank += sentenceWordComparisonRank.Rank;
                    usedFirstSentenceWordIndexes.Add(sentenceWordComparisonRank.FirstSentenceWordIndex);
                    usedSecondSentenceWordIndexes.Add(sentenceWordComparisonRank.SecondSentenceWordIndex);
                    numberOfWordComparisons++;
                }
                if (numberOfWordComparisons >= numberOfSignificantWordComparisons)
                {
                    break;
                }
            }
            return sentenceRank;
        }

        public static double RateWordSimilarity(this StringComparisonExpression expression, string firstWord, string secondWord)
        {
            if (string.IsNullOrWhiteSpace(firstWord) || string.IsNullOrWhiteSpace(secondWord))
            {
                return 0d;
            }

            string normalizedFirstWord = firstWord.Trim().ToLower();
            string normalizedSecondWord = secondWord.Trim().ToLower();

            return expression.Evaluate(normalizedFirstWord, normalizedSecondWord);
        }
    }
}
