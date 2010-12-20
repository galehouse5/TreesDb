using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Locations
{
    public interface ILocationRepository
    {
        Country FindCountryByCode(string code);
        IList<Country> FindAllCountries();
        IList<State> FindAllStates();
        State FindStateById(int id);
        State FindStateByCountryAndStateCode(string countryCode, string stateCode);
        IList<State> FindStatesByCountryCode(string code);
    }
}
