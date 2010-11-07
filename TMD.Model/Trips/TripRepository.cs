using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Extensions;
using TMD.Model.Validation;

namespace TMD.Model.Trips
{
    public abstract class TripRepository
    {
        public void Save(Trip t)
        {
            if (t.IsImported)
            {
                throw new InvalidEntityOperationException(t, "Unable to save trip because it has already been imported.");
            }
            t.AssertIsValidToPersist();
            t.SetPrivatePropertyValue("LastSaved", DateTime.Now);
            InternalSave(t);
        }

        protected abstract void InternalSave(Trip t);
        
        public abstract Trip FindById(int id);

        public void Remove(Trip t)
        {
            if (t.IsImported)
            {
                throw new InvalidEntityOperationException(t, "Unable to remove trip because it has already been imported.");
            }
        }

        protected abstract void InternalRemove(Trip t);

        public void Import(Trip t)
        {
            if (t.IsImported)
            {
                throw new ApplicationException("Trip has already been imported.");
            }
            t.SetPrivatePropertyValue("IsImported", true);
            t.SetPrivatePropertyValue("Imported", DateTime.Now);
            InternalImport(t);
        }

        protected abstract void InternalImport(Trip t);

        public abstract IList<Trip> FindTripsCreatedByUser(int userId);
    }
}
