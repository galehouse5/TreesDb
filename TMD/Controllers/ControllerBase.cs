using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using System.Web.Routing;
using TMD.Model.Users;
using TMD.Controllers;
using System.IO;
using System.Data;
using TMD.Model;
using TMD.Model.Logging;

namespace TMD
{
    public class DefaultReturnUrlAttribute : ActionFilterAttribute
    {
        public override void OnResultExecuted(ResultExecutedContext filterContext)
        {
            base.OnResultExecuted(filterContext);
            ((ControllerBase)filterContext.Controller).Session.DefaultReturnUrl = ((ControllerBase)filterContext.Controller).Request.RawUrl;
        }
    }

    public class UnitOfWorkAttribute : ActionFilterAttribute
    {
        private IUnitOfWork m_UnitOfWork;

        public UnitOfWorkAttribute()
        {
            IsolationLevel = IsolationLevel.Unspecified;
        }

        public IsolationLevel IsolationLevel { get; set; }

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            m_UnitOfWork = IsolationLevel == IsolationLevel.Unspecified ?
                UnitOfWork.Begin() : UnitOfWork.Begin(IsolationLevel);
            filterContext.ActionParameters["uow"] = m_UnitOfWork;
            base.OnActionExecuting(filterContext);
        }

        public override void OnResultExecuting(ResultExecutingContext filterContext)
        {
            base.OnResultExecuting(filterContext);
            m_UnitOfWork.Dispose();
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
                catch (Exception ex)
                {
                    this.Error("Unhandled exception executing controller action.", ex);
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

        protected string RenderPartialViewToString()
        {
            return RenderPartialViewToString(ControllerContext.RouteData.GetRequiredString("action"), null);
        }

        protected string RenderPartialViewToString(string viewName)
        {
            return RenderPartialViewToString(viewName, null);
        }

        protected string RenderPartialViewToString(object model)
        {
            return RenderPartialViewToString(ControllerContext.RouteData.GetRequiredString("action"), model);
        }

        protected string RenderPartialViewToString(string viewName, object model)
        {
            ViewData.Model = model;
            using (StringWriter sw = new StringWriter())
            {
                ViewEngineResult viewResult = ViewEngines.Engines.FindPartialView(ControllerContext, viewName);
                ViewContext viewContext = new ViewContext(ControllerContext, viewResult.View, ViewData, TempData, sw);
                viewResult.View.Render(viewContext, sw);
                return sw.GetStringBuilder().ToString();
            }
        }
    }
}
