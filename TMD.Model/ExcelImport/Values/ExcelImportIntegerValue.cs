using TMD.Model.Excel;

namespace TMD.Model.ExcelImport.Values
{
    public class ExcelImportIntegerValue : ExcelImportValue
    {
        protected ExcelImportIntegerValue()
        { }

        public int? IntegerValue
        {
            get { return (int?)Value; }
            set { Value = value; }
        }

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, IExcelWorksheet worksheet)
        {
            return new ExcelImportIntegerValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = worksheet.Cell(entity.Row, attribute.Column).Value
            };
        }
    }
}
