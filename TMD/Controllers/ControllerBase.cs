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

    public abstract class ControllerBase : Controller
    {
        // TODO: Inject as a constructor dependency and move it out of the base class, since many controllers don't even use it.
        protected IUnitOfWork Uow { get; private set; }

        public virtual IsolationLevel UowIsolationLevel => IsolationLevel.Unspecified;

        protected override void HandleUnknownAction(string actionName)
        {
            ActionResult ar = new NotFoundResult();
            ar.ExecuteResult(ControllerContext);
        }

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            Uow = UowIsolationLevel == IsolationLevel.Unspecified ?
                UnitOfWork.Begin() : UnitOfWork.Begin(UowIsolationLevel);

            if (filterContext.IsChildAction) return;

            if (WebApplicationRegistry.Settings.EnableMaintenance
                && !MaintenanceResult.IsExecuting(ControllerContext))
            {
                filterContext.Result = new MaintenanceResult();
                return;
            }
        }

        protected override void OnResultExecuted(ResultExecutedContext filterContext)
        {
            Uow.Dispose();
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
