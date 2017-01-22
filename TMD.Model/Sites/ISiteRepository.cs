using System.Collections.Generic;

namespace TMD.Model.Sites
{
    public interface ISiteRepository
    {
        void Save(Site site);
        Site FindById(int id);
        void Merge(Site site);
        IList<Site> ListByProximity(Coordinates coordinates, float minutesDistance);
        IList<Site> ListAll();
        IList<Site> ListAllForMap();
        void RemoveVisitsByTrip(Imports.Trip trip);
        void Remove(Site site);
        EntityPage<Subsite> ListAllSubsites(SubsiteBrowser browser);
        IList<Subsite> FindSubsitesByStateId(int stateId);
        IEnumerable<Subsite> SearchSubsites(string expression, int maxResults);
        IEnumerable<SubsiteVisit> ListRecentSubsiteVisits(int maxResults);
    }

    public class SubsiteBrowser : IPagingOptions
    {
        public enum Property { State, Site, County, RHI5, RHI10, RGI5, RGI10, LastMeasurement }
        public Property? SortProperty { get; set; }
        public bool SortAscending { get; set; }
        public string StateFilter { get; set; }
        public string CountyFilter { get; set; }
        public string SiteFilter { get; set; }
        public string SubsiteFilter { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }

        public bool HasFilters
            => !string.IsNullOrEmpty(StateFilter)
            || !string.IsNullOrEmpty(CountyFilter)
            || !string.IsNullOrEmpty(SiteFilter)
            || !string.IsNullOrEmpty(SubsiteFilter);
    }
}
