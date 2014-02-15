using OfficeOpenXml;
using System.Linq;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport
{
    public class ExcelImportRepository
    {
        private IRepository<ExcelImportEntityType> entityTypeRepository;
        private IRepository<ExcelImportEntity> entityRepository;

        public ExcelImportRepository(IFetchableRepository<ExcelImportEntityType> entityTypeRepository, IFetchableRepository<ExcelImportEntity> entityRepository)
        {
            this.entityTypeRepository = entityTypeRepository.Fetch(t => t.Attributes);
            this.entityRepository = entityRepository.Fetch(e => e.Values);
        }

        public ExcelImportDatabase GetDatabase(User user)
        {
            return ExcelImportDatabase.Create(entityRepository.Where(e => e.User.Id == user.Id), user);
        }

        public ExcelImportDatabase CreateDatabase(User user, ExcelWorkbook workbook)
        {
            return ExcelImportDatabase.Create(entityTypeRepository, user, workbook);
        }

        public void Save(ExcelImportDatabase database)
        {
            foreach (ExcelImportEntity entity in database.Entities)
            {
                entityRepository.Save(entity);
            }
        }

        public void Delete(ExcelImportDatabase database)
        {
            foreach (ExcelImportEntity entity in database.Entities)
            {
                entityRepository.Delete(entity);
            }
        }
    }
}
