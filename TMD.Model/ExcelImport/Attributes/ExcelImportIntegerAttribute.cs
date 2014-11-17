using TMD.Model.Excel;
using System.Collections.Generic;
using TMD.Model.ExcelImport.Values;

namespace TMD.Model.ExcelImport.Attributes
{
    public class ExcelImportIntegerAttribute : ExcelImportAttribute
    {
        public ExcelImportIntegerAttribute(byte id, string name, int? column = null)
            : base(id, name, column)
        { }

        public int? MinInclusive { get; set; }
        public int? MaxInclusive { get; set; }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be a whole number."; }
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

        public override IEnumerable<string> GetErrors(ExcelImportValue value, IEnumerable<ExcelImportEntity> context)
        {
            foreach (string error in base.GetErrors(value, context))
                yield return error;

            if (value.IsEmpty)
                yield break;

            int? intValue = (int?)value.Value;

            if (MinInclusive.HasValue && intValue < MinInclusive)
                yield return string.Format("{0} must be greater than or equal to {1}.", Name, MinInclusive);

            if (MaxInclusive.HasValue && intValue > MaxInclusive)
                yield return string.Format("{0} must be less than or equal to {1}.", Name, MaxInclusive);
        }

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, IExcelWorksheet worksheet)
        {
            return ExcelImportIntegerValue.Create(entity, this, worksheet);
        }
    }
}
