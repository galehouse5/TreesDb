using OfficeOpenXml;

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

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, ExcelWorksheet sheet)
        {
            return new ExcelImportBooleanValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = sheet.GetValue(entity.Row, attribute.Column)
            };
        }
    }
}
