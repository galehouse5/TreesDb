using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate;
using NHibernate.Cfg;
using System.Reflection;
using TMD.Model;

namespace TMD.Infrastructure
{
    internal static class InfrastructureRegistry
    {
        private static ISessionFactory s_SessionFactory;
        public static ISessionFactory SessionFactory
        {
            get
            {
                if (s_SessionFactory == null)
                {
                    s_SessionFactory = new Configuration()
                        .Configure()
                        .AddAssembly(Assembly.GetExecutingAssembly())
                        .BuildSessionFactory();
                }
                return s_SessionFactory;
            }
        }

        public static ISession UnitOfWorkSession
        {
            get
            {
                return (UnitOfWork.Context as NHibernateUnitOfWorkProvider).Session;
            }
        }
    }
}
