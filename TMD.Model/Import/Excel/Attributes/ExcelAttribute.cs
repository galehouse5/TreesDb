using System.Collections.Generic;

namespace TMD.Model.Import.Excel.Attributes
{
    public abstract class ExcelAttribute
    {
        protected ExcelAttribute(int column, string name)
        {
            this.Column = column;
            this.Name = name;
        }

        public abstract string ParseValidationErrorFormat { get; }
        public string Name { get; private set; }
        public int Column { get; private set; }
        public bool IsRequired { get; set; }

        public bool HasValue(object rawValue)
        {
            return !string.IsNullOrWhiteSpace((rawValue ?? string.Empty).ToString());
        }

        public abstract object GetValue(object rawValue);
        public abstract object GetRawValue(object value);

        protected virtual IEnumerable<string> GetAdditionalValidationErrors(object value)
        {
            yield break;
        }

        public IEnumerable<string> GetValidationErrors(object rawValue)
        {
            if (HasValue(rawValue))
            {
                object value = GetValue(rawValue);
                if (null == value)
                {
                    yield return string.Format(ParseValidationErrorFormat, Name);
                }
                else
                {
                    foreach (string error in GetAdditionalValidationErrors(value))
                        yield return error;
                }
            }
            else if (IsRequired)
            {
                yield return string.Format("{0} is required", Name);
            }
        }

        public override string ToString()
        {
            return string.Format("{0} ({1})", Name, Column);
        }
    }
}
