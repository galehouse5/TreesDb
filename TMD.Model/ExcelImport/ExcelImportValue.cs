using System;
using System.Collections.Generic;
using System.Linq;
using TMD.Model.Excel;

namespace TMD.Model.ExcelImport
{
    public abstract class ExcelImportValue
    {
        public int ID { get; set; }
        protected byte AttributeID { get; set; }
        public ExcelImportEntity Entity { get; protected set; }
        public object RawValue { get; protected set; }

        public bool IsEmpty
        {
            get { return string.IsNullOrWhiteSpace((RawValue ?? string.Empty).ToString()); }
        }

        public ExcelImportAttribute Attribute
        {
            get { return Entity.Attributes.Single(a => a.ID == AttributeID); }
            set { AttributeID = value.ID; }
        }

        public object Value
        {
            get { return Attribute.GetValue(RawValue); }
            set { RawValue = Attribute.GetRawValue(value); }
        }

        public IEnumerable<string> GetErrors(IEnumerable<ExcelImportEntity> context)
        {
            return Attribute.GetErrors(this, context);
        }

        public void ShowErrors(IEnumerable<string> errors, IExcelWorksheet worksheet)
        {
            IExcelCell cell = worksheet.Cell(Entity.Row, Attribute.Column);
            cell.SetStyle(ExcelStyle.Error);
            cell.SetActive();

            IExcelComment comment = worksheet.AddComment(Entity.Row, Attribute.Column);
            comment.Note = string.Join(Environment.NewLine, errors);
            comment.Author = "TMD";
        }

        public void Fill(IExcelWorksheet worksheet)
        {
            IExcelCell cell = worksheet.Cell(Entity.Row, Attribute.Column);

            cell.Value = Attribute.Format(RawValue);
        }

        public override string ToString()
        {
            return string.Format("{0} = {1}", Attribute.Name, IsEmpty ? null : Value);
        }
    }
}
