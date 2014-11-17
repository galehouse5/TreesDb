using TMD.Model.Excel;
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

        public static ExcelImportValue Create(ExcelImportEntity entity, ExcelImportAttribute attribute, IExcelWorksheet worksheet)
        {
            return new ExcelImportDateValue
            {
                Entity = entity,
                Attribute = attribute,
                RawValue = worksheet.Cell(entity.Row, attribute.Column).Value
            };
        }
    }
}
