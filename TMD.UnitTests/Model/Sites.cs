using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model;
using TMD.Model.Trees;
using TMD.UnitTests.Stubs;
using TMD.Model.Sites;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Sites
    {
        [TestMethod]
        public void CreatesSubsite()
        {
            var importedTrip = new ImportedTripStub { Date = DateTime.Now };
            var importedSite = new ImportedSiteStub(importedTrip);
            var importedSubsite = new ImportedSubsiteStub(importedSite)
            {
                Comments = "Comments",
                Coordinates = Coordinates.Create(1, 2),
                County = "County",
                MakeOwnershipContactInfoPublic = true,
                Name = "Name",
                OwnershipContactInfo = "OwnershipContactInfo",
                OwnershipType = "OwnershipType",
                State = new StateStub("State")
            };

            var subsite = Subsite.Create(importedSubsite);
            Assert.AreEqual(1, subsite.Visits.Count);
            Assert.AreEqual("Comments", subsite.Visits[0].Comments);
            Assert.AreEqual(Coordinates.Create(1, 2), subsite.Coordinates);
            Assert.AreEqual("County", subsite.County);
            Assert.AreEqual(true, subsite.MakeOwnershipContactInfoPublic);
            Assert.AreEqual("Name", subsite.Name);
            Assert.AreEqual("OwnershipContactInfo", subsite.OwnershipContactInfo);
            Assert.AreEqual("OwnershipType", subsite.OwnershipType);
            Assert.AreEqual("State", subsite.State.Name);
        }

        [TestMethod]
        public void CreatesSite()
        {
            var importedTrip = new ImportedTripStub { Date = DateTime.Now };
            var importedSite = new ImportedSiteStub(importedTrip)
            {
                Comments = "Comments",
                Coordinates = Coordinates.Create(1, 2),
                Name = "Name",
            };

            var site = Site.Create(importedSite);
            Assert.AreEqual(1, site.Visits.Count);
            Assert.AreEqual(Coordinates.Create(1, 2), site.Coordinates);
            Assert.AreEqual("Name", site.Name);
        }

        [TestMethod]
        public void DeterminesWhetherToMergeSites()
        {
            var importedTrip = new ImportedTripStub { Date = DateTime.Now };
            var site1 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Name = "Name1",
                Coordinates = Coordinates.Create(1, 2)
            });
            var site2 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Name = "Name",
                Coordinates = Coordinates.Create(1, 2)
            });
            Assert.IsFalse(site1.ShouldMerge(site2));
            Assert.IsFalse(site2.ShouldMerge(site1));
            var site3 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Name = "Name1",
                Coordinates = Coordinates.Create(1.25f, 1.75f)
            });
            Assert.IsTrue(site3.ShouldMerge(site1));
            Assert.IsTrue(site1.ShouldMerge(site3));
            Assert.IsFalse(site3.ShouldMerge(site2));
            Assert.IsFalse(site2.ShouldMerge(site3));
        }

        [TestMethod]
        public void DeterminesWhetherToMergeSubsites()
        {
            var state = new StateStub("State");
            var importedTrip = new ImportedTripStub { Date = DateTime.Now };
            var importedSite = new ImportedSiteStub(importedTrip);
            var subsite1 = Subsite.Create(new ImportedSubsiteStub(importedSite)
            {
                Coordinates = Coordinates.Create(1, 2),
                County = "County",
                Name = "Name",
                State = state
            });
            var subsite2 = Subsite.Create(new ImportedSubsiteStub(importedSite)
            {
                Coordinates = Coordinates.Create(1.1f, 1.9f),
                County = "County",
                Name = "Name",
                State = state
            });
            Assert.IsFalse(subsite1.ShouldMerge(subsite2));
            Assert.IsFalse(subsite2.ShouldMerge(subsite1));
            var subsite3 = Subsite.Create(new ImportedSubsiteStub(importedSite)
            {
                Coordinates = Coordinates.Create(1, 2),
                County = "County",
                Name = "Name",
                State = state
            });
            Assert.IsTrue(subsite3.ShouldMerge(subsite1));
            Assert.IsTrue(subsite1.ShouldMerge(subsite3));
            Assert.IsFalse(subsite3.ShouldMerge(subsite2));
            Assert.IsFalse(subsite2.ShouldMerge(subsite3));
        }

        [TestMethod]
        public void MergresSubsites()
        {
            var state = new StateStub("State");
            var importedTrip1 = new ImportedTripStub { Date = DateTime.Now.AddDays(1) };
            var importedSite1 = new ImportedSiteStub(importedTrip1);
            var subsite1 = Subsite.Create(new ImportedSubsiteStub(importedSite1)
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
            var importedSite2 = new ImportedSiteStub(importedTrip2);
            var subsite2 = Subsite.Create(new ImportedSubsiteStub(importedSite2)
            {
                Coordinates = Coordinates.Create(1, 2),
                County = "County",
                Name = "Name",
                State = state,
                MakeOwnershipContactInfoPublic = false,
                OwnershipContactInfo = "OwnershipContactInfo2",
                OwnershipType = "OwnershipType2",
            });

            Assert.IsTrue(subsite1.ShouldMerge(subsite2));
            subsite2.Merge(subsite1);
            Assert.AreEqual(2, subsite2.Visits.Count);
            Assert.AreEqual(true, subsite2.MakeOwnershipContactInfoPublic);
            Assert.AreEqual("OwnershipContactInfo1", subsite2.OwnershipContactInfo);
            Assert.AreEqual("OwnershipType1", subsite2.OwnershipType);
        }

        [TestMethod]
        public void MergresSites()
        {
            var importedTrip1 = new ImportedTripStub { Date = DateTime.Now.AddDays(1) };
            var site1 = Site.Create(new ImportedSiteStub(importedTrip1)
            {
                Comments = "Comments",
                Coordinates = Coordinates.Create(1, 2),
                Name = "Name",
            });

            var importedTrip2 = new ImportedTripStub { Date = DateTime.Now };
            var site2 = Site.Create(new ImportedSiteStub(importedTrip2)
            {
                Comments = "Comments",
                Coordinates = Coordinates.Create(1, 2),
                Name = "Name",
            });

            Assert.IsTrue(site1.ShouldMerge(site2));
            site2.Merge(site1);
            Assert.AreEqual(2, site2.Visits.Count);
        }
    }
}
