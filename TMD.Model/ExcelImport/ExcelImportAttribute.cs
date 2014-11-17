using System.Collections.Generic;
using TMD.Model.Excel;

namespace TMD.Model.ExcelImport
{
    public abstract class ExcelImportAttribute
    {
        protected ExcelImportAttribute(byte id, string name, int? column = null)
        {
            this.ID = id;
            this.Name = name;
            this.Column = column ?? id;
        }

        public byte ID { get; private set; }
        public string Name { get; private set; }
        public int Column { get; private set; }
        public virtual bool IsRequired { get; set; }
        public virtual string ValueFormat { get; set; }
        public abstract string ParseValidationErrorFormat { get; }

        public abstract object GetValue(object rawValue);
        public abstract object GetRawValue(object value);
        public abstract ExcelImportValue CreateValue(ExcelImportEntity entity, IExcelWorksheet worksheet);

        public virtual IEnumerable<string> GetErrors(ExcelImportValue value, IEnumerable<ExcelImportEntity> context)
        {
            if (value.IsEmpty)
            {
                if (IsRequired)
                    yield return string.Format("{0} is required.", Name);
            }
            else
            {
                if (null == value.Value)
                    yield return string.Format(ParseValidationErrorFormat, Name);
            }
        }

        public string Format(object rawValue)
        {
            return string.Format(ValueFormat ?? "{0}", rawValue);
        }

        public override string ToString()
        {
            return string.Format("{0} ({1})", Name, Column);
        }
    }
}
