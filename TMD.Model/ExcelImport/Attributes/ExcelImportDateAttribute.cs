using TMD.Model.Excel;
using System;
using TMD.Model.ExcelImport.Values;

namespace TMD.Model.ExcelImport.Attributes
{
    public class ExcelImportDateAttribute : ExcelImportAttribute
    {
        public ExcelImportDateAttribute(byte id, string name, int? column = null)
            : base(id, name, column)
        { }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be a date."; }
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

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, IExcelWorksheet worksheet)
        {
            return ExcelImportDateValue.Create(entity, this, worksheet);
        }
    }
}
