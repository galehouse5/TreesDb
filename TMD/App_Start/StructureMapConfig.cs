using StructureMap;
using System.Linq;
using System.Web.Mvc;
using TMD.Infrastructure;
using TMD.Infrastructure.Repositories;
using TMD.Model;

namespace TMD
{
    public class StructureMapConfig
    {
        public static void RegisterContainer()
        {
            ObjectFactory.Initialize(x =>
            {
                x.AddRegistry(new RepositoryRegistry());
                x.For<IUnitOfWorkProvider>().HttpContextScoped().Use<NHibernateUnitOfWorkProvider>();
                x.For<IUserSessionProvider>().Singleton().Use<WebUserSessionProvider>();

                x.Scan(s =>
                    {
                        s.TheCallingAssembly();
                        s.WithDefaultConventions();
                    });
            });

            DependencyResolver.SetResolver(t =>
                {
                    try
                    {
                        return ObjectFactory.GetInstance(t);
                    }
                    catch (StructureMapException ex)
                    {
                        if (202 == ex.ErrorCode) return null;
                        throw;
                    }
                }, t => ObjectFactory.GetAllInstances(t).Cast<object>());
        }
    }
}