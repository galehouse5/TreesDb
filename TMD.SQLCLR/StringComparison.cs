using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Data.SqlTypes;
using SimMetricsMetricUtilities;
using SimMetricsApi;
using Microsoft.SqlServer.Server;
using TMD.SQLCLR.Expressions;

namespace TMD.SQLCLR
{
    public class StringComparison
    {
        private static readonly string[] s_SentenceSeperators = new string[] { " ", ".", ",", "-", "!", "?" };
        private static readonly ExpressionFactory s_ExpressionFactory = new ExpressionFactory();

        public static string InternalParseExpression(string expression)
        {
            Expression e = s_ExpressionFactory.Create(expression);
            return e.Print();
        }

        public static double InternalRankWords(string firstWord, string secondWord, string expression)
        {
            Expression e = s_ExpressionFactory.Create(expression);
            
            string normalizedFirstWord = firstWord.Trim().ToLower();
            string normalizedSecondWord = secondWord.Trim().ToLower();
            
            double rank = e.Evaluate(normalizedFirstWord, normalizedSecondWord);
            
            return rank;
        }

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

        public static double InternalRankSentences(string firstSentence, string secondSentence, string expression)
        {
            Expression e = s_ExpressionFactory.Create(expression);
            
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
                        e.Evaluate(normalizedFirstSentenceWords[firstSentenceWordIndex], normalizedSecondSentenceWords[secondSentenceWordIndex]));
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

        [SqlFunction(IsDeterministic = true, IsPrecise = true)]
        public static SqlString ParseExpression(SqlString expression)
        {
            string s = InternalParseExpression(expression.Value);
            return new SqlString(s);
        }

        [SqlFunction(IsDeterministic = true, IsPrecise = true)]
        public static SqlDouble RankSentences(SqlString firstSentence, SqlString secondSentence, SqlString expression)
        {
            if (firstSentence.IsNull || secondSentence.IsNull || expression.IsNull)
            {
                return 0;
            }
            double rank = InternalRankSentences(firstSentence.Value, secondSentence.Value, expression.Value);
            return new SqlDouble(rank);
        }

        [SqlFunction(IsDeterministic = true, IsPrecise = true)]
        public static SqlDouble RankWords(SqlString firstWord, SqlString secondWord, SqlString expression)
        {
            if (firstWord.IsNull || secondWord.IsNull || expression.IsNull)
            {
                return 0;
            }
            double rank = InternalRankWords(firstWord.Value, secondWord.Value, expression.Value);
            return new SqlDouble(rank);
        }
    }
}
