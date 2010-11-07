using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using StructureMap;
using TMD.Infrastructure.Repositories;
using TMD.Model;
using TMD.Infrastructure;

namespace TMD.UnitTests
{
    [TestClass]
    public static class Registry
    {
        [AssemblyInitialize]
        public static void Initialize(TestContext tc)
        {
            log4net.Config.XmlConfigurator.Configure();
            ObjectFactory.Initialize(x =>
            {
                x.AddRegistry(new RepositoryRegistry());
                x.For<IUnitOfWorkProvider>().Singleton().Use<NHibernateUnitOfWorkProvider>().OnCreation(uow => uow.Initialize());
                x.For<IUserSessionProvider>().Singleton().Use<FakeUserSessionProvider>();
            });
        }
    }

    public class FakeUserSessionProvider : IUserSessionProvider
    {
        public bool IsAnonymous
        {
            get { return true; }
        }

        public TMD.Model.Users.User User
        {
            get { return null; }
        }
    }
}
