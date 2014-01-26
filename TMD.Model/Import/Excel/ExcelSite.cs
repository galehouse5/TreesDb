using OfficeOpenXml;
using System.Collections.Generic;
using TMD.Model.Import.Excel.Attributes;

namespace TMD.Model.Import.Excel
{
    public class ExcelSite : ExcelEntity
    {
        public ExcelSite(ExcelWorksheet sheet, int row)
            : base(sheet, row)
        { }

        public override IEnumerable<ExcelAttribute> Attributes
        {
            get
            {
                yield return new ExcelNumberAttribute(1, "Site ID") { MinInclusive = 1 };
                yield return new ExcelStringAttribute(2, "Site Name", 100) { IsRequired = true };
                yield return new ExcelNumberAttribute(3, "Latitude") { MinInclusive = -90, MaxInclusive = 90 };
                yield return new ExcelNumberAttribute(4, "Longitude") { MinInclusive = -180, MaxInclusive = 180 };
                yield return new ExcelBooleanAttribute(5, "Pick Coordinates");
                yield return new ExcelStringAttribute(6, "First Measurer", 100) { IsRequired = true };
                yield return new ExcelStringAttribute(7, "Second Measurer", 100);
                yield return new ExcelStringAttribute(8, "Third Measurer", 100);
                yield return new ExcelStringAttribute(9, "Measurer Contact", 100);
                yield return new ExcelBooleanAttribute(10, "Publicize Measurer Contact");
                yield return new ExcelStringAttribute(11, "Comments", 500);
                yield return new ExcelBooleanAttribute(12, "Upload Photos");
                yield return new ExcelStringAttribute(13, "Report Url", 500);
                yield return new ExcelNumberAttribute(14, "Visit ID") { MinInclusive = 1 };
            }
        }

        public int? SiteID
        {
            get { return (int?)(decimal?)this["Site ID"].Value; }
            set { this["Site ID"].Value = value; }
        }

        public string SiteName
        {
            get { return (string)this["Site Name"].Value; }
            set { this["Site Name"].Value = value; }
        }

        public override string ToString()
        {
            return string.Format(SiteID.HasValue ? "{0} ({1})" : "{0}", SiteName, SiteID);
        }
    }
}
