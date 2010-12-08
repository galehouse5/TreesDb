using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Mappings.ValidationMapping;

namespace TMD.UnitTests.Application
{
    [TestClass]
    public class ValidationMapping
    {
        [TestMethod]
        public void MatchesPath()
        {
            Assert.IsTrue(new ExactPathMatcher("this.is.a.property.path").Matches("this.is.a.property.path"));
            Assert.IsFalse(new ExactPathMatcher("this.is.a.property.path").Matches("this.is.a.property.path.too"));
            
            Assert.IsTrue(new WildcardPathMatcher("this.*").Matches("this.is.a.property.path"));
            Assert.IsFalse(new WildcardPathMatcher("this.*").Matches("thisis.a.property.path"));
            Assert.IsTrue(new WildcardPathMatcher("this.*.a.*.path").Matches("this.is.a.property.path"));
            Assert.IsFalse(new WildcardPathMatcher("this.*.a.*.path").Matches("this.is.a.property.path.too"));
        }

        [TestMethod]
        public void CreatesPathMatcher()
        {
            Assert.IsInstanceOfType(new PathMatcherFactory().Create("*"), typeof(AlwaysPathMatcher));
            Assert.IsInstanceOfType(new PathMatcherFactory().Create("this.*"), typeof(WildcardPathMatcher));
            Assert.IsInstanceOfType(new PathMatcherFactory().Create("this.is.a.property.path"), typeof(ExactPathMatcher));
            Assert.IsInstanceOfType(new PathMatcherFactory().Create(string.Empty), typeof(NeverPathMatcher));
        }

        [TestMethod]
        public void MapsPath()
        {
            Assert.AreEqual(string.Empty, new EmptyPathMapper().Map("this.is.a.property.path"));
            Assert.AreNotEqual("this.is.a.property.path", new EmptyPathMapper().Map("this.is.a.property.path"));

            Assert.AreEqual("this.is.a.property.path", new SourcePathMapper().Map("this.is.a.property.path"));
            Assert.AreNotEqual("this.is.a.property.path", new SourcePathMapper().Map("this.is.a.property.path.too"));

            Assert.AreEqual("this.is.a.property.path.too", new WildcardPathMapper("this.*.a.*.path", "this.*.a.*.path.too").Map("this.is.a.property.path"));
            Assert.AreNotEqual("this.is.a.property.path", new WildcardPathMapper("this.*.a.*.path", "this.*.a.*.path.too").Map("this.is.a.property.path"));
            Assert.AreEqual("this.is.a.property.path.too", new WildcardPathMapper("*.path", "*.path.too").Map("this.is.a.property.path"));
            Assert.AreNotEqual("this.is.a.property.path", new WildcardPathMapper("*.path", "*.path.too").Map("this.is.a.property.path"));
            Assert.AreEqual("that.is.a.property.path", new WildcardPathMapper("this.*", "that.*").Map("this.is.a.property.path"));
            Assert.AreNotEqual("this.is.a.property.path", new WildcardPathMapper("this.*", "that.*").Map("this.is.a.property.path"));
        }

        [TestMethod]
        public void CreatesPathMapper()
        {
            Assert.IsInstanceOfType(new PathMapperFactory().Create("*", "this.is.a.property.path"), typeof(ConstantPathMapper));
            Assert.IsInstanceOfType(new PathMapperFactory().Create("this.is.a.property.path", "this.is.a.property.path"), typeof(SourcePathMapper));
            Assert.IsInstanceOfType(new PathMapperFactory().Create("*.path", "*.path.too"), typeof(WildcardPathMapper));
            Assert.IsInstanceOfType(new PathMapperFactory().Create(string.Empty, string.Empty), typeof(EmptyPathMapper));
        }
    }
}
