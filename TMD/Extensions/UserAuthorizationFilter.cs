using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Users;
using TMD.Model;

namespace TMD.Extensions
{
    public class UserAuthorizationException : Exception
    {
        protected UserAuthorizationException()
            : base()
        { }

        public bool NeedsToAuthenticate { get; private set; }

        public static UserAuthorizationException Create(bool needsToAuthenticate)
        {
            return new UserAuthorizationException()
            {
                NeedsToAuthenticate = UserSession.IsAnonymous
            };
        }
    }

    public class UserAuthorizationFilterAttribute : FilterAttribute, IAuthorizationFilter
    {
        private class Keys
        {
            public const string IsUserAuthorized = "isUserAuthorized";
        }

        public void OnAuthorization(AuthorizationContext filterContext)
        {
            if (UserSession.IsAnonymous)
            {
                throw UserAuthorizationException.Create(true);
            }
            if ((UserSession.CurrentUser.Roles & Roles) != Roles)
            {
                throw UserAuthorizationException.Create(false);
            }
        }

        public UserRoles Roles { get; set; }
    }
}