using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Locations
{
    public interface ILocationRepository
    {
        State FindStateByCountryAndStateCodes(string countryCode, string stateCode);
        Country FindCountryByCode(string code);
        IList<State> FindStatesByCountryCode(string code);
        IList<Country> FindAllCountries();
    }
}
