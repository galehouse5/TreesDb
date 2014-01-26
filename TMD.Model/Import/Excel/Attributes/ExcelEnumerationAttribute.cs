using System;
using System.ComponentModel;
using System.Linq;

namespace TMD.Model.Import.Excel.Attributes
{
    public class ExcelEnumerationAttribute<T> : ExcelAttribute
        where T : struct, IComparable, IFormattable, IConvertible
    {
        public ExcelEnumerationAttribute(int column, string name)
            : base(column, name)
        { }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be valid"; }
        }

        public override object GetValue(object rawValue)
        {
            return (from T value in Enum.GetValues(typeof(T))
                    let description = typeof(T).GetField(value.ToString())
                         .GetCustomAttributes(typeof(DescriptionAttribute), false)
                         .Cast<DescriptionAttribute>().Select(a => a.Description)
                         .SingleOrDefault()
                    where rawValue.ToString().Equals(value.ToString(), StringComparison.OrdinalIgnoreCase)
                        || rawValue.ToString().Equals(description, StringComparison.OrdinalIgnoreCase)
                    select (T?)value).SingleOrDefault();
        }

        public override object GetRawValue(object value)
        {
            if (null == value) return null;

            string description = typeof(T).GetField(value.ToString())
                .GetCustomAttributes(typeof(DescriptionAttribute), false)
                .Cast<DescriptionAttribute>().Select(a => a.Description)
                .SingleOrDefault();

            return description ?? value.ToString();
        }
    }
}
