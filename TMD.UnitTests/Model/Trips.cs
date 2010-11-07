﻿using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model.Trips;
using TMD.Model;
using TMD.Model.Locations;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Trips
    {
        [TestMethod]
        public void AddAndRemoveTrip()
        {            
            Trip t = Trip.Create();
            t.MeasurerContactInfo = "measurer contact info";
            t.Name = "name";
            t.PhotosAvailable = true;
            t.Website = "website";
            t.Date = DateTime.Now;

            using (UnitOfWork.Begin())
            {
                Repositories.Trips.Save(t);
                UnitOfWork.Persist();
            }
            
            Trip found = Repositories.Trips.FindById(t.Id);
            Assert.IsNotNull(found);
            
            using (UnitOfWork.Begin())
            {
                Repositories.Trips.Remove(t);
                UnitOfWork.Persist();
            }
        }

        [TestMethod]
        public void AddAndRemoveTripWithSiteVisits()
        {
            Trip t = Trip.Create();
            t.MeasurerContactInfo = "measurer contact info";
            t.Name = "name";
            t.PhotosAvailable = true;
            t.Website = "website";
            t.Date = DateTime.Now;

            SiteVisit sv1 = t.AddSiteVisit();
            sv1.Name = "site visit 1 name";
            sv1.Comments = "site visit 1 comments";
            SiteVisit sv2 = t.AddSiteVisit();
            sv2.Name = "site visit 2 name";
            sv2.Comments = "site visit 2 comments";

            using (UnitOfWork.Begin())
            {
                Repositories.Trips.Save(t);
                UnitOfWork.Persist();
            }

            Trip found = Repositories.Trips.FindById(t.Id);
            Assert.IsNotNull(found);
            Assert.IsTrue(found.SiteVisits.Count == 2);

            using (UnitOfWork.Begin())
            {
                Repositories.Trips.Remove(t);
                UnitOfWork.Persist();
            }
        }

        [TestMethod]
        public void AddAndRemoveTripWithSiteVisitsAndSubsiteVisits()
        {
            Trip t = Trip.Create();
            t.MeasurerContactInfo = "measurer contact info";
            t.Name = "name";
            t.PhotosAvailable = true;
            t.Website = "website";
            t.Date = DateTime.Now;

            SiteVisit sv1 = t.AddSiteVisit();
            sv1.Name = "site visit 1 name";
            sv1.Comments = "site visit 1 comments";
            SiteVisit sv2 = t.AddSiteVisit();
            sv2.Name = "site visit 2 name";
            sv2.Comments = "site visit 2 comments";

            SubsiteVisit ssv1 = sv2.AddSubsiteVisit();
            ssv1.Comments = "subsite visit 1 comments";
            ssv1.Country = Repositories.Locations.FindCountryByCode("US");
            ssv1.County = "subsite visit 1 county";
            ssv1.Name = "subsite visit 1 name";
            ssv1.OwnershipContactInfo = "subsite visit 1 ownership contact info";
            ssv1.OwnershipType = "subsite visit 1 ownership type";
            ssv1.State = Repositories.Locations.FindStateByCountryAndStateCodes("US", "OH");
            SubsiteVisit ssv2 = sv2.AddSubsiteVisit();
            ssv2.Comments = "subsite visit 2 comments";
            ssv2.Country = Repositories.Locations.FindCountryByCode("US");
            ssv2.County = "subsite visit 2 county";
            ssv2.Name = "subsite visit 2 name";
            ssv2.OwnershipContactInfo = "subsite visit 2 ownership contact info";
            ssv2.OwnershipType = "subsite visit 2 ownership type";
            ssv2.State = Repositories.Locations.FindStateByCountryAndStateCodes("US", "OH");
            
            using (UnitOfWork.Begin())
            {
                Repositories.Trips.Save(t);
                UnitOfWork.Persist();
            }

            Trip found = Repositories.Trips.FindById(t.Id);
            Assert.IsNotNull(found);
            Assert.IsTrue(found.SiteVisits.Count == 2);
            Assert.IsTrue(found.SiteVisits[1].SubsiteVisits.Count == 2);

            using (UnitOfWork.Begin())
            {
                Repositories.Trips.Remove(t);
                UnitOfWork.Persist();
            }
        }

        [TestMethod]
        public void AddAndRemoveTripWithSiteVisitsAndSubsiteVisitsAndMeasurementsAndMeasurers()
        {
            Trip t = Trip.Create();
            t.MeasurerContactInfo = "measurer contact info";
            t.Name = "name";
            t.PhotosAvailable = true;
            t.Website = "website";
            t.Date = DateTime.Now;
            Measurer tmeasurer1 = t.AddMeasurer();
            tmeasurer1.FirstName = "tree measurer 1 first name";
            tmeasurer1.LastName = "tree measurer 1 last name";
            Measurer tmeasurer2 = t.AddMeasurer();
            tmeasurer2.FirstName = "tree measurer 2 first name";
            tmeasurer2.LastName = "tree measurer 2 last name";

            SiteVisit sv1 = t.AddSiteVisit();
            sv1.Name = "site visit 1 name";
            sv1.Comments = "site visit 1 comments";
            SiteVisit sv2 = t.AddSiteVisit();
            sv2.Name = "site visit 2 name";
            sv2.Comments = "site visit 2 comments";

            SubsiteVisit ssv1 = sv2.AddSubsiteVisit();
            ssv1.Comments = "subsite visit 1 comments";
            ssv1.Country = Repositories.Locations.FindCountryByCode("US");
            ssv1.County = "subsite visit 1 county";
            ssv1.Name = "subsite visit 1 name";
            ssv1.OwnershipContactInfo = "subsite visit 1 ownership contact info";
            ssv1.OwnershipType = "subsite visit 1 ownership type";
            ssv1.State = Repositories.Locations.FindStateByCountryAndStateCodes("US", "OH");
            SubsiteVisit ssv2 = sv2.AddSubsiteVisit();
            ssv2.Comments = "subsite visit 2 comments";
            ssv2.Country = Repositories.Locations.FindCountryByCode("US");
            ssv2.County = "subsite visit 2 county";
            ssv2.Name = "subsite visit 2 name";
            ssv2.OwnershipContactInfo = "subsite visit 2 ownership contact info";
            ssv2.OwnershipType = "subsite visit 2 ownership type";
            ssv2.State = Repositories.Locations.FindStateByCountryAndStateCodes("US", "OH");

            TreeMeasurementBase tm1 = ssv2.AddSingleTrunkTreeMeasurement();
            tm1.Age = 10;
            tm1.AgeClass = TreeAgeClass.VeryOld;
            tm1.AgeType = TreeAgeType.RingCount;
            tm1.CrownSpread = Distance.Create(10);
            tm1.BaseCrownHeight = Distance.Create(20);
            tm1.ClinometerBrand = "tree measurement 1 clinometer brand";
            tm1.CommonName = "tree measurement 1 common name";
            tm1.Coordinates = Coordinates.Create(10, 20);
            tm1.CrownComments = "tree measurement 1 crown comments";
            tm1.CrownSpreadMeasurementMethod = "tree measurement 1 crown spread measurement method";
            tm1.CrownVolume = Volume.Create(10);
            tm1.CrownVolumeCalculationMethod = "tree measurement 1 crown volume calculation method";
            tm1.Elevation = Elevation.Create(10);
            tm1.FormType = TreeFormType.Vine;
            tm1.GeneralComments = "tree measurement 1 general comments";
            tm1.Girth = Distance.Create(30);
            tm1.GirthComments = "tree measurement 1 girth comments";
            tm1.GirthMeasurementHeight = Distance.Create(40);
            tm1.GirthRootCollarHeight = Distance.Create(50);
            tm1.HealthStatus = "tree measurement 1 health status";
            tm1.Height = Distance.Create(60);
            tm1.HeightComments = "tree measurement 1 height comments";
            tm1.HeightMeasurements = HeightMeasurements.Create(
                Distance.Create(70),
                Angle.Create(10),
                Distance.Create(80),
                Angle.Create(20),
                DirectedDistance.Create(10));
            tm1.HeightMeasurementType = "tree measurement 1 height measurement type";
            tm1.LandformIndex = .10f;
            tm1.LaserBrand = "tree measurement 1 laser brand";
            tm1.CrownSpread = Distance.Create(90);
            tm1.MaximumLimbLength = Distance.Create(100);
            tm1.NumberOfTrunks = 10;
            tm1.ScientificName = "tree measurement 1 scientific name";
            tm1.Status = TreeStatus.ExoticPlanted;
            tm1.TerrainComments = "tree measurement 1 terrain comments";
            tm1.TerrainShapeIndex = .10f;
            tm1.TerrainType = TreeTerrainType.HillTop;
            tm1.TreeFormComments = "tree measurement 1 tree form comments";
            tm1.TrunkComments = "tree measurement 1 trunk comments";
            tm1.TrunkVolume = Volume.Create(20);
            tm1.TrunkVolumeCalculationMethod = "tree measurement 1 trunk volume calculation method";

            MultiTrunkTreeMeasurement tm2 = ssv2.AddMultiTrunkTreeMeasurement();
            tm2.NumberOfTrunks = 10;
            tm2.FormType = TreeFormType.Multi;
            TrunkMeasurement trunk1 = tm2.AddTrunkMeasurement();
            trunk1.Girth = Distance.Create(10);
            trunk1.GirthMeasurementHeight = Distance.Create(20);
            trunk1.Height = Distance.Create(30);
            trunk1.HeightMeasurements = HeightMeasurements.Create(
                Distance.Create(40),
                Angle.Create(50),
                Distance.Create(60),
                Angle.Create(70),
                DirectedDistance.Create(80));
            TrunkMeasurement trunk2 = tm2.AddTrunkMeasurement();
            trunk2.Girth = Distance.Create(10);
            trunk2.GirthMeasurementHeight = Distance.Create(20);
            trunk2.Height = Distance.Create(30);
            trunk2.HeightMeasurements = HeightMeasurements.Create(
                Distance.Create(40),
                Angle.Create(50),
                Distance.Create(60),
                Angle.Create(70),
                DirectedDistance.Create(80));
            tm2.Age = 10;
            tm2.AgeClass = TreeAgeClass.VeryOld;
            tm2.AgeType = TreeAgeType.RingCount;
            tm2.CrownSpread = Distance.Create(10);
            tm2.BaseCrownHeight = Distance.Create(20);
            tm2.ClinometerBrand = "tree measurement 2 clinometer brand";
            tm2.CommonName = "tree measurement 2 common name";
            tm2.Coordinates = Coordinates.Create(30, 40);
            tm2.CrownComments = "tree measurement 2 crown comments";
            tm2.CrownSpreadMeasurementMethod = "tree measurement 2 crown spread measurement method";
            tm2.CrownVolume = Volume.Create(10);
            tm2.CrownVolumeCalculationMethod = "tree measurement 2 crown volume calculation method";
            tm2.Elevation = Elevation.Create(10);
            tm2.GeneralComments = "tree measurement 2 general comments";
            tm2.Girth = Distance.Create(30);
            tm2.GirthComments = "tree measurement 2 girth comments";
            tm2.GirthMeasurementHeight = Distance.Create(40);
            tm2.GirthRootCollarHeight = Distance.Create(50);
            tm2.HealthStatus = "tree measurement 2 health status";
            tm2.Height = Distance.Create(60);
            tm2.HeightComments = "tree measurement 2 height comments";
            tm2.HeightMeasurements = HeightMeasurements.Create(
                Distance.Create(70),
                Angle.Create(10),
                Distance.Create(80),
                Angle.Create(20),
                DirectedDistance.Create(10));
            tm2.HeightMeasurementType = "tree measurement 2 height measurement type";
            tm2.LandformIndex = .10f;
            tm2.LaserBrand = "tree measurement 2 laser brand";
            tm2.CrownSpread = Distance.Create(90);
            tm2.MaximumLimbLength = Distance.Create(100);
            tm2.ScientificName = "tree measurement 2 scientific name";
            tm2.Status = TreeStatus.ExoticPlanted;
            tm2.TerrainComments = "tree measurement 2 terrain comments";
            tm2.TerrainShapeIndex = .10f;
            tm2.TerrainType = TreeTerrainType.HillTop;
            tm2.TreeFormComments = "tree measurement 2 tree form comments";
            tm2.TrunkComments = "tree measurement 2 trunk comments";
            tm2.TrunkVolume = Volume.Create(20);
            tm2.TrunkVolumeCalculationMethod = "tree measurement 1 trunk volume calculation method";

            using (UnitOfWork.Begin())
            {
                Repositories.Trips.Save(t);
                UnitOfWork.Persist();
            }

            Trip found = Repositories.Trips.FindById(t.Id);
            Assert.IsNotNull(found);
            Assert.IsTrue(found.SiteVisits.Count == 2);
            Assert.IsTrue(found.SiteVisits[1].SubsiteVisits.Count == 2);
            Assert.IsTrue(found.SiteVisits[1].SubsiteVisits[1].TreeMeasurements.Count == 2);

            using (UnitOfWork.Begin())
            {
                Repositories.Trips.Remove(t);
                UnitOfWork.Persist();
            }
        }

        //[TestMethod]
        //public void ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers()
        //{
        //    Trip t = Trip.Create();
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid);
        //    t.MeasurerContactInfo = "measurer contact info";
        //    t.Name = "name";
        //    t.PhotosAvailable = true;
        //    t.Website = "website";
        //    t.Date = DateTime.Now;
        //    Assert.IsTrue(t.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid);
        //    SiteVisit sv1 = t.AddSiteVisit();
        //    Assert.IsTrue(t.ValidateIgnoringSiteVisitsSubsiteVisitsTreeMeasurementsAndTreeMeasurers().IsValid);
        //}

        //[TestMethod]
        //public void ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers()
        //{
        //    Trip t = Trip.Create();
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid);
        //    t.MeasurerContactInfo = "measurer contact info";
        //    t.Name = "name";
        //    t.PhotosAvailable = true;
        //    t.Website = "website";
        //    t.Date = DateTime.Now;
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid);
        //    SiteVisit sv1 = t.AddSiteVisit();
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid);
        //    sv1.Name = "site visit name";
        //    sv1.Comments = "site visit 1 comments";
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid);
        //    SubsiteVisit ssv = sv1.AddSubsiteVisit();
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid);
        //    ssv.Comments = "subsite visit comments";
        //    ssv.Country = Repositories.Locations.FindCountryByCode("US");
        //    ssv.County = "subsite visit county";
        //    ssv.Name = "subsite visit name";
        //    ssv.OwnershipContactInfo = "subsite visit ownership contact info";
        //    ssv.OwnershipType = "subsite visit ownership type";
        //    ssv.State = Repositories.Locations.FindStateByCountryAndStateCodes("US", "OH");
        //    Assert.IsTrue(t.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid);
        //    TreeMeasurementBase tm = ssv.AddSingleTrunkTreeMeasurement();
        //    Assert.IsTrue(t.ValidateIgnoringSiteVisitCoordinatesSubsiteVisitCoordinatesTreeMeasurementsAndTreeMeasurers().IsValid);
        //}

        //[TestMethod]
        //public void ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates()
        //{
        //    Trip t = Trip.Create();
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid);
        //    t.MeasurerContactInfo = "measurer contact info";
        //    t.Name = "name";
        //    t.PhotosAvailable = true;
        //    t.Website = "website";
        //    t.Date = DateTime.Now;
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid);
        //    SiteVisit sv1 = t.AddSiteVisit();
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid);
        //    sv1.Name = "site visit name";
        //    sv1.Comments = "site visit 1 comments";
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid);
        //    SubsiteVisit ssv = sv1.AddSubsiteVisit();
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid);
        //    ssv.Comments = "subsite visit comments";
        //    ssv.Country = Repositories.Locations.FindCountryByCode("US");
        //    ssv.County = "subsite visit county";
        //    ssv.Name = "subsite visit name";
        //    ssv.OwnershipContactInfo = "subsite visit ownership contact info";
        //    ssv.OwnershipType = "subsite visit ownership type";
        //    ssv.State = Repositories.Locations.FindStateByCountryAndStateCodes("US", "OH");
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid);
        //    TreeMeasurementBase tm = ssv.AddSingleTrunkTreeMeasurement();
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid);
        //    tm.CommonName = "tree measurement common name";
        //    tm.ScientificName = "tree measurement scientific name";
        //    tm.Coordinates = Coordinates.Create(10, 20);
        //    Assert.IsFalse(t.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid);
        //    Measurer tmeasurer1 = t.AddMeasurer();
        //    tmeasurer1.FirstName = "tree measurer 1 first name";
        //    tmeasurer1.LastName = "tree measurer 1 last name";
        //    Assert.IsTrue(t.ValidateIgnoringSiteVisitCoordinatesAndSubsiteVisitCoordinates().IsValid);
        //}

        //[TestMethod]
        //public void ValidateRegardingPersistence()
        //{
        //    Trip t = Trip.Create();
        //    Assert.IsTrue(t.ValidateRegardingPersistence().IsValid);
        //    t.MeasurerContactInfo = "measurer contact info";
        //    t.Name = "name";
        //    t.PhotosAvailable = true;
        //    t.Website = "website";
        //    t.Date = DateTime.Now;
        //    Assert.IsTrue(t.ValidateRegardingPersistence().IsValid);
        //    SiteVisit sv1 = t.AddSiteVisit();
        //    Assert.IsTrue(t.ValidateRegardingPersistence().IsValid);
        //    sv1.Name = "site visit name";
        //    sv1.Comments = "site visit 1 comments";
        //    Assert.IsTrue(t.ValidateRegardingPersistence().IsValid);
        //    SubsiteVisit ssv = sv1.AddSubsiteVisit();
        //    Assert.IsTrue(t.ValidateRegardingPersistence().IsValid);
        //    ssv.Comments = "subsite visit comments";
        //    ssv.Country = Repositories.Locations.FindCountryByCode("US");
        //    ssv.County = "subsite visit county";
        //    ssv.Name = "subsite visit name";
        //    ssv.OwnershipContactInfo = "subsite visit ownership contact info";
        //    ssv.OwnershipType = "subsite visit ownership type";
        //    ssv.State = Repositories.Locations.FindStateByCountryAndStateCodes("US", "OH");
        //    Assert.IsTrue(t.ValidateRegardingPersistence().IsValid);
        //    TreeMeasurementBase tm = ssv.AddSingleTrunkTreeMeasurement();
        //    Assert.IsTrue(t.ValidateRegardingPersistence().IsValid);
        //    tm.CommonName = "tree measurement common name";
        //    tm.ScientificName = "tree measurement scientific name";
        //    Assert.IsTrue(t.ValidateRegardingPersistence().IsValid);
        //}

        //[TestMethod]
        //public void ValidateRegardingImport()
        //{
        //    Trip t = Trip.Create();
        //    Assert.IsFalse(t.ValidateRegardingImport().IsValid);
        //    t.MeasurerContactInfo = "measurer contact info";
        //    t.Name = "name";
        //    t.PhotosAvailable = true;
        //    t.Website = "website";
        //    t.Date = DateTime.Now;
        //    Assert.IsFalse(t.ValidateRegardingImport().IsValid);
        //    SiteVisit sv1 = t.AddSiteVisit();
        //    Assert.IsFalse(t.ValidateRegardingImport().IsValid);
        //    sv1.Name = "site visit name";
        //    sv1.Comments = "site visit 1 comments";
        //    Assert.IsFalse(t.ValidateRegardingImport().IsValid);
        //    SubsiteVisit ssv = sv1.AddSubsiteVisit();
        //    Assert.IsFalse(t.ValidateRegardingImport().IsValid);
        //    ssv.Comments = "subsite visit comments";
        //    ssv.Country = Repositories.Locations.FindCountryByCode("US");
        //    ssv.County = "subsite visit county";
        //    ssv.Name = "subsite visit name";
        //    ssv.OwnershipContactInfo = "subsite visit ownership contact info";
        //    ssv.OwnershipType = "subsite visit ownership type";
        //    ssv.State = Repositories.Locations.FindStateByCountryAndStateCodes("US", "OH");
        //    Assert.IsFalse(t.ValidateRegardingImport().IsValid);
        //    TreeMeasurementBase tm = ssv.AddSingleTrunkTreeMeasurement();
        //    Assert.IsFalse(t.ValidateRegardingImport().IsValid);
        //    tm.CommonName = "tree measurement common name";
        //    tm.ScientificName = "tree measurement scientific name";
        //    tm.Coordinates = Coordinates.Create(10, 20);
        //    ssv.CoordinatesEntered = true;
        //    ssv.Coordinates = Coordinates.Create(1, 2);
        //    Assert.IsFalse(t.ValidateRegardingImport().IsValid);
        //    Measurer tmeasurer1 = t.AddMeasurer();
        //    tmeasurer1.FirstName = "tree measurer 1 first name";
        //    tmeasurer1.LastName = "tree measurer 1 last name";
        //    Assert.IsTrue(t.ValidateRegardingImport().IsValid);
        //}
    }
}
