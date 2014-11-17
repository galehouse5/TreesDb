using System.Linq;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport
{
    public class ExcelImportRepository : RepositoryDecorator<ExcelImportEntity>
    {
        public ExcelImportRepository(IFetchableRepository<ExcelImportEntity> entityRepository)
            : base(entityRepository.Fetch(e => e.Values))
        { }

        public ExcelImportDatabase GetDatabase(User user)
        {
            return ExcelImportDatabase.Create(Next.Where(e => e.User.Id == user.Id), user);
        }

        public void Save(ExcelImportDatabase database)
        {
            foreach (ExcelImportEntity entity in database.Entities)
            {
                Next.Save(entity);
            }
        }

        public void Remove(ExcelImportDatabase database)
        {
            foreach (ExcelImportEntity entity in database.Entities)
            {
                Next.Delete(entity);
            }
        }
    }
}
