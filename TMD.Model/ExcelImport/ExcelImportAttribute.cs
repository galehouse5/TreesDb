using OfficeOpenXml;
using System.Collections.Generic;

namespace TMD.Model.ExcelImport
{
    public abstract class ExcelImportAttribute
    {
        public int ID { get; private set; }
        public ExcelImportEntityType EntityType { get; private set; }
        public string Name { get; protected set; }
        public int Column { get; protected set; }
        public bool IsRequired { get; set; }
        public string ValueFormat { get; set; }
        public abstract string ParseValidationErrorFormat { get; }

        public abstract object GetValue(object rawValue);
        public abstract object GetRawValue(object value);
        public abstract ExcelImportValue CreateValue(ExcelImportEntity entity, ExcelWorksheet sheet);

        protected virtual IEnumerable<string> GetAdditionalValidationErrors(object value)
        {
            yield break;
        }

        public IEnumerable<string> GetValidationErrors(ExcelImportValue value)
        {
            if (value.IsEmpty)
            {
                if (IsRequired)
                    yield return string.Format("{0} is required", Name);
            }
            else
            {
                if (null == value.Value)
                    yield return string.Format(ParseValidationErrorFormat, Name);

                else
                {
                    foreach (string error in GetAdditionalValidationErrors(value.Value))
                        yield return error;
                }
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
