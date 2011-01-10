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
        IList<Site> FindByProximity(Coordinates coordinates, float minutesDistance);
    }
}
