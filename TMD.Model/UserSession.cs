using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;

namespace TMD.Model
{
    public abstract class UserSessionProvider
    {
        public abstract User User { get; }

        public virtual void InitializeSession()
        {
            if (User != null)
            {
                User.ReportActivity();
            }
        }

        public virtual void DisposeSession()
        {
            if (User != null)
            {
                using (UnitOfWork.BeginBusinessTransaction())
                {
                    UserService.Save(User);
                    UnitOfWork.Persist();
                }
            }
        }
    }

    public static class UserSession
    {
        private static UserSessionProvider s_ContextProvider;
        private static UserSessionProvider ContextProvider
        {
            get
            {
                if (s_ContextProvider == null)
                {
                    Type t = Type.GetType(ModelRegistry.Settings.UserSessionProvider);
                    s_ContextProvider = (UserSessionProvider)Activator.CreateInstance(t);
                }
                return s_ContextProvider;
            }
        }

        public static User User
        {
            get { return ContextProvider.User; }
        }

        public static bool IsAnonymous
        {
            get { return User == null; }
        }
    }
}
