using NHibernate;
using TMD.Model;

namespace TMD.Infrastructure.Repositories
{
    public class RepositoryRegistry : StructureMap.Configuration.DSL.Registry
    {
        public RepositoryRegistry()
        {
            For<Model.Locations.ILocationRepository>().Singleton().Use<LocationRepository>();
            For<Model.Trees.ITreeRepository>().Singleton().Use<TreeRepository>();
            For<Model.Users.UserRepository>().Singleton().Use<UserRepository>();
            For<Model.Photos.IPhotoRepository>().Singleton().Use<PhotoRepository>();
            For<Model.Sites.ISiteRepository>().Singleton().Use<SiteRepository>();

            For<ISession>().HybridHttpOrThreadLocalScoped().Use(c => c.GetInstance<NHibernateUnitOfWorkProvider>().Session);
            For(typeof(IRepository<>)).HybridHttpOrThreadLocalScoped().Use(typeof(NHibernateFetchableRepository<>));
            For(typeof(IFetchableRepository<>)).HybridHttpOrThreadLocalScoped().Use(typeof(NHibernateFetchableRepository<>));
        }

        internal static void Configure(NHibernate.Cfg.Configuration config)
        {
            PhotoRepository.Configure(config);
        }
    }
}
