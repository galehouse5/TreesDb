using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.Unity;

namespace TMD.Model.Locations
{
    public interface ILocationRepository
    {
        State FindStateByCountryCodeAndCode(string countryCode, string code);
        Country FindCountryByCode(string code);
        IList<State> FindStatesByCountryCode(string countryCode);
        IList<Country> FindAllCountries();
    }

    public static class LocationService
    {
        private static ILocationRepository s_Repository = ModelRegistry.RepositoryFactory.Resolve<ILocationRepository>();

        public static State FindStateByCountryCodeAndCode(string countryCode, string code)
        {
            return s_Repository.FindStateByCountryCodeAndCode(countryCode, code);
        }

        public static Country FindCountryByCode(string code)
        {
            return s_Repository.FindCountryByCode(code);
        }

        public static IList<State> FindStatesByCountryCode(string countryCode)
        {
            return s_Repository.FindStatesByCountryCode(countryCode);
        }

        public static IList<Country> FindAllCountries()
        {
            return s_Repository.FindAllCountries();
        }
    }
}
