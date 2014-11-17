using TMD.Model.Excel;
using System.Collections.Generic;
using TMD.Model.ExcelImport.Values;

namespace TMD.Model.ExcelImport.Attributes
{
    public class ExcelImportStringAttribute : ExcelImportAttribute
    {
        public ExcelImportStringAttribute(byte id, string name, int? column = null)
            : base(id, name, column)
        {
            MaxLength = 100;
        }

        public int MaxLength { get; set; }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be text."; }
        }

        public override object GetValue(object rawValue)
        {
            string value = rawValue.ToString();
            if (string.IsNullOrWhiteSpace(value)) return null;
            return value;
        }

        public override object GetRawValue(object value)
        {
            return (string)value;
        }

        public override IEnumerable<string> GetErrors(ExcelImportValue value, IEnumerable<ExcelImportEntity> context)
        {
            foreach (string error in base.GetErrors(value, context))
                yield return error;

            if (value.IsEmpty)
                yield break;

            string stringValue = (string)value.Value;

            if (stringValue.Length > MaxLength)
                yield return string.Format("{0} must be {1} or fewer characters.", Name, MaxLength);
        }

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, IExcelWorksheet worksheet)
        {
            return ExcelImportStringValue.Create(entity, this, worksheet);
        }
    }
}
