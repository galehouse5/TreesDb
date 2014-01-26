using OfficeOpenXml;
using System.Collections.Generic;
using TMD.Model.Import.Excel.Attributes;

namespace TMD.Model.Import.Excel
{
    public class ExcelSubsite : ExcelEntity
    {
        public ExcelSubsite(ExcelWorksheet sheet, int row)
            : base(sheet, row)
        { }

        public override IEnumerable<ExcelAttribute> Attributes
        {
            get
            {
                yield return new ExcelStringAttribute(1, "Site Name", 100) { IsRequired = true };
                yield return new ExcelNumberAttribute(2, "Subsite ID") { MinInclusive = 1 };
                yield return new ExcelStringAttribute(3, "Subsite Name", 100) { IsRequired = true };
                yield return new ExcelEnumerationAttribute<ImportState>(4, "State") { IsRequired = true };
                yield return new ExcelStringAttribute(5, "County", 100) { IsRequired = true };
                yield return new ExcelStringAttribute(6, "Township", 100);
                yield return new ExcelNumberAttribute(7, "Latitude") { MinInclusive = -90, MaxInclusive = 90 };
                yield return new ExcelNumberAttribute(8, "Longitude") { MinInclusive = -180, MaxInclusive = 180 };
                yield return new ExcelBooleanAttribute(9, "Pick Coordinates");
                yield return new ExcelStringAttribute(10, "Comments", 500);
                yield return new ExcelEnumerationAttribute<ImportSiteOwnershipType>(11, "Ownership Type");
                yield return new ExcelStringAttribute(12, "Ownership Contact Info", 500);
                yield return new ExcelBooleanAttribute(13, "Publicize Ownership Contact Info");
                yield return new ExcelBooleanAttribute(14, "Upload Photos");
                yield return new ExcelNumberAttribute(15, "Visit ID");
            }
        }

        public string SiteName
        {
            get { return (string)this["Site Name"].Value; }
            set { this["Site Name"].Value = value; }
        }

        public int? SubsiteID
        {
            get { return (int?)(decimal?)this["Subsite ID"].Value; }
            set { this["Subsite ID"].Value = value; }
        }

        public string SubsiteName
        {
            get { return (string)this["Subsite Name"].Value; }
            set { this["Subsite Name"].Value = value; }
        }

        public override string ToString()
        {
            return string.Format(SubsiteID.HasValue ? "{0} ({1})" : "{0}", SubsiteName, SubsiteID);
        }
    }
}
