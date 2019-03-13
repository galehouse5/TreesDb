using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using TMD.Model;
using TMD.Model.Imports;
using TMD.Model.Photos;
using TMD.UnitTests.Extensions;

namespace TMD.UnitTests.Infrastructure
{
    [TestClass]
    public class ImportsRepository
    {
        [TestMethod]
        public void PersistsTrip()
        {
            Trip trip = Trip.Create();
            trip.MeasurerContactInfo = "measurer contact info";
            trip.Name = "name";
            trip.PhotosAvailable = true;
            trip.Website = "website";
            trip.Date = DateTime.Now;

            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Imports.Save(trip);
                uow.Persist();
            }

            UnitOfWork.Dispose();

            using (var uow = UnitOfWork.Begin())
            {
                var found = Repositories.Imports.FindById(trip.Id);
                Assert.IsNotNull(found);
                Repositories.Imports.Remove(found);
                uow.Persist();
            }
        }

        [TestMethod]
        public void PersistsSites()
        {
            Trip trip = Trip.Create();
            trip.MeasurerContactInfo = "measurer contact info";
            trip.Name = "name";
            trip.PhotosAvailable = true;
            trip.Website = "website";
            trip.Date = DateTime.Now;

            Site site1 = trip.AddSite();
            site1.Name = "site 1 name";
            site1.Comments = "site 1 comments";
            site1.County = "site 1 county";
            site1.OwnershipContactInfo = "site 1 ownership contact info";
            site1.OwnershipType = "site 1 ownership type";
            site1.State = Repositories.Locations.FindStateByCountryAndStateCode("US", "OH");

            Site site2 = trip.AddSite();
            site2.Name = "site 2 name";
            site2.Comments = "site 2 comments";
            site2.Name = "site 2 name";
            site2.OwnershipContactInfo = "site 2 ownership contact info";
            site2.OwnershipType = "site 2 ownership type";
            site2.State = Repositories.Locations.FindStateByCountryAndStateCode("US", "OH");

            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Imports.Save(trip);
                uow.Persist();
            }

            UnitOfWork.Dispose();

            using (var uow = UnitOfWork.Begin())
            {
                var found = Repositories.Imports.FindById(trip.Id);
                Assert.IsNotNull(found);
                Assert.IsTrue(found.Sites.Count == 2);
                Repositories.Imports.Remove(found);
                uow.Persist();
            }
        }

        [TestMethod]
        public void PersistsTrees()
        {
            Trip trip = Trip.Create();
            trip.MeasurerContactInfo = "measurer contact info";
            trip.Name = "name";
            trip.PhotosAvailable = true;
            trip.Website = "website";
            trip.Date = DateTime.Now;
            trip.Measurers.Add(Name.Create("tree measurer 1 first name", "tree measurer 1 last name"));
            trip.Measurers.Add(Name.Create("tree measurer 2 first name", "tree measurer 2 last name"));

            Site site1 = trip.AddSite();
            site1.Name = "site 1 name";
            site1.Comments = "site 1 comments";
            site1.County = "site 1 county";
            site1.OwnershipContactInfo = "site 1 ownership contact info";
            site1.OwnershipType = "site 1 ownership type";
            site1.State = Repositories.Locations.FindStateByCountryAndStateCode("US", "OH");

            Site site2 = trip.AddSite();
            site2.Name = "site 2 name";
            site2.Comments = "site 2 comments";
            site2.Name = "site 2 name";
            site2.OwnershipContactInfo = "site 2 ownership contact info";
            site2.OwnershipType = "site 2 ownership type";
            site2.State = Repositories.Locations.FindStateByCountryAndStateCode("US", "OH");

            TreeBase tree1 = site2.AddSingleTrunkTree();
            tree1.Age = 10;
            tree1.AgeClass = TreeAgeClass.VeryOld;
            tree1.AgeType = TreeAgeType.RingCount;
            tree1.CrownSpread = Distance.Create(10);
            tree1.BaseCrownHeight = Distance.Create(20);
            tree1.ClinometerBrand = "tree measurement 1 clinometer brand";
            tree1.CommonName = "tree measurement 1 common name";
            tree1.Coordinates = Coordinates.Create(10, 20);
            tree1.CrownComments = "tree measurement 1 crown comments";
            tree1.CrownSpreadMeasurementMethod = "tree measurement 1 crown spread measurement method";
            tree1.CrownVolume = Volume.Create(10);
            tree1.CrownVolumeCalculationMethod = "tree measurement 1 crown volume calculation method";
            tree1.Elevation = Elevation.Create(10);
            tree1.FormType = TreeFormType.Vine;
            tree1.GeneralComments = "tree measurement 1 general comments";
            tree1.Girth = Distance.Create(30);
            tree1.GirthComments = "tree measurement 1 girth comments";
            tree1.GirthMeasurementHeight = Distance.Create(40);
            tree1.GirthRootCollarHeight = Distance.Create(50);
            tree1.HealthStatus = "tree measurement 1 health status";
            tree1.Height = Distance.Create(60);
            tree1.HeightComments = "tree measurement 1 height comments";
            tree1.HeightMeasurements = HeightMeasurements.Create(
                Distance.Create(70),
                Angle.Create(10),
                Distance.Create(80),
                Angle.Create(20),
                DirectedDistance.Create(10));
            tree1.HeightMeasurementType = "tree measurement 1 height measurement type";
            tree1.LandformIndex = .10f;
            tree1.LaserBrand = "tree measurement 1 laser brand";
            tree1.CrownSpread = Distance.Create(90);
            tree1.MaximumLimbLength = Distance.Create(100);
            tree1.NumberOfTrunks = 10;
            tree1.ScientificName = "tree measurement 1 scientific name";
            tree1.Status = TreeStatus.ExoticPlanted;
            tree1.TerrainComments = "tree measurement 1 terrain comments";
            tree1.TerrainShapeIndex = .10f;
            tree1.TerrainType = TreeTerrainType.HillTop;
            tree1.TreeFormComments = "tree measurement 1 tree form comments";
            tree1.TrunkComments = "tree measurement 1 trunk comments";
            tree1.TrunkVolume = Volume.Create(20);
            tree1.TrunkVolumeCalculationMethod = "tree measurement 1 trunk volume calculation method";

            MultiTrunkTree tree2 = site2.AddMultiTrunkTree();
            tree2.NumberOfTrunks = 10;
            tree2.FormType = TreeFormType.Multi;
            Trunk trunk1 = tree2.AddTrunkMeasurement();
            trunk1.Girth = Distance.Create(10);
            trunk1.GirthMeasurementHeight = Distance.Create(20);
            trunk1.Height = Distance.Create(30);
            trunk1.HeightMeasurements = HeightMeasurements.Create(
                Distance.Create(40),
                Angle.Create(50),
                Distance.Create(60),
                Angle.Create(70),
                DirectedDistance.Create(80));
            Trunk trunk2 = tree2.AddTrunkMeasurement();
            trunk2.Girth = Distance.Create(10);
            trunk2.GirthMeasurementHeight = Distance.Create(20);
            trunk2.Height = Distance.Create(30);
            trunk2.HeightMeasurements = HeightMeasurements.Create(
                Distance.Create(40),
                Angle.Create(50),
                Distance.Create(60),
                Angle.Create(70),
                DirectedDistance.Create(80));
            tree2.Age = 10;
            tree2.AgeClass = TreeAgeClass.VeryOld;
            tree2.AgeType = TreeAgeType.RingCount;
            tree2.CrownSpread = Distance.Create(10);
            tree2.BaseCrownHeight = Distance.Create(20);
            tree2.ClinometerBrand = "tree measurement 2 clinometer brand";
            tree2.CommonName = "tree measurement 2 common name";
            tree2.Coordinates = Coordinates.Create(30, 40);
            tree2.CrownComments = "tree measurement 2 crown comments";
            tree2.CrownSpreadMeasurementMethod = "tree measurement 2 crown spread measurement method";
            tree2.CrownVolume = Volume.Create(10);
            tree2.CrownVolumeCalculationMethod = "tree measurement 2 crown volume calculation method";
            tree2.Elevation = Elevation.Create(10);
            tree2.GeneralComments = "tree measurement 2 general comments";
            tree2.Girth = Distance.Create(30);
            tree2.GirthComments = "tree measurement 2 girth comments";
            tree2.GirthMeasurementHeight = Distance.Create(40);
            tree2.GirthRootCollarHeight = Distance.Create(50);
            tree2.HealthStatus = "tree measurement 2 health status";
            tree2.Height = Distance.Create(60);
            tree2.HeightComments = "tree measurement 2 height comments";
            tree2.HeightMeasurements = HeightMeasurements.Create(
                Distance.Create(70),
                Angle.Create(10),
                Distance.Create(80),
                Angle.Create(20),
                DirectedDistance.Create(10));
            tree2.HeightMeasurementType = "tree measurement 2 height measurement type";
            tree2.LandformIndex = .10f;
            tree2.LaserBrand = "tree measurement 2 laser brand";
            tree2.CrownSpread = Distance.Create(90);
            tree2.MaximumLimbLength = Distance.Create(100);
            tree2.ScientificName = "tree measurement 2 scientific name";
            tree2.Status = TreeStatus.ExoticPlanted;
            tree2.TerrainComments = "tree measurement 2 terrain comments";
            tree2.TerrainShapeIndex = .10f;
            tree2.TerrainType = TreeTerrainType.HillTop;
            tree2.TreeFormComments = "tree measurement 2 tree form comments";
            tree2.TrunkComments = "tree measurement 2 trunk comments";
            tree2.TrunkVolume = Volume.Create(20);
            tree2.TrunkVolumeCalculationMethod = "tree measurement 1 trunk volume calculation method";

            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Imports.Save(trip);
                uow.Persist();
            }

            UnitOfWork.Dispose();

            using (var uow = UnitOfWork.Begin())
            {
                Trip found = Repositories.Imports.FindById(trip.Id);
                Assert.IsNotNull(found);
                Assert.IsTrue(found.Sites.Count == 2);
                Assert.IsTrue(found.Sites[1].Trees.Count == 2);
                Repositories.Imports.Remove(found);
                uow.Persist();
            }
        }

        [TestMethod]
        public void PersistsTreeWithPhotos()
        {
            Trip trip = Trip.Create();
            trip.MeasurerContactInfo = "measurer contact info";
            trip.Name = "name";
            trip.Measurers.Add(Name.Create("tree measurer 1 first name", "tree measurer 1 last name"));

            Site site1 = trip.AddSite();
            site1.Name = "site 1 name";
            site1.County = "site 1 county";
            site1.OwnershipType = "site 1 ownership type";
            site1.State = Repositories.Locations.FindStateByCountryAndStateCode("US", "OH");
            Site site2 = trip.AddSite();
            site2.Name = "site 2 name";
            site2.County = "site 2 county";
            site2.OwnershipType = "site 2 ownership type";
            site2.State = Repositories.Locations.FindStateByCountryAndStateCode("US", "OH");

            TreeBase tree1 = site2.AddSingleTrunkTree();
            tree1.CommonName = "tree measurement 1 common name";
            tree1.ScientificName = "tree measurement 1 scientific name";

            MultiTrunkTree tree2 = site2.AddMultiTrunkTree();
            tree2.CommonName = "tree measurement 2 common name";
            tree2.ScientificName = "tree measurement 2 scientific name";

            tree2.AddPhoto(TemporaryPhoto.Create("Square.jpg".GetPhoto()));
            tree2.AddPhoto(TemporaryPhoto.Create("Thumbnail.jpg".GetPhoto()));

            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Imports.Save(trip);
                uow.Persist();
            }

            UnitOfWork.Dispose();

            using (var uow = UnitOfWork.Begin())
            {
                Trip found = Repositories.Imports.FindById(trip.Id);
                Assert.IsNotNull(found);
                Assert.AreEqual(2, found.Sites.Count);
                Assert.AreEqual(2, found.Sites[1].Trees.Count);
                Assert.AreEqual(2, found.Sites[1].Trees[1].Photos.Count);
                Assert.IsTrue("Square.jpg".GetPhoto().CompareByContent(found.Sites[1].Trees[1].Photos[0].Get()));
                Assert.IsTrue("Thumbnail.jpg".GetPhoto().CompareByContent(found.Sites[1].Trees[1].Photos[1].Get()));
                Repositories.Imports.Remove(found);
                uow.Persist();
            }
        }
    }
}
