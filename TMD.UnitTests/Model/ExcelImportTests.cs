using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.IO;
using System.Linq;
using System.Reflection;
using TMD.Model.Excel;
using TMD.Model.Excel.AsposeCells;
using TMD.Model.ExcelImport;
using TMD.Model.ExcelImport.Entities;
using TMD.Model.ExcelImport.EntityTypes;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class ExcelImportTests
    {
        private Stream data;
        private IExcelWorkbook workbook;
        private ExcelImportDatabase database;

        [TestInitialize]
        public void Initialize()
        {
            data = Assembly.GetExecutingAssembly().GetManifestResourceStream("TMD.UnitTests.Model.TMD.xlsx");
            workbook = new AsposeCellsWorkbook(data);
            database = ExcelImportDatabase.Create(null, workbook);
        }

        [TestCleanup]
        public void Cleanup()
        {
            data.Dispose();
        }

        [TestMethod]
        public void ReadsSites()
        {
            Assert.AreEqual(4, database.Entities.OfType<ExcelImportSite>().Count());

            ExcelImportSite site = database.Entities.OfType<ExcelImportSite>().First();
            Assert.AreEqual("Mohawk Trail State Forest", site.SiteName);
            Assert.AreEqual(42.638353f, (float?)site.Latitude);
            Assert.AreEqual(-72.936443f, (float?)site.Longitude);
            Assert.AreEqual("Bob Leverett", site[ExcelImportSiteType.MeasurerContact]);
            Assert.AreEqual(true, site[ExcelImportSiteType.PublicizeContact]);
            Assert.AreEqual("7,500 acre forest", site.Comments);
            Assert.IsNull(site.ReportUrl);
        }

        [TestMethod]
        public void ReadsSubsites()
        {
            Assert.AreEqual(7, database.Entities.OfType<ExcelImportSubsite>().Count());

            ExcelImportSubsite subsite = database.Entities.OfType<ExcelImportSubsite>().First();
            Assert.AreEqual("Mohawk Trail State Forest", subsite.SiteName);
            Assert.AreEqual("Trees of Peace", subsite.SubsiteName);
            Assert.AreEqual(ExcelImportState.MA, subsite.State);
            Assert.AreEqual("Charlemont", subsite.County);
            Assert.IsNull(subsite[ExcelImportSubsiteType.Township]);
            Assert.AreEqual(42.643482f, (float?)subsite.Latitude);
            Assert.AreEqual(-72.935085f, (float?)subsite.Longitude);
            Assert.IsNull(subsite.Comments);
            Assert.AreEqual("State", subsite.OwnershipType);
            Assert.AreEqual("MTSF: 413-339-5504", subsite.OwnershipContact);
            Assert.AreEqual(false, subsite.PublicizeContact);
        }

        [TestMethod]
        public void ReadsTrees()
        {
            Assert.AreEqual(8, database.Entities.OfType<ExcelImportTree>().Count());

            ExcelImportTree tree = database.Entities.OfType<ExcelImportTree>().First();
            Assert.AreEqual("Trees of Peace", tree.SubsiteName);
            Assert.AreEqual("Jake Swamp", tree.TreeName);
            Assert.AreEqual("white pine", tree.CommonName);
            Assert.AreEqual("Pinus strobus", tree.BotanicalName);
            Assert.AreEqual(172.5f, (float?)tree.Height);
            Assert.AreEqual(ExcelImportHeightMeasurementMethod.ClinometerLaserRangefinderSine, tree.HeightMeasurementMethod);
            Assert.AreEqual("TruPulse", tree[ExcelImportTreeType.HeightLaserBrand]);
            Assert.AreEqual("TruPulse", tree[ExcelImportTreeType.HeightClinometerBrand]);
            Assert.AreEqual(ExcelImportHeightMeasurementType.SelectionFromASet, tree[ExcelImportTreeType.HeightMeasurementType]);
            Assert.IsNull(tree[ExcelImportTreeType.HeightDistanceTop]);
            Assert.IsNull(tree[ExcelImportTreeType.HeightAngleTop]);
            Assert.IsNull(tree[ExcelImportTreeType.HeightDistanceBottom]);
            Assert.IsNull(tree[ExcelImportTreeType.HeightAngleBottom]);
            Assert.IsNull(tree[ExcelImportTreeType.HeightVerticalOffset]);
            Assert.AreEqual("Tallest tree in new England", tree[ExcelImportTreeType.HeightComments]);
            Assert.AreEqual(10.6f, (float?)tree.Girth);
            Assert.AreEqual(4.5f, (float?)tree[ExcelImportTreeType.GirthMeasurementHeight]);
            Assert.IsNull(tree[ExcelImportTreeType.GirthRootCollarHeight]);
            Assert.IsNull(tree[ExcelImportTreeType.GirthComments]);
            Assert.IsNull(tree.CrownMaxSpread);
            Assert.AreEqual(48.5f, (float?)tree[ExcelImportTreeType.CrownAverageSpread]);
            Assert.AreEqual(ExcelImportCrownSpreadMeasurementMethod.AverageOfMaxAndMin, tree[ExcelImportTreeType.CrownSpreadMeasurementMethod]);
            Assert.IsNull(tree[ExcelImportTreeType.CrownBaseHeight]);
            Assert.IsNull(tree[ExcelImportTreeType.CrownArea]);
            Assert.IsNull(tree[ExcelImportTreeType.CrownAreaMeasurementMethod]);
            Assert.IsNull(tree[ExcelImportTreeType.CrownVolume]);
            Assert.IsNull(tree[ExcelImportTreeType.CrownVolumeCalculationMethod]);
            Assert.IsNull(tree[ExcelImportTreeType.CrownComments]);
            Assert.IsNull(tree[ExcelImportTreeType.TrunkVolume]);
            Assert.IsNull(tree[ExcelImportTreeType.TrunkVolumeCalculationMethod]);
            Assert.IsNull(tree[ExcelImportTreeType.TrunkCount]);
            Assert.IsNull(tree[ExcelImportTreeType.TrunkComments]);
            Assert.AreEqual(ExcelImportTreeFormType.Single, tree[ExcelImportTreeType.FormType]);
            Assert.IsNull(tree[ExcelImportTreeType.FormComments]);
            Assert.AreEqual(ExcelImportTreeStatus.Native, tree[ExcelImportTreeType.Status]);
            Assert.AreEqual("Good", tree[ExcelImportTreeType.HealthStatus]);
            Assert.AreEqual(ExcelImportTreeAgeClass.Mature, tree[ExcelImportTreeType.AgeClass]);
            Assert.AreEqual(155, (int?)tree[ExcelImportTreeType.Age]);
            Assert.AreEqual(ExcelImportTreeAgeMethod.Estimate, tree[ExcelImportTreeType.AgeMethod]);
            Assert.AreEqual(ExcelImportTerrainType.SideSlope, tree[ExcelImportTreeType.TerrainType]);
            Assert.IsNull(tree[ExcelImportTreeType.TerrainShapeIndex]);
            Assert.IsNull(tree[ExcelImportTreeType.LandformIndex]);
            Assert.IsNull(tree[ExcelImportTreeType.TerrainComments]);
            Assert.AreEqual(new DateTime(2013, 12, 6), tree.Date);
            Assert.AreEqual("Bob Leverett", tree.Measurers.ElementAt(0));
            Assert.AreEqual("John Eichholz", tree.Measurers.ElementAt(1));
            Assert.AreEqual("Will Blozan", tree.Measurers.ElementAt(2));
            Assert.IsNull(tree.Latitude);
            Assert.IsNull(tree.Longitude);
            Assert.AreEqual(false, tree[ExcelImportTreeType.PublicizeCoordinates]);
            Assert.AreEqual(800, (int?)tree.Elevation);
            Assert.IsNull(tree.GeneralComments);
        }

        [TestMethod]
        public void ReadsTrunks()
        {
            Assert.AreEqual(1, database.Entities.OfType<ExcelImportTrunk>().Count());

            ExcelImportTrunk trunk = database.Entities.OfType<ExcelImportTrunk>().First();
            Assert.AreEqual("Monarch", trunk.TreeName);
            Assert.AreEqual(1.1f, (float?)trunk[ExcelImportTrunkType.Height]);
            Assert.AreEqual(2.2f, (float?)trunk[ExcelImportTrunkType.HeightDistanceTop]);
            Assert.AreEqual(3.3f, (float?)trunk[ExcelImportTrunkType.HeightAngleTop]);
            Assert.AreEqual(4.4f, (float?)trunk[ExcelImportTrunkType.HeightDistanceBottom]);
            Assert.AreEqual(5.5f, (float?)trunk[ExcelImportTrunkType.HeightAngleBottom]);
            Assert.AreEqual(6.6f, (float?)trunk[ExcelImportTrunkType.HeightVerticalOffset]);
            Assert.AreEqual(7.7f, (float?)trunk[ExcelImportTrunkType.Girth]);
            Assert.AreEqual(8.8f, (float?)trunk[ExcelImportTrunkType.GirthMeasurementHeight]);
            Assert.AreEqual("hello world", trunk[ExcelImportTrunkType.Comments]);
        }
    }
}
