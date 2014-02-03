using OfficeOpenXml;
using System;
using System.Collections.Generic;
using TMD.Model.ExcelImport.Values;

namespace TMD.Model.ExcelImport.Attributes
{
    public class ExcelImportFloatAttribute : ExcelImportAttribute
    {
        protected ExcelImportFloatAttribute()
        { }

        public float? MinInclusive { get; private set; }
        public float? MaxInclusive { get; private set; }
        public float? MinExclusive { get; private set; }
        public float? MaxExclusive { get; private set; }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be a number"; }
        }

        public override object GetValue(object rawValue)
        {
            float value;
            if (!float.TryParse(rawValue.ToString(), out value)) return null;
            return value;
        }

        public override object GetRawValue(object value)
        {
            return (float?)value;
        }

        protected override IEnumerable<string> GetAdditionalValidationErrors(object value)
        {
            if (MinInclusive.HasValue && (float?)value < MinInclusive)
                yield return string.Format("{0} must be greater than or equal to {1}", Name, MinInclusive);

            if (MaxInclusive.HasValue && (float?)value > MaxInclusive)
                yield return string.Format("{0} must be less than or equal to {1}", Name, MaxInclusive);

            if (MinExclusive.HasValue && (float?)value <= MinExclusive)
                yield return string.Format("{0} must be greater than {1}", Name, MinExclusive);

            if (MaxExclusive.HasValue && (float?)value >= MaxExclusive)
                yield return string.Format("{0} must be less than {1}", Name, MaxExclusive);
        }

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, ExcelWorksheet sheet)
        {
            return ExcelImportFloatValue.Create(entity, this, sheet);
        }
    }
}
