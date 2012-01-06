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
        Units Units { get; }
    }

    public class NullUserSessionProvider : IUserSessionProvider
    {
        public bool IsAnonymous { get { return true; } }
        public User User { get { return null; } }
        public Units Units { get { return Units.Default; } }
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

        public static Units Units 
        {
            get { return Provider.Units; }
        }
    }
}
