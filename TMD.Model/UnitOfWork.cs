﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using StructureMap;
using System.Data;

namespace TMD.Model
{
    public interface IUnitOfWorkProvider : IDisposable
    {
        IUnitOfWork Begin();
        IUnitOfWork Begin(IsolationLevel isolationLevel);
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
    }
}
