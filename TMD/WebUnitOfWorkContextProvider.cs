using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;

namespace TMD
{
    public class WebUnitOfWorkContextProvider : UnitOfWorkContextProvider, IHttpModule
    {
        private HttpApplication m_ApplicationContext;

        public void Dispose()
        {
            this.m_ApplicationContext.AcquireRequestState -= Context_AcquireRequestState;
            this.m_ApplicationContext.ReleaseRequestState -= Context_PostRequestHandlerExecute;
        }

        public void Init(HttpApplication context)
        {
            this.m_ApplicationContext = context;
            this.m_ApplicationContext.AcquireRequestState += new EventHandler(Context_AcquireRequestState);
            this.m_ApplicationContext.ReleaseRequestState += new EventHandler(Context_PostRequestHandlerExecute);
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