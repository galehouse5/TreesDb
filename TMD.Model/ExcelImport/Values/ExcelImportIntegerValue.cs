using OfficeOpenXml;

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

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, ExcelWorksheet sheet)
        {
            return new ExcelImportIntegerValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = sheet.GetValue(entity.Row, attribute.Column)
            };
        }
    }
}
