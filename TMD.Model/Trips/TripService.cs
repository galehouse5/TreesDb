using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.Unity;

namespace TMD.Model.Trips
{
    public static class TripService
    {
        private static ITripRepository m_Repository = ModelRegistry.RepositoryFactory.Resolve<ITripRepository>();

        public static void Save(Trip t)
        {
            m_Repository.Save(t);
        }

        public static Trip FindById(int id)
        {
            return m_Repository.FindById(id);
        }

        public static void Remove(Trip t)
        {
            m_Repository.Remove(t);
        }
    }
}
