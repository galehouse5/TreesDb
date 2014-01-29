using OfficeOpenXml;

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

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, ExcelWorksheet sheet)
        {
            return new ExcelImportStringValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = sheet.GetValue(entity.Row, attribute.Column)
            };
        }
    }
}
