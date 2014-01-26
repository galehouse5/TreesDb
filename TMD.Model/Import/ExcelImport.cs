using OfficeOpenXml;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using TMD.Model.Import.Excel;

namespace TMD.Model.Import
{
    public class ExcelImport : IDisposable
    {
        private ExcelPackage package;
        private ExcelWorkbook book;

        public ExcelImport(Stream data)
        {
            package = new ExcelPackage(data);
            book = package.Workbook;
        }

        public IEnumerable<ExcelSite> Sites
        {
            get
            {
                ExcelWorksheet sheet = book.Worksheets["Sites"];
                return Enumerable.Range(2, sheet.Dimension.End.Row)
                    .Select(i => new ExcelSite(sheet, i)).Where(s => s.HasValue);
            }
        }

        public IEnumerable<ExcelSubsite> Subsites
        {
            get
            {
                ExcelWorksheet sheet = book.Worksheets["Subsites"];
                return Enumerable.Range(2, sheet.Dimension.End.Row)
                    .Select(i => new ExcelSubsite(sheet, i)).Where(s => s.HasValue);
            }
        }

        public IEnumerable<ExcelTree> Trees
        {
            get
            {
                ExcelWorksheet sheet = book.Worksheets["Trees"];
                return Enumerable.Range(3, sheet.Dimension.End.Row)
                    .Select(i => new ExcelTree(sheet, i)).Where(s => s.HasValue);
            }
        }

        public IEnumerable<ExcelTrunk> Trunks
        {
            get
            {
                ExcelWorksheet sheet = book.Worksheets["Trunks"];
                return Enumerable.Range(2, sheet.Dimension.End.Row)
                    .Select(i => new ExcelTrunk(sheet, i)).Where(s => s.HasValue);
            }
        }

        public IEnumerable<ExcelEntity> Entities
        {
            get { return Sites.Cast<ExcelEntity>().Union(Subsites).Union(Trees).Union(Trunks); }
        }

        public IEnumerable<KeyValuePair<ExcelValue, string>> GetValidationErrors()
        {
            return Entities.SelectMany(s => s.GetValidationErrors());
        }

        public void AddValidationErrors()
        {
            // remove any existing validation errors
            foreach (ExcelValue value in Entities.SelectMany(s => s.Values))
            {
                value.RemoveValidationErrors();
            }

            foreach (var valueErrors in from error in GetValidationErrors()
                                        group error by error.Key into valueErrors
                                        select new { value = valueErrors.Key, errors = valueErrors.Select(e => e.Value) })
            {
                valueErrors.value.AddValidationErrors(valueErrors.errors);
            }
        }

        public Stream Save()
        {
            package.Save();

            package.Stream.Position = 0;
            return package.Stream;
        }

        public void Dispose()
        {
            package.Dispose();
        }
    }
}
