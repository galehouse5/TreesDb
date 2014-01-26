using System;
using System.Collections.Generic;

namespace TMD.Model.Import.Excel.Attributes
{
    public class ExcelBooleanAttribute : ExcelAttribute
    {
        public ExcelBooleanAttribute(int column, string name)
            : base(column, name)
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
    }
}
