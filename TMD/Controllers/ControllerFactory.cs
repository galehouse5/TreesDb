using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace TMD
{
    public class ControllerFactory : DefaultControllerFactory
    {
        protected override Type GetControllerType(RequestContext requestContext, string controllerName)
        {
            Type t = base.GetControllerType(requestContext, controllerName);
            if (t == null)
            {
                requestContext.RouteData.Values["controller"] = "Error";
                requestContext.RouteData.Values["action"] = "NotFound";
                t = base.GetControllerType(requestContext, "Error");
            }
            return t;
        }

        protected override IController GetControllerInstance(RequestContext requestContext, Type controllerType)
        {
            return base.GetControllerInstance(requestContext, controllerType);
        }
    }
}