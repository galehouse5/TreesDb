using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using StructureMap;

namespace TMD.Model
{
    public interface IUnitOfWorkProvider : IDisposable
    {
        void Initialize();
        IDisposable Begin();
        void Persist();
        void Rollback();
    }

    public static class UnitOfWork
    {
        private static IUnitOfWorkProvider Provider
        {
            get { return ObjectFactory.GetInstance<IUnitOfWorkProvider>(); }
        }

        public static void Initialize()
        {
            Provider.Initialize();
        }

        public static IDisposable Begin()
        {
            return Provider.Begin();
        }

        public static IDisposable BeginAndPersist()
        {
            return new PersistUnitOfWorkDecorator
            {
                Next = Provider.Begin(),
                Provider = Provider
            };
        }

        public static void Persist()
        {
            Provider.Persist();
        }

        public static void Rollback()
        {
            Provider.Rollback();
        }

        public static void Dispose()
        {
            Provider.Dispose();
        }
    }

    internal class PersistUnitOfWorkDecorator : IDisposable
    {
        public IDisposable Next { get; set; }
        public IUnitOfWorkProvider Provider { get; set; }

        public void Dispose()
        {
            Provider.Persist();
            Next.Dispose();
        }
    }
}
