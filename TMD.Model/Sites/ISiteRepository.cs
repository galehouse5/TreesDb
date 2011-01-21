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
    }
}
