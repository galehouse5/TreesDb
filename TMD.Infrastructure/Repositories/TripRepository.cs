using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trips;
using TMD.Model;

namespace TMD.Infrastructure.Repositories
{
    public class TripRepository : TMD.Model.Trips.TripRepository
    {
        public override Trip FindById(int id)
        {
            return Registry.Session.Get<Trip>(id);
        }

        public override IList<Trip> ListCreatedByUser(int userId)
        {
            return Registry.Session.CreateQuery(@"
                select t from Trip as t
                where t.Creator.Id = :userId
                order by t.Id desc")
                .SetParameter("userId", userId)
                .List<Trip>();
        }

        protected override void InternalSave(Trip t)
        {
            Registry.Session.SaveOrUpdate(t);
        }

        protected override void InternalRemove(Trip t)
        {
            Registry.Session.Delete(t);
        }

        // TODO: implement import logic
        protected override void InternalImport(Trip t)
        {
            Registry.Session.SaveOrUpdate(t);
        }

        public override Trip FindLastCreatedByUser(int userId)
        {
            return Registry.Session.CreateQuery(@"
                select t from Trip as t
                where t.Creator.Id = :userId
                order by t.Id desc")
                .SetParameter("userId", userId)
                .SetMaxResults(1).List<Trip>().FirstOrDefault();
        }
    }
}
