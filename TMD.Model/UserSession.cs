using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;
using StructureMap;

namespace TMD.Model
{
    public interface IUserSessionProvider
    {
        bool IsAnonymous { get; }
        User User { get; }
    }

    public static class UserSession
    {
        private static IUserSessionProvider Provider
        {
            get { return ObjectFactory.GetInstance<IUserSessionProvider>(); }
        }

        public static bool IsAnonymous
        {
            get { return Provider.IsAnonymous; }
        }

        public static User User
        {
            get { return Provider.User; }
        }
    }
}
