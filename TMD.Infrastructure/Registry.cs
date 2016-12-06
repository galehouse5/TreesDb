using NHibernate;
using NHibernate.Cfg;
using StructureMap;
using System;
using System.Reflection;
using TMD.Infrastructure.Repositories;
using TMD.Model;

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
                    var config = new Configuration().Configure().AddAssembly(Assembly.GetExecutingAssembly());
                    RepositoryRegistry.Configure(config);
                    s_SessionFactory = config.BuildSessionFactory();
                }

                return s_SessionFactory;
            }
        }

        public static ISession Session
            => (ObjectFactory.GetInstance<IUnitOfWorkProvider>() as NHibernateUnitOfWorkProvider).Session;

        private static string s_ConnectionString;
        internal static string ConnectionString
            => s_ConnectionString ?? (s_ConnectionString = getConnectionString(new Configuration().Configure()));

        private static string getConnectionString(Configuration configuration)
        {
            if (configuration.Properties.ContainsKey(NHibernate.Cfg.Environment.ConnectionString))
                return configuration.GetProperty(NHibernate.Cfg.Environment.ConnectionString);

            if (configuration.Properties.ContainsKey(NHibernate.Cfg.Environment.ConnectionStringName))
                return System.Configuration.ConfigurationManager
                    .ConnectionStrings[configuration.GetProperty(NHibernate.Cfg.Environment.ConnectionStringName)]
                    .ConnectionString;

            throw new NotImplementedException();
        }
    }
}
