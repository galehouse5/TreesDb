using Microsoft.VisualStudio.TestTools.UnitTesting;
using StructureMap;
using TMD.Infrastructure;
using TMD.Infrastructure.Repositories;
using TMD.Model;

namespace TMD.UnitTests
{
    [TestClass]
    public static class Registry
    {
        [AssemblyInitialize]
        public static void Initialize(TestContext tc)
        {
            ObjectFactory.Initialize(x =>
            {
                x.AddRegistry(new RepositoryRegistry());
                x.For<IUnitOfWorkProvider>().Singleton().Use<NHibernateUnitOfWorkProvider>();
                x.For<IUserSessionProvider>().Singleton().Use<NullUserSessionProvider>();
            });
        }
    }
}
