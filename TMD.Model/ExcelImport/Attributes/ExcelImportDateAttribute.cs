using OfficeOpenXml;
using System;
using TMD.Model.ExcelImport.Values;

namespace TMD.Model.ExcelImport.Attributes
{
    public class ExcelImportDateAttribute : ExcelImportAttribute
    {
        protected ExcelImportDateAttribute()
        { }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be a date"; }
        }

        public override object GetValue(object rawValue)
        {
            DateTime value;
            if (!DateTime.TryParse(rawValue.ToString(), out value)) return null;
            return value;
        }

        public override object GetRawValue(object value)
        {
            return (DateTime?)value;
        }

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, ExcelWorksheet sheet)
        {
            return ExcelImportDateValue.Create(entity, this, sheet);
        }
    }
}
