using OfficeOpenXml;
using System.Collections.Generic;
using TMD.Model.ExcelImport.Values;

namespace TMD.Model.ExcelImport.Attributes
{
    public class ExcelImportStringAttribute : ExcelImportAttribute
    {
        protected ExcelImportStringAttribute()
        { }

        public int MaxLength { get; private set; }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be text"; }
        }

        public override object GetValue(object rawValue)
        {
            return rawValue.ToString();
        }

        public override object GetRawValue(object value)
        {
            return value.ToString();
        }

        protected override IEnumerable<string> GetAdditionalValidationErrors(object value)
        {
            if (((string)value).Length > MaxLength)
                yield return string.Format("{0} must be {1} or fewer characters", Name, MaxLength);
        }

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, ExcelWorksheet sheet)
        {
            return ExcelImportStringValue.Create(entity, this, sheet);
        }
    }
}
