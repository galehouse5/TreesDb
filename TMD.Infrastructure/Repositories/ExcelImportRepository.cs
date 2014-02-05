using NHibernate.Linq;
using System.Linq;
using TMD.Model.ExcelImport;

namespace TMD.Infrastructure.Repositories
{
    public class ExcelImportRepository : Model.ExcelImport.ExcelImportRepository
    {
        public override IQueryable<ExcelImportEntityType> EntityTypes
        {
            get { return Registry.Session.Query<ExcelImportEntityType>().Fetch(t => t.Attributes); }
        }

        public override IQueryable<ExcelImportEntity> Entities
        {
            get { return Registry.Session.Query<ExcelImportEntity>().Fetch(e => e.Values); }
        }

        protected override void Save(ExcelImportEntity entity)
        {
            Registry.Session.Save(entity);
        }

        protected override void Delete(ExcelImportEntity entity)
        {
            Registry.Session.Delete(entity);
        }
    }
}
