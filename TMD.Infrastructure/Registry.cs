using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate;
using NHibernate.Cfg;
using System.Reflection;
using TMD.Model;
using TMD.Infrastructure.Repositories;
using System.Configuration;
using StructureMap;

namespace TMD.Infrastructure
{
    internal static class Registry
    {
        private static ISessionFactory s_SessionFactory;
        public static ISessionFactory SessionFactory
        {
            get
            {
                if (s_SessionFactory == null)
                {
                    s_SessionFactory = new NHibernate.Cfg.Configuration()
                        .Configure()
                        .AddAssembly(Assembly.GetExecutingAssembly())
                        .BuildSessionFactory();
                }
                return s_SessionFactory;
            }
        }

        public static ISession Session
        {
            get { return (ObjectFactory.GetInstance<IUnitOfWorkProvider>() as NHibernateUnitOfWorkProvider).Session; }
        }
    }
}
