using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Application;

namespace TMD.Extensions
{
    public class SetDefaultControllerAndActionToCurrentControllerAndActionFilterAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            if (filterContext.HttpContext.Request.HttpMethod == "GET")
            {
                ApplicationSession.DefaultAction = filterContext.ActionDescriptor.ActionName;
                ApplicationSession.DefaultController = filterContext.Controller.GetType().Name.Replace("Controller", string.Empty);
            }
            base.OnActionExecuting(filterContext);
        }
    }
}