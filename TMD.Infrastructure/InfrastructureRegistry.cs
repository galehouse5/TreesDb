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

namespace TMD.Infrastructure
{
    internal static class InfrastructureRegistry
    {
        private class SectionNames
        {
            public const string RepositorySettings = "repositorySettings";
        }

        private static RepositorySettings m_RepositorySettings;
        public static RepositorySettings RepositorySettings
        {
            get
            {
                if (m_RepositorySettings == null)
                {
                    m_RepositorySettings = (RepositorySettings)ConfigurationManager.GetSection(SectionNames.RepositorySettings);
                }
                return m_RepositorySettings;
            }
        }

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

        public static ISession UnitOfWorkSession
        {
            get { return (UnitOfWork.Context as NHibernateUnitOfWorkProvider).Session; }
        }
    }
}
