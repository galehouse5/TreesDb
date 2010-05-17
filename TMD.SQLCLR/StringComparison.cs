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
    public partial class StringComparison
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


        public static double InternalRankSentences(string firstSentence, string secondSentence, string expression)
        {
            Expression e = s_ExpressionFactory.Create(expression);
            
            string normalizedFirstSentence = firstSentence.Trim().ToLower();
            string normalizedSecondSentence = secondSentence.Trim().ToLower();
            string[] normalizedFirstWords = normalizedFirstSentence.Split(s_SentenceSeperators, StringSplitOptions.RemoveEmptyEntries);
            string[] normalizedSecondWords = normalizedSecondSentence.Split(s_SentenceSeperators, StringSplitOptions.RemoveEmptyEntries);
            
            List<double> cartesianProductRanks = new List<double>(normalizedFirstWords.Length * normalizedSecondWords.Length);
            for (int w1 = 0; w1 < normalizedFirstWords.Length; w1++)
            {
                for (int w2 = 0; w2 < normalizedSecondWords.Length; w2++)
                {
                    cartesianProductRanks.Add(e.Evaluate(normalizedFirstWords[w1], normalizedSecondWords[w2]));
                }
            }

            cartesianProductRanks.Sort();
            double rank = 0;
            int significantRanks = Math.Min(normalizedFirstWords.Length, normalizedSecondWords.Length);
            for (int i = cartesianProductRanks.Count - 1; i >= cartesianProductRanks.Count - significantRanks; i--)
            {
                rank += cartesianProductRanks[i];
            }

            return rank;
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
