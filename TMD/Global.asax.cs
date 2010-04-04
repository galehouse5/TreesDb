using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using System.Web.SessionState;
using TMD.Application;
using System.Web.Configuration;
using System.Text.RegularExpressions;

namespace TMD
{
    public class Global : System.Web.HttpApplication
    {
        private static string m_LoginPath;

        protected void Application_Start(object sender, EventArgs e)
        {
            // Code that runs on application startup
            AuthenticationSection authenticationConfiguration =
                (AuthenticationSection)WebConfigurationManager.GetSection("system.web/authentication");
            m_LoginPath = Server.MapPath(authenticationConfiguration.Forms.LoginUrl);

            ApplicationSession.DefaultGoToOnWizardCancelCreator = delegate() { return "~/Main.aspx"; };
            ApplicationSession.DefaultGoToOnWizardCompleteCreator = delegate() { return "~/Main.aspx"; };
        }

        protected void Session_Start(object sender, EventArgs e)
        {

        }

        private static Regex s_BrowserCompatibilityCheckBlacklistRegex = new Regex("^.+\\.aspx$", RegexOptions.Compiled);
        private static Regex s_BrowserCompatibilityCheckWhitelistRegex = new Regex("^(^/home\\.aspx)|(/incompatiblebrowser\\.aspx)$", RegexOptions.Compiled);
        protected void Application_BeginRequest(object sender, EventArgs e)
        {
            if (s_BrowserCompatibilityCheckBlacklistRegex.IsMatch(Request.Path.ToLower())
                && !s_BrowserCompatibilityCheckWhitelistRegex.IsMatch(Request.Path.ToLower()))
            {
                switch (Request.Browser.Browser.ToLower())
                {
                    case "firefox":
                        if (Request.Browser.MajorVersion < 3)
                        {
                            Response.Redirect("~/IncompatibleBrowser.aspx");
                        }
                        break;
                    case "ie":
                        if (Request.Browser.MajorVersion < 8)
                        {
                            Response.Redirect("~/IncompatibleBrowser.aspx");
                        }
                        break;
                    default:
                        Response.Redirect("~/IncompatibleBrowser.aspx");
                        break;
                }
            }
        }

        void Application_AuthorizeRequest(Object sender, EventArgs e)
        {
            // if the request is being redirected to the login page 
            // with a ReturnUrl querystring parameter
            // and the user has been authenticated
            // the user must have requested a page he lacks access to
            if (Request.PhysicalPath.Equals(m_LoginPath)
                && Request.QueryString["ReturnUrl"] != null
                && Request.IsAuthenticated)
            {
                Response.Redirect("~/Account/Unauthorized.aspx?ReturnUrl=" + Request.QueryString["ReturnUrl"]);
            }
        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e)
        {

        }

        protected void Application_Error(object sender, EventArgs e)
        {

        }

        protected void Session_End(object sender, EventArgs e)
        {

        }

        protected void Application_End(object sender, EventArgs e)
        {

        }
    }
}