using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using TMD.Infrastructure.StringComparison;

namespace TMD.UnitTests
{
    [TestClass]
    public class SQLCLR
    {
        [TestMethod]
        public void ParseExpression()
        {
            string expression = "(Levenstein * MinLength) + (FirstContains * MinLength * 2) + (Equality * MinLength * 4)";
            string parsedExpression = StringComparisonExpression.Create(expression).Print();
            Assert.AreEqual(expression, parsedExpression);
        }

        [TestMethod]
        public void InternalRankSentences()
        {
            string expression = "(Levenstein * MinLength) + (FirstContains * MinLength * 2) + (Equality * MinLength * 4)";
            string sentence1 = "Pinus torreyana var. insularis";
            string sentence2 = "Mt. Atlas mastic tree";
            double rank = StringComparisonExpression.Create(expression).RateSentenceSimilarity(sentence1, sentence2);
            double expectedRank = 3.5000000000000004d;
            Assert.AreEqual(expectedRank, rank);
        }

        [TestMethod]
        public void InternalRankWords()
        {
            string expression = "(Levenstein * MinLength) + (FirstContains * MinLength * 2) + (Equality * MinLength * 4)";
            string word1 = "apple";
            string word2 = "maple";
            double rank = StringComparisonExpression.Create(expression).RateWordSimilarity(word1, word2);
            double expectedRank = 3.0d;
            Assert.AreEqual(expectedRank, rank);
        }
    }
}
