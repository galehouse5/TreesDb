using OfficeOpenXml;
using System;
using TMD.Model.ExcelImport.Attributes;

namespace TMD.Model.ExcelImport.Values
{
    public class ExcelImportEnumerationValue : ExcelImportValue
    {
        protected ExcelImportEnumerationValue()
        { }

        public byte EnumerationValue
        {
            get { return (byte)(int)Value; }
            set { Value = Enum.ToObject(((ExcelImportEnumerationAttribute)Attribute).EnumerationType, value); }
        }

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, ExcelWorksheet sheet)
        {
            return new ExcelImportEnumerationValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = sheet.GetValue(entity.Row, attribute.Column)
            };
        }
    }
}
