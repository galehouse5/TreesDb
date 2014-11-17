using System.Collections.Generic;
using TMD.Model.Excel;

namespace TMD.Model.ExcelImport.Attributes
{
    public abstract class ExcelImportAttributeValidator : ExcelImportAttribute
    {
        private ExcelImportAttribute inner;

        protected ExcelImportAttributeValidator(ExcelImportAttribute innerAttribute)
            : base(innerAttribute.ID, innerAttribute.Name, innerAttribute.Column)
        {
            this.inner = innerAttribute;
        }

        public override bool IsRequired
        {
            get { return inner.IsRequired; }
            set { inner.IsRequired = value; }
        }

        public override string ValueFormat
        {
            get { return inner.ValueFormat; }
            set { inner.ValueFormat = value; }
        }

        public override string ParseValidationErrorFormat
        {
            get { return inner.ParseValidationErrorFormat; }
        }

        public override object GetValue(object rawValue)
        {
            return inner.GetValue(rawValue);
        }

        public override object GetRawValue(object value)
        {
            return inner.GetRawValue(value);
        }

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, IExcelWorksheet worksheet)
        {
            return inner.CreateValue(entity, worksheet);
        }

        protected abstract IEnumerable<string> GetErrors(ExcelImportEntity entity, object value, IEnumerable<ExcelImportEntity> context);

        public override IEnumerable<string> GetErrors(ExcelImportValue value, IEnumerable<ExcelImportEntity> context)
        {
            foreach (string error in inner.GetErrors(value, context))
                yield return error;

            if (value.IsEmpty)
                yield break;

            foreach (string error in GetErrors(value.Entity, value.Value, context))
                yield return error;
        }
    }
}
