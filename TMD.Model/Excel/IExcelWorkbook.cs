using System.Collections.Generic;
using System.IO;

namespace TMD.Model.Excel
{
    public interface IExcelWorkbook
    {
        IEnumerable<IExcelWorksheet> Worksheets { get; }
        IExcelWorksheet Worksheet(string name);
        IExcelWorksheet Worksheet(int index);

        void Save(Stream stream);
    }
}
