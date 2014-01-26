using OfficeOpenXml;
using System.Collections.Generic;
using TMD.Model.Import.Excel.Attributes;

namespace TMD.Model.Import.Excel
{
    public class ExcelTrunk : ExcelEntity
    {
        public ExcelTrunk(ExcelWorksheet sheet, int row)
            : base(sheet, row)
        { }

        public override IEnumerable<ExcelAttribute> Attributes
        {
            get
            {
                yield return new ExcelStringAttribute(1, "Tree Name", 100) { IsRequired = true };
                yield return new ExcelNumberAttribute(2, "Height") { MinExclusive = 0 };
                yield return new ExcelNumberAttribute(3, "Height Distance Top") { MinExclusive = 0 };
                yield return new ExcelNumberAttribute(4, "Height Angle Top") { MinInclusive = 0, MaxInclusive = 90 };
                yield return new ExcelNumberAttribute(5, "Height Distance Bottom") { MinExclusive = 0 };
                yield return new ExcelNumberAttribute(6, "Height Angle Bottom") { MinInclusive = -90, MaxInclusive = 0 };
                yield return new ExcelNumberAttribute(7, "Height Vertical Offset");
                yield return new ExcelNumberAttribute(8, "Girth") { MinExclusive = 0 };
                yield return new ExcelNumberAttribute(9, "Girth Measurement Height");
                yield return new ExcelStringAttribute(10, "Comments", 500);
            }
        }

        public string TreeName
        {
            get { return (string)this["Tree Name"].Value; }
            set { this["Tree Name"].Value = value; }
        }

        public override string ToString()
        {
            return TreeName;
        }
    }
}
