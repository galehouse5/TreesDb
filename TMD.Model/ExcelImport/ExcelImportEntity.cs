using System.Collections.Generic;
using System.Linq;
using TMD.Model.Excel;
using TMD.Model.ExcelImport.Values;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport
{
    public abstract class ExcelImportEntity
    {
        public int ID { get; private set; }
        public abstract ExcelImportEntityType EntityType { get; }
        public int RowIndex { get; private set; }
        public User User { get; protected internal set; }

        public int Row
        {
            get { return EntityType.StartRow + RowIndex; }
            protected internal set { RowIndex = value - EntityType.StartRow; }
        }

        public IEnumerable<ExcelImportAttribute> Attributes
        {
            get { return EntityType.Attributes; }
        }

        public IEnumerable<ExcelImportValue> Values { get; protected internal set; }

        public object this[ExcelImportAttribute attribute]
        {
            get
            {
                ExcelImportValue value = Values.SingleOrDefault(v => v.Attribute.Equals(attribute));
                return value == null || value.IsEmpty ? null : value.Value;
            }
        }

        public bool IsEmpty
        {
            get { return Values.All(v => v.IsEmpty); }
        }

        protected KeyValuePair<ExcelImportValue, string> Error(ExcelImportAttribute attribute, string message)
        {
            ExcelImportValue value = Values.SingleOrDefault(v => v.Attribute.Equals(attribute))
                ?? ExcelImportNullValue.Create(this, attribute);
            return new KeyValuePair<ExcelImportValue, string>(value, message);
        }

        public virtual IEnumerable<KeyValuePair<ExcelImportValue, string>> GetErrors(IEnumerable<ExcelImportEntity> context)
        {
            return from value in Values
                   from error in value.GetErrors(context)
                   select new KeyValuePair<ExcelImportValue, string>(value, error);
        }

        public void ShowErrors(IEnumerable<KeyValuePair<ExcelImportValue, string>> errors, IExcelWorksheet worksheet)
        {
            foreach (ExcelImportAttribute attribute in EntityType.Attributes)
            {
                IExcelCell cell = worksheet.Cell(Row, attribute.Column);

                if (!cell.HasStyle(ExcelStyle.Error))
                {
                    cell.SetStyle(ExcelStyle.Warning);
                }
            }

            foreach (var valueErrors in errors.GroupBy(e => e.Key, e => e.Value))
            {
                valueErrors.Key.ShowErrors(valueErrors.Distinct(), worksheet);
            }
        }

        public void Fill(IExcelWorksheet worksheet)
        {
            foreach (ExcelImportValue value in Values)
            {
                value.Fill(worksheet);
            }
        }

        public override string ToString()
        {
            return string.Format("{0} ({1})", EntityType.Name, Row);
        }
    }
}
