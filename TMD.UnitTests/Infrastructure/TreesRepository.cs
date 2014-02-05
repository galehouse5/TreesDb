using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using TMD.Model;
using TMD.Model.Trees;

namespace TMD.UnitTests.Infrastructure
{
    [TestClass]
    public class TreesRepository
    {
        [TestMethod]
        public void FindTreesWithSimilarCommonName()
        {
            IList<KnownSpecies> knownTrees = Repositories.Trees.ListKnownSpeciesBySimilarCommonName("fur white", 10);
            Assert.AreNotSame(0, knownTrees.Count);
            Assert.AreEqual("White Fir", knownTrees[0].CommonName);
        }

        [TestMethod]
        public void FindKnownSpeciesBySimilarScientificName()
        {
            IList<KnownSpecies> knownTrees = Repositories.Trees.ListKnownSpeciesBySimilarScientificName("vitamix", 10);
            Assert.AreNotSame(0, knownTrees.Count);
            Assert.AreEqual("Vitex agnus-castus", knownTrees[0].ScientificName);
        }
    }
}
