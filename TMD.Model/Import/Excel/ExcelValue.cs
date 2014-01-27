using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.Drawing;
using TMD.Model.Import.Excel.Attributes;

namespace TMD.Model.Import.Excel
{
    public class ExcelValue
    {
        private ExcelWorksheet sheet;

        public ExcelValue(ExcelWorksheet sheet, ExcelEntity entity, ExcelAttribute attribute)
        {
            this.sheet = sheet;
            this.Entity = entity;
            this.Attribute = attribute;
        }

        public ExcelEntity Entity { get; private set; }
        public ExcelAttribute Attribute { get; private set; }

        public object RawValue
        {
            get { return sheet.GetValue(Entity.Row, Attribute.Column); }
            set { sheet.SetValue(Entity.Row, Attribute.Column, value); }
        }

        public bool HasValue
        {
            get { return Attribute.HasValue(RawValue); }
        }

        public object Value
        {
            get { return HasValue ? Attribute.GetValue(RawValue) : null; }
            set { RawValue = Attribute.GetValue(value); }
        }

        public void AddValidationErrors(IEnumerable<string> errors)
        {
            using (ExcelRange cell = sheet.Cells[Entity.Row, Attribute.Column])
            {
                ExcelComment comment = cell.Comment ?? cell.AddComment(string.Empty, "TMD");
                comment.Text = string.Join(Environment.NewLine, errors);

                ExcelValueStyling.Invalid.SetStyle(cell);
                sheet.TabColor = Color.Red;

                sheet.Select(cell.Address, true);
            }

            // draw attention to this cell's row
            foreach (ExcelValue value in Entity.Values)
            {
                using (ExcelRange cell = sheet.Cells[Entity.Row, value.Attribute.Column])
                {
                    if (!ExcelValueStyling.Invalid.HasStyle(cell))
                    {
                        ExcelValueStyling.Attention.SetStyle(cell);
                    }
                }
            }
        }

        public void RemoveValidationErrors()
        {
            using (ExcelRange cell = sheet.Cells[Entity.Row, Attribute.Column])
            {
                if (null != cell.Comment)
                {
                    sheet.Comments.Remove(cell.Comment);
                }

                cell.StyleName = sheet.Column(Attribute.Column).StyleName;
                sheet.TabColor = Color.Green;
            }
        }

        public override string ToString()
        {
            return string.Format("{0}: {1}", Attribute, Value);
        }
    }
}
