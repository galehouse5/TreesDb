using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.Unity;

namespace TMD.Model.Locations
{
    public interface ILocationRepository
    {
        State FindStateByCountryAndStateCodes(string countryCode, string stateCode);
        Country FindCountryByCode(string code);
        IList<State> FindStatesByCountryCode(string code);
        IList<Country> FindAllCountries();
    }

    public static class LocationService
    {
        private static ILocationRepository s_Repository = ModelRegistry.RepositoryFactory.Resolve<ILocationRepository>();

        public static State FindStateByCountryAndStateCodes(string countryCode, string stateCode)
        {
            return s_Repository.FindStateByCountryAndStateCodes(countryCode, stateCode);
        }

        public static Country FindCountryByCode(string code)
        {
            return s_Repository.FindCountryByCode(code);
        }

        public static IList<State> FindStatesByCountryCode(string code)
        {
            return s_Repository.FindStatesByCountryCode(code);
        }

        public static IList<Country> FindAllCountries()
        {
            return s_Repository.FindAllCountries();
        }
    }
}
