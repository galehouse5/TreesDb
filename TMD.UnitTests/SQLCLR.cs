using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using Wintellect.Threading.ResourceLocks;

namespace TMD.UnitTests
{
    [TestClass]
    public class SQLCLR
    {
        [TestMethod]
        public void ParseExpression()
        {
            string expression = "(Levenstein * MinLength) + (FirstContains * MinLength * 2) + (Equality * MinLength * 4)";
            string parsedExpression = TMD.SQLCLR.StringComparison.InternalParseExpression(expression);
            Assert.AreEqual(expression, parsedExpression);
        }

        [TestMethod]
        public void InternalRankSentences()
        {
            string expression = "(Levenstein * MinLength) + (FirstContains * MinLength * 2) + (Equality * MinLength * 4)";
            string sentence1 = "Pinus torreyana var. insularis";
            string sentence2 = "Mt. Atlas mastic tree";
            double rank = TMD.SQLCLR.StringComparison.InternalRankSentences(sentence1, sentence2, expression);
            double expectedRank = 3.5000000000000004d;
            Assert.AreEqual(expectedRank, rank);
        }

        [TestMethod]
        public void InternalRankWords()
        {
            string expression = "(Levenstein * MinLength) + (FirstContains * MinLength * 2) + (Equality * MinLength * 4)";
            string word1 = "apple";
            string word2 = "maple";
            double rank = TMD.SQLCLR.StringComparison.InternalRankWords(word1, word2, expression);
            double expectedRank = 3.0d;
            Assert.AreEqual(expectedRank, rank);
        }

        [TestMethod]
        public void MultithreadedDictionaryInsertion()
        {
            ResourceLock rl = new OneManyResourceLock();
            Dictionary<int, int> d = new Dictionary<int, int>();
            int count = 10000000;
            Parallel.For(0, count, delegate(int i)
            {
                using (rl.WaitToWrite())
                {
                    d.Add(i, i);
                }
            });
            Assert.AreEqual(d.Count, count);
        }
    }
}
