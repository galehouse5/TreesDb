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
        bool IsActive { get; }
        void Flush();
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

        public static void Flush()
        {
            Provider.Flush();
        }
    }

    internal class PersistUnitOfWorkDecorator : IDisposable
    {
        public IDisposable Next { get; set; }
        public IUnitOfWorkProvider Provider { get; set; }

        public void Dispose()
        {
            if (Provider.IsActive)
            {
                Provider.Persist();
            }
            Next.Dispose();
        }
    }
}
