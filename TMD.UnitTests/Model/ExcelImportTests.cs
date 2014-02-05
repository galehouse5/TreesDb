using Microsoft.VisualStudio.TestTools.UnitTesting;
using OfficeOpenXml;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using TMD.Model.ExcelImport;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class ExcelImportTests
    {
        private Stream data;
        private ExcelPackage package;
        private ExcelImportDatabase database;

        [TestInitialize]
        public void Initialize()
        {
            data = Assembly.GetExecutingAssembly().GetManifestResourceStream("TMD.UnitTests.Model.TMD.xlsx");
            package = new ExcelPackage(data);
            database = ExcelImportDatabase.Create(new TMD.Infrastructure.Repositories.ExcelImportRepository().EntityTypes, null, package.Workbook);
        }

        [TestCleanup]
        public void Cleanup()
        {
            package.Dispose();
            data.Dispose();
        }

        [TestMethod]
        public void ReadsSites()
        {
            Assert.AreEqual(4, database.Entities.Count(e => "Site".Equals(e.EntityType.Name)));

            ExcelImportEntity site = database.Entities.First(e => "Site".Equals(e.EntityType.Name));
            Assert.AreEqual("Mohawk Trail State Forest", site["Site Name"].Value);
            Assert.AreEqual(42.638353f, (float?)site["Latitude"].Value);
            Assert.AreEqual(-72.936443f, (float?)site["Longitude"].Value);
            Assert.AreEqual("Bob Leverett", site["Measurer Contact"].Value);
            Assert.AreEqual(true, site["Publicize Contact"].Value);
            Assert.AreEqual("7,500 acre forest", site["Comments"].Value);
            Assert.IsNull(site["Report Url"]);
        }

        [TestMethod]
        public void ReadsSubsites()
        {
            Assert.AreEqual(7, database.Entities.Count(e => "Subsite".Equals(e.EntityType.Name)));

            ExcelImportEntity subsite = database.Entities.First(e => "Subsite".Equals(e.EntityType.Name));
            Assert.AreEqual("Mohawk Trail State Forest", subsite["Site Name"].Value);
            Assert.AreEqual("Trees of Peace", subsite["Subsite Name"].Value);
            Assert.AreEqual(ExcelImportState.MA, subsite["State"].Value);
            Assert.AreEqual("Charlemont", subsite["County"].Value);
            Assert.IsNull(subsite["Township"]);
            Assert.AreEqual(42.643482f, (float?)subsite["Latitude"].Value);
            Assert.AreEqual(-72.935085f, (float?)subsite["Longitude"].Value);
            Assert.IsNull(subsite["Comments"]);
            Assert.AreEqual("State", subsite["Ownership Type"].Value);
            Assert.AreEqual("MTSF: 413-339-5504", subsite["Ownership Contact"].Value);
            Assert.AreEqual(false, subsite["Publicize Contact"].Value);
        }

        [TestMethod]
        public void ReadsTrees()
        {
            Assert.AreEqual(8, database.Entities.Count(e => "Tree".Equals(e.EntityType.Name)));

            ExcelImportEntity tree = database.Entities.First(e => "Tree".Equals(e.EntityType.Name));
            Assert.AreEqual("Trees of Peace", tree["Subsite Name"].Value);
            Assert.AreEqual("Jake Swamp", tree["Tree Name"].Value);
            Assert.AreEqual("white pine", tree["Common Name"].Value);
            Assert.AreEqual("Pinus strobus", tree["Botanical Name"].Value);
            Assert.AreEqual(172.5f, (float?)tree["Height"].Value);
            Assert.AreEqual(ExcelImportHeightMeasurementMethod.ClinometerLaserRangefinderSine, tree["Height Measurement Method"].Value);
            Assert.AreEqual("TruPulse", tree["Height Laser Brand"].Value);
            Assert.AreEqual("TruPulse", tree["Height Clinometer Brand"].Value);
            Assert.AreEqual(ExcelImportHeightMeasurementType.SelectionFromASet, tree["Height Measurement Type"].Value);
            Assert.IsNull(tree["Height Distance Top"]);
            Assert.IsNull(tree["Height Angle Top"]);
            Assert.IsNull(tree["Height Distance Bottom"]);
            Assert.IsNull(tree["Height Angle Bottom"]);
            Assert.IsNull(tree["Height Vertical Offset"]);
            Assert.AreEqual("Tallest tree in new England", tree["Height Comments"].Value);
            Assert.AreEqual(10.6f, (float?)tree["Girth"].Value);
            Assert.AreEqual(4.5f, (float?)tree["Girth Measurement Height"].Value);
            Assert.IsNull(tree["Girth Root Collar Height"]);
            Assert.IsNull(tree["Girth Comments"]);
            Assert.IsNull(tree["Crown Max Spread"]);
            Assert.AreEqual(48.5f, (float?)tree["Crown Average Spread"].Value);
            Assert.AreEqual(ExcelImportCrownSpreadMeasurementMethod.AverageOfMaxAndMin, tree["Crown Spread Measurement Method"].Value);
            Assert.IsNull(tree["Crown Base Height"]);
            Assert.IsNull(tree["Crown Area"]);
            Assert.IsNull(tree["Crown Area Measurement Method"]);
            Assert.IsNull(tree["Crown Volume"]);
            Assert.IsNull(tree["Crown Volume Calculation Method"]);
            Assert.IsNull(tree["Crown Comments"]);
            Assert.IsNull(tree["Trunk Volume"]);
            Assert.IsNull(tree["Trunk Volume Calculation Method"]);
            Assert.IsNull(tree["Trunk Count"]);
            Assert.IsNull(tree["Trunk Comments"]);
            Assert.AreEqual(ExcelImportTreeFormType.Single, tree["Form Type"].Value);
            Assert.IsNull(tree["Form Comments"]);
            Assert.AreEqual(ExcelImportTreeStatus.Native, tree["Status"].Value);
            Assert.AreEqual("Good", tree["Health Status"].Value);
            Assert.AreEqual(ExcelImportTreeAgeClass.Mature, tree["Age Class"].Value);
            Assert.AreEqual(155, (int?)tree["Age"].Value);
            Assert.AreEqual(ExcelImportTreeAgeMethod.Estimate, tree["Age Method"].Value);
            Assert.AreEqual(ExcelImportTerrainType.SideSlope, tree["Terrain Type"].Value);
            Assert.IsNull(tree["Terrain Shape Index"]);
            Assert.IsNull(tree["Landform Index"]);
            Assert.IsNull(tree["Terrain Comments"]);
            Assert.AreEqual(new DateTime(2013, 12, 6), tree["Date"].Value);
            Assert.AreEqual("Bob Leverett", tree["First Measurer"].Value);
            Assert.AreEqual("John Eichholz", tree["Second Measurer"].Value);
            Assert.AreEqual("Will Blozan", tree["Third Measurer"].Value);
            Assert.IsNull(tree["Latitude"]);
            Assert.IsNull(tree["Longitude"]);
            Assert.AreEqual(false, tree["Publicize Coordinates"].Value);
            Assert.AreEqual(800, (int?)tree["Elevation"].Value);
            Assert.IsNull(tree["General Comments"]);
        }

        [TestMethod]
        public void ReadsTrunks()
        {
            Assert.AreEqual(1, database.Entities.Count(e => "Trunk".Equals(e.EntityType.Name)));

            ExcelImportEntity trunk = database.Entities.First(e => "Trunk".Equals(e.EntityType.Name));
            Assert.AreEqual("Monarch", trunk["Tree Name"].Value);
            Assert.AreEqual(1.1f, (float?)trunk["Height"].Value);
            Assert.AreEqual(2.2f, (float?)trunk["Height Distance Top"].Value);
            Assert.AreEqual(3.3f, (float?)trunk["Height Angle Top"].Value);
            Assert.AreEqual(4.4f, (float?)trunk["Height Distance Bottom"].Value);
            Assert.AreEqual(5.5f, (float?)trunk["Height Angle Bottom"].Value);
            Assert.AreEqual(6.6f, (float?)trunk["Height Vertical Offset"].Value);
            Assert.AreEqual(7.7f, (float?)trunk["Girth"].Value);
            Assert.AreEqual(8.8f, (float?)trunk["Girth Measurement Height"].Value);
            Assert.AreEqual("hello world", trunk["Comments"].Value);
        }
    }
}
