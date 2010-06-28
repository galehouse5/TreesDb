using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;

namespace TMD.Infrastructure
{
    public class StaticUnitOfWorkContextProvider : UnitOfWorkContextProvider
    {
        public StaticUnitOfWorkContextProvider()
        {
            base.InitializeContext();
            AppDomain.CurrentDomain.ProcessExit += new EventHandler(CurrentDomain_ProcessExit);   
        }

        private static IUnitOfWorkProvider s_Provider;
        public override IUnitOfWorkProvider Context
        {
            get { return s_Provider; }
            protected set { s_Provider = value; }
        }

        private void CurrentDomain_ProcessExit(object sender, EventArgs e)
        {
            base.DisposeContext();
            AppDomain.CurrentDomain.ProcessExit -= CurrentDomain_ProcessExit;
        }
    }
}
