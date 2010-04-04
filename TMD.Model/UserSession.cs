using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;

namespace TMD.Model
{
    public interface IUserSession
    {
        DateTime StartTime { get; }
        User User { get; }

        void Start(User user);
        void End(User user);
    }

    public static class UserSession
    {
        public static DateTime StartTime
        {
            get { return ModelRegistry.UserSession.StartTime; }
        }

        public static User User 
        {
            get { return ModelRegistry.UserSession.User; }
        }

        public static void Start(User user)
        {
            ModelRegistry.UserSession.Start(user);
        }

        public static void End(User user)
        {
            ModelRegistry.UserSession.End(user);
        }
    }
}
