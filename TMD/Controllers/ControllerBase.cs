using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using System.Web.Routing;
using TMD.Model.Users;
using TMD.Controllers;

namespace TMD
{
    public class DefaultReturnUrlAttribute : ActionFilterAttribute
    {
        public override void  OnResultExecuted(ResultExecutedContext filterContext)
        {
            base.OnResultExecuted(filterContext);
            ((ControllerBase)filterContext.Controller).Session.DefaultReturnUrl = ((ControllerBase)filterContext.Controller).Request.RawUrl;
        }
    }

    public abstract class ControllerBase : Controller
    {
        protected override void HandleUnknownAction(string actionName)
        {
            ActionResult ar = new NotFoundResult();
            ar.ExecuteResult(ControllerContext);
        }

        protected override void ExecuteCore()
        {
            if (WebApplicationRegistry.Settings.HandleControllerExceptions)
            {
                try
                {
                    base.ExecuteCore();
                }
                catch (Exception)
                {
                    ActionResult ar = new ServerErrorResult();
                    ar.ExecuteResult(ControllerContext);
                }
            }
            else
            {
                base.ExecuteCore();
            }
        }

        public bool IsAuthenticated
        {
            get { return base.User.Identity.IsAuthenticated; }
        }

        public new User User
        {
            get { return (WebUser)base.User; }
        }

        private Session m_Session;
        public new Session Session
        {
            get 
            { 
                if (m_Session == null)
                {
                    m_Session = new Session(base.Session);
                }
                return m_Session; 
            }
        }

        private TempData m_TempData;
        public new TempData TempData
        {
            get 
            {
                if (m_TempData == null)
                {
                    m_TempData = new TempData(base.TempData);
                }
                return m_TempData; 
            }
        }

        private ViewData m_ViewData;
        public new ViewData ViewData
        {
            get
            {
                if (m_ViewData == null)
                {
                    m_ViewData = new ViewData(base.ViewData);
                }
                return m_ViewData;
            }
        }

        protected override ViewResult View(IView view, object model)
        {
            return base.View(view, model);
        }

        protected override ViewResult View(string viewName, string masterName, object model)
        {
            return base.View(viewName, masterName, model);
        }
    }
}
