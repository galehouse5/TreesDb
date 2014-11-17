using TMD.Model.Excel;

namespace TMD.Model.ExcelImport.Values
{
    public class ExcelImportStringValue : ExcelImportValue
    {
        protected ExcelImportStringValue()
        { }

        public string StringValue
        {
            get { return (string)Value; }
            set { Value = value; }
        }

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, IExcelWorksheet worksheet)
        {
            return new ExcelImportStringValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = worksheet.Cell(entity.Row, attribute.Column).Value
            };
        }
    }
}
