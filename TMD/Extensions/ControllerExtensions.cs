using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Html;

namespace TMD.Extensions
{
    public static class ControllerExtensions
    {
        public static bool IsCurrentController(this HtmlHelper helper, string controllerName)
        {
            string currentControllerName = (string)helper.ViewContext.RouteData.Values["controller"];
            return string.Compare(controllerName, currentControllerName, true) == 0;
        }

        public static bool IsCurrentControllerAndAction(this HtmlHelper helper, string controllerName, string actionName)
        {
            string currentControllerName = (string)helper.ViewContext.RouteData.Values["controller"];
            string currentActionName = (string)helper.ViewContext.RouteData.Values["action"];
            return string.Compare(controllerName, currentControllerName, true) == 0 && string.Compare(actionName, currentActionName, true) == 0;
        }
    }
}