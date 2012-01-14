using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;

namespace TMD.Model
{
    public interface IPagingOptions
    {
        int PageIndex { get; set; }
        int PageSize { get; set; }
    }

    public interface IEntityPage<T> where T : class, IEntity
    {
        int TotalEntitiesCount { get; }
        int? FilteredEntitiesCount { get; }
        IEnumerable<T> PageEntities { get;  }
    }

    public class EntityPage<T> : IEntityPage<T> where T : class, IEntity
    {
        public int TotalEntitiesCount { get; set; }
        public int? FilteredEntitiesCount { get; set; }
        public IEnumerable<T> PageEntities { get; set; }
    }
}
