using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Security;
using TMD.Model;
using System.Security.Principal;
using TMD.Model.Users;
using TMD.Application;

namespace TMD.Extensions
{
    public class UserAuthenticationModule : IHttpModule
    {
        private class Cookies
        {
            public const string Token = "A";
        }

        private class SessionKeys
        {
            public const string Token = "userAuthenticationToken";
            public const string ExpiringTokens = "userAuthenticationExpiringTokens";
        }

        private HttpApplication m_Context;

        private string cookieToken
        {
            get
            {
                HttpCookie hc = m_Context.Request.Cookies[Cookies.Token];
                if (hc == null)
                {
                    return string.Empty;
                }
                return hc.Value;
            }
        }

        private string sessionToken
        {
            get
            {
                if (m_Context.Session[SessionKeys.Token] == null)
                {
                    m_Context.Session[SessionKeys.Token] = string.Empty;
                }
                return (string)m_Context.Session[SessionKeys.Token];
            }
        }

        private List<Tuple<string, DateTime>> expiringTokens
        {
            get
            {
                if (m_Context.Session[SessionKeys.ExpiringTokens] == null)
                {
                    m_Context.Session[SessionKeys.ExpiringTokens] = new List<Tuple<string, DateTime>>();
                }
                return (List<Tuple<string, DateTime>>)m_Context.Session[SessionKeys.ExpiringTokens];
            }
        }

        private void revokeAllUserAuthenticationTokens()
        {
            expiringTokens.Clear();
            HttpCookie hc = new HttpCookie(Cookies.Token, string.Empty);
            hc.HttpOnly = true;
            hc.Expires = DateTime.Parse("Thu, 01-Jan-1970 00:00:01 GMT");
            m_Context.Response.Cookies.Add(hc);
            m_Context.Session[SessionKeys.Token] = string.Empty;
        }

        private void issueNewUserAuthenticationToken()
        {
            expiringTokens.Clear();
            SecureToken st = SecureToken.Create();
            m_Context.Session[SessionKeys.Token] = st.UrlEncodedValue;
            HttpCookie hc = new HttpCookie(Cookies.Token, st.UrlEncodedValue);
            hc.HttpOnly = true;
            m_Context.Response.Cookies.Add(hc);
        }

        private void expireAndReissueCurrentUserAuthenticationToken()
        {
            expiringTokens.Insert(0, new Tuple<string, DateTime>(sessionToken, DateTime.Now));
            if (expiringTokens.Count > WebApplicationRegistry.Settings.ExpiringTokensToRemember)
            {
                expiringTokens.RemoveAt(expiringTokens.Count - 1);
            }
            SecureToken st = SecureToken.Create();
            m_Context.Session[SessionKeys.Token] = st.UrlEncodedValue;
            HttpCookie hc = new HttpCookie(Cookies.Token, st.UrlEncodedValue);
            hc.HttpOnly = true;
            m_Context.Response.Cookies.Add(hc);
        }

        private bool isCurrentUserAuthenticationTokenValid
        {
            get
            {
                if (cookieToken.Equals(sessionToken))
                {
                    return true;
                }
                DateTime expirationThreshold = DateTime.Now.Subtract(WebApplicationRegistry.Settings.ExpiringTokenLifetime);
                foreach (Tuple<string, DateTime> expiringToken in expiringTokens)
                {
                    if (cookieToken.Equals(expiringToken.Item1) && expiringToken.Item2 >= expirationThreshold)
                    {
                        return true;
                    }
                }
                return false;
            }
        }

        public void Init(HttpApplication context)
        {
            m_Context = context;
            context.PostRequestHandlerExecute += new EventHandler(context_PostRequestHandlerExecute);
            context.AcquireRequestState += new EventHandler(context_AcquireRequestState);
        }

        public void Dispose()
        {
            m_Context.PostRequestHandlerExecute -= context_PostRequestHandlerExecute;
            m_Context.AcquireRequestState -= context_AcquireRequestState;
        }

        void context_AcquireRequestState(object sender, EventArgs e)
        {
            if (HttpContext.Current.Session != null)
            {
                if (m_Context.Request.HttpMethod.Equals("POST", StringComparison.InvariantCultureIgnoreCase)
                    && m_Context.Request.Url.AbsolutePath.Equals("/Account/Login", StringComparison.InvariantCultureIgnoreCase))
                {
                    m_Context.Session.Clear();
                }
                else if (UserSession.CurrentUser != null)
                {
                    if (!isCurrentUserAuthenticationTokenValid)
                    {
                        m_Context.Session.Clear();
                        revokeAllUserAuthenticationTokens();
                    }
                }
                else if (!string.IsNullOrEmpty(cookieToken))
                {
                    revokeAllUserAuthenticationTokens();
                }
            }
        }

        void context_PostRequestHandlerExecute(object sender, EventArgs e)
        {
            if (m_Context.Request.HttpMethod.Equals("POST", StringComparison.InvariantCultureIgnoreCase)
                && m_Context.Request.Url.AbsolutePath.Equals("/Account/Login", StringComparison.InvariantCultureIgnoreCase))
            {
                if (UserSession.CurrentUser != null)
                {
                    issueNewUserAuthenticationToken();
                }
            }
            else if (m_Context.Request.HttpMethod.Equals("POST", StringComparison.InvariantCultureIgnoreCase)
                && m_Context.Request.Url.AbsolutePath.Equals("/Account/Logout", StringComparison.InvariantCultureIgnoreCase))
            {
                string clearedSessionStatusMessage = ApplicationSession.StatusMessage;
                m_Context.Session.Clear();
                ApplicationSession.StatusMessage = clearedSessionStatusMessage;
                revokeAllUserAuthenticationTokens();
            }
            else if (HttpContext.Current.Session != null
                && UserSession.CurrentUser != null
                && isCurrentUserAuthenticationTokenValid)
            {
                expireAndReissueCurrentUserAuthenticationToken();
            }
        }
    }
}