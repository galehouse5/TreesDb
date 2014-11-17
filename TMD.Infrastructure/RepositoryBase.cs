using NHibernate;
using NHibernate.Criterion;
using System;
using System.Collections;
using System.Linq;
using TMD.Model;

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
            var batchedCriteria = Registry.Session.CreateMultiCriteria();

            var pageCriteria = Registry.Session.CreateCriteria<T>();
            if (browserAliaser != null) { browserAliaser(pageCriteria); }
            if (browserFilterer != null) { browserFilterer(pageCriteria); }
            if (browserSorter != null) { browserSorter(pageCriteria); }
            if (browserPager != null) { browserPager(pageCriteria); }
            batchedCriteria.Add(pageCriteria);

            var totalCountCriteria = Registry.Session.CreateCriteria<T>()
                .SetProjection(Projections.Count("Id"));
            if (browserAliaser != null) { browserAliaser(totalCountCriteria); }
            batchedCriteria.Add(totalCountCriteria);

            if (browserFilterer == null)
            {
                var results = batchedCriteria.List();

                return new EntityPage<T>
                {
                    PageEntities = ((IList)results[0]).Cast<T>(),
                    TotalEntitiesCount = (int)((IList)results[1])[0],
                    FilteredEntitiesCount = null
                };
            }
            {
                var filteredCountCriteria = Registry.Session.CreateCriteria<T>()
                    .SetProjection(Projections.Count("Id"));
                if (browserAliaser != null) { browserAliaser(filteredCountCriteria); }
                if (browserFilterer != null) { browserFilterer(filteredCountCriteria); }
                batchedCriteria.Add(filteredCountCriteria);

                var results = batchedCriteria.List();

                return new EntityPage<T>
                {
                    PageEntities = ((IList)results[0]).Cast<T>(),
                    TotalEntitiesCount = (int)((IList)results[1])[0],
                    FilteredEntitiesCount = (int)((IList)results[2])[0]
                };
            }
        }
    }
}
