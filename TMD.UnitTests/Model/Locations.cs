using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model;
using TMD.Infrastructure;
using TMD.Model.Locations;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Locations
    {
        [TestMethod]
        public void FindAllCountries()
        {
            IList<Country> countries = LocationService.FindAllCountries();
            Assert.IsTrue(countries.Count >= 1);
            Assert.IsNotNull(countries[0].CoordinateBounds);
        }

        [TestMethod]
        public void FindStatesByCountryCode()
        {
            IList<State> states = LocationService.FindStatesByCountryCode("US");
            Assert.IsTrue(states.Count == 48);
            Assert.IsNotNull(states[0].CoordinateBounds);
        }

        [TestMethod]
        public void FindStateByCountryCodeAndCode()
        {
            State oh = LocationService.FindStateByCountryCodeAndCode("US", "OH");
            Assert.IsNotNull(oh);
            State io = LocationService.FindStateByCountryCodeAndCode("US", "IO");
            Assert.IsNull(io);
        }

        [TestMethod]
        public void FindCountryByCode()
        {
            Country us = LocationService.FindCountryByCode("US");
            Assert.IsNotNull(us);
            Country su = LocationService.FindCountryByCode("SU");
            Assert.IsNull(su);
        }
    }
}
