using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model;
using TMD.Model.Trees;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Trees
    {
        public class ImportedTripStub : TMD.Model.Imports.Trip
        {
            public ImportedTripStub() { Sites = new List<TMD.Model.Imports.Site>(); }
            public override bool IsImported { get { return true; } }
        }

        public class ImportedSiteStub : TMD.Model.Imports.Site
        {
            public ImportedSiteStub(TMD.Model.Imports.Trip trip) 
            {
                this.Trip = trip;
                Subsites = new List<TMD.Model.Imports.Subsite>(); 
            }
        }

        public class ImportedSubsiteStub : TMD.Model.Imports.Subsite
        {
            public ImportedSubsiteStub(TMD.Model.Imports.Site site) 
            {
                this.Site = site;
                Trees = new List<TMD.Model.Imports.TreeBase>(); 
            }
        }

        public class ImportedTreeStub : TMD.Model.Imports.TreeBase
        {
            public ImportedTreeStub(TMD.Model.Imports.Subsite subsite) 
            {
                this.Subsite = subsite;
            }
        }


        [TestMethod]
        public void CreatesTree()
        {
            var importedTrip = new ImportedTripStub
            {
                Date = DateTime.Now
            };
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
            Assert.IsNotNull(tree.Measurements);
            Assert.AreEqual(1, tree.Measurements.Count);
            Assert.AreEqual("GeneralComments", tree.Measurements[0].GeneralComments);
        }
    }
}
