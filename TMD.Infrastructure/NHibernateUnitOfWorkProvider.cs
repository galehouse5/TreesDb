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
            Session.FlushMode = FlushMode.Commit;
        }

        public IDisposable Begin()
        {
            Transaction = Session.BeginTransaction();
            return Transaction;
        }

        public void Persist()
        {
            try
            {
                Transaction.Commit();
            }
            catch
            {
                Transaction.Rollback();
                throw;
            }
            finally
            {
                Transaction.Dispose();
            }
        }

        public void Rollback()
        {
            try
            {
                Transaction.Rollback();
            }
            finally
            {
                Transaction.Dispose();
            }
        }

        public void Dispose()
        {
            if (Session.IsOpen)
            {
                Session.Close();
            }
            Session.Dispose();
        }
    }
}
