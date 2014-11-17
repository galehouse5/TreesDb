using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;

namespace TMD.Model
{
    public abstract class RepositoryDecorator<T> : IRepository<T>
        where T : class
    {
        public RepositoryDecorator(IRepository<T> next)
        {
            this.Next = next;
        }

        protected IRepository<T> Next { get; private set; }

        public virtual T Get(int id)
        {
            return Next.Get(id);
        }

        public virtual void Save(T entity)
        {
            Next.Save(entity);
        }

        public virtual void Delete(T entity)
        {
            Next.Delete(entity);
        }

        IEnumerator<T> IEnumerable<T>.GetEnumerator()
        {
            return Next.GetEnumerator();
        }

        IEnumerator IEnumerable.GetEnumerator()
        {
            return Next.GetEnumerator();
        }

        Type IQueryable.ElementType
        {
            get { return Next.ElementType; }
        }

        Expression IQueryable.Expression
        {
            get { return Next.Expression; }
        }

        IQueryProvider IQueryable.Provider
        {
            get { return Next.Provider; }
        }
    }
}
