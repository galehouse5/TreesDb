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

        public IList<Trip> FindAlreadyImportedTripsByUserId(int userId)
        {
            return InfrastructureRegistry.UnitOfWorkSession.CreateQuery(@"
                select t from Trip as t
                where t.IsImported = 1
                    and t.Creator.Id = :userId
                order by t.Id desc")
                .SetParameter("userId", userId)
                .List<Trip>();
        }

        public IList<Trip> FindNotYetImportedTripsByUserId(int userId)
        {
            return InfrastructureRegistry.UnitOfWorkSession.CreateQuery(@"
                select t from Trip as t
                where t.IsImported = 0
                    and t.Creator.Id = :userId
                order by t.Id desc")
                .SetParameter("userId", userId)
                .List<Trip>();
        }


        public Trip FindLastSavedTripNotYetImportedByUserId(int userId)
        {
            return InfrastructureRegistry.UnitOfWorkSession.CreateQuery(@"
                select t from Trip as t
                where t.IsImported = 0
                    and t.Creator.Id = :userId
                order by t.LastSaved desc, t.Id desc")
                .SetParameter("userId", userId)
                .SetMaxResults(1)
                .UniqueResult<Trip>();
        }
    }
}
