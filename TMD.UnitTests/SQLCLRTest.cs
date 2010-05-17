using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.SQLCLR;

namespace TMD.UnitTests
{
    [TestClass]
    public class SQLCLRTest
    {
        [TestMethod]
        public void ParseExpression()
        {
            string expression = "(Levenstein * MinLength) + (FirstContains * MinLength * 2) + (Equality * MinLength * 4)";
            string parsedExpression = SQLCLR.StringComparison.InternalParseExpression(expression);
            Assert.AreEqual(expression, parsedExpression);
        }

        [TestMethod]
        public void InternalRankSentences()
        {
            string expression = "(Levenstein * MinLength) + (FirstContains * MinLength * 2) + (Equality * MinLength * 4)";
            string sentence1 = "Pinus torreyana var. insularis";
            string sentence2 = "Mt. Atlas mastic tree";
            double rank = SQLCLR.StringComparison.InternalRankSentences(sentence1, sentence2, expression);
            double expectedRank = 5.3333333333333339d;
            Assert.AreEqual(expectedRank, rank);
        }

        [TestMethod]
        public void InternalRankWords()
        {
            string expression = "(Levenstein * MinLength) + (FirstContains * MinLength * 2) + (Equality * MinLength * 4)";
            string word1 = "apple";
            string word2 = "maple";
            double rank = SQLCLR.StringComparison.InternalRankWords(word1, word2, expression);
            double expectedRank = 3.0d;
            Assert.AreEqual(expectedRank, rank);
        }
    }
}
