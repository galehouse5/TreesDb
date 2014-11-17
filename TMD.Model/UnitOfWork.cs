using StructureMap;
using System;
using System.Data;

namespace TMD.Model
{
    public interface IUnitOfWorkProvider : IDisposable
    {
        IUnitOfWork Begin();
        IUnitOfWork Begin(IsolationLevel isolationLevel);
        void Refresh(object instance);
        void Flush();
        void Evict(object instance);
    }

    public interface IUnitOfWork : IDisposable
    {
        void Persist();
        void Rollback();
    }

    public static class UnitOfWork
    {
        private static IUnitOfWorkProvider Provider
        {
            get { return ObjectFactory.GetInstance<IUnitOfWorkProvider>(); }
        }

        public static IUnitOfWork Begin()
        {
            return Provider.Begin();
        }

        public static IUnitOfWork Begin(IsolationLevel isolationLevel)
        {
            return Provider.Begin(isolationLevel);
        }

        public static void Dispose()
        {
            Provider.Dispose();
        }

        public static void Refresh(object instance)
        {
            Provider.Refresh(instance);
        }

        public static void Flush()
        {
            Provider.Flush();
        }

        public static void Evict(object instance)
        {
            Provider.Evict(instance);
        }
    }
}
