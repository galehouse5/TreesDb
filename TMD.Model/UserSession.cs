//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using TMD.Model.Users;

//namespace TMD.Model
//{
//    public interface IUserSessionProvider
//    {
//        DateTime StartTime { get; }
//        User User { get; }

//        void Start(User user);
//        void End(User user);
//    }

//    public static class UserSession
//    {
//        private static IUserSessionProvider s_Provider;
//        public static IUserSessionProvider Provider
//        {
//            get
//            {
//                if (s_Provider == null)
//                {
//                    Type t = Type.GetType(ModelRegistry.ModelSettings.UserSessionProvider);
//                    s_Provider = (IUserSessionProvider)Activator.CreateInstance(t);
//                }
//                return s_Provider;
//            }
//        }

//        public static DateTime StartTime
//        {
//            get { return Provider.StartTime; }
//        }

//        public static User User 
//        {
//            get { return Provider.User; }
//        }

//        public static void Start(User user)
//        {
//            Provider.Start(user);
//        }

//        public static void End(User user)
//        {
//            Provider.End(user);
//        }
//    }
//}
