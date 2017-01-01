using System;
using System.Collections.Generic;
using TMD.Model.Validation;

namespace TMD.Model.Imports
{
    public abstract class ImportRepository
    {
        protected abstract void InternalSave(Trip t);

        public void Save(Trip t)
        {
            t.LastSaved = DateTime.Now;
            InternalSave(t);
        }

        public abstract Trip FindById(int id);
        public abstract void Remove(Trip t);

        public void Import(Trip t)
        {
            t.AssertIsValid(ValidationTag.Required);
            t.Imported = DateTime.Now;
            InternalImport(t);
        }
        protected abstract void InternalImport(Trip t);

        public void Reimport(Trip t)
        {
            t.AssertIsValid(ValidationTag.Required);
            if (!t.IsImported)
            {
                throw new InvalidEntityOperationException(t, "Unable to reimport trip because it has not yet been imported.");
            }
            InternalReimport(t);
        }
        protected abstract void InternalReimport(Trip t);

        public abstract IList<Trip> ListCreatedByUser(int userId);
        public abstract Trip FindLastCreatedByUser(int userId);
        public abstract IList<Trip> ListAll();
    }
}
