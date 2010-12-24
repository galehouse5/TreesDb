using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;
using NHibernate;

namespace TMD.Infrastructure
{
    public class NHibernateUnitOfWorkProvider : IUnitOfWorkProvider
    {
        public ISession Session { get; private set; }
        public ITransaction Transaction { get; private set; }

        public void Initialize()
        {
            Session = Registry.SessionFactory.OpenSession();
        }

        public IDisposable Begin()
        {
            Transaction = Session.BeginTransaction();
            return Transaction;
        }

        public void Persist()
        {
            Transaction.Commit();
        }

        public void Rollback()
        {
            Transaction.Rollback();
        }

        public void Dispose()
        {
            if (Transaction != null) { Transaction.Dispose(); }
            if (Session != null) { Session.Dispose(); }
        }

        public bool IsActive
        {
            get
            {
                if (Transaction != null)
                {
                    return Transaction.IsActive;
                }
                return false;
            }
        }

        public void Flush()
        {
            Session.Flush();
        }
    }
}
