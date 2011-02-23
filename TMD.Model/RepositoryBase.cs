using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public interface IListPager
    {
        int PageIndex { get; set; }
        int PageSize { get; set; }
    }

    public class PagedList<T>
        where T : IEntity
    {
        public PagedList(IListPager pager)
        {
            PageIndex = pager.PageIndex;
            PageSize = pager.PageSize;
        }

        public int PageIndex { get; private set; }
        public int PageSize { get; private set; }
        public IList<T> Page { get; set; }
        public int Count { get; set; }
    }
}
