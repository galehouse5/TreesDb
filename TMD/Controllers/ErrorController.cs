using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Net;
using System.Web.Routing;

namespace TMD.Controllers
{
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

    public class InternalServerErrorResult : ActionResult
    {
        public override void ExecuteResult(ControllerContext context)
        {
            RouteData rd = new RouteData();
            rd.Values.Add("controller", "Error");
            rd.Values.Add("action", "InternalServerError");
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
            new CompatibleBrowser("IE", 8) 
        };

        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (!false.Equals(((ControllerBase)filterContext.Controller).Session.PerformBrowserCheck))
            {
                HttpBrowserCapabilitiesBase browser = ((Controller)filterContext.Controller).Request.Browser;
                bool isCompatible = false;
                foreach (CompatibleBrowser compatibleBrowser in s_CompatibleBrowsers)
                {
                    if (compatibleBrowser.Is(browser))
                    {
                        isCompatible = true;
                        break;
                    }
                }
                if (!isCompatible)
                {
                    filterContext.Result = new IncompatibleBrowserResult();
                }
            }
            base.OnActionExecuting(filterContext);
        }
    }

    public class ErrorController : ControllerBase
    {
        public ActionResult NotFound()
        {
            Response.StatusCode = (int)HttpStatusCode.NotFound;
            return View();
        }

        public ActionResult InternalServerError()
        {
            Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            return View();
        }

        public ActionResult IncompatibleBrowser()
        {
            Response.StatusCode = (int)HttpStatusCode.BadRequest;
            return View();
        }

        [HttpPost]
        public ActionResult BypassBrowserCheck(string ReturnUrl)
        {
            Session.PerformBrowserCheck = false;
            return Redirect(ReturnUrl);
        }

        public ActionResult Unauthorized()
        {
            Response.StatusCode = (int)HttpStatusCode.Forbidden;
            return View();
        }
    }
}
