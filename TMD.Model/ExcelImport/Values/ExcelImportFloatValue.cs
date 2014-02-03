using OfficeOpenXml;

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

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, ExcelWorksheet sheet)
        {
            return new ExcelImportFloatValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = sheet.GetValue(entity.Row, attribute.Column)
            };
        }
    }
}
