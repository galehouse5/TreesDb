using OfficeOpenXml;
using System.Collections.Generic;
using System.Linq;
using TMD.Model.Import.Excel.Attributes;

namespace TMD.Model.Import.Excel
{
    public abstract class ExcelEntity
    {
        private ExcelWorksheet sheet;

        protected ExcelEntity(ExcelWorksheet sheet, int row)
        {
            this.sheet = sheet;
            this.Row = row;
        }

        public int Row { get; private set; }
        public abstract IEnumerable<ExcelAttribute> Attributes { get; }

        public IEnumerable<ExcelValue> Values
        {
            get { return Attributes.Select(a => new ExcelValue(sheet, this, a)); }
        }

        public ExcelValue this[string name]
        {
            get { return Values.SingleOrDefault(v => v.Attribute.Name.Equals(name)); }
        }

        protected virtual IEnumerable<KeyValuePair<ExcelValue, string>> GetAdditionalValidationErrors()
        {
            yield break;
        }

        public IEnumerable<KeyValuePair<ExcelValue, string>> GetValidationErrors()
        {
            return (from value in Values
                    from error in value.Attribute.GetValidationErrors(value.RawValue)
                    select new KeyValuePair<ExcelValue, string>(value, error))
                   .Union(GetAdditionalValidationErrors());
        }

        public bool HasValue
        {
            get { return Values.Any(v => v.HasValue); }
        }
    }
}
