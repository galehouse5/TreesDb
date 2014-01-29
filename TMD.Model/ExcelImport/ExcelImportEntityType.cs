using OfficeOpenXml;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport
{
    public class ExcelImportEntityType
    {
        protected ExcelImportEntityType()
        { }

        public int ID { get; private set; }
        public string Name { get; private set; }
        public string Spreadsheet { get; private set; }
        public int StartRow { get; private set; }

        public IEnumerable<ExcelImportAttribute> Attributes { get; private set; }

        public IEnumerable<ExcelImportEntity> CreateEntities(ExcelWorkbook book, User user)
        {
            return Enumerable.Range(StartRow, book.Worksheets[Spreadsheet].Dimension.End.Row)
                .Select(i => ExcelImportEntity.Create(this, book.Worksheets[Spreadsheet], i, user))
                .Where(e => !e.IsEmpty);
        }

        public void ShowValidationErrors(IEnumerable<KeyValuePair<ExcelImportValue, string>> errors, ExcelWorkbook book)
        {
            book.Worksheets[Spreadsheet].TabColor = Color.Red;

            foreach (ExcelImportEntity entity in errors.Select(e => e.Key.Entity).Distinct())
            {
                entity.ShowValidationErrors(errors.Where(e => e.Key.Entity.Equals(entity)), book.Worksheets[Spreadsheet]);
            }
        }

        public void HideValidationErrors(IEnumerable<ExcelImportEntity> entities, ExcelWorkbook book)
        {
            book.Worksheets[Spreadsheet].TabColor = Color.Green;

            foreach (ExcelImportEntity entity in entities)
            {
                entity.HideValidationErrors(book.Worksheets[Spreadsheet]);
            }
        }

        public void Fill(IEnumerable<ExcelImportEntity> entities, ExcelWorkbook book)
        {
            foreach (ExcelImportEntity entity in entities)
            {
                entity.Fill(book.Worksheets[Spreadsheet]);
            }
        }

        public override string ToString()
        {
            return string.Format("{0} ({1}:{2})", Name, Spreadsheet, StartRow);
        }
    }
}
