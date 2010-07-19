using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;
using TMD.Model.Users;

namespace TMD
{
    public class WebUserSessionProvider : UserSessionProvider
    {
        private class Keys
        {
            public const string ActiveUser = "activeUser";
        }

        public override Model.Users.User ActiveUser
        {
            get 
            {
                if (HttpContext.Current.Session != null)
                {
                    return (User)HttpContext.Current.Session[Keys.ActiveUser]; 
                }
                return null;
            }
            set 
            {
                if (HttpContext.Current.Session != null)
                {
                    HttpContext.Current.Session[Keys.ActiveUser] = value;
                }
            }
        }
    }
}