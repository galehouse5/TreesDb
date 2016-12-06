using TMD.Model.Exports;
using TMD.Model.Locations;
using TMD.Model.Photos;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Infrastructure.Repositories
{
    public class RepositoryRegistry : StructureMap.Configuration.DSL.Registry
    {
        public RepositoryRegistry()
        {
            For<ILocationRepository>().Singleton().Use<LocationRepository>();
            For<ITreeRepository>().Singleton().Use<TreeRepository>();
            For<Model.Imports.ImportRepository>().Singleton().Use<ImportRepository>();
            For<Model.Users.UserRepository>().Singleton().Use<UserRepository>();
            For<IPhotoRepository>().Singleton().Use<PhotoRepository>();
            For<ISiteRepository>().Singleton().Use<SiteRepository>();
            For<IExportRepository>().Singleton().Use<ExportRepository>();
        }

        internal static void Configure(NHibernate.Cfg.Configuration config)
        {
            PhotoRepository.Configure(config);
        }
    }
}
