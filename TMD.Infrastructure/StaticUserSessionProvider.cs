using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;
using TMD.Model.Users;

namespace TMD.Infrastructure
{
    public class StaticUserSessionProvider : UserSessionProvider
    {
        private static User s_ActiveUser;
        public override Model.Users.User ActiveUser
        {
            get { return s_ActiveUser; }
            set { s_ActiveUser = value; }
        }
    }
}
