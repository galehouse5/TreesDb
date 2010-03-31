using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Sites
{
    public interface ISiteRepository
    {
        IList<string> FindAllCountries();
        IList<string> FindAllStates();
        IList<string> FindStatesByCountry(string country);
        IList<Site> FindSitesByNameLike(string name, string county, string state, string country);
        void Add(Site site);
        void Update(Site site);
    }
}
