using NHibernate;
using NHibernate.Criterion;
using TMD.Model.Locations;
using TMD.Model.Sites;

namespace TMD.Infrastructure.Repositories
{
    public static class SiteBrowserExtensions
    {
        public static ICriteria ApplyFilters(this ICriteria criteria, SiteBrowser browser)
        {
            if (!string.IsNullOrEmpty(browser.SiteFilter))
            {
                criteria.Add(Restrictions.Like("Name", browser.SiteFilter, MatchMode.Anywhere));
            }
            if (!string.IsNullOrEmpty(browser.StateFilter))
            {
                criteria.Add(Restrictions.Like("state.Name", browser.StateFilter, MatchMode.Anywhere));
            }
            if (!string.IsNullOrEmpty(browser.CountyFilter))
            {
                criteria.Add(Restrictions.Like(nameof(Site.County), browser.CountyFilter, MatchMode.Anywhere));
            }
            return criteria;
        }

        public static ICriteria ApplySorting(this ICriteria criteria, SiteBrowser browser)
        {
            switch (browser.SortProperty)
            {
                case SiteBrowser.Property.Site:
                    return criteria.AddOrder(new Order(nameof(Site.Name), browser.SortAscending));
                case SiteBrowser.Property.State:
                    return criteria.AddOrder(new Order($"state.{nameof(State.Name)}", browser.SortAscending));
                case SiteBrowser.Property.County:
                    return criteria.AddOrder(new Order(nameof(Site.County), browser.SortAscending));
                case SiteBrowser.Property.RHI5:
                    return criteria.AddOrder(new Order(nameof(Site.ComputedRHI5), browser.SortAscending));
                case SiteBrowser.Property.RHI10:
                    return criteria.AddOrder(new Order(nameof(Site.ComputedRHI10), browser.SortAscending));
                case SiteBrowser.Property.RGI5:
                    return criteria.AddOrder(new Order(nameof(Site.ComputedRGI5), browser.SortAscending));
                case SiteBrowser.Property.RGI10:
                    return criteria.AddOrder(new Order(nameof(Site.ComputedRGI10), browser.SortAscending));
                case SiteBrowser.Property.LastMeasurement:
                    return criteria.AddOrder(new Order(nameof(Site.ComputedLastMeasurementDate), browser.SortAscending));
                default:
                    return criteria.AddOrder(new Order(nameof(Site.ComputedLastMeasurementDate), ascending: false));
            }
        }
    }
}
