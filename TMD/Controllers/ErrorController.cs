﻿using System;
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
            RouteData rd = new RouteData();
            rd.Values.Add("controller", "Error");
            rd.Values.Add("action", "ServerError");
            IController c = new ErrorController();
            c.Execute(new RequestContext(context.HttpContext, rd));
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
        private class CompatibleBrowser
        {
            public readonly string Browser;
            public readonly int MajorVersion;

            public CompatibleBrowser(string browser, int majorVersion)
            {
                this.Browser = browser;
                this.MajorVersion = majorVersion;
            }

            public bool Is(HttpBrowserCapabilitiesBase browser)
            {
                if (Browser == browser.Browser
                    && MajorVersion == browser.MajorVersion)
                {
                    return true;
                }
                return false;
            }
        }

        private static readonly CompatibleBrowser[] s_CompatibleBrowsers = new[] { 
            new CompatibleBrowser("Firefox", 3),
            new CompatibleBrowser("IE", 8),
            new CompatibleBrowser("Safari", 5)
        };

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (!filterContext.IsChildAction && true.Equals(((ControllerBase)filterContext.Controller).Session.GetPerformBrowserCheck()))
            {
                HttpBrowserCapabilitiesBase browser = ((Controller)filterContext.Controller).Request.Browser;
                if (!s_CompatibleBrowsers.Any(compatibleBrowser => compatibleBrowser.Is(browser)))
                {
                    filterContext.Result = new IncompatibleBrowserResult();
                }
            }
            base.OnActionExecuting(filterContext);
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
            return View();
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
