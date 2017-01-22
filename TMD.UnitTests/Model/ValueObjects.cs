using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class ValueObjects
    {
        [TestMethod]
        public void CreatesLatitude()
        {
            Assert.AreEqual(0f, Latitude.Create(-180f).TotalDegrees);
            Assert.AreEqual(45f, Latitude.Create(-135f).TotalDegrees);
            Assert.AreEqual(-90f, Latitude.Create(-90f).TotalDegrees);
            Assert.AreEqual(-45f, Latitude.Create(-45f).TotalDegrees);
            Assert.AreEqual(0f, Latitude.Create(0f).TotalDegrees);
            Assert.AreEqual(45f, Latitude.Create(45f).TotalDegrees);
            Assert.AreEqual(90f, Latitude.Create(90f).TotalDegrees);
            Assert.AreEqual(-45f, Latitude.Create(135f).TotalDegrees);
            Assert.AreEqual(0f, Latitude.Create(180f).TotalDegrees);
        }

        [TestMethod]
        public void CreatesLongitude()
        {
            Assert.AreEqual(0f, Longitude.Create(-360f).TotalDegrees);
            Assert.AreEqual(90f, Longitude.Create(-270f).TotalDegrees);
            Assert.AreEqual(-180f, Longitude.Create(-180f).TotalDegrees);
            Assert.AreEqual(-90f, Longitude.Create(-90f).TotalDegrees);
            Assert.AreEqual(0f, Longitude.Create(0f).TotalDegrees);
            Assert.AreEqual(90f, Longitude.Create(90f).TotalDegrees);
            Assert.AreEqual(180f, Longitude.Create(180f).TotalDegrees);
            Assert.AreEqual(-90f, Longitude.Create(270f).TotalDegrees);
            Assert.AreEqual(0f, Longitude.Create(360f).TotalDegrees);
        }

        [TestMethod]
        public void ExtendsCoordinateBounds()
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
        public void CalculatesCenterForCoordinateBounds()
        {
            CoordinateBounds ohioBounds = CoordinateBounds.Create(
                ne: Coordinates.Create(42.32324f, -80.51899f),
                sw: Coordinates.Create(38.40314f, -84.82034f));
            Assert.AreEqual(Coordinates.Create(40.36319f, -82.669665f), ohioBounds.Center);

            CoordinateBounds alaskaBounds = CoordinateBounds.Create(
                ne: Coordinates.Create(71.60482f, -129.9742f),
                sw: Coordinates.Create(51.02287f, 172.1155f));
            Assert.AreEqual(Coordinates.Create(61.3138428f, -158.929352f), alaskaBounds.Center);
        }

        [TestMethod]
        public void CreatesDistance()
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
