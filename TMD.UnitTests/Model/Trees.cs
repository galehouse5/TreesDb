using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model.Trees;
using TMD.Model;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Trees
    {
        [TestMethod]
        public void FindTreesWithSimilarCommonName()
        {
            IList<KnownTree> knownTrees = Repositories.Trees.FindTreesWithSimilarCommonName("fur white", 10);
            Assert.AreNotSame(0, knownTrees.Count);
            Assert.AreEqual("White Fir", knownTrees[0].CommonName);
        }
    }
}
