using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;

namespace TMD.Model
{
    public enum SortDirection { ASC, DESC }

    public class RepositoryDataSourceOptions
    {
        public IDictionary<string, SortDirection> PropertySortings { get; set; }
        public IDictionary<string, string> PropertyFilterings { get; set; }
        public int? PageIndex { get; set; }
        public int? EntitiesPerPage { get; set; }
    }

    public class RepositoryDataSource<T>
        where T : IEntity
    {
        public IEnumerable<T> PagedDataSource { get; set; }
        public int TotalEntityCount { get; set; }
    }
}
