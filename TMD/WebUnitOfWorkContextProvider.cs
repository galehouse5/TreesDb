using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;

namespace TMD
{
    public class WebUnitOfWorkContextProvider : UnitOfWorkContextProvider, IHttpModule
    {
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

        private const string HttpContextItemsKey = "unitOfWorkProvider";
        public override IUnitOfWorkProvider Context
        {
            get { return (IUnitOfWorkProvider)HttpContext.Current.Items[HttpContextItemsKey]; }
            protected set { HttpContext.Current.Items[HttpContextItemsKey] = value; }
        }
    }
}