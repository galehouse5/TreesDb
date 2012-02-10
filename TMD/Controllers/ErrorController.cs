using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using System.Web.Routing;
using TMD.Extensions;

namespace TMD.Controllers
{
    public class MaintenanceResult : ActionResult
    {
        public bool IsExecuting(ControllerContext context)
        {
            return "Error".Equals(context.RouteData.Values["controller"])
                && "Maintenance".Equals(context.RouteData.Values["action"]);
        }

        public override void ExecuteResult(ControllerContext context)
        {
            RouteData rd = new RouteData();
            rd.Values.Add("controller", "Error");
            rd.Values.Add("action", "Maintenance");
            IController c = new ErrorController();
            c.Execute(new RequestContext(context.HttpContext, rd));
        }
    }

    public class NotFoundResult : ActionResult
    {
        public override void ExecuteResult(ControllerContext context)
        {
            RouteData rd = new RouteData();
            rd.Values.Add("controller", "Error");
            rd.Values.Add("action", "NotFound");
            IController c = new ErrorController();
            c.Execute(new RequestContext(context.HttpContext, rd));
        }
    }

    public class ServerErrorResult : ActionResult
    {
        public override void ExecuteResult(ControllerContext context)
        {
            ExecuteResult(context.HttpContext);
        }

        public void ExecuteResult(HttpContextBase context)
        {
            RouteData rd = new RouteData();
            rd.Values.Add("controller", "Error");
            rd.Values.Add("action", "ServerError");
            IController c = new ErrorController();
            c.Execute(new RequestContext(context, rd));
        }
    }

    public class IncompatibleBrowserResult : ActionResult
    {
        public override void ExecuteResult(ControllerContext context)
        {
            RouteData rd = new RouteData();
            rd.Values.Add("controller", "Error");
            rd.Values.Add("action", "IncompatibleBrowser");
            IController c = new ErrorController();
            c.Execute(new RequestContext(context.HttpContext, rd));
        }
    }

    public class UnauthorizedResult : ActionResult
    {
        public override void ExecuteResult(ControllerContext context)
        {
            RouteData rd = new RouteData();
            rd.Values.Add("controller", "Error");
            rd.Values.Add("action", "Unauthorized");
            IController c = new ErrorController();
            c.Execute(new RequestContext(context.HttpContext, rd));
        }
    }

    public class CheckBrowserCompatibilityFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (!WebApplicationRegistry.Settings.EnableBrowserCompatibilityCheck)
            {
                return;
            }
            if (filterContext.IsChildAction)
            {
                return;
            }
            if (filterContext.HttpContext.Request.IsAjaxRequest())
            {
                return;
            }
            HttpBrowserCapabilitiesBase requestBrowser = filterContext.RequestContext.HttpContext.Request.Browser;
            if (WebApplicationRegistry.CompatibleBrowsers.Any(compatibleBrowser => compatibleBrowser.Is(requestBrowser)))
            {
                return;
            }
            filterContext.Result = new IncompatibleBrowserResult();
        }
    }

    public partial class ErrorController : ControllerBase
    {
        public virtual ActionResult NotFound()
        {
            Response.StatusCode = (int)HttpStatusCode.NotFound;
            return View();
        }

        public virtual ActionResult ServerError()
        {
            Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            return View();
        }

        public virtual ActionResult IncompatibleBrowser()
        {
            Response.StatusCode = (int)HttpStatusCode.BadRequest;
            return View(WebApplicationRegistry.CompatibleBrowsers);
        }

        [HttpPost]
        public virtual ActionResult BypassBrowserCheck(string ReturnUrl)
        {
            Session.SetPerformBrowserCheck(false);
            return Redirect(ReturnUrl);
        }

        public virtual ActionResult Unauthorized()
        {
            Response.StatusCode = (int)HttpStatusCode.Forbidden;
            return View();
        }

        public virtual ActionResult Maintenance()
        {
            Response.StatusCode = (int)HttpStatusCode.ServiceUnavailable;
            return View();
        }
    }
}
