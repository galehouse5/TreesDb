using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;
using TMD.Model.Users;
using System.Web.Security;

namespace TMD
{
    public class WebUserSessionProvider : UserSessionProvider, IHttpModule
    {
        public override User User
        {
            get { return HttpContext.Current.User as User; }
        }

        public override void InitializeSession()
        {
            if (HttpContext.Current.User != null && HttpContext.Current.User.Identity.IsAuthenticated)
            {
                HttpContext.Current.User = UserService.FindByEmail(HttpContext.Current.User.Identity.Name);
            }
            base.InitializeSession();
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
            InitializeSession();
        }

        void Context_PostRequestHandlerExecute(object sender, EventArgs e)
        {
            DisposeSession();
        }
    }
}