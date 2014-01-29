using System.Linq;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport
{
    public abstract class ExcelImportRepository
    {
        public abstract IQueryable<ExcelImportEntityType> EntityTypes { get; }
        public abstract IQueryable<ExcelImportEntity> Entities { get; }

        protected abstract void Save(ExcelImportEntity entity);
        protected abstract void Delete(ExcelImportEntity entity);

        public ExcelImportDatabase GetDatabase(User user)
        {
            return ExcelImportDatabase.Create(Entities.Where(e => e.User.Id == user.Id), user);
        }

        public void Save(ExcelImportDatabase database)
        {
            foreach (ExcelImportEntity entity in database.Entities)
            {
                Save(entity);
            }
        }

        public void Delete(ExcelImportDatabase database)
        {
            foreach (ExcelImportEntity entity in database.Entities)
            {
                Delete(entity);
            }
        }
    }
}
