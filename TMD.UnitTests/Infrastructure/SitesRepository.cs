using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model;
using TMD.Model.Locations;
using TMD.UnitTests.Extensions;
using TMD.Model.Photos;
using TMD.UnitTests.Stubs;
using TMD.Model.Sites;
using TMD.Model.Extensions;

namespace TMD.UnitTests.Infrastructure
{
    [TestClass]
    public class SitesRepository
    {
        [TestMethod]
        public void SavesSiteWithSubsite()
        {
            var importedTrip = new ImportedTripStub { Date = DateTime.Now.AddDays(1) };
            var importedSite = new ImportedSiteStub(importedTrip)
            {
                Comments = "Comments",
                Coordinates = Coordinates.Create(1, 2),
                Name = "Name"
            };
            var importedSubsite = new ImportedSubsiteStub(importedSite)
            {
                Comments = "Comments",
                Coordinates = Coordinates.Create(3, 4),
                County = "County",
                MakeOwnershipContactInfoPublic = true,
                Name = "Name",
                OwnershipContactInfo = "OwnershipContactInfo",
                OwnershipType = "OwnershipType",
                State = Repositories.Locations.FindStateById(50),
            };
            importedSite.Subsites.Add(importedSubsite);
            var site = Site.Create(importedSite);
            site.Visits[0].SetPrivatePropertyValue("ImportingTrip", null);
            site.Subsites[0].Visits[0].SetPrivatePropertyValue("ImportingTrip", null);
            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Sites.Save(site);
                UnitOfWork.Flush();
                UnitOfWork.Refresh(site);
                Assert.IsNotNull(site);
                Assert.IsNotNull(site.Visits);
                Assert.AreEqual(1, site.Visits.Count);
                Assert.IsNotNull(site.Subsites);
                Assert.AreEqual(1, site.Subsites.Count);
                Assert.IsNotNull(site.Subsites[0]);
                Assert.IsNotNull(site.Subsites[0].Visits);
                Assert.AreEqual(1, site.Subsites[0].Visits.Count);
                uow.Rollback();
            }
        }

        [TestMethod]
        public void FindsByProximity()
        {
            var importedTrip = new ImportedTripStub { Date = DateTime.Now };
            var site1 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(1, 2),
                Name = "Name1",
                Comments = "Comments1"
            });
            site1.Visits[0].SetPrivatePropertyValue("ImportingTrip", null);
            var site2 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(1.1f, 2.1f),
                Name = "Name2",
                Comments = "Comments2"
            });
            site2.Visits[0].SetPrivatePropertyValue("ImportingTrip", null);
            var site3 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(0.9f, 1.9f),
                Name = "Name3",
                Comments = "Comments3"
            });
            site3.Visits[0].SetPrivatePropertyValue("ImportingTrip", null);
            var site4 = Site.Create(new ImportedSiteStub(importedTrip)
            {
                Coordinates = Coordinates.Create(3, 4),
                Name = "Name4",
                Comments = "Comments4"
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

        //[TestMethod]
        //public void Removes()
        //{
        //    using (var uow = UnitOfWork.Begin())
        //    {
        //        Repositories.Sites.Remove(Repositories.Sites.FindById(61));
        //        //uow.Rollback();
        //        uow.Persist();
        //    }
        //}
    }
}
