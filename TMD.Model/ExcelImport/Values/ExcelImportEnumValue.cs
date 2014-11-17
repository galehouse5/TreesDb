using TMD.Model.Excel;
using System;
using TMD.Model.ExcelImport.Attributes;

namespace TMD.Model.ExcelImport.Values
{
    public class ExcelImportEnumValue : ExcelImportValue
    {
        protected ExcelImportEnumValue()
        { }

        public byte ByteValue
        {
            get { return (byte)(int)Value; }
            set { Value = Enum.ToObject(((ExcelImportEnumAttribute)Attribute).EnumerationType, value); }
        }

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, IExcelWorksheet worksheet)
        {
            return new ExcelImportEnumValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = worksheet.Cell(entity.Row, attribute.Column).Value
            };
        }
    }
}
