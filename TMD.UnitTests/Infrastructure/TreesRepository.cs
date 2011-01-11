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
            var importedTrip1 = new ImportedTripStub { Date = DateTime.Now.AddDays(1) };
            var importedSite1 = new ImportedSiteStub(importedTrip1);
            var importedSubsite1 = new ImportedSubsiteStub(importedSite1);
            var tree1 = Tree.Create(new ImportedTreeStub(importedSubsite1)
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
            tree1.Measurements[0].SetPrivatePropertyValue("ImportingTrip", null);
            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Trees.Save(tree1);
                UnitOfWork.Flush();
                UnitOfWork.Refresh(tree1);
                Assert.IsNotNull(tree1);
                Assert.IsNotNull(tree1.Measurements);
                Assert.AreEqual(1, tree1.Measurements.Count);
                Assert.IsNotNull(tree1.Species);
                uow.Rollback();
            }
        }
    }
}
