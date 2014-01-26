using System;

namespace TMD.Model.Import.Excel.Attributes
{
    public class ExcelDateAttribute : ExcelAttribute
    {
        public ExcelDateAttribute(int column, string name)
            : base(column, name)
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
    }
}
