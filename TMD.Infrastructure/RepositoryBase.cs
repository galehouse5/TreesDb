using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate;
using TMD.Model;
using System.Collections;
using NHibernate.Criterion;

namespace TMD.Infrastructure
{
    public static class CriteriaExtensions
    {
        public static ICriteria ApplyPaging(this ICriteria criteria, IPagingOptions pager)
        {
            criteria.SetFirstResult(pager.PageSize * pager.PageIndex);
            criteria.SetMaxResults(pager.PageSize);
            return criteria;
        }

        public static EntityPage<T> ListAllEntitiesByBrowser<T>(
            Action<ICriteria> browserAliaser = null,
            Action<ICriteria> browserFilterer = null,
            Action<ICriteria> browserSorter = null,
            Action<ICriteria> browserPager = null)
            where T : class, IEntity
        {
            var pageCriteria = Registry.Session.CreateCriteria<T>();
            if (browserAliaser != null) { browserAliaser(pageCriteria); }
            if (browserFilterer != null) { browserFilterer(pageCriteria); }
            if (browserSorter != null) { browserSorter(pageCriteria); }
            if (browserPager != null) { browserPager(pageCriteria); }

            var filteredCountCriteria = Registry.Session.CreateCriteria<T>()
                .SetProjection(Projections.Count("Id"));
            if (browserAliaser != null) { browserAliaser(filteredCountCriteria); }
            if (browserFilterer != null) { browserFilterer(filteredCountCriteria); }

            var totalCountCriteria = Registry.Session.CreateCriteria<T>()
                .SetProjection(Projections.Count("Id"));
            if (browserAliaser != null) { browserAliaser(totalCountCriteria); }
            
            var batchedCriteria = Registry.Session.CreateMultiCriteria()
                .Add(pageCriteria).Add(filteredCountCriteria).Add(totalCountCriteria);
            var results = batchedCriteria.List();
            return new EntityPage<T>
            {
                Page = ((IList)results[0]).Cast<T>(),
                FilteredItems = (int)((IList)results[1])[0],
                TotalItems = (int)((IList)results[2])[0]
            };
       }
    }
}
