using Aspose.Cells;
using System.Collections.Generic;
using System.Linq;

namespace TMD.Model.Excel.AsposeCells
{
    public class AsposeCellsWorksheet : IExcelWorksheet
    {
        private Worksheet worksheet;
        private WorksheetCollection worksheets;

        public AsposeCellsWorksheet(Worksheet worksheet)
        {
            this.worksheet = worksheet;
            worksheets = worksheet.Workbook.Worksheets;
        }

        public int Index
        {
            get { return worksheet.Index; }
        }

        public string Name
        {
            get { return worksheet.Name; }
        }

        public IEnumerable<IExcelCell> Cells
        {
            get { return worksheet.Cells.Cast<Cell>().Select(c => new AsposeCellsCell(c)); }
        }

        public IExcelCell Cell(string address)
        {
            return new AsposeCellsCell(worksheet.Cells[address]);
        }

        public IExcelCell Cell(int row, int column)
        {
            return new AsposeCellsCell(worksheet.Cells[row - 1, column - 1]);
        }

        public IEnumerable<IExcelComment> Comments
        {
            get { return worksheet.Comments.Select(c => new AsposeCellsComment(c)); }
        }

        public IExcelComment Comment(string address)
        {
            Comment comment = worksheet.Comments[address];
            if (comment == null) return null;

            return new AsposeCellsComment(comment);
        }

        public IExcelComment Comment(int row, int column)
        {
            Comment comment = worksheet.Comments[row - 1, column - 1];
            if (comment == null) return null;

            return new AsposeCellsComment(comment);
        }

        public IExcelComment AddComment(string address)
        {
            int index = worksheet.Comments.Add(address);

            return new AsposeCellsComment(worksheet.Comments[index]);
        }

        public IExcelComment AddComment(int row, int column)
        {
            int index = worksheet.Comments.Add(row - 1, column - 1);

            return new AsposeCellsComment(worksheet.Comments[index]);
        }

        public void Remove(IExcelComment comment)
        {
            worksheet.Comments.RemoveAt(comment.Row, comment.Column);
        }

        public void SetTabStyle(ExcelStyle style)
        {
            worksheet.TabColor = style.TabColor;
        }

        public void SetActive()
        {
            worksheets.ActiveSheetIndex = worksheet.Index;
        }
    }
}
