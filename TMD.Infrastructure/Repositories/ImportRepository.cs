using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Imports;
using TMD.Model;
using NHibernate.Criterion;

namespace TMD.Infrastructure.Repositories
{
    public class ImportRepository : TMD.Model.Imports.ImportRepository
    {
        public override Trip FindById(int id)
        {
            return Registry.Session.Get<Trip>(id);
        }

        public override IList<Trip> ListCreatedByUser(int userId)
        {
            return Registry.Session.CreateCriteria<Trip>()
                .CreateAlias("Creator", "Creator")
                .Add(Restrictions.Eq("Creator.Id", userId))
                .AddOrder(Order.Desc("Id"))
                .List<Trip>();
        }

        protected override void InternalSave(Trip t)
        {
            Registry.Session.Save(t);
        }

        public override void Remove(Trip t)
        {
            Model.Repositories.Trees.RemoveMeasurementsByTrip(t);
            Model.Repositories.Sites.RemoveVisitsByTrip(t);
            Registry.Session.Delete(t);
        }

        protected override void InternalImport(Trip t)
        {
            foreach(var site in t.Sites)
            {
                var siteForMerging = Model.Sites.Site.Create(site);
                Model.Repositories.Sites.Merge(siteForMerging);
            }
        }

        public override Trip FindLastCreatedByUser(int userId)
        {
            return Registry.Session.CreateCriteria<Trip>()
                .CreateAlias("Creator", "Creator")
                .Add(Restrictions.Eq("Creator.Id", userId))
                .AddOrder(Order.Desc("Id"))
                .SetMaxResults(1).List<Trip>().FirstOrDefault();
        }

        public override IList<Trip> ListAll()
        {
            return Registry.Session.CreateCriteria<Trip>().List<Trip>();
        }

        protected override void InternalReimport(Trip t)
        {
            Model.Repositories.Trees.RemoveMeasurementsByTrip(t);
            Model.Repositories.Sites.RemoveVisitsByTrip(t);
            // resolves obscure NHibernate exception
            // "deleted object would be re-saved by cascade (remove deleted object from associations)"
            Registry.Session.Flush();
            InternalImport(t);
        }
    }
}
