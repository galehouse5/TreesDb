using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using TMD.Model;
using TMD.Model.Sites;
using TMD.UnitTests.Stubs;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Sites
    {
        [TestMethod]
        public void CreatesSite()
        {
            var importedTrip = new ImportedTripStub { Date = DateTime.Now };
            var importedSite = new ImportedSiteStub(importedTrip)
            {
                Comments = "Comments",
                Coordinates = Coordinates.Create(1, 2),
                Name = "Name",
                County = "County",
                MakeOwnershipContactInfoPublic = true,
                OwnershipContactInfo = "OwnershipContactInfo",
                OwnershipType = "OwnershipType",
                State = new StateStub("State")
            };

            var site = Site.Create(importedSite);
            Assert.AreEqual(1, site.Visits.Count);
            Assert.AreEqual("Comments", site.Visits[0].Comments);
            Assert.AreEqual(Coordinates.Create(1, 2), site.Coordinates);
            Assert.AreEqual("Name", site.Name);
            Assert.AreEqual("County", site.County);
            Assert.IsTrue(site.MakeOwnershipContactInfoPublic);
            Assert.AreEqual("OwnershipContactInfo", site.OwnershipContactInfo);
            Assert.AreEqual("OwnershipType", site.OwnershipType);
            Assert.AreEqual("State", site.State.Name);
        }

        [TestMethod]
        public void DeterminesWhetherToMergeSites()
        {
            var state = new StateStub("State");
            var importedTrip = new ImportedTripStub { Date = DateTime.Now };
            var site1 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(1, 2),
                County = "County",
                Name = "Name",
                State = state
            });
            var site2 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(1.3f, 1.7f),
                County = "County",
                Name = "Name",
                State = state
            });

            Assert.IsFalse(site1.ShouldMerge(site2));
            Assert.IsFalse(site2.ShouldMerge(site1));

            var site3 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(1, 2),
                County = "County",
                Name = "Name",
                State = state
            });

            Assert.IsTrue(site3.ShouldMerge(site1));
            Assert.IsTrue(site1.ShouldMerge(site3));
            Assert.IsFalse(site3.ShouldMerge(site2));
            Assert.IsFalse(site2.ShouldMerge(site3));
        }

        [TestMethod]
        public void MergesSites()
        {
            var state = new StateStub("State");

            var importedTrip1 = new ImportedTripStub { Date = DateTime.Now.AddDays(1) };
            var site1 = Site.Create(new ImportedSiteStub(importedTrip1)
            {
                Coordinates = Coordinates.Create(1, 2),
                County = "County",
                Name = "Name",
                State = state,
                MakeOwnershipContactInfoPublic = true,
                OwnershipContactInfo = "OwnershipContactInfo1",
                OwnershipType = "OwnershipType1",
            });

            var importedTrip2 = new ImportedTripStub { Date = DateTime.Now };
            var site2 = Site.Create(new ImportedSiteStub(importedTrip2)
            {
                Coordinates = Coordinates.Create(1, 2),
                County = "County",
                Name = "Name",
                State = state,
                MakeOwnershipContactInfoPublic = false,
                OwnershipContactInfo = "OwnershipContactInfo2",
                OwnershipType = "OwnershipType2",
            });

            Assert.IsTrue(site1.ShouldMerge(site2));
            site2.Merge(site1);
            Assert.AreEqual(2, site2.Visits.Count);
            Assert.IsTrue(site2.MakeOwnershipContactInfoPublic);
            Assert.AreEqual("OwnershipContactInfo1", site2.OwnershipContactInfo);
            Assert.AreEqual("OwnershipType1", site2.OwnershipType);
        }
    }
}
