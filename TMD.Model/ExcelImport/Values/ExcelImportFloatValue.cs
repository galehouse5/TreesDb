using TMD.Model.Excel;

namespace TMD.Model.ExcelImport.Values
{
    public class ExcelImportFloatValue : ExcelImportValue
    {
        protected ExcelImportFloatValue()
        { }

        public float? FloatValue
        {
            get { return (float?)Value; }
            set { Value = value; }
        }

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, IExcelWorksheet worksheet)
        {
            return new ExcelImportFloatValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = worksheet.Cell(entity.Row, attribute.Column).Value
            };
        }
    }
}
