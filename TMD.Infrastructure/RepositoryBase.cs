using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate;

namespace TMD.Model
{
    public static class CriteriaExtensions
    {
        public static ICriteria ApplyPaging(this ICriteria criteria, IPagingOptions pager)
        {
            criteria.SetFirstResult(pager.PageSize * (pager.PageNumber - 1));
            criteria.SetMaxResults(pager.PageSize);
            return criteria;
        }
    }
}
