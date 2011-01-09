using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Extensions;
using TMD.Model.Validation;

namespace TMD.Model.Imports
{
    public abstract class ImportRepository
    {
        public void Save(Trip t)
        {
            t.AssertIsValidToPersist();
            t.LastSaved = DateTime.Now;
            InternalSave(t);
        }

        protected abstract void InternalSave(Trip t);
        
        public abstract Trip FindById(int id);

        public void Remove(Trip t)
        {
            if (t.IsMerged)
            {
                throw new InvalidEntityOperationException(t, "Unable to remove trip because it has already been imported.");
            }
            InternalRemove(t);
        }

        protected abstract void InternalRemove(Trip t);

        public void Merge(Trip t)
        {
            t.AssertIsValid(Tag.Screening, Tag.Finalization, Tag.Persistence);
            t.Merged = DateTime.Now;
            InternalImport(t);
        }

        protected abstract void InternalImport(Trip t);

        public abstract IList<Trip> ListCreatedByUser(int userId);
        public abstract Trip FindLastCreatedByUser(int userId);
    }
}
