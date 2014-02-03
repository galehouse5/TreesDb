using OfficeOpenXml;
using System;
using System.Collections.Generic;

namespace TMD.Model.ExcelImport
{
    public abstract class ExcelImportValue
    {
        public int ID { get; set; }
        public ExcelImportEntity Entity { get; protected set; }
        public ExcelImportAttribute Attribute { get; protected set; }

        public object RawValue { get; protected set; }

        public bool IsEmpty
        {
            get { return string.IsNullOrWhiteSpace((RawValue ?? string.Empty).ToString()); }
        }

        public object Value
        {
            get { return Attribute.GetValue(RawValue); }
            set { RawValue = Attribute.GetRawValue(value); }
        }

        public IEnumerable<string> GetValidationErrors()
        {
            return Attribute.GetValidationErrors(this);
        }

        public void ShowValidationErrors(IEnumerable<string> errors, ExcelWorksheet sheet)
        {
            using (ExcelRange cell = sheet.Cells[Entity.Row, Attribute.Column])
            {
                sheet.Comments.Add(cell, string.Join(Environment.NewLine, errors), "TMD");
                ExcelImportValueStyling.Invalid.SetStyle(cell);
                sheet.Select(cell.Address, true);
            }
        }

        public void HideValidationErrors(ExcelWorksheet sheet)
        {
            using (ExcelRange cell = sheet.Cells[Entity.Row, Attribute.Column])
            {
                if (null != cell.Comment)
                {
                    sheet.Comments.Remove(cell.Comment);
                }
            }
        }

        public void Fill(ExcelWorksheet sheet)
        {
            sheet.SetValue(Entity.Row, Attribute.Column, Attribute.Format(RawValue));
        }
    }
}
