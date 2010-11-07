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
            IList<Country> countries = Repositories.Locations.FindAllCountries();
            Assert.IsTrue(countries.Count >= 1);
            Assert.IsNotNull(countries[0].CoordinateBounds);
        }

        [TestMethod]
        public void FindStatesByCountryCode()
        {
            IList<State> states = Repositories.Locations.FindStatesByCountryCode("US");
            Assert.IsTrue(states.Count == 57);
            states = Repositories.Locations.FindStatesByCountryCode("USA");
            Assert.IsTrue(states.Count == 57);
            states = Repositories.Locations.FindStatesByCountryCode("United States");
            Assert.IsTrue(states.Count == 57);
            Assert.IsNotNull(states[0].CoordinateBounds);
        }

        [TestMethod]
        public void FindStateByCountryCodeAndCode()
        {
            State oh = Repositories.Locations.FindStateByCountryAndStateCodes("US", "OH");
            Assert.IsNotNull(oh);
            State io = Repositories.Locations.FindStateByCountryAndStateCodes("US", "IO");
            Assert.IsNull(io);
        }

        [TestMethod]
        public void FindCountryByCode()
        {
            Country us = Repositories.Locations.FindCountryByCode("US");
            Assert.IsNotNull(us);
            Country su = Repositories.Locations.FindCountryByCode("SU");
            Assert.IsNull(su);
        }
    }
}
