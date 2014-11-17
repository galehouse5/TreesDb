using TMD.Model.Excel;
using System;
using System.ComponentModel;
using System.Linq;
using TMD.Model.ExcelImport.Values;

namespace TMD.Model.ExcelImport.Attributes
{
    public class ExcelImportEnumAttribute<TEnum> : ExcelImportEnumAttribute
        where TEnum : struct, IComparable, IFormattable, IConvertible
    {
        public ExcelImportEnumAttribute(byte id, string name, int? column = null)
            : base(id, name, column)
        { }

        public override Type EnumerationType
        {
            get { return typeof(TEnum); }
        }
    }

    public abstract class ExcelImportEnumAttribute : ExcelImportAttribute
    {
        protected ExcelImportEnumAttribute(byte id, string name, int? column = null)
            : base(id, name, column)
        { }

        public abstract Type EnumerationType { get; }

        public override string ParseValidationErrorFormat
        {
            get { return "{0} must be valid."; }
        }

        public override object GetValue(object rawValue)
        {
            return (from Enum value in Enum.GetValues(EnumerationType)
                    let description = EnumerationType.GetField(value.ToString())
                         .GetCustomAttributes(typeof(DescriptionAttribute), false)
                         .Cast<DescriptionAttribute>().Select(a => a.Description)
                         .SingleOrDefault()
                    where rawValue.ToString().Equals(value.ToString(), StringComparison.OrdinalIgnoreCase)
                        || rawValue.ToString().Equals(description, StringComparison.OrdinalIgnoreCase)
                    select value).SingleOrDefault();
        }

        public override object GetRawValue(object value)
        {
            if (null == value) return null;

            string description = EnumerationType.GetField(value.ToString())
                .GetCustomAttributes(typeof(DescriptionAttribute), false)
                .Cast<DescriptionAttribute>().Select(a => a.Description)
                .SingleOrDefault();

            return description ?? value.ToString();
        }

        public override ExcelImportValue CreateValue(ExcelImportEntity entity, IExcelWorksheet worksheet)
        {
            return ExcelImportEnumValue.Create(entity, this, worksheet);
        }
    }
}
