using NHibernate;
using TMD.Model;

namespace TMD.Infrastructure
{
    public class NHibernateUnitOfWork : IUnitOfWork
    {
        protected internal ITransaction Transaction { get; set; }

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
            Transaction.Dispose();
        }
    }

    public class NHibernateUnitOfWorkProvider : IUnitOfWorkProvider
    {
        private ISession m_Session;
        protected internal ISession Session
        {
            get
            {
                if (m_Session == null)
                {
                    m_Session = Registry.SessionFactory.OpenSession();
                }
                return m_Session;
            }
        }

        public IUnitOfWork Begin()
        {
            return new NHibernateUnitOfWork
            {
                Transaction = Session.BeginTransaction()
            };
        }

        public IUnitOfWork Begin(System.Data.IsolationLevel isolationLevel)
        {
            return new NHibernateUnitOfWork
            {
                Transaction = Session.BeginTransaction(isolationLevel)
            };
        }

        public void Refresh(object instance)
        {
            Session.Refresh(instance);
        }

        public void Flush()
        {
            Session.Flush();
        }

        public void Dispose()
        {
            if (m_Session != null)
            {
                m_Session.Dispose();
            }
            m_Session = null;
        }

        public void Evict(object instance)
        {
            Session.Evict(instance);
        }
    }
}
