using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using StructureMap;

namespace TMD.Infrastructure.Repositories
{
    public class RepositoryRegistry : StructureMap.Configuration.DSL.Registry
    {
        public RepositoryRegistry()
        {
            For<TMD.Model.Locations.ILocationRepository>().Singleton().Use<LocationRepository>();
            For<TMD.Model.Trees.ITreeRepository>().Singleton().Use<TreeRepository>();
            For<TMD.Model.Trips.TripRepository>().Singleton().Use<TripRepository>();
            For<TMD.Model.Users.UserRepository>().Singleton().Use<UserRepository>();
            For<TMD.Model.Photos.IPhotoRepository>().Singleton().Use<PhotoRepository>();
        }

        internal static void Configure(NHibernate.Cfg.Configuration config)
        {
            PhotoRepository.Configure(config);
        }
    }
}
