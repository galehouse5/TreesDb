using OfficeOpenXml;
using System;

namespace TMD.Model.ExcelImport.Values
{
    public class ExcelImportDateValue : ExcelImportValue
    {
        protected ExcelImportDateValue()
        { }

        public DateTime? DateValue
        {
            get { return (DateTime?)Value; }
            set { Value = value; }
        }

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, ExcelWorksheet sheet)
        {
            return new ExcelImportDateValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = sheet.GetValue(entity.Row, attribute.Column)
            };
        }
    }
}
