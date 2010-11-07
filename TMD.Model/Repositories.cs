using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;
using StructureMap;
using TMD.Model.Trips;
using TMD.Model.Locations;
using TMD.Model.Trees;

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

        public static TripRepository Trips
        {
            get { return ObjectFactory.GetInstance<TripRepository>(); }
        }

        public static UserRepository Users
        {
            get { return ObjectFactory.GetInstance<UserRepository>(); }
        }
    }
}
