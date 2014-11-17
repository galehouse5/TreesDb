using System.Collections.Generic;

namespace TMD.Model.Excel
{
    public interface IExcelWorksheet
    {
        int Index { get; }
        string Name { get; }

        IEnumerable<IExcelCell> Cells { get; }
        IExcelCell Cell(string address);
        IExcelCell Cell(int row, int column);

        IEnumerable<IExcelComment> Comments { get; }
        IExcelComment Comment(string address);
        IExcelComment Comment(int row, int column);
        IExcelComment AddComment(string address);
        IExcelComment AddComment(int row, int column);
        void Remove(IExcelComment comment);

        void SetTabStyle(ExcelStyle style);
        void SetActive();
    }
}
