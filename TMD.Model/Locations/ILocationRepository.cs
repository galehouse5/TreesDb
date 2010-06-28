using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Locations
{
    public interface ILocationRepository
    {
        State FindStateByCountryCodeAndCode(string countryCode, string code);
        Country FindCountryByCode(string code);
        IList<State> FindStatesByCountryCode(string countryCode);
        IList<Country> FindAllCountries();
    }
}
