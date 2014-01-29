using OfficeOpenXml;
using System.Collections.Generic;
using System.Linq;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport
{
    public class ExcelImportDatabase
    {
        protected ExcelImportDatabase()
        { }

        public IEnumerable<ExcelImportEntity> Entities { get; private set; }
        public User User { get; private set; }

        public IEnumerable<KeyValuePair<ExcelImportValue, string>> GetValidationErrors()
        {
            return Entities.SelectMany(e => e.GetValidationErrors());
        }

        public void ShowValidationErrors(IEnumerable<KeyValuePair<ExcelImportValue, string>> errors, ExcelWorkbook book)
        {
            foreach (ExcelImportEntityType entityType in errors.Select(e => e.Key.Entity.EntityType).Distinct())
            {
                entityType.ShowValidationErrors(errors.Where(e => e.Key.Entity.EntityType.Equals(entityType)), book);
            }
        }

        public void HideValidationErrors(ExcelWorkbook book)
        {
            foreach (ExcelImportEntityType entityType in Entities.Select(e => e.EntityType).Distinct())
            {
                entityType.HideValidationErrors(Entities.Where(e => e.EntityType.Equals(entityType)), book);
            }
        }

        public void Fill(ExcelWorkbook book)
        {
            foreach (ExcelImportEntityType entityType in Entities.Select(e => e.EntityType).Distinct())
            {
                entityType.Fill(Entities.Where(e => e.EntityType.Equals(entityType)), book);
            }
        }

        public static ExcelImportDatabase Create(IEnumerable<ExcelImportEntityType> entityTypes, User user, ExcelWorkbook book)
        {
            return new ExcelImportDatabase { Entities = entityTypes.SelectMany(t => t.CreateEntities(book, user)).ToArray(), User = user };
        }

        public static ExcelImportDatabase Create(IEnumerable<ExcelImportEntity> entities, User user)
        {
            return new ExcelImportDatabase { Entities = entities.ToArray(), User = user };
        }
    }
}
