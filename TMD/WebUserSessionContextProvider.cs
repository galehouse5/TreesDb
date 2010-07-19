using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;

namespace TMD
{
    public class WebUserSessionContextProvider : UserSessionContextProvider, IHttpModule
    {
        private class Keys
        {
            public const string Context = "userSessionContextProvider";
        }

        private HttpApplication ApplicationContext { get; set; }

        public void Dispose()
        {
            this.ApplicationContext.AcquireRequestState -= Context_AcquireRequestState;
            this.ApplicationContext.PostRequestHandlerExecute -= Context_PostRequestHandlerExecute;
        }

        public void Init(HttpApplication context)
        {
            this.ApplicationContext = context;
            this.ApplicationContext.AcquireRequestState += new EventHandler(Context_AcquireRequestState);
            this.ApplicationContext.PostRequestHandlerExecute += new EventHandler(Context_PostRequestHandlerExecute);
        }

        void Context_AcquireRequestState(object sender, EventArgs e)
        {
            base.InitializeContext();
        }

        void Context_PostRequestHandlerExecute(object sender, EventArgs e)
        {
            base.DisposeContext();
        }

        public override UserSessionProvider Context
        {
            get { return (UserSessionProvider)HttpContext.Current.Items[Keys.Context]; }
            protected set { HttpContext.Current.Items[Keys.Context] = value; }
        }
    }
}