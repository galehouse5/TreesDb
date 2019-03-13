using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using TMD.Model;
using TMD.Model.Extensions;
using TMD.Model.Sites;
using TMD.UnitTests.Stubs;

namespace TMD.UnitTests.Infrastructure
{
    [TestClass]
    public class SitesRepository
    {
        [TestMethod]
        public void SavesSite()
        {
            var importedTrip = new ImportedTripStub
            {
                Date = DateTime.Now.AddDays(1),
                Website = "http://www.example.com"
            };
            var importedSite = new ImportedSiteStub(importedTrip)
            {
                Comments = "Comments",
                Coordinates = Coordinates.Create(1, 2),
                County = "County",
                MakeOwnershipContactInfoPublic = true,
                Name = "Name",
                OwnershipContactInfo = "OwnershipContactInfo",
                OwnershipType = "OwnershipType",
                State = Repositories.Locations.FindStateById(50)
            };
            var site = Site.Create(importedSite);
            site.Visits[0].SetPrivatePropertyValue("ImportingTrip", null);
            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Sites.Save(site);
                UnitOfWork.Flush();
                UnitOfWork.Refresh(site);
                Assert.IsNotNull(site);
                Assert.IsNotNull(site.Visits);
                Assert.AreEqual(1, site.Visits.Count);
                uow.Rollback();
            }
        }

        [TestMethod]
        public void FindsByProximity()
        {
            var state = Repositories.Locations.FindStateById(50);
            var importedTrip = new ImportedTripStub
            {
                Date = DateTime.Now.AddDays(1),
                Website = "http://www.example.com"
            };
            var site1 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(1, 2),
                County = "County 1",
                Name = "Name 1",
                Comments = "Comments 1",
                OwnershipContactInfo = "OwnershipContactInfo 1",
                OwnershipType = "OwnershipType 1",
                State = state
            });
            site1.Visits[0].SetPrivatePropertyValue("ImportingTrip", null);

            var site2 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(1.1f, 2.1f),
                County = "County 2",
                Name = "Name 2",
                Comments = "Comments 2",
                OwnershipContactInfo = "OwnershipContactInfo 2",
                OwnershipType = "OwnershipType 2",
                State = state
            });
            site2.Visits[0].SetPrivatePropertyValue("ImportingTrip", null);

            var site3 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(0.9f, 1.9f),
                County = "County 3",
                Name = "Name 3",
                Comments = "Comments 3",
                OwnershipContactInfo = "OwnershipContactInfo 3",
                OwnershipType = "OwnershipType 3",
                State = state
            });
            site3.Visits[0].SetPrivatePropertyValue("ImportingTrip", null);

            var site4 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(3, 4),
                County = "County 4",
                Name = "Name 4",
                Comments = "Comments 4",
                OwnershipContactInfo = "OwnershipContactInfo 4",
                OwnershipType = "OwnershipType 4",
                State = state
            });
            site4.Visits[0].SetPrivatePropertyValue("ImportingTrip", null);

            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Sites.Save(site1);
                Repositories.Sites.Save(site2);
                Repositories.Sites.Save(site3);
                Repositories.Sites.Save(site4);
                UnitOfWork.Flush();
                IList<Site> sites = Repositories.Sites.ListByProximity(Coordinates.Create(1, 2), Site.CoordinateMinutesEquivalenceProximity);
                Assert.IsNotNull(sites);
                Assert.AreEqual(3, sites.Count);
                Assert.IsTrue(sites.Contains(site1));
                Assert.IsTrue(sites.Contains(site2));
                Assert.IsTrue(sites.Contains(site3));
                Assert.IsFalse(sites.Contains(site4));
                uow.Rollback();
            }
        }

        //[TestMethod]
        //public void Merges()
        //{
        //    using (var uow = UnitOfWork.Begin())
        //    {
        //        var trips = Repositories.Imports.ListAll();
        //        foreach (var importedSite in from trip in trips where trip.IsImported from site in trip.Sites select site)
        //        {
        //            var site = Site.Create(importedSite);
        //            UnitOfWork.Refresh(site);
        //            Repositories.Sites.Merge(site);
        //        }
        //        //uow.Rollback();
        //        uow.Persist();
        //    }
        //}
    }
}
