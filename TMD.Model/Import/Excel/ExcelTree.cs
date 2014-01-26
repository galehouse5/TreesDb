using OfficeOpenXml;
using System.Collections.Generic;
using TMD.Model.Import.Excel.Attributes;

namespace TMD.Model.Import.Excel
{
    public class ExcelTree : ExcelEntity
    {
        public ExcelTree(ExcelWorksheet sheet, int row)
            : base(sheet, row)
        { }

        public override IEnumerable<ExcelAttribute> Attributes
        {
            get
            {
                yield return new ExcelStringAttribute(1, "Subsite Name", 100) { IsRequired = true };
                yield return new ExcelNumberAttribute(2, "Tree ID") { MinInclusive = 1 };
                yield return new ExcelStringAttribute(3, "Tree Name", 100);
                yield return new ExcelStringAttribute(4, "Common Name", 100) { IsRequired = true };
                yield return new ExcelStringAttribute(5, "Botanical Name", 100) { IsRequired = true };
                yield return new ExcelNumberAttribute(6, "Height") { MinExclusive = 0 };
                yield return new ExcelEnumerationAttribute<ImportHeightMeasurementMethod>(7, "Height Measurement Method");
                yield return new ExcelEnumerationAttribute<ImportLaserBrand>(8, "Height Laser Brand");
                yield return new ExcelEnumerationAttribute<ImportClinometerBrand>(9, "Height Clinometer Brand");
                yield return new ExcelEnumerationAttribute<ImportHeightMeasurementType>(10, "Height Measurement Type");
                yield return new ExcelNumberAttribute(11, "Height Distance Top") { MinExclusive = 0 };
                yield return new ExcelNumberAttribute(12, "Height Angle Top") { MinInclusive = 0, MaxExclusive = 90 };
                yield return new ExcelNumberAttribute(13, "Height Distance Bottom") { MinExclusive = 0 };
                yield return new ExcelNumberAttribute(14, "Height Angle Bottom") { MinInclusive = -90, MaxExclusive = 0 };
                yield return new ExcelNumberAttribute(15, "Height Vertical Offset");
                yield return new ExcelStringAttribute(16, "Height Comments", 500);
                yield return new ExcelNumberAttribute(17, "Girth") { MinExclusive = 0 };
                yield return new ExcelNumberAttribute(18, "Girth Measurement Height");
                yield return new ExcelNumberAttribute(19, "Girth Root Collar Height");
                yield return new ExcelStringAttribute(20, "Girth Comments", 500);
                yield return new ExcelNumberAttribute(21, "Crown Max Spread") { MinExclusive = 0 };
                yield return new ExcelNumberAttribute(22, "Crown Average Spread") { MinExclusive = 0 };
                yield return new ExcelEnumerationAttribute<ImportCrownSpreadMeasurementMethod>(23, "Crown Spread Measurement Method");
                yield return new ExcelNumberAttribute(24, "Crown Base Height") { MinExclusive = 0 };
                yield return new ExcelNumberAttribute(25, "Crown Area") { MinExclusive = 0 };
                yield return new ExcelStringAttribute(26, "Crown Area Measurement Method", 100);
                yield return new ExcelNumberAttribute(27, "Crown Volume") { MinExclusive = 0 };
                yield return new ExcelEnumerationAttribute<ImportCrownVolumeCalculationMethod>(28, "Crown Volume Calculation Method");
                yield return new ExcelStringAttribute(29, "Crown Comments", 500);
                yield return new ExcelNumberAttribute(30, "Trunk Volume") { MinExclusive = 0 };
                yield return new ExcelEnumerationAttribute<ImportTrunkVolumeCalculationMethod>(31, "Trunk Volume Calculation Method");
                yield return new ExcelNumberAttribute(32, "Trunk Count") { MinInclusive = 1 };
                yield return new ExcelStringAttribute(33, "Trunk Comments", 500);
                yield return new ExcelEnumerationAttribute<ImportTreeFormType>(34, "Form Type");
                yield return new ExcelStringAttribute(35, "Form Comments", 500);
                yield return new ExcelEnumerationAttribute<ImportTreeStatus>(36, "Status");
                yield return new ExcelStringAttribute(37, "Health Status", 100);
                yield return new ExcelEnumerationAttribute<ImportTreeAgeClass>(38, "Age Class");
                yield return new ExcelNumberAttribute(39, "Age") { MinExclusive = 0 };
                yield return new ExcelEnumerationAttribute<ImportTreeAgeMethod>(40, "Age Method");
                yield return new ExcelEnumerationAttribute<ImportTerrainType>(41, "Terrain Type");
                yield return new ExcelNumberAttribute(42, "Terrain Shape Index") { MinInclusive = -1, MaxInclusive = 1 };
                yield return new ExcelNumberAttribute(43, "Landform Index") { MinInclusive = 0, MaxInclusive = 1 };
                yield return new ExcelStringAttribute(44, "Terrain Comments", 500);
                yield return new ExcelDateAttribute(45, "Date");
                yield return new ExcelNumberAttribute(46, "Latitude") { MinInclusive = -90, MaxInclusive = 90 };
                yield return new ExcelNumberAttribute(47, "Longitude") { MinInclusive = -180, MaxInclusive = 180 };
                yield return new ExcelBooleanAttribute(48, "Pick Coordinates");
                yield return new ExcelBooleanAttribute(49, "Publicize Coordinates");
                yield return new ExcelNumberAttribute(50, "Elevation") { MinInclusive = 1 };
                yield return new ExcelStringAttribute(51, "General Comments", 500);
                yield return new ExcelBooleanAttribute(52, "Upload Photos");
                yield return new ExcelNumberAttribute(53, "Measurement ID") { MinInclusive = 1 };
            }
        }

        public string SubsiteName
        {
            get { return (string)this["Subsite Name"].Value; }
            set { this["Subsite Name"].Value = value; }
        }

        public int? TreeID
        {
            get { return (int?)(decimal?)this["Tree ID"].Value; }
            set { this["Tree ID"].Value = value; }
        }

        public string TreeName
        {
            get { return (string)this["Tree Name"].Value; }
            set { this["Tree Name"].Value = value; }
        }

        public string CommonName
        {
            get { return (string)this["Common Name"].Value; }
            set { this["Common Name"].Value = value; }
        }

        public string BotanicalName
        {
            get { return (string)this["Botanical Name"].Value; }
            set { this["Botanical Name"].Value = value; }
        }

        public override string ToString()
        {
            if (null != TreeName)
                return string.Format(TreeID.HasValue ? "{0} ({1})" : "{0}", TreeName, TreeID);

            return string.Format(TreeID.HasValue ? "{0} - {1} ({2})" : "{0} - {1}", CommonName, BotanicalName, TreeID);
        }
    }
}
