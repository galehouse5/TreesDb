using Aspose.Cells;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace TMD.Model.Excel.AsposeCells
{
    public class AsposeCellsWorkbook : IExcelWorkbook
    {
        private static License license;
        private Workbook workbook;

        public AsposeCellsWorkbook(Stream stream)
        {
            if (license == null)
            {
                license = new License();
                license.SetLicense("Aspose.Cells.lic");
            }

            workbook = new Workbook(stream);
        }

        public IEnumerable<IExcelWorksheet> Worksheets
        {
            get { return workbook.Worksheets.Select(s => new AsposeCellsWorksheet(s)); }
        }

        public IExcelWorksheet Worksheet(string name)
        {
            return new AsposeCellsWorksheet(workbook.Worksheets[name]);
        }

        public IExcelWorksheet Worksheet(int index)
        {
            return new AsposeCellsWorksheet(workbook.Worksheets[index]);
        }

        public void Save(Stream stream)
        {
            workbook.Save(stream, (SaveFormat)workbook.FileFormat);
        }
    }
}
