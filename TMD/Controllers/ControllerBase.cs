using System.Data;
using System.IO;
using System.Web.Mvc;
using TMD.Controllers;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Users;

namespace TMD
{
    public class DefaultReturnUrlAttribute : ActionFilterAttribute
    {
        public override void OnResultExecuted(ResultExecutedContext filterContext)
        {
            base.OnResultExecuted(filterContext);

            if (filterContext.HttpContext.Request.IsAjaxRequest())
                return;

            ((ControllerBase)filterContext.Controller).Session.SetDefaultReturnUrl(((ControllerBase)filterContext.Controller).Request.RawUrl);
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

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (WebApplicationRegistry.Settings.EnableMaintenance)
            {
                MaintenanceResult result = new MaintenanceResult();
                if (!result.IsExecuting(ControllerContext))
                {
                    filterContext.Result = new MaintenanceResult();
                }
                base.OnActionExecuting(filterContext);
                return;
            }
            if (base.User.Identity.IsAuthenticated)
            {
                User.ReportActivity();
                Repositories.Users.Save(User);
            }
            base.OnActionExecuting(filterContext);
        }

        public bool IsAuthenticated
        {
            get { return base.User.Identity.IsAuthenticated; }
        }

        public new User User
        {
            get { return (WebUser)base.User; }
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
