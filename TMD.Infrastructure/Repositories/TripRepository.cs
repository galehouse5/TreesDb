using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trips;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using TMD.Model;

namespace TMD.Infrastructure.Repositories
{
    public class TripRepository : ITripRepository
    {
        public void Save(Trip t)
        {
            if (!t.ValidateRegardingPersistence().IsValid)
            {
                throw new ApplicationException("Unable to save trip due to validation failure.");
            }
            InfrastructureRegistry.UnitOfWorkSession.SaveOrUpdate(t);
        }

        public Trip FindById(int id)
        {
            return InfrastructureRegistry.UnitOfWorkSession.Get<Trip>(id);
        }

        public void Remove(Trip t)
        {
            InfrastructureRegistry.UnitOfWorkSession.Delete(t);
        }
    }
}
