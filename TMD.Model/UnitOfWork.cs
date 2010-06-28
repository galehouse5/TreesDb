using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public interface IUnitOfWorkProvider : IDisposable
    {
        void Initialize();
        IDisposable BeginBusinessTransaction();
        void Persist();
        void Rollback();
    }

    public abstract class UnitOfWorkContextProvider
    {
        /// <summary>
        /// This method must be called before the context can be consumed.
        /// </summary>
        protected void InitializeContext()
        {
            if (Context == null)
            {
                Type t = Type.GetType(ModelRegistry.ModelSettings.UnitOfWorkProvider);
                Context = (IUnitOfWorkProvider)Activator.CreateInstance(t);
            }
            Context.Initialize();
        }

        public abstract IUnitOfWorkProvider Context { get; protected set; }

        /// <summary>
        /// This method must be called after the context has gone out of scope.
        /// </summary>
        protected void DisposeContext()
        {
            if (Context != null)
            {
                Context.Dispose();
            }
        }
    }

    public static class UnitOfWork
    {
        private static UnitOfWorkContextProvider s_ContextProvider;
        private static UnitOfWorkContextProvider ContextProvider
        {
            get
            {
                if (s_ContextProvider == null)
                {
                    Type t = Type.GetType(ModelRegistry.ModelSettings.UnitOfWorkContextProvider);
                    s_ContextProvider = (UnitOfWorkContextProvider)Activator.CreateInstance(t);
                }
                return s_ContextProvider;
            }
        }

        public static IUnitOfWorkProvider Context
        {
            get { return ContextProvider.Context; }
        }

        public static IDisposable BeginBusinessTransaction()
        {
            return Context.BeginBusinessTransaction();
        }

        public static void Persist()
        {
            Context.Persist();
        }

        public static void Rollback()
        {
            Context.Rollback();
        }
    }
}
