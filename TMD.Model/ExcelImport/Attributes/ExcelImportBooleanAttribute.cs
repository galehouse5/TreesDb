using OfficeOpenXml;
using System;
using TMD.Model.ExcelImport.Values;

namespace TMD.Model.ExcelImport.Attributes
{
    public class ExcelImportBooleanAttribute : ExcelImportAttribute
    {
        protected ExcelImportBooleanAttribute()
        { }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be Y or N"; }
        }

        public override object GetValue(object rawValue)
        {
            if ("y".Equals(rawValue.ToString(), StringComparison.OrdinalIgnoreCase)
                || "yes".Equals(rawValue.ToString(), StringComparison.OrdinalIgnoreCase))
                return true;

            if ("n".Equals(rawValue.ToString(), StringComparison.OrdinalIgnoreCase)
                || "no".Equals(rawValue.ToString(), StringComparison.OrdinalIgnoreCase))
                return false;

            return null;
        }

        public override object GetRawValue(object value)
        {
            return (bool)value ? "Y" : "N";
        }

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, ExcelWorksheet sheet)
        {
            return ExcelImportBooleanValue.Create(entity, this, sheet);
        }
    }
}
