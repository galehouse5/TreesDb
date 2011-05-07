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

    public class EntityPage<T> where T : class, IEntity
    {
        public int TotalItems { get; set; }
        public int FilteredItems { get; set; }
        public IEnumerable<T> Page { get; set; }
    }
}
