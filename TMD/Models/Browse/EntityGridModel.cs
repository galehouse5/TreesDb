using System.Collections.Generic;
using TMD.Model;

namespace TMD.Models.Browse
{
    public class EntityGridModel<T> : IEntityPage<T>
        where T : class, IEntity
    {
        private IEntityPage<T> entityPage;

        public EntityGridModel(IEntityPage<T> entityPage)
        {
            this.entityPage = entityPage;
        }

        public IEnumerable<T> PageEntities { get { return entityPage.PageEntities; } }
        public int? FilteredEntitiesCount { get { return entityPage.FilteredEntitiesCount; } }
        public int TotalEntitiesCount { get { return entityPage.TotalEntitiesCount; } }
        public int RowsPerPage { get; set; }
        public string ParameterNamePrefix { get; set; }
    }
}