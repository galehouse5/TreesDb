using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model;
using TMD.Model.Trees;
using TMD.UnitTests.Stubs;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Trees
    {
        [TestMethod]
        public void CreatesTree()
        {
            var importedTrip = new ImportedTripStub { Date = DateTime.Now };
            var importedSite = new ImportedSiteStub(importedTrip);
            var importedSubsite = new ImportedSubsiteStub(importedSite);
            var importedTree = new ImportedTreeStub(importedSubsite)
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
            };

            var tree = Tree.Create(importedTree);
            Assert.AreEqual(1, tree.Measurements.Count);
            Assert.AreEqual("Commonname", tree.CommonName);
            Assert.AreEqual("Scientificname", tree.ScientificName);
            Assert.AreEqual(1, tree.Height);
            Assert.AreEqual(TMD.Model.Imports.TreeHeightMeasurementMethod.ClinometerLaserRangefinderSine, tree.HeightMeasurementMethod);
            Assert.AreEqual(2, tree.Girth);
            Assert.AreEqual(3, tree.CrownSpread);
            Assert.AreEqual(Coordinates.Create(4, 5), tree.Coordinates);
            Assert.AreEqual(Elevation.Create(6), tree.Elevation);
            Assert.AreEqual(9.424778f, tree.ENTSPTS);
            Assert.AreEqual(0.8882644f, tree.ENTSPTS2);
            Assert.AreEqual("GeneralComments", tree.Measurements[0].GeneralComments);
        }

        [TestMethod]
        public void DeterminesWhetherToMergeTrees()
        {
            var importedTrip = new ImportedTripStub { Date = DateTime.Now };
            var importedSite = new ImportedSiteStub(importedTrip);
            var importedSubsite = new ImportedSubsiteStub(importedSite);
            var tree1 = Tree.Create(new ImportedTreeStub(importedSubsite)
            {
                CommonName = "CommonName1",
                ScientificName = "ScientificName1",
                Coordinates = Coordinates.Create(1, 2)
            });
            var tree2 = Tree.Create(new ImportedTreeStub(importedSubsite)
            {
                CommonName = "CommonName1",
                ScientificName = "ScientificName1",
                Coordinates = Coordinates.Create(3, 4)
            });
            Assert.IsFalse(tree1.ShouldMerge(tree2));
            Assert.IsFalse(tree2.ShouldMerge(tree1));
            var tree3 = Tree.Create(new ImportedTreeStub(importedSubsite)
            {
                CommonName = "CommonName1",
                ScientificName = "ScientificName1",
                Coordinates = Coordinates.Create(1, 2)
            });
            Assert.IsTrue(tree3.ShouldMerge(tree1));
            Assert.IsTrue(tree1.ShouldMerge(tree3));
            Assert.IsFalse(tree3.ShouldMerge(tree2));
            Assert.IsFalse(tree2.ShouldMerge(tree3));
        }

        [TestMethod]
        public void MergresTrees()
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
                Elevation = Elevation.Create(6)
            });

            var importedTrip2 = new ImportedTripStub { Date = DateTime.Now };
            var importedSite2 = new ImportedSiteStub(importedTrip2);
            var importedSubsite2 = new ImportedSubsiteStub(importedSite2);
            var tree2 = Tree.Create(new ImportedTreeStub(importedSubsite2)
            {
                CommonName = "CommonName",
                ScientificName = "ScientificName",
                Height = 10,
                HeightMeasurementMethod = TMD.Model.Imports.TreeHeightMeasurementMethod.FormalTransitTotalStationSurvey,
                Girth = 20,
                CrownSpread = 30,
                Coordinates = Coordinates.Create(4, 5),
                Elevation = Elevation.Create(60)
            });

            Assert.IsTrue(tree1.ShouldMerge(tree2));
            tree2.Merge(tree1);
            Assert.AreEqual(2, tree2.Measurements.Count);
            Assert.AreEqual(1, tree2.Height);
            Assert.AreEqual(TMD.Model.Imports.TreeHeightMeasurementMethod.ClinometerLaserRangefinderSine, tree2.HeightMeasurementMethod);
            Assert.AreEqual(2, tree2.Girth);
            Assert.AreEqual(3, tree2.CrownSpread);
            Assert.AreEqual(Elevation.Create(6), tree2.Elevation);
            Assert.AreEqual(9.424778f, tree2.ENTSPTS);
            Assert.AreEqual(0.8882644f, tree2.ENTSPTS2);
        }
    }
}
