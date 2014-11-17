using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace TMD.Model
{
    public interface IRepository<T> : IQueryable<T>
        where T : class
    {
        T Get(int id);
        void Save(T entity);
        void Delete(T entity);
    }

    public interface IFetchableRepository<T> : IRepository<T>
        where T : class
    {
        IFetchedRepository<T, U> Fetch<U>(Expression<Func<T, U>> entitySelector);
        IFetchedRepository<T, U> FetchMany<U>(Expression<Func<T, IEnumerable<U>>> entitySelector);
    }

    public interface IFetchedRepository<T, U> : IRepository<T>
        where T : class
    {
        IFetchedRepository<T, V> ThenFetch<V>(Expression<Func<U, V>> entitySelector);
        IFetchedRepository<T, V> ThenFetchMany<V>(Expression<Func<U, IEnumerable<V>>> entitySelector);
    }
}
