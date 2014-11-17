using NHibernate;
using NHibernate.Cfg;
using StructureMap;
using System.Reflection;
using TMD.Infrastructure.EventListeners;
using TMD.Model;

namespace TMD.Infrastructure
{
    public static class Registry
    {
        private static ISessionFactory sessionFactory;

        private static ISessionFactory createSessionFactory()
        {
            Configuration config = new Configuration().Configure()
                .AddAssembly(Assembly.GetExecutingAssembly());

            PhotoFileEventListener.Configure(config);

            return config.BuildSessionFactory();
        }

        public static ISessionFactory SessionFactory
        {
            get { return sessionFactory ?? (sessionFactory = createSessionFactory()); }
        }

        public static ISession Session
        {
            get { return ((NHibernateUnitOfWorkProvider)ObjectFactory.GetInstance<IUnitOfWorkProvider>()).Session; }
        }
    }
}
