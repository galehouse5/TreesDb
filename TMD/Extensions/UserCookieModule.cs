using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;

namespace TMD.Extensions
{
    public class UserCookieModule : IHttpModule
    {
        private const string CookieName = "User";
        
        private class Keys
        {
            public const string Email = "email";
            public const string Firstname = "firstname";
            public const string Lastname = "lastname";
        }

        public bool IsReusable
        {
            get { return true; }
        }

        private HttpApplication ApplicationContext { get; set; }

        public void Dispose()
        {
            this.ApplicationContext.PostRequestHandlerExecute -= ApplicationContext_PostRequestHandlerExecute;
        }

        public void Init(HttpApplication context)
        {
            this.ApplicationContext = context;
            this.ApplicationContext.PostRequestHandlerExecute += new EventHandler(ApplicationContext_PostRequestHandlerExecute);
        }

        void ApplicationContext_PostRequestHandlerExecute(object sender, EventArgs e)
        {
            if (HttpContext.Current.Session != null && UserSession.IsAuthenticated)
            {
                if (ApplicationContext.Request.HttpMethod.Equals("POST", StringComparison.InvariantCultureIgnoreCase)
                    && (
                        ApplicationContext.Request.RawUrl.Equals("/Account/EditMyself", StringComparison.InvariantCultureIgnoreCase)
                        || ApplicationContext.Request.RawUrl.Equals("/Account/Login", StringComparison.InvariantCultureIgnoreCase)
                    ))
                {
                    HttpCookie cookie = new HttpCookie(CookieName);
                    cookie.Path = "/Account/";
                    cookie.Expires = DateTime.Now.Add(WebApplicationRegistry.Settings.UserCookieLifetime);
                    cookie[Keys.Email] = UserSession.AuthenticatedUser.Email;
                    cookie[Keys.Firstname] = UserSession.AuthenticatedUser.Firstname;
                    cookie[Keys.Lastname] = UserSession.AuthenticatedUser.Lastname;
                    ApplicationContext.Response.AppendCookie(cookie);
                }
            }
        }
    }
}