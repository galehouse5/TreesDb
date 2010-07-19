using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;

namespace TMD.Model
{
    public abstract class UserSessionProvider
    {
        public abstract User ActiveUser { get; set; }

        public void Initialize()
        {
            if (ActiveUser != null)
            {
                ActiveUser.ReportActivity();
            }
        }

        public void Dispose()
        {
            if (ActiveUser != null)
            {
                using (UnitOfWork.BeginBusinessTransaction())
                {
                    UserService.Save(ActiveUser);
                    UnitOfWork.Persist();
                }
            }
        }
    }
     
    public abstract class UserSessionContextProvider
    {
        /// <summary>
        /// This method must be called before the context can be consumed.
        /// </summary>
        protected void InitializeContext()
        {
            if (Context == null)
            {
                Type t = Type.GetType(ModelRegistry.Settings.UserSessionProvider);
                Context = (UserSessionProvider)Activator.CreateInstance(t);
            }
            Context.Initialize();
        }

        public abstract UserSessionProvider Context { get; protected set; }

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

    public static class UserSession
    {
        private static UserSessionContextProvider s_ContextProvider;
        private static UserSessionContextProvider ContextProvider
        {
            get
            {
                if (s_ContextProvider == null)
                {
                    Type t = Type.GetType(ModelRegistry.Settings.UserSessionContextProvider);
                    s_ContextProvider = (UserSessionContextProvider)Activator.CreateInstance(t);
                }
                return s_ContextProvider;
            }
        }

        public static User AuthenticatedUser
        {
            get { return ContextProvider.Context.ActiveUser; }
            internal set { ContextProvider.Context.ActiveUser = value; }
        }

        public static bool Authenticate(User user, string password)
        {
            if (user.AttemptLogin(password))
            {
                AuthenticatedUser = user;
                return true;
            }
            return false;
        }

        public static bool IsAuthenticated
        {
            get
            {
                return AuthenticatedUser != null;
            }
        }

        public static void Abandon()
        {
            AuthenticatedUser = null;
        }
    }
}
