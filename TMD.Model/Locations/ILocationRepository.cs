using System.Collections.Generic;

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
        IEnumerable<State> SearchStates(string expression, int maxResults);
    }
}
