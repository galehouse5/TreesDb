using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class ValueObjects
    {
        [TestMethod]
        public void ExtendCoordinateBounds()
        {
            CoordinateBounds cb1 = CoordinateBounds.Null();
            Assert.AreEqual(cb1.NE, Coordinates.Null());
            Assert.AreEqual(cb1.SW, Coordinates.Null());
            Assert.AreEqual(cb1.Center, Coordinates.Null());
            CoordinateBounds cb2 = CoordinateBounds.Null()
                .Extend(Coordinates.Create(50, 50))
                .Extend(Coordinates.Create(25, 75))
                .Extend(Coordinates.Create(75, 25));
            Assert.AreEqual(cb2.NE, Coordinates.Create(75, 75));
            Assert.AreEqual(cb2.SW, Coordinates.Create(25, 25));
            Assert.AreEqual(cb2.Center, Coordinates.Create(50, 50));
        }

        [TestMethod]
        public void CreateDistance()
        {
            Distance d = Distance.Create("7' 10\"");
            Assert.AreEqual(Distance.Create("7 10"), d);
            
            Assert.AreEqual(Distance.Create("7ft 10"), d);
            Assert.AreEqual(Distance.Create("7 ft 10"), d);
            Assert.AreEqual(Distance.Create("7feet 10"), d);
            Assert.AreEqual(Distance.Create("7 feet 10"), d);
            Assert.AreEqual(Distance.Create("7foot 10"), d);
            Assert.AreEqual(Distance.Create("7 foot 10"), d);
            
            Assert.AreEqual(Distance.Create("7 10\""), d);
            Assert.AreEqual(Distance.Create("7 10 \""), d);
            Assert.AreEqual(Distance.Create("7 10''"), d);
            Assert.AreEqual(Distance.Create("7 10 ''"), d);
            Assert.AreEqual(Distance.Create("7 10in"), d);
            Assert.AreEqual(Distance.Create("7 10 in"), d);
            Assert.AreEqual(Distance.Create("7 10inches"), d);
            Assert.AreEqual(Distance.Create("7 10 inches"), d);
            Assert.AreEqual(Distance.Create("7 10 inches"), d);

            Assert.AreEqual(Distance.Create("7.83333349"), d);
            Assert.AreEqual(Distance.Create("7.83333349 "), d);
            Assert.AreEqual(Distance.Create("7.83333349'"), d);
            Assert.AreEqual(Distance.Create("7.83333349 '"), d);
            Assert.AreEqual(Distance.Create("7.83333349`"), d);
            Assert.AreEqual(Distance.Create("7.83333349 `"), d);
            Assert.AreEqual(Distance.Create("7.83333349ft"), d);
            Assert.AreEqual(Distance.Create("7.83333349 ft"), d);
            Assert.AreEqual(Distance.Create("7.83333349foot"), d);
            Assert.AreEqual(Distance.Create("7.83333349 foot"), d);
            Assert.AreEqual(Distance.Create("7.83333349feet"), d);
            Assert.AreEqual(Distance.Create("7.83333349 feet"), d);

            Assert.AreEqual(Distance.Create("94''"), d);
            Assert.AreEqual(Distance.Create("94 ''"), d);
            Assert.AreEqual(Distance.Create("94``"), d);
            Assert.AreEqual(Distance.Create("94 ``"), d);
            Assert.AreEqual(Distance.Create("94in"), d);
            Assert.AreEqual(Distance.Create("94 in"), d);
            Assert.AreEqual(Distance.Create("94inch"), d);
            Assert.AreEqual(Distance.Create("94 inch"), d);
            Assert.AreEqual(Distance.Create("94inches"), d);
            Assert.AreEqual(Distance.Create("94 inches"), d);
        }
    }
}
