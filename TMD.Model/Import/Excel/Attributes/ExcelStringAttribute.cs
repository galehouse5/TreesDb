using System.Collections.Generic;

namespace TMD.Model.Import.Excel.Attributes
{
    public class ExcelStringAttribute : ExcelAttribute
    {
        public ExcelStringAttribute(int column, string name, int maxLength)
            : base(column, name)
        {
            this.MaxLength = maxLength;
        }
        
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
    }
}
