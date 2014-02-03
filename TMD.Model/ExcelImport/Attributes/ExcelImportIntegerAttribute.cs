using OfficeOpenXml;
using System.Collections.Generic;
using TMD.Model.ExcelImport.Values;

namespace TMD.Model.ExcelImport.Attributes
{
    public class ExcelImportIntegerAttribute : ExcelImportAttribute
    {
        protected ExcelImportIntegerAttribute()
        { }

        public int? MinInclusive { get; private set; }
        public int? MaxInclusive { get; private set; }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be a whole number"; }
        }

        public override object GetValue(object rawValue)
        {
            int value;
            if (!int.TryParse(rawValue.ToString(), out value)) return null;
            return value;
        }

        public override object GetRawValue(object value)
        {
            return (int?)value;
        }

        protected override IEnumerable<string> GetAdditionalValidationErrors(object value)
        {
            if (MinInclusive.HasValue && (int?)value < MinInclusive)
                yield return string.Format("{0} must be greater than or equal to {1}", Name, MinInclusive);

            if (MaxInclusive.HasValue && (int?)value > MaxInclusive)
                yield return string.Format("{0} must be less than or equal to {1}", Name, MaxInclusive);
        }

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, ExcelWorksheet sheet)
        {
            return ExcelImportIntegerValue.Create(entity, this, sheet);
        }
    }
}
