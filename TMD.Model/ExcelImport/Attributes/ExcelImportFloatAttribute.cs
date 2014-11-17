using TMD.Model.Excel;
using System.Collections.Generic;
using TMD.Model.ExcelImport.Values;

namespace TMD.Model.ExcelImport.Attributes
{
    public class ExcelImportFloatAttribute : ExcelImportAttribute
    {
        public ExcelImportFloatAttribute(byte id, string name, int? column = null)
            : base(id, name, column)
        { }

        public float? MinInclusive { get; set; }
        public float? MaxInclusive { get; set; }
        public float? MinExclusive { get; set; }
        public float? MaxExclusive { get; set; }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be a number."; }
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

        public override IEnumerable<string> GetErrors(ExcelImportValue value, IEnumerable<ExcelImportEntity> context)
        {
            foreach (string error in base.GetErrors(value, context))
                yield return error;

            if (value.IsEmpty)
                yield break;

            float? floatValue = (float?)value.Value;

            if (MinInclusive.HasValue && floatValue < MinInclusive)
                yield return string.Format("{0} must be greater than or equal to {1}.", Name, MinInclusive);

            if (MaxInclusive.HasValue && floatValue > MaxInclusive)
                yield return string.Format("{0} must be less than or equal to {1}.", Name, MaxInclusive);

            if (MinExclusive.HasValue && floatValue <= MinExclusive)
                yield return string.Format("{0} must be greater than {1}.", Name, MinExclusive);

            if (MaxExclusive.HasValue && floatValue >= MaxExclusive)
                yield return string.Format("{0} must be less than {1}.", Name, MaxExclusive);
        }

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, IExcelWorksheet worksheet)
        {
            return ExcelImportFloatValue.Create(entity, this, worksheet);
        }
    }
}
