using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;
using TMD.Model.Users;

namespace TMD.Application
{
    public abstract class ApplicationUserSessionProvider : ApplicationSessionProvider, IUserSession
    {
        private const string StartTimeKey = "startTime";
        private const string UserKey = "user";

        #region IUserSession Members

        public DateTime StartTime
        {
            get { return GetOrCreate<DateTime>(StartTimeKey, DateTime.MaxValue); }
            private set { Set(StartTimeKey, value); }
        }

        public User User
        {
            get { return GetOrCreate<User>(UserKey, delegate() { return User.Anonymous(); } ); }
            private set { Set(UserKey, value); }
        }

        public void Start(User user)
        {
            this.User = user;
            this.StartTime = DateTime.Now;
        }

        public void End(User user)
        {
            this.User = User.Anonymous();
        }

        #endregion
    }
}
