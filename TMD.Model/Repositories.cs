using StructureMap;
using TMD.Model.Exports;
using TMD.Model.Imports;
using TMD.Model.Locations;
using TMD.Model.Photos;
using TMD.Model.Sites;
using TMD.Model.Trees;
using TMD.Model.Users;

namespace TMD.Model
{
    // TODO: Migrate away from service location pattern to dependency injection.
    public static class Repositories
    {
        public static ILocationRepository Locations => ObjectFactory.GetInstance<ILocationRepository>();
        public static ITreeRepository Trees => ObjectFactory.GetInstance<ITreeRepository>();
        public static ImportRepository Imports => ObjectFactory.GetInstance<ImportRepository>();
        public static UserRepository Users => ObjectFactory.GetInstance<UserRepository>();
        public static IPhotoRepository Photos => ObjectFactory.GetInstance<IPhotoRepository>();
        public static ISiteRepository Sites => ObjectFactory.GetInstance<ISiteRepository>();
        public static IExportRepository Exports => ObjectFactory.GetInstance<IExportRepository>();
    }
}
