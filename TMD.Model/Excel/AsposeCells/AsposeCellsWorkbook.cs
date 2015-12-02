using Aspose.Cells;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace TMD.Model.Excel.AsposeCells
{
    public class AsposeCellsWorkbook : IExcelWorkbook
    {
        private static License license;
        private Workbook workbook;

        public AsposeCellsWorkbook(Stream stream)
        {
            EnsureLicenseIsSet();

            workbook = new Workbook(stream);
        }

        protected void EnsureLicenseIsSet()
        {
            if (license != null) return;

            using (Stream data = Assembly.GetExecutingAssembly().GetManifestResourceStream("TMD.Model.Excel.AsposeCells.Aspose.Cells.lic"))
            {
                license = new License();

                try
                {
                    license.SetLicense(data);
                }
                catch (Exception ex)
                {
                    if (!AsposeCellsLicenseCheckHelper.Instance.HasLicenseExpired(ex))
                        throw;

                    AsposeCellsLicenseCheckHelper.Instance.DisableLicenseCheck();
                }
            }
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
