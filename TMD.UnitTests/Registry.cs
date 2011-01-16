﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using StructureMap;
using TMD.Infrastructure.Repositories;
using TMD.Model;
using TMD.Infrastructure;
using TMD.Model.Logging;

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
                x.For<IUnitOfWorkProvider>().Singleton().Use<NHibernateUnitOfWorkProvider>();
                x.For<IUserSessionProvider>().Singleton().Use<FakeUserSessionProvider>();
                x.For<ILogProvider>().Singleton().Use<Log4NetLogProvider>();
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
