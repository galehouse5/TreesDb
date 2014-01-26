using System.Collections.Generic;

namespace TMD.Model.Import.Excel.Attributes
{
    public class ExcelNumberAttribute : ExcelAttribute
    {
        public ExcelNumberAttribute(int column, string name)
            : base(column, name)
        { }

        public decimal? MinInclusive { get; set; }
        public decimal? MaxInclusive { get; set; }
        public decimal? MinExclusive { get; set; }
        public decimal? MaxExclusive { get; set; }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be a number"; }
        }

        public override object GetValue(object rawValue)
        {
            decimal value;
            if (!decimal.TryParse(rawValue.ToString(), out value)) return null;
            return value;
        }

        public override object GetRawValue(object value)
        {
            return (decimal?)value;
        }

        protected override IEnumerable<string> GetAdditionalValidationErrors(object value)
        {
            if (MinInclusive.HasValue && (decimal?)value < MinInclusive)
                yield return string.Format("{0} must be greater than or equal to {1}", Name, MinInclusive);

            if (MaxInclusive.HasValue && (decimal?)value > MaxInclusive)
                yield return string.Format("{0} must be less than or equal to {1}", Name, MaxInclusive);

            if (MinExclusive.HasValue && (decimal?)value <= MinExclusive)
                yield return string.Format("{0} must be greater than {1}", Name, MinExclusive);

            if (MaxExclusive.HasValue && (decimal?)value > MaxExclusive)
                yield return string.Format("{0} must be less than {1}", Name, MaxExclusive);
        }
    }
}
