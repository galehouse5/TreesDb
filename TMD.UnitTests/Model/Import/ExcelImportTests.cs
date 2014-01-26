using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using TMD.Model.Import;
using TMD.Model.Import.Excel;

namespace TMD.UnitTests.Model.Import
{
    [TestClass]
    public class ExcelImportTests
    {
        private Stream data;
        private ExcelImport import;

        [TestInitialize]
        public void Initialize()
        {
            data = Assembly.GetExecutingAssembly().GetManifestResourceStream("TMD.UnitTests.Model.Import.Portable_TMD.xlsx");
            import = new ExcelImport(data);
        }

        [TestCleanup]
        public void Cleanup()
        {
            import.Dispose();
            data.Dispose();
        }

        [TestMethod]
        public void ReadsSites()
        {
            Assert.AreEqual(4, import.Sites.Count());

            ExcelSite site = import.Sites.First();
            Assert.AreEqual(12, site.SiteID);
            Assert.AreEqual("Mohawk Trail State Forest", site.SiteName);
            Assert.AreEqual(42.638353, (double?)(decimal?)site["Latitude"].Value);
            Assert.AreEqual(-72.936443, (double?)(decimal?)site["Longitude"].Value);
            Assert.IsNull(site["Pick Coordinates"].Value);
            Assert.AreEqual("Bob Leverett", site["First Measurer"].Value);
            Assert.AreEqual("John Eichholz", site["Second Measurer"].Value);
            Assert.AreEqual("Will Blozan", site["Third Measurer"].Value);
            Assert.AreEqual("Bob Leverett", site["Measurer Contact"].Value);
            Assert.AreEqual(true, site["Publicize Measurer Contact"].Value);
            Assert.AreEqual("7,500 acre forest", site["Comments"].Value);
            Assert.IsNull(site["Upload Photos"].Value);
            Assert.IsNull(site["Report Url"].Value);
            Assert.AreEqual(123, (int?)(decimal?)site["Visit ID"].Value);
        }

        [TestMethod]
        public void ReadsSubsites()
        {
            Assert.AreEqual(7, import.Subsites.Count());

            ExcelSubsite subsite = import.Subsites.First();
            Assert.AreEqual("Mohawk Trail State Forest (12)", subsite.SiteName);
            Assert.AreEqual(34, subsite.SubsiteID);
            Assert.AreEqual("Trees of Peace", subsite.SubsiteName);
            Assert.AreEqual(ImportState.MA, subsite["State"].Value);
            Assert.AreEqual("Charlemont", subsite["County"].Value);
            Assert.IsNull(subsite["Township"].Value);
            Assert.AreEqual(42.643482, (double?)(decimal?)subsite["Latitude"].Value);
            Assert.AreEqual(-72.935085, (double?)(decimal?)subsite["Longitude"].Value);
            Assert.IsNull(subsite["Pick Coordinates"].Value);
            Assert.IsNull(subsite["Comments"].Value);
            Assert.AreEqual(ImportSiteOwnershipType.State, subsite["Ownership Type"].Value);
            Assert.AreEqual("MTSF: 413-339-5504", subsite["Ownership Contact Info"].Value);
            Assert.AreEqual(false, subsite["Publicize Ownership Contact Info"].Value);
            Assert.AreEqual(false, subsite["Upload Photos"].Value);
            Assert.AreEqual(345, (int?)(decimal?)subsite["Visit ID"].Value);
        }

        [TestMethod]
        public void ReadsTrees()
        {
            Assert.AreEqual(8, import.Trees.Count());

            ExcelTree tree = import.Trees.First();
            Assert.AreEqual("Trees of Peace (34)", tree.SubsiteName);
            Assert.AreEqual(58, tree.TreeID);
            Assert.AreEqual("Jake Swamp", tree.TreeName);
            Assert.AreEqual("white pine", tree.CommonName);
            Assert.AreEqual("Pinus strobus", tree.BotanicalName);
            Assert.AreEqual(172.5, (double?)(decimal?)tree["Height"].Value);
            Assert.AreEqual(ImportHeightMeasurementMethod.ClinometerLaserRangefinderSine, tree["Height Measurement Method"].Value);
            Assert.AreEqual(ImportLaserBrand.TruPulse, tree["Height Laser Brand"].Value);
            Assert.AreEqual(ImportClinometerBrand.TruPulse, tree["Height Clinometer Brand"].Value);
            Assert.AreEqual(ImportHeightMeasurementType.SelectionFromASet, tree["Height Measurement Type"].Value);
            Assert.IsNull(tree["Height Distance Top"].Value);
            Assert.IsNull(tree["Height Angle Top"].Value);
            Assert.IsNull(tree["Height Distance Bottom"].Value);
            Assert.IsNull(tree["Height Angle Bottom"].Value);
            Assert.IsNull(tree["Height Vertical Offset"].Value);
            Assert.AreEqual("Tallest tree in new England", tree["Height Comments"].Value);
            Assert.AreEqual(10.6, (double?)(decimal?)tree["Girth"].Value);
            Assert.AreEqual(4.5, (double?)(decimal?)tree["Girth Measurement Height"].Value);
            Assert.IsNull(tree["Girth Root Collar Height"].Value);
            Assert.IsNull(tree["Girth Comments"].Value);
            Assert.IsNull(tree["Crown Max Spread"].Value);
            Assert.AreEqual(48.5, (double?)(decimal?)tree["Crown Average Spread"].Value);
            Assert.AreEqual(ImportCrownSpreadMeasurementMethod.AverageOfMaxAndMin, tree["Crown Spread Measurement Method"].Value);
            Assert.IsNull(tree["Crown Base Height"].Value);
            Assert.IsNull(tree["Crown Area"].Value);
            Assert.IsNull(tree["Crown Area Measurement Method"].Value);
            Assert.IsNull(tree["Crown Volume"].Value);
            Assert.IsNull(tree["Crown Volume Calculation Method"].Value);
            Assert.IsNull(tree["Crown Comments"].Value);
            Assert.IsNull(tree["Trunk Volume"].Value);
            Assert.IsNull(tree["Trunk Volume Calculation Method"].Value);
            Assert.IsNull(tree["Trunk Count"].Value);
            Assert.IsNull(tree["Trunk Comments"].Value);
            Assert.AreEqual(ImportTreeFormType.Single, tree["Form Type"].Value);
            Assert.IsNull(tree["Form Comments"].Value);
            Assert.AreEqual(ImportTreeStatus.Native, tree["Status"].Value);
            Assert.AreEqual("Good", tree["Health Status"].Value);
            Assert.AreEqual(ImportTreeAgeClass.Mature, tree["Age Class"].Value);
            Assert.AreEqual(155, (int?)(decimal?)tree["Age"].Value);
            Assert.AreEqual(ImportTreeAgeMethod.Estimate, tree["Age Method"].Value);
            Assert.AreEqual(ImportTerrainType.SideSlope, tree["Terrain Type"].Value);
            Assert.IsNull(tree["Terrain Shape Index"].Value);
            Assert.IsNull(tree["Landform Index"].Value);
            Assert.IsNull(tree["Terrain Comments"].Value);
            Assert.AreEqual(new DateTime(2013, 12, 6), tree["Date"].Value);
            Assert.IsNull(tree["Latitude"].Value);
            Assert.IsNull(tree["Longitude"].Value);
            Assert.IsNull(tree["Pick Coordinates"].Value);
            Assert.AreEqual(false, tree["Publicize Coordinates"].Value);
            Assert.AreEqual(800, (int?)(decimal?)tree["Elevation"].Value);
            Assert.IsNull(tree["General Comments"].Value);
            Assert.AreEqual(true, tree["Upload Photos"].Value);
            Assert.AreEqual(567, (int?)(decimal?)tree["Measurement ID"].Value);
        }

        [TestMethod]
        public void ReadsTrunks()
        {
            Assert.AreEqual(1, import.Trunks.Count());

            ExcelTrunk trunk = import.Trunks.First();
            Assert.AreEqual("Monarch", trunk.TreeName);
            Assert.AreEqual(1.1, (double?)(decimal?)trunk["Height"].Value);
            Assert.AreEqual(2.2, (double?)(decimal?)trunk["Height Distance Top"].Value);
            Assert.AreEqual(3.3, (double?)(decimal?)trunk["Height Angle Top"].Value);
            Assert.AreEqual(4.4, (double?)(decimal?)trunk["Height Distance Bottom"].Value);
            Assert.AreEqual(5.5, (double?)(decimal?)trunk["Height Angle Bottom"].Value);
            Assert.AreEqual(6.6, (double?)(decimal?)trunk["Height Vertical Offset"].Value);
            Assert.AreEqual(7.7, (double?)(decimal?)trunk["Girth"].Value);
            Assert.AreEqual(8.8, (double?)(decimal?)trunk["Girth Measurement Height"].Value);
            Assert.AreEqual("hello world", trunk["Comments"].Value);
        }
    }
}
