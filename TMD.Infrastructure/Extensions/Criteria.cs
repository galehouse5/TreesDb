using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate;
using TMD.Model;
using NHibernate.Criterion;

namespace TMD.Infrastructure.Extensions
{
    public static class CriteriaExtensions
    {
        private static ICriteria applyPropertyFilterings(this ICriteria criteria, IDictionary<string, string> propertyFilterings, IDictionary<string, string> propertyNameToAliasMappings)
        {
            foreach (var propertyFiltering in propertyFilterings)
            {
                string alias = propertyFiltering.Key;
                if (propertyNameToAliasMappings != null && propertyNameToAliasMappings.ContainsKey(propertyFiltering.Key))
                {
                    alias = propertyNameToAliasMappings[propertyFiltering.Key];
                }
                criteria.Add(Restrictions.Like(propertyFiltering.Key, propertyFiltering.Value));
            }
            return criteria;
        }

        private static ICriteria applyPropertySortings(this ICriteria criteria, IDictionary<string, SortDirection> propertySortings, IDictionary<string, string> propertyNameToAliasMappings)
        {
            foreach (var propertySorting in propertySortings)
            {
                string alias = propertySorting.Key;
                if (propertyNameToAliasMappings != null && propertyNameToAliasMappings.ContainsKey(propertySorting.Key))
                {
                    alias = propertyNameToAliasMappings[propertySorting.Key];
                }
                if (propertySorting.Value == SortDirection.ASC)
                {
                    criteria.AddOrder(Order.Asc(alias));
                }
                else
                {
                    criteria.AddOrder(Order.Desc(alias));
                }
            }
            return criteria;
        }

        public static ICriteria ApplyForDataSource(this ICriteria criteria, RepositoryDataSourceOptions options, IDictionary<string, string> propertyNameToAliasMappings = null)
        {
            if (options.PropertySortings != null)
            {
                criteria.applyPropertySortings(options.PropertySortings, propertyNameToAliasMappings);
            }
            if (options.PropertyFilterings != null)
            {
                criteria.applyPropertyFilterings(options.PropertyFilterings, propertyNameToAliasMappings);
            }
            if (options.PageIndex.HasValue && options.EntitiesPerPage.HasValue)
            {
                criteria.SetFirstResult(options.PageIndex.Value * options.EntitiesPerPage.Value);
                criteria.SetFetchSize(options.EntitiesPerPage.Value);
            }
            return criteria;
        }

        public static ICriteria ApplyForTotalEntityCount(this ICriteria criteria, RepositoryDataSourceOptions options, IDictionary<string, string> propertyNameToAliasMappings = null)
        {
            if (options.PropertyFilterings != null)
            {
                criteria.applyPropertyFilterings(options.PropertyFilterings, propertyNameToAliasMappings);
            }
            return criteria;
        }
    }
}
