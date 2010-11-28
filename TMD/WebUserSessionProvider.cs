using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;
using TMD.Model.Users;
using System.Web.Security;
using System.Security.Principal;
using TMD.Model.Extensions;
using System.Diagnostics;

namespace TMD
{
    public class WebUserSessionProvider : IUserSessionProvider, IHttpModule
    {
        private HttpApplication ApplicationContext { get; set; }

        public void Dispose()
        {
            ApplicationContext.AcquireRequestState -= Context_AcquireRequestState;
        }

        public void Init(HttpApplication context)
        {
            ApplicationContext = context;
            ApplicationContext.AcquireRequestState += new EventHandler(Context_AcquireRequestState);
        }

        void Context_AcquireRequestState(object sender, EventArgs e)
        {
            if (ApplicationContext.Context.User == null)
            {
                ApplicationContext.Context.User = new WebUser(null);
            }
            if (ApplicationContext.Context.User.Identity.IsAuthenticated)
            {
                ApplicationContext.Context.User = new WebUser(Repositories.Users.FindByEmail(ApplicationContext.Context.User.Identity.Name));
            }
        }

        public bool IsAnonymous
        {
            get { return User == null; }
        }

        public User User
        {
            get { return HttpContext.Current.User is WebUser ? ((WebUser)HttpContext.Current.User).User : null; }
        }
    }

    [DebuggerDisplay("{Name}")]
    public class WebUser : IPrincipal, IIdentity
    {
        internal WebUser(User user)
        {
            this.User = user;
        }

        public User User { get; private set; }

        public IIdentity Identity
        {
            get { return this; }
        }

        public bool IsInRole(string role)
        {
            UserRole userRole = role.ParseEnum<UserRole>(UserRole.None);
            if (IsAuthenticated)
            {
                return User.IsInRole(userRole);
            }
            return userRole == UserRole.None;
        }

        public string AuthenticationType
        {
            get { return "Custom"; }
        }

        public bool IsAuthenticated
        {
            get { return User != null; }
        }

        public string Name
        {
            get 
            { 
                if (!IsAuthenticated)
                {
                    return "Anonymous";
                }
                return User.Email;
            }
        }
    }
}