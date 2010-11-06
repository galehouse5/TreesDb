using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;
using TMD.Model.Users;
using System.Threading;

namespace TMD.Infrastructure
{
    public class StaticUserSessionProvider : UserSessionProvider
    {
        public override User User
        {
            get { return Thread.CurrentPrincipal as User; }
        }
    }
}
