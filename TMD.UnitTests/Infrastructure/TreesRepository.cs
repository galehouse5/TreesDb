using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model.Trees;
using TMD.Model;

namespace TMD.UnitTests.Infrastructure
{
    [TestClass]
    public class TreesRepository
    {
        [TestMethod]
        public void FindTreesWithSimilarCommonName()
        {
            IList<KnownSpecies> knownTrees = Repositories.Trees.FindKnownSpeciesBySimilarCommonName("fur white", 10);
            Assert.AreNotSame(0, knownTrees.Count);
            Assert.AreEqual("White Fir", knownTrees[0].CommonName);
        }
    }
}
