using OfficeOpenXml;
using System.Collections.Generic;
using System.Linq;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport
{
    public class ExcelImportEntity
    {
        protected ExcelImportEntity()
        { }

        public int ID { get; private set; }
        public ExcelImportEntityType EntityType { get; private set; }
        public int RowIndex { get; private set; }
        public User User { get; private set; }

        public int Row
        {
            get { return EntityType.StartRow + RowIndex; }
            private set { RowIndex = value - EntityType.StartRow; }
        }

        public IEnumerable<ExcelImportValue> Values { get; private set; }

        public ExcelImportValue this[string name]
        {
            get { return Values.SingleOrDefault(v => v.Attribute.Name.Equals(name)); }
        }

        public bool IsEmpty
        {
            get { return Values.All(v => v.IsEmpty); }
        }

        public IEnumerable<KeyValuePair<ExcelImportValue, string>> GetValidationErrors()
        {
            return from value in Values
                   from error in value.GetValidationErrors()
                   select new KeyValuePair<ExcelImportValue, string>(value, error);
        }

        public void ShowValidationErrors(IEnumerable<KeyValuePair<ExcelImportValue, string>> errors, ExcelWorksheet sheet)
        {
            foreach (ExcelImportAttribute attribute in EntityType.Attributes)
            {
                using (ExcelRange cell = sheet.Cells[Row, attribute.Column])
                {
                    if (!ExcelImportValueStyling.Invalid.HasStyle(cell))
                    {
                        ExcelImportValueStyling.Attention.SetStyle(cell);
                    }
                }
            }

            foreach (ExcelImportValue value in errors.Select(e => e.Key).Distinct())
            {
                value.ShowValidationErrors(errors.Where(e => e.Key.Equals(value)).Select(e => e.Value), sheet);
            }
        }

        public void HideValidationErrors(ExcelWorksheet sheet)
        {
            foreach (ExcelImportAttribute attribute in EntityType.Attributes)
            {
                using (ExcelRange cell = sheet.Cells[Row, attribute.Column])
                {
                    cell.StyleName = sheet.Column(attribute.Column).StyleName;
                }
            }

            foreach (ExcelImportValue value in Values)
            {
                value.HideValidationErrors(sheet);
            }
        }

        public void Fill(ExcelWorksheet sheet)
        {
            foreach (ExcelImportValue value in Values)
            {
                value.Fill(sheet);
            }
        }

        public static ExcelImportEntity Create(ExcelImportEntityType entityType, ExcelWorksheet sheet, int row, User user)
        {
            ExcelImportEntity entity = new ExcelImportEntity
            {
                EntityType = entityType,
                Row = row,
                User = user
            };
            entity.Values = entityType.Attributes.Select(a => a.CreateValue(entity, sheet)).Where(v => !v.IsEmpty).ToArray();
            return entity;
        }

        public override string ToString()
        {
            return string.Format("{0} ({1})", EntityType.Name, Row);
        }
    }
}
