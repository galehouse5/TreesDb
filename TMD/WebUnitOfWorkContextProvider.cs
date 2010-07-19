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
            this.ApplicationContext.BeginRequest -= Context_BeginRequest;
            this.ApplicationContext.EndRequest -= Context_EndRequest;
        }

        public void Init(HttpApplication context)
        {
            this.ApplicationContext = context;
            this.ApplicationContext.BeginRequest += new EventHandler(Context_BeginRequest);
            this.ApplicationContext.EndRequest += new EventHandler(Context_EndRequest);
        }

        void Context_BeginRequest(object sender, EventArgs e)
        {
            base.InitializeContext();
        }

        void Context_EndRequest(object sender, EventArgs e)
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