using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model.Trees;
using TMD.Model;
using TMD.UnitTests.Stubs;
using TMD.Model.Extensions;

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

        [TestMethod]
        public void FindKnownSpeciesBySimilarScientificName()
        {
            IList<KnownSpecies> knownTrees = Repositories.Trees.FindKnownSpeciesBySimilarScientificName("vitamix", 10);
            Assert.AreNotSame(0, knownTrees.Count);
            Assert.AreEqual("Vitex agnus-castus", knownTrees[0].ScientificName);
        }

        [TestMethod]
        public void SavesTree()
        {
            var importedTrip = new ImportedTripStub { Date = DateTime.Now.AddDays(1) };
            var importedSite = new ImportedSiteStub(importedTrip);
            var importedSubsite = new ImportedSubsiteStub(importedSite);
            var tree = Tree.Create(new ImportedTreeStub(importedSubsite)
            {
                CommonName = "CommonName",
                ScientificName = "ScientificName",
                Height = 1,
                HeightMeasurementMethod = TMD.Model.Imports.TreeHeightMeasurementMethod.ClinometerLaserRangefinderSine,
                Girth = 2,
                CrownSpread = 3,
                Coordinates = Coordinates.Create(4, 5),
                Elevation = Elevation.Create(6),
                GeneralComments = "GeneralComments"
            });
            tree.Measurements[0].SetPrivatePropertyValue("ImportingTrip", null);
            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Trees.Save(tree);
                UnitOfWork.Flush();
                UnitOfWork.Refresh(tree);
                Assert.IsNotNull(tree);
                Assert.IsNotNull(tree.Measurements);
                Assert.AreEqual(1, tree.Measurements.Count);
                Assert.IsNotNull(tree.Species);
                uow.Rollback();
            }
        }
    }
}
