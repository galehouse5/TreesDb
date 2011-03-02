using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

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
        Site FindSiteContainingTree(int treeId);
        PagedList<Subsite> ListAllSubsites(SubsiteBrowser browser);
    }

    public class SubsiteBrowser : IPagingOptions
    {
        public enum Property { State, Site, Subsite }
        public Property? SortProperty { get; set; }
        public bool SortAscending { get; set; }
        public string StateFilter { get; set; }
        public string SiteFilter { get; set; }
        public string SubsiteFilter { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}
