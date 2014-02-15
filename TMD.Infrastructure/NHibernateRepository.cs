using NHibernate;
using NHibernate.Linq;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using TMD.Model;

namespace TMD.Infrastructure
{
    public abstract class NHibernateRepository<T> : IRepository<T>
        where T : class
    {
        public NHibernateRepository(IQueryable<T> entities, ISession session)
        {
            this.Session = session;
            this.Entities = entities;
        }

        protected IQueryable<T> Entities { get; private set; }
        protected ISession Session { get; private set; }

        public void Save(T entity)
        {
            Session.Save(entity);
        }

        public void Delete(T entity)
        {
            Session.Delete(entity);
        }

        #region IQueryable<T> implementation

        IEnumerator<T> IEnumerable<T>.GetEnumerator()
        {
            return Entities.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return Entities.GetEnumerator();
        }

        Type IQueryable.ElementType
        {
            get { return Entities.ElementType; }
        }

        Expression IQueryable.Expression
        {
            get { return Entities.Expression; }
        }

        IQueryProvider IQueryable.Provider
        {
            get { return Entities.Provider; }
        }

        #endregion
    }

    public class NHibernateFetchableRepository<T> : NHibernateRepository<T>, IFetchableRepository<T>
        where T : class
    {
        public NHibernateFetchableRepository(ISession session)
            : base(session.Query<T>(), session)
        { }

        public IFetchedRepository<T, U> Fetch<U>(Expression<Func<T, U>> entitySelector)
        {
            return new NHibernateFetchedRepository<T, U>(Entities.Fetch(entitySelector), Session);
        }

        public IFetchedRepository<T, U> FetchMany<U>(Expression<Func<T, IEnumerable<U>>> entitySelector)
        {
            return new NHibernateFetchedRepository<T, U>(Entities.FetchMany(entitySelector), Session);
        }
    }

    public class NHibernateFetchedRepository<T, U> : NHibernateRepository<T>, IFetchedRepository<T, U>
        where T : class
    {
        public NHibernateFetchedRepository(INhFetchRequest<T, U> fetchedEntities, ISession session)
            : base(fetchedEntities, session)
        { }

        public IFetchedRepository<T, V> ThenFetch<V>(Expression<Func<U, V>> entitySelector)
        {
            return new NHibernateFetchedRepository<T, V>(((INhFetchRequest<T, U>)Entities).ThenFetch(entitySelector), Session);
        }

        public IFetchedRepository<T, V> ThenFetchMany<V>(Expression<Func<U, IEnumerable<V>>> entitySelector)
        {
            return new NHibernateFetchedRepository<T, V>(((INhFetchRequest<T, U>)Entities).ThenFetchMany(entitySelector), Session);
        }
    }
}
