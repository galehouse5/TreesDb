using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;
using StructureMap;
using TMD.Model.Imports;
using TMD.Model.Locations;
using TMD.Model.Trees;
using TMD.Model.Photos;
using TMD.Model.Sites;

namespace TMD.Model
{
    public static class Repositories
    {
        public static ILocationRepository Locations
        {
            get { return ObjectFactory.GetInstance<ILocationRepository>(); }
        }

        public static ITreeRepository Trees
        {
            get { return ObjectFactory.GetInstance<ITreeRepository>(); }
        }

        public static ImportRepository Imports
        {
            get { return ObjectFactory.GetInstance<ImportRepository>(); }
        }

        public static UserRepository Users
        {
            get { return ObjectFactory.GetInstance<UserRepository>(); }
        }

        public static IPhotoRepository Photos
        {
            get { return ObjectFactory.GetInstance<IPhotoRepository>(); }
        }

        public static ISiteRepository Sites
        {
            get { return ObjectFactory.GetInstance<ISiteRepository>(); }
        }
    }
}
