using TMD.Model.Excel;

namespace TMD.Model.ExcelImport.Values
{
    public class ExcelImportBooleanValue : ExcelImportValue
    {
        protected ExcelImportBooleanValue()
        { }

        public bool? BooleanValue
        {
            get { return (bool?)Value; }
            set { Value = value; }
        }

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, IExcelWorksheet worksheet)
        {
            return new ExcelImportBooleanValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = worksheet.Cell(entity.Row, attribute.Column).Value
            };
        }
    }
}
