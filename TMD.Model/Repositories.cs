using StructureMap;

namespace TMD.Model
{
    public static class Repositories
    {
        public static Locations.ILocationRepository Locations
        {
            get { return ObjectFactory.GetInstance<Locations.ILocationRepository>(); }
        }

        public static Trees.ITreeRepository Trees
        {
            get { return ObjectFactory.GetInstance<Trees.ITreeRepository>(); }
        }

        public static Users.UserRepository Users
        {
            get { return ObjectFactory.GetInstance<Users.UserRepository>(); }
        }

        public static Photos.IPhotoRepository Photos
        {
            get { return ObjectFactory.GetInstance<Photos.IPhotoRepository>(); }
        }

        public static Sites.ISiteRepository Sites
        {
            get { return ObjectFactory.GetInstance<Sites.ISiteRepository>(); }
        }
    }
}
