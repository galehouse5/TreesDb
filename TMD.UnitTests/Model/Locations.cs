using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Collections.Generic;
using TMD.Model;
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
            Assert.AreEqual(57, states.Count);
            states = Repositories.Locations.FindStatesByCountryCode("USA");
            Assert.AreEqual(57, states.Count);
            states = Repositories.Locations.FindStatesByCountryCode("United States");
            Assert.AreEqual(57, states.Count);
            Assert.IsNotNull(states[0].CoordinateBounds);
        }

        [TestMethod]
        public void FindStateByCountryCodeAndCode()
        {
            State oh = Repositories.Locations.FindStateByCountryAndStateCode("US", "OH");
            Assert.IsNotNull(oh);
            State io = Repositories.Locations.FindStateByCountryAndStateCode("US", "IO");
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
