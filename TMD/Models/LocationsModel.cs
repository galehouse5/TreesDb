using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model.Locations;

namespace TMD.Models
{
    public class LocationsModel
    {
        public IList<Country> FindAllCountries()
        {
            return LocationService.FindAllCountries();
        }

        public IList<State> FindStatesByCountryCode(string code)
        {
            return LocationService.FindStatesByCountryCode(code);
        }
    }
}