using OfficeOpenXml;

namespace TMD.Model.ExcelImport.Values
{
    public class ExcelImportNumberValue : ExcelImportValue
    {
        protected ExcelImportNumberValue()
        { }

        public decimal? NumberValue
        {
            get { return (decimal?)Value; }
            set { Value = value; }
        }

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, ExcelWorksheet sheet)
        {
            return new ExcelImportNumberValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = sheet.GetValue(entity.Row, attribute.Column)
            };
        }
    }
}
