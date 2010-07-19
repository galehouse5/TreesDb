using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Users;
using TMD.Model;

namespace TMD.Extensions
{
    public class UserAuthorizationFilterAttribute : FilterAttribute, IAuthorizationFilter
    {
        private class Keys
        {
            public const string IsUserAuthenticated = "isUserAuthenticated";
        }

        public void OnAuthorization(AuthorizationContext filterContext)
        {
            if (!UserSession.IsAuthenticated)
            {
                HttpContext.Current.Items[Keys.IsUserAuthenticated] = false;
                filterContext.Result = new HttpUnauthorizedResult();
            }
            else if ((UserSession.AuthenticatedUser.Roles & Roles) != Roles)
            {
                HttpContext.Current.Items[Keys.IsUserAuthenticated] = true;
                filterContext.Result = new HttpUnauthorizedResult();
            }
        }

        public UserRoles Roles { get; set; }
    }

    public class UserAuthorizationModule : IHttpModule
    {
        private class Keys
        {
            public const string IsUserAuthenticated = "isUserAuthenticated";
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

        private static
        void ApplicationContext_PostRequestHandlerExecute(object sender, EventArgs e)
        {
            if (HttpContext.Current.Response.StatusCode == 401)
            {
                if ((bool)HttpContext.Current.Items[Keys.IsUserAuthenticated])
                {
                    HttpContext.Current.RewritePath("/Account/Unauthorized", false);
                    IHttpHandler handler = new MvcHttpHandler();
                    handler.ProcessRequest(HttpContext.Current);
                }
                else
                {
                    HttpContext.Current.Response.Redirect(
                        "/Account/Login?ReturnUrl=" + HttpContext.Current.Request.RawUrl,
                        false);
                }
            }
        }
    }
}