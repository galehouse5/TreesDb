using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;

namespace TMD.Model
{
    public interface IPagingOptions
    {
        int PageNumber { get; set; }
        int PageSize { get; set; }
    }

    public interface IPaged : IEnumerable
    {
        int PageNumber { get; }
        int PageSize { get; }
        int TotalItems { get; }
    }

    public class PagedList<T> : IPaged
        where T : IEntity
    {
        public PagedList(IPagingOptions pager)
        {
            PageNumber = pager.PageNumber;
            PageSize = pager.PageSize;
        }

        public int PageNumber { get; private set; }
        public int PageSize { get; private set; }
        public int TotalItems { get; set; }
        public IList<T> Page { get; set; }
        public IEnumerator GetEnumerator() { return Page.GetEnumerator(); }
    }
}
